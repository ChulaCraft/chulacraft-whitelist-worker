const fs = require("node:fs");
const net = require("node:net");
const { parseArgs } = require("node:util");
const { createClient } = require("@supabase/supabase-js");
const { validName, nextRetry, safeError } = require("./lib.cjs");
const { createBoundedFetch } = require("./bounded-fetch.cjs");

// --server-name selects the managed server instance. It is required by the
// systemd stdin transport and ignored by the RCON transport.
const options = {
  "server-name": { type: "string", default: "chulacraft" },
  "heartbeat-file": { type: "string" }
};

const { values } = parseArgs({ options });

const NODE_MAJOR_VERSION = parseInt(process.versions.node.split(".")[0], 10);

const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const required = ["SUPABASE_URL"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
if (!supabaseSecret) throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY");

// Node < 22 has no global WebSocket, so supabase-js needs the ws polyfill.
let realtime = undefined;
if (NODE_MAJOR_VERSION < 22) realtime = { transport: "ws" };

const supabase = createClient(process.env.SUPABASE_URL, supabaseSecret, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: createBoundedFetch(8000) }, realtime });
const pollInterval = Number(process.env.POLL_INTERVAL_MS || 8000);

// Two transports. The systemd stdin socket is preferred whenever it exists: it
// needs no password and is not exposed on a port. RCON is used for Docker and
// for instances without a stdin socket.
//
// The systemd unit uses RuntimeDirectory=minecraft, so the instance stdin socket
// lives in /run/minecraft. The directory is overridable so the transport can be
// exercised in tests without root.
const runDir = process.env.MINECRAFT_RUN_DIR || "/run/minecraft";
const serverStdin = `${runDir}/${values["server-name"]}.stdin`;
const rconOptions = { host: process.env.RCON_HOST || "127.0.0.1", port: Number(process.env.RCON_PORT || 25575), password: process.env.RCON_PASSWORD, timeout: 8000 };

// Re-evaluated per command: the worker can start before its instance does, and
// the server may restart underneath it. Pinning the choice at startup would
// strand the worker on RCON for its whole life.
function useStdin() { return fs.existsSync(serverStdin); }

// The stdin transport gets no reply, so the game port is its only evidence
// that a server is there to read the command.
const serverPort = Number(process.env.MINECRAFT_PORT || 25565);
function serverListening() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port: serverPort });
    const finish = (up) => { socket.destroy(); resolve(up); };
    socket.setTimeout(2000, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
}

// Absent under systemd, where the unit's hardening forbids writing outside its
// own allowed paths; the systemd unit tracks health itself.
const heartbeatFile = values["heartbeat-file"] || "/run/whitelist-worker/heartbeat";

let rconSession = null;

function log(event, details = {}) { console.log(JSON.stringify({ time: new Date().toISOString(), service: "whitelist-sync", event, ...details })); }
function supabaseFailureCode(error, fallback) { return /SUPABASE_TIMEOUT/i.test(error?.message || "") ? "SUPABASE_TIMEOUT" : fallback; }

// Best-effort liveness marker for the container HEALTHCHECK. Absent under
// systemd, where the unit's hardening forbids writing outside its own paths.
function heartbeat() {
  if (!heartbeatFile) return;
  try { fs.writeFileSync(heartbeatFile, "ok", { mode: 0o600 }); }
  catch { /* read-only runtime dir: health is tracked by the systemd unit instead */ }
}

async function closeRcon() {
  const session = rconSession;
  if (!session) return;
  rconSession = null;
  try { await (await session).end(); } catch { /* connection already gone */ }
}

// Each command opens its own short-lived RCON session so a broken socket can
// never poison the next poll. The stdin transport needs no session at all.
async function command(text) {
  if (useStdin()) {
    // systemd keeps the FIFO open while the instance is stopped, so a write
    // succeeding proves nothing. Defer unless the server is actually up.
    if (!(await serverListening())) throw new Error("socket closed");
    let fd;
    try {
      // Append, never truncate or create: a removal sends two commands in a
      // row. Non-blocking, so a FIFO with no reader fails with ENXIO instead of
      // hanging the worker, and a full one fails with EAGAIN.
      fd = fs.openSync(serverStdin, fs.constants.O_WRONLY | fs.constants.O_APPEND | fs.constants.O_NONBLOCK);
      fs.writeSync(fd, text + "\n");
    }
    catch (error) {
      // Nobody is reading the instance's stdin. Report it as an offline server
      // so the record is deferred instead of consuming a retry.
      if (["ENOENT", "ENXIO", "EPIPE", "EAGAIN"].includes(error?.code)) throw new Error("socket closed");
      throw error;
    }
    finally { if (fd !== undefined) fs.closeSync(fd); }
    return "";
  }
  try {
    // Imported lazily: the systemd deployment has no rcon-client installed.
    // There, a missing stdin socket means the server is stopped, so report it
    // as offline rather than as a rejected command.
    const { Rcon } = await import("rcon-client").catch(() => { throw new Error("socket closed"); });
    rconSession = Rcon.connect(rconOptions);
    const session = await rconSession;
    return await session.send(text);
  } finally { await closeRcon(); }
}

async function markSuccess(record) {
  const now = new Date().toISOString();
  const change = record.desired_whitelisted
    ? { sync_status: "synced", sync_attempts: 0, next_sync_at: now, last_sync_error_code: null, last_sync_error_at: null, whitelisted_at: now }
    : { sync_status: "synced", sync_attempts: 0, next_sync_at: now, last_sync_error_code: null, last_sync_error_at: null, revoked_at: now };
  const { data, error } = await supabase.from("minecraft_registrations").update(change).eq("id", record.id).eq("desired_whitelisted", record.desired_whitelisted).select("id");
  if (error) throw new Error(supabaseFailureCode(error, "SUPABASE_UPDATE_FAILED"));
  return (data || []).length === 1;
}

async function markFailure(record, code) {
  const now = new Date().toISOString();
  // The server being down is not a per-player failure. Counting these against
  // sync_attempts would park every registration outside the retry window and
  // stall the whole queue, so leave the row due for the next pass instead.
  if (code === "RCON_OFFLINE" || code === "RCON_TIMEOUT") {
    log("sync_deferred", { registrationId: record.id, username: record.minecraft_username, code });
    return;
  }
  const attempts = Number(record.sync_attempts || 0) + 1;
  const { data, error } = await supabase.from("minecraft_registrations").update({ sync_status: "failed", sync_attempts: attempts, next_sync_at: nextRetry(attempts), last_sync_error_code: code, last_sync_error_at: now }).eq("id", record.id).eq("desired_whitelisted", record.desired_whitelisted).select("id");
  if (error) throw new Error(supabaseFailureCode(error, "SUPABASE_UPDATE_FAILED"));
  if ((data || []).length !== 1) { log("sync_result_stale", { registrationId: record.id, username: record.minecraft_username }); return; }
  log("sync_retry_scheduled", { registrationId: record.id, username: record.minecraft_username, code, attempts });
}

async function syncRecord(record) {
  if (!validName(record.minecraft_username)) { await markFailure(record, "INVALID_USERNAME"); return false; }
  const action = record.desired_whitelisted ? "add" : "remove";
  try {
    const response = await command(`whitelist ${action} ${record.minecraft_username}`);
    if (/unknown command|incorrect argument|usage:/i.test(response)) throw new Error("RCON_REJECTED");
    // Removal means revoked, banned or deleted, so an online player must not keep playing.
    // Best-effort: "No player was found" for offline players is expected and ignored.
    if (action === "remove") await command(`kick ${record.minecraft_username} Your server access was removed.`).catch(() => undefined);
    if (await markSuccess(record)) { log("sync_succeeded", { registrationId: record.id, username: record.minecraft_username, action }); return true; }
    log("sync_result_stale", { registrationId: record.id, username: record.minecraft_username });
    return false;
  } catch (error) { await markFailure(record, safeError(error)); return false; }
}

async function queryRecords(startup) {
  const due = new Date().toISOString();
  let desired = supabase.from("minecraft_registrations").select("id,minecraft_username,desired_whitelisted,sync_status,sync_attempts,next_sync_at,revoked_at").eq("desired_whitelisted", true).order("next_sync_at", { ascending: true }).limit(startup ? 1000 : 20);
  if (!startup) desired = desired.in("sync_status", ["pending", "failed"]).lte("next_sync_at", due);
  const { data: adds, error: addError } = await desired;
  if (addError) throw new Error(supabaseFailureCode(addError, "SUPABASE_READ_FAILED"));
  let removalsQuery = supabase.from("minecraft_registrations").select("id,minecraft_username,desired_whitelisted,sync_status,sync_attempts,next_sync_at,revoked_at").eq("desired_whitelisted", false).is("revoked_at", null).order("next_sync_at", { ascending: true }).limit(startup ? 1000 : 20);
  if (!startup) removalsQuery = removalsQuery.lte("next_sync_at", due);
  const { data: removals, error: removeError } = await removalsQuery;
  if (removeError) throw new Error(supabaseFailureCode(removeError, "SUPABASE_READ_FAILED"));
  return [...(adds || []), ...(removals || [])];
}

async function runPass(startup) {
  heartbeat();
  const records = await queryRecords(startup);
  let succeeded = 0;
  for (const record of records) {
    try {
      if (await syncRecord(record)) succeeded += 1;
    } catch (error) {
      // A failed database status write must not prevent other due players from
      // being processed in this pass. The record remains due for the next pass.
      log("sync_record_unexpected", { registrationId: record.id, username: record.minecraft_username, code: safeError(error) });
    }
    heartbeat();
  }
  log(startup ? "startup_reconciliation_complete" : "poll_complete", { total: records.length, succeeded, failed: records.length - succeeded });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function pollForever() {
  while (true) {
    try { await runPass(false); }
    catch (error) { log("poll_failed", { code: safeError(error) }); }
    // Deliberately await before starting another pass: server commands and
    // Supabase work must not overlap between polls, even when a batch takes
    // longer than its configured interval.
    await delay(pollInterval);
  }
}

async function main() {
  log("worker_started", { pollInterval, transport: useStdin() ? "stdin" : "rcon", serverName: values["server-name"] });
  try { await runPass(true); } catch (error) { log("startup_reconciliation_failed", { code: safeError(error) }); }
  void pollForever();
  if (heartbeatFile) setInterval(heartbeat, 10_000).unref();
}
main().catch((error) => { log("worker_fatal", { code: safeError(error) }); process.exit(1); });
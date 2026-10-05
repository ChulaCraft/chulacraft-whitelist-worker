const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");
const { Rcon } = require("rcon-client");
const { validName, nextRetry, safeError } = require("./lib.cjs");
const { createBoundedFetch } = require("./bounded-fetch.cjs");

const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const required = ["SUPABASE_URL", "RCON_PASSWORD"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
if (!supabaseSecret) throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY");

const supabase = createClient(process.env.SUPABASE_URL, supabaseSecret, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: createBoundedFetch(8000) } });
const pollInterval = Number(process.env.POLL_INTERVAL_MS || 8000);
const rconOptions = { host: process.env.RCON_HOST || "minecraft", port: Number(process.env.RCON_PORT || 25575), password: process.env.RCON_PASSWORD, timeout: 8000 };

function log(event, details = {}) { console.log(JSON.stringify({ time: new Date().toISOString(), service: "whitelist-sync", event, ...details })); }
function heartbeat() { fs.writeFileSync("/run/whitelist-worker/heartbeat", "ok", { mode: 0o600 }); }
function supabaseFailureCode(error, fallback) { return /SUPABASE_TIMEOUT/i.test(error?.message || "") ? "SUPABASE_TIMEOUT" : fallback; }

async function command(command) {
  let rcon;
  try { rcon = await Rcon.connect(rconOptions); return await rcon.send(command); }
  finally { if (rcon) await rcon.end().catch(() => undefined); }
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
  const attempts = Number(record.sync_attempts || 0) + 1;
  const now = new Date().toISOString();
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
    // Deliberately await before starting another pass: RCON and Supabase work
    // must not overlap between polls, even when a batch takes longer than its
    // configured interval.
    await delay(pollInterval);
  }
}

async function main() {
  log("worker_started", { pollInterval });
  try { await runPass(true); } catch (error) { log("startup_reconciliation_failed", { code: safeError(error) }); }
  void pollForever();
  setInterval(heartbeat, 10_000).unref();
}
main().catch((error) => { log("worker_fatal", { code: safeError(error) }); process.exit(1); });

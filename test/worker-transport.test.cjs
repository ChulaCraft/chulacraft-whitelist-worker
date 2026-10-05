const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { makeRow, startGamePort, startSupabase } = require("./helpers/e2e.cjs");
const { spawnWorker, waitForEvent } = require("./helpers/run-worker.cjs");

const NAME = "prod-folia12111";

// Lays out /run/minecraft/<name>.stdin and /srv/minecraft/instances/<name>/ in
// a temp dir. port: the instance's server-port (omit for a stopped server).
function makeInstance(t, { port = "1", whitelist, fifo = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-"));
  const runDir = path.join(root, "run");
  const instancesDir = path.join(root, "instances");
  const instanceDir = path.join(instancesDir, NAME);
  fs.mkdirSync(runDir);
  fs.mkdirSync(instanceDir, { recursive: true });
  const stdinPath = path.join(runDir, NAME + ".stdin");
  if (fifo) execFileSync("mkfifo", [stdinPath]);
  else fs.writeFileSync(stdinPath, "");
  fs.writeFileSync(path.join(instanceDir, "server.properties"), `motd=test\nserver-port=${port}\n`);
  if (whitelist !== undefined) {
    const body = typeof whitelist === "string" ? whitelist : JSON.stringify(whitelist.map((name) => ({ uuid: "00000000-0000-0000-0000-000000000000", name })));
    fs.writeFileSync(path.join(instanceDir, "whitelist.json"), body);
  }
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { stdinPath, env: { MINECRAFT_RUN_DIR: runDir, MINECRAFT_INSTANCES_DIR: instancesDir } };
}

async function runStartup(t, rows, instanceOptions, event = "startup_reconciliation_complete") {
  const supabase = await startSupabase(rows);
  const game = await startGamePort();
  t.after(() => { supabase.close(); game.close(); });
  const instance = makeInstance(t, Object.assign({ port: game.port }, instanceOptions));
  const worker = spawnWorker(Object.assign({ SUPABASE_URL: supabase.url }, instance.env), ["--server-name", NAME]);
  const done = await waitForEvent(worker, event);
  const lines = worker.readLines();
  await worker.stop();
  return { done, lines, supabase, sent: fs.statSync(instance.stdinPath).isFIFO() ? null : fs.readFileSync(instance.stdinPath, "utf8") };
}

test("a player missing from whitelist.json is added through stdin", async (t) => {
  const { done, sent, supabase } = await runStartup(t, [makeRow({ minecraft_username: "StdinPlayer" })], { whitelist: [] });
  assert.equal(done.succeeded, 1);
  assert.equal(sent, "whitelist add StdinPlayer\n");
  assert.equal(supabase.updates[0].sync_status, "synced");
  assert.ok(supabase.updates[0].whitelisted_at, "an add must stamp whitelisted_at");
});

test("a pending player already in whitelist.json is marked synced without a command", async (t) => {
  const { done, sent, supabase } = await runStartup(t, [makeRow({ minecraft_username: "Already" })], { whitelist: ["already"] });
  assert.equal(done.succeeded, 1);
  assert.equal(sent, "", "the server already has this player; nothing may be sent");
  assert.equal(supabase.updates[0].sync_status, "synced");
});

test("a restart does not replay synced players that whitelist.json already has", async (t) => {
  const { done, sent, supabase } = await runStartup(t, [makeRow({ minecraft_username: "Synced", sync_status: "synced" })], { whitelist: ["Synced"] });
  assert.equal(done.succeeded, 1);
  assert.equal(sent, "");
  assert.equal(supabase.updates.length, 0, "nothing changed, so nothing is written either");
});

test("a removed player in whitelist.json is removed and kicked", async (t) => {
  const { sent, supabase } = await runStartup(t, [makeRow({ desired_whitelisted: false, minecraft_username: "StdinKick" })], { whitelist: ["StdinKick"] });
  assert.equal(sent, "whitelist remove StdinKick\nkick StdinKick Your server access was removed.\n");
  assert.ok(supabase.updates[0].revoked_at, "a removal must stamp revoked_at");
  assert.equal(supabase.updates[0].whitelisted_at, undefined);
});

test("a removed player absent from whitelist.json is marked revoked without a command", async (t) => {
  const { sent, supabase } = await runStartup(t, [makeRow({ desired_whitelisted: false, minecraft_username: "Gone" })], { whitelist: [] });
  assert.equal(sent, "");
  assert.ok(supabase.updates[0].revoked_at);
});

test("a missing whitelist.json is treated as empty", async (t) => {
  const { sent } = await runStartup(t, [makeRow({ minecraft_username: "Fresh" })], {});
  assert.equal(sent, "whitelist add Fresh\n");
});

test("an unreadable whitelist.json fails the pass instead of resending everything", async (t) => {
  const { lines, sent, supabase } = await runStartup(t, [makeRow()], { whitelist: "[{\"na" }, "startup_reconciliation_failed");
  assert.ok(!lines.some((line) => line.event === "startup_reconciliation_complete"), "the pass must not complete");
  assert.equal(sent, "");
  assert.equal(supabase.updates.length, 0);
});

test("a stopped server defers records instead of consuming retry attempts", async (t) => {
  const supabase = await startSupabase([makeRow({ desired_whitelisted: false, minecraft_username: "Stopped" })]);
  t.after(() => supabase.close());
  const instance = makeInstance(t, { whitelist: ["Stopped"], fifo: true });
  // Like the systemd socket unit: the FIFO stays open with nothing consuming it.
  const holder = fs.openSync(instance.stdinPath, fs.constants.O_RDWR | fs.constants.O_NONBLOCK);
  t.after(() => fs.closeSync(holder));

  // server-port=1 has nothing listening: the server is down.
  const worker = spawnWorker(Object.assign({ SUPABASE_URL: supabase.url }, instance.env), ["--server-name", NAME]);
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  const lines = worker.readLines();
  await worker.stop();

  assert.equal(done.succeeded, 0, "a command nobody read must not count as synced");
  assert.equal(supabase.updates.length, 0, "a down server must not write retry state");
  assert.ok(lines.some((line) => line.event === "sync_deferred" && line.code === "SERVER_OFFLINE"));
  assert.throws(() => fs.readSync(holder, Buffer.alloc(64)), { code: "EAGAIN" }, "nothing may be queued for a stopped server");
});

test("a FIFO with no reader defers instead of hanging the worker", async (t) => {
  const { done, supabase } = await runStartup(t, [makeRow()], { whitelist: [], fifo: true });
  assert.equal(done.succeeded, 0);
  assert.equal(supabase.updates.length, 0);
});

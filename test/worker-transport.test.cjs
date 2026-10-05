const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { makeRow, startGamePort, startRcon, startSupabase } = require("./helpers/e2e.cjs");
const { spawnWorker, waitForEvent } = require("./helpers/run-worker.cjs");

test("a live RCON server receives whitelist commands and the record is marked synced", async (t) => {
  const rcon = await startRcon();
  const supabase = await startSupabase([makeRow()]);
  t.after(() => {
    rcon.close();
    supabase.close();
  });

  const worker = spawnWorker({
    SUPABASE_URL: supabase.url,
    RCON_HOST: "127.0.0.1",
    RCON_PORT: String(rcon.port),
    RCON_PASSWORD: "pw"
  });
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  await worker.stop();

  assert.equal(done.succeeded, 1, "the single due record should have synced");
  assert.deepEqual(rcon.received, ["whitelist add PlayerOne"]);
  assert.equal(supabase.updates.length, 1);
  assert.equal(supabase.updates[0].sync_status, "synced");
  assert.ok(supabase.updates[0].whitelisted_at, "an add must stamp whitelisted_at");
});

test("a removed registration also kicks the player and stamps revoked_at", async (t) => {
  const rcon = await startRcon();
  const supabase = await startSupabase([
    makeRow({ desired_whitelisted: false, minecraft_username: "PlayerTwo" })
  ]);
  t.after(() => {
    rcon.close();
    supabase.close();
  });

  const worker = spawnWorker({
    SUPABASE_URL: supabase.url,
    RCON_HOST: "127.0.0.1",
    RCON_PORT: String(rcon.port),
    RCON_PASSWORD: "pw"
  });
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  await worker.stop();

  assert.equal(done.succeeded, 1);
  assert.deepEqual(rcon.received, [
    "whitelist remove PlayerTwo",
    "kick PlayerTwo Your server access was removed."
  ]);
  assert.ok(supabase.updates[0].revoked_at, "a removal must stamp revoked_at");
  assert.equal(supabase.updates[0].whitelisted_at, undefined);
});

test("the systemd stdin transport writes commands to the instance socket", async (t) => {
  // The systemd deployment has no rcon-client and no TCP port: it writes the
  // command straight to /run/minecraft/<instance>.stdin.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-run-"));
  const stdinPath = path.join(runDir, "prod-folia12111.stdin");
  // systemd pre-creates the instance stdin socket; the worker uses its
  // presence to select the transport.
  fs.writeFileSync(stdinPath, "");
  t.after(() => fs.rmSync(runDir, { recursive: true, force: true }));

  const supabase = await startSupabase([makeRow({ minecraft_username: "StdinPlayer" })]);
  const game = await startGamePort();
  t.after(() => { supabase.close(); game.close(); });

  const worker = spawnWorker(
    { SUPABASE_URL: supabase.url, MINECRAFT_RUN_DIR: runDir, MINECRAFT_PORT: game.port },
    ["--server-name", "prod-folia12111"]
  );
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  const lines = await worker.readLines();
  await worker.stop();

  assert.equal(lines.find((line) => line.event === "worker_started").transport, "stdin");
  assert.equal(done.succeeded, 1, "a stdin command still counts as a success");
  assert.equal(fs.readFileSync(stdinPath, "utf8"), "whitelist add StdinPlayer\n");
  assert.equal(supabase.updates.length, 1, "the stdin transport must still record success");
  assert.equal(supabase.updates[0].sync_status, "synced");
});

test("the stdin transport kicks a removed player too", async (t) => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-run-"));
  const stdinPath = path.join(runDir, "prod-folia12111.stdin");
  fs.writeFileSync(stdinPath, "");
  t.after(() => fs.rmSync(runDir, { recursive: true, force: true }));

  const supabase = await startSupabase([
    makeRow({ desired_whitelisted: false, minecraft_username: "StdinKick" })
  ]);
  const game = await startGamePort();
  t.after(() => { supabase.close(); game.close(); });

  const worker = spawnWorker(
    { SUPABASE_URL: supabase.url, MINECRAFT_RUN_DIR: runDir, MINECRAFT_PORT: game.port },
    ["--server-name", "prod-folia12111"]
  );
  await waitForEvent(worker, "startup_reconciliation_complete");
  await worker.stop();

  assert.equal(
    fs.readFileSync(stdinPath, "utf8"),
    "whitelist remove StdinKick\nkick StdinKick Your server access was removed.\n"
  );
});

test("the worker picks up a server that starts after it does", async (t) => {
  // Under systemd both units boot together, so the worker may start before the
  // instance and must not stay pinned to RCON forever.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-run-"));
  const stdinPath = path.join(runDir, "prod-folia12111.stdin");
  t.after(() => fs.rmSync(runDir, { recursive: true, force: true }));

  const supabase = await startSupabase([makeRow({ minecraft_username: "LateStart" })]);
  const game = await startGamePort();
  t.after(() => { supabase.close(); game.close(); });

  const worker = spawnWorker(
    { SUPABASE_URL: supabase.url, RCON_HOST: "127.0.0.1", RCON_PORT: "1", RCON_PASSWORD: "pw", MINECRAFT_RUN_DIR: runDir, MINECRAFT_PORT: game.port, POLL_INTERVAL_MS: "300" },
    ["--server-name", "prod-folia12111"]
  );
  await waitForEvent(worker, "startup_reconciliation_complete");
  const started = (await worker.readLines()).find((line) => line.event === "worker_started");
  assert.equal(started.transport, "rcon", "no socket yet, so it starts on RCON");

  // The instance comes up.
  fs.writeFileSync(stdinPath, "");
  const deferred = (await worker.readLines()).filter((line) => line.event === "sync_deferred");
  assert.ok(deferred.length >= 1, "the unreachable server is deferred, not retried");
  assert.equal(supabase.updates.length, 0);

  const succeeded = await waitForEvent(worker, "sync_succeeded", 15000);
  assert.equal(succeeded.username, "LateStart");
  assert.equal(succeeded.action, "add");
  assert.equal(fs.readFileSync(stdinPath, "utf8"), "whitelist add LateStart\n");
  await worker.stop();
}, 30000);

test("an unreachable server defers records instead of consuming retry attempts", async (t) => {
  // Port 1 has nothing listening, so every connect fails.
  const supabase = await startSupabase([makeRow({ sync_attempts: 0 })]);
  t.after(() => supabase.close());

  const worker = spawnWorker({
    SUPABASE_URL: supabase.url,
    RCON_HOST: "127.0.0.1",
    RCON_PORT: "1",
    RCON_PASSWORD: "pw"
  });
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  const lines = await worker.readLines();
  await worker.stop();

  assert.equal(done.failed, 1);
  assert.equal(supabase.updates.length, 0, "a down server must not write retry state");
  assert.ok(
    lines.some((line) => line.event === "sync_deferred" && line.code === "RCON_OFFLINE"),
    "expected a sync_deferred line, got " + JSON.stringify(lines.map((l) => l.event))
  );
});

test("a command rejected by the server schedules a retry with backoff", async (t) => {
  const supabase = await startSupabase([makeRow()]);
  // Answer with an "Unknown command" style response.
  const rcon = await startRcon({ response: "Unknown command. Type /help for help." });
  t.after(() => {
    rcon.close();
    supabase.close();
  });

  const worker = spawnWorker({
    SUPABASE_URL: supabase.url,
    RCON_HOST: "127.0.0.1",
    RCON_PORT: String(rcon.port),
    RCON_PASSWORD: "pw"
  });
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  await worker.stop();

  assert.equal(done.failed, 1);
  assert.equal(supabase.updates.length, 1, "a rejected command is a real failure and must retry");
  assert.equal(supabase.updates[0].sync_status, "failed");
  assert.equal(supabase.updates[0].sync_attempts, 1);
  assert.equal(supabase.updates[0].last_sync_error_code, "RCON_REJECTED");
});

test("a stopped server defers stdin commands even though systemd keeps the FIFO open", async (t) => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-run-"));
  const stdinPath = path.join(runDir, "prod-folia12111.stdin");
  execFileSync("mkfifo", [stdinPath]);
  // Like the systemd socket unit: the FIFO stays open with nothing consuming it.
  const holder = fs.openSync(stdinPath, fs.constants.O_RDWR | fs.constants.O_NONBLOCK);
  const supabase = await startSupabase([makeRow({ desired_whitelisted: false, minecraft_username: "Stopped" })]);
  t.after(() => {
    fs.closeSync(holder);
    fs.rmSync(runDir, { recursive: true, force: true });
    supabase.close();
  });

  // Port 1 has nothing listening: the server is down.
  const worker = spawnWorker(
    { SUPABASE_URL: supabase.url, MINECRAFT_RUN_DIR: runDir, MINECRAFT_PORT: "1" },
    ["--server-name", "prod-folia12111"]
  );
  const done = await waitForEvent(worker, "startup_reconciliation_complete");
  const lines = await worker.readLines();
  await worker.stop();

  assert.equal(done.succeeded, 0, "a command nobody read must not count as synced");
  assert.equal(supabase.updates.length, 0);
  assert.ok(lines.some((line) => line.event === "sync_deferred" && line.code === "RCON_OFFLINE"));
  assert.throws(() => fs.readSync(holder, Buffer.alloc(64)), { code: "EAGAIN" }, "nothing may be queued for a stopped server");
});

test("a FIFO with no reader defers instead of hanging the worker", async (t) => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "minecraft-run-"));
  const stdinPath = path.join(runDir, "prod-folia12111.stdin");
  execFileSync("mkfifo", [stdinPath]);
  const supabase = await startSupabase([makeRow()]);
  const game = await startGamePort();
  t.after(() => {
    fs.rmSync(runDir, { recursive: true, force: true });
    supabase.close();
    game.close();
  });

  const worker = spawnWorker(
    { SUPABASE_URL: supabase.url, MINECRAFT_RUN_DIR: runDir, MINECRAFT_PORT: game.port },
    ["--server-name", "prod-folia12111"]
  );
  const done = await waitForEvent(worker, "startup_reconciliation_complete", 5000);
  await worker.stop();

  assert.equal(done.succeeded, 0);
  assert.equal(supabase.updates.length, 0);
});

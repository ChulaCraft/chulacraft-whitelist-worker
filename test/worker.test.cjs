const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { spawnWorker } = require("./helpers/run-worker.cjs");

const WORKER = path.join(__dirname, "..", "worker.cjs");

test("worker announces the RCON transport when no stdin socket exists", async () => {
  const worker = spawnWorker({ SUPABASE_URL: "http://127.0.0.1:1", RCON_HOST: "127.0.0.1", RCON_PORT: "1", RCON_PASSWORD: "pw" });
  await new Promise((resolve) => setTimeout(resolve, 800));
  const lines = await worker.readLines();
  await worker.stop();
  const started = lines.find((line) => line.event === "worker_started");
  assert.ok(started, "expected a worker_started line, got " + JSON.stringify(lines.map((l) => l.event)));
  assert.equal(started.transport, "rcon");
  assert.equal(started.serverName, "chulacraft");
});

test("worker refuses to start without a Supabase secret key", async () => {
  const child = spawn(process.execPath, [WORKER], {
    env: { PATH: process.env.PATH, SUPABASE_URL: "http://127.0.0.1:1" }
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const code = await new Promise((resolve) => child.on("close", resolve));
  assert.notEqual(code, 0, "a missing secret key must be fatal");
  assert.match(stderr, /SUPABASE_SECRET_KEY/);
});
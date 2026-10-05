const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { spawn } = require("node:child_process");

const WORKER = path.join(__dirname, "..", "worker.cjs");

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
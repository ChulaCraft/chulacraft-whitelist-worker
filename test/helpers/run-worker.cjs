// Spawns the worker as a child process and exposes its JSON log lines.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const WORKER = path.join(__dirname, "..", "..", "worker.cjs");

function spawnWorker(env, args) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wlw-"));
  const logFile = path.join(tmp, "log.ndjson");
  const out = fs.openSync(logFile, "w");

  const child = spawn(process.execPath, [WORKER].concat(args || []), {
    stdio: ["ignore", out, out],
    env: Object.assign(
      {
        PATH: process.env.PATH,
        SUPABASE_SECRET_KEY: "test-secret",
        POLL_INTERVAL_MS: "60000"
      },
      env
    )
  });

  const stopped = new Promise((resolve) => child.on("close", resolve));

  return {
    logFile,
    child,
    stop() {
      child.kill("SIGKILL");
      return stopped.then(() => fs.rmSync(tmp, { recursive: true, force: true }));
    },
    readLines() {
      if (!fs.existsSync(logFile)) return [];
      return fs
        .readFileSync(logFile, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    }
  };
}

// Resolves once the worker emits the given event, or rejects after a timeout.
function waitForEvent(worker, event, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const poll = setInterval(() => {
      const match = worker.readLines().find((line) => line.event === event);
      if (match) {
        clearInterval(poll);
        return resolve(match);
      }
      if (Date.now() > deadline) {
        clearInterval(poll);
        reject(new Error("timed out waiting for " + event + "; saw " + JSON.stringify(worker.readLines().map((l) => l.event))));
      }
    }, 25);
  });
}

module.exports = { spawnWorker, waitForEvent };
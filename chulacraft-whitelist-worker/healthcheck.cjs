const fs = require("node:fs");
try {
  const age = Date.now() - fs.statSync("/run/whitelist-worker/heartbeat").mtimeMs;
  process.exit(age < 45_000 ? 0 : 1);
} catch { process.exit(1); }

function validName(name) {
  return typeof name === "string" && /^[A-Za-z0-9_]{3,16}$/.test(name);
}

function retryDelayMs(attempts) {
  return Math.min(300_000, 5000 * 2 ** Math.min(Math.max(0, attempts), 6));
}

function nextRetry(attempts, now = Date.now()) {
  return new Date(now + retryDelayMs(attempts)).toISOString();
}

function safeError(error) {
  const message = error instanceof Error ? error.message : "unknown";
  if (/SUPABASE_TIMEOUT/i.test(message)) return "SUPABASE_TIMEOUT";
  if (/SUPABASE_(READ|UPDATE)_FAILED/i.test(message)) return "SUPABASE_ERROR";
  if (/SERVER_OFFLINE/.test(message)) return "SERVER_OFFLINE";
  return "COMMAND_FAILED";
}

function isDue(value, now) {
  return !value || Number.isNaN(Date.parse(value)) || Date.parse(value) <= now;
}

function shouldProcess(record, startup, now = Date.now()) {
  if (record.desired_whitelisted) {
    return startup || (["pending", "failed"].includes(record.sync_status) && isDue(record.next_sync_at, now));
  }
  return record.revoked_at == null && (startup || isDue(record.next_sync_at, now));
}

module.exports = { validName, retryDelayMs, nextRetry, safeError, shouldProcess };

const test = require("node:test");
const assert = require("node:assert/strict");
const { validName, retryDelayMs, nextRetry, safeError, shouldProcess } = require("../lib.cjs");
const { createBoundedFetch, BoundedFetchTimeoutError } = require("../bounded-fetch.cjs");

test("Minecraft username validation accepts only safe Java names", () => {
  assert.equal(validName("Example_Player"), true);
  assert.equal(validName("ab"), false);
  assert.equal(validName("name with space"), false);
  assert.equal(validName("name;op"), false);
});

test("retry backoff grows and caps at five minutes", () => {
  assert.equal(retryDelayMs(1), 10_000);
  assert.equal(retryDelayMs(6), 300_000);
  assert.equal(retryDelayMs(99), 300_000);
  assert.equal(nextRetry(1, 0), "1970-01-01T00:00:10.000Z");
});

test("failures are categorized without echoing messages", () => {
  assert.equal(safeError(new Error("SERVER_OFFLINE")), "SERVER_OFFLINE");
  assert.equal(safeError(new Error("SUPABASE_READ_FAILED")), "SUPABASE_ERROR");
  assert.equal(safeError(new Error("EACCES: permission denied")), "COMMAND_FAILED");
  assert.equal(safeError(new Error("SUPABASE_TIMEOUT")), "SUPABASE_TIMEOUT");
});

test("worker bounded fetch turns only its own timeout into a safe error", async () => {
  const originalFetch = global.fetch;
  global.fetch = (_input, init = {}) => new Promise((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(init.signal.reason), { once: true }));
  await assert.rejects(createBoundedFetch(1)("https://example.test"), BoundedFetchTimeoutError);
  global.fetch = originalFetch;
});

test("only due pending or failed additions are selected by normal polling", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");
  assert.equal(shouldProcess({ desired_whitelisted: true, sync_status: "synced", next_sync_at: "2026-07-27T11:00:00.000Z" }, false, now), false);
  assert.equal(shouldProcess({ desired_whitelisted: true, sync_status: "pending", next_sync_at: "2026-07-27T11:00:00.000Z" }, false, now), true);
  assert.equal(shouldProcess({ desired_whitelisted: true, sync_status: "failed", next_sync_at: "2026-07-27T13:00:00.000Z" }, false, now), false);
  assert.equal(shouldProcess({ desired_whitelisted: true, sync_status: "synced", next_sync_at: "2026-07-27T13:00:00.000Z" }, true, now), true);
});

test("revocation selection honors retry time and terminal removal state", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");
  assert.equal(shouldProcess({ desired_whitelisted: false, revoked_at: null, next_sync_at: "2026-07-27T11:00:00.000Z" }, false, now), true);
  assert.equal(shouldProcess({ desired_whitelisted: false, revoked_at: null, next_sync_at: "2026-07-27T13:00:00.000Z" }, false, now), false);
  assert.equal(shouldProcess({ desired_whitelisted: false, revoked_at: "2026-07-27T11:00:00.000Z", next_sync_at: "2026-07-27T11:00:00.000Z" }, false, now), false);
});

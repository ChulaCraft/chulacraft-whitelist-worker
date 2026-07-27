import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidMinecraftUsername, normalizeMinecraftUsername, safeNextPath, statusMessage } from "./registration";
import { BoundedFetchTimeoutError, createBoundedFetch } from "./bounded-fetch";

afterEach(() => vi.unstubAllGlobals());

describe("Minecraft username validation", () => {
  it("trims valid names and rejects unsafe values", () => {
    expect(normalizeMinecraftUsername("  Example_Player ")).toBe("Example_Player");
    expect(isValidMinecraftUsername("Example_Player")).toBe(true);
    expect(isValidMinecraftUsername("no")).toBe(false);
    expect(isValidMinecraftUsername("player name")).toBe(false);
    expect(isValidMinecraftUsername("player;op")).toBe(false);
  });
});

describe("bounded server fetch", () => {
  it("converts its own timeout into a safe error", async () => {
    vi.stubGlobal("fetch", (_input: unknown, init?: RequestInit) => new Promise((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true })));
    await expect(createBoundedFetch(1)("https://example.test")).rejects.toBeInstanceOf(BoundedFetchTimeoutError);
  });

  it("preserves a caller cancellation instead of recategorizing it as a timeout", async () => {
    vi.stubGlobal("fetch", (_input: unknown, init?: RequestInit) => new Promise((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true })));
    const controller = new AbortController();
    const request = createBoundedFetch(10_000)("https://example.test", { signal: controller.signal });
    const reason = new Error("CALLER_CANCELLED");
    controller.abort(reason);
    await expect(request).rejects.toBe(reason);
  });
});

describe("safe redirect and status copy", () => {
  it("does not permit external redirect targets", () => {
    expect(safeNextPath("/register")).toBe("/register");
    expect(safeNextPath("//evil.example")).toBe("/register");
    expect(safeNextPath("/\\evil.example")).toBe("/register");
    expect(safeNextPath("https://evil.example")).toBe("/register");
  });
  it("never calls a pending registration complete", () => {
    expect(statusMessage({ desiredWhitelisted: true, syncStatus: "pending" })).toContain("Waiting");
    expect(statusMessage({ desiredWhitelisted: true, syncStatus: "synced" })).toContain("whitelisted");
  });
});

import { afterEach, describe, expect, it } from "vitest";

import { getPublicSupabaseEnvironment, getSiteUrl } from "./env";

const names = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL"
] as const;

const originalValues = Object.fromEntries(
  names.map((name) => [name, process.env[name]])
) as Record<(typeof names)[number], string | undefined>;

afterEach(() => {
  for (const name of names) {
    const value = originalValues[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("getPublicSupabaseEnvironment", () => {
  it("returns the explicitly referenced browser configuration", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";

    expect(getPublicSupabaseEnvironment()).toEqual({
      url: "https://project.supabase.co",
      key: "sb_publishable_test"
    });
  });

  it("reports all missing public configuration", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => getPublicSupabaseEnvironment()).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  });
});

describe("getSiteUrl", () => {
  it("prefers the explicitly configured public site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://play.chulacraft.example";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "fallback.vercel.app";

    expect(getSiteUrl()).toBe("https://play.chulacraft.example");
  });

  it("uses Vercel's stable production domain when configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL =
      "chulacraft-register.vercel.app";
    process.env.VERCEL_URL = "preview-123.vercel.app";

    expect(getSiteUrl()).toBe(
      "https://chulacraft-register.vercel.app"
    );
  });

  it("falls back to the deployment domain and then localhost", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.VERCEL_URL = "preview-123.vercel.app";

    expect(getSiteUrl()).toBe("https://preview-123.vercel.app");

    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

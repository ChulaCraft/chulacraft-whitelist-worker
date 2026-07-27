"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnvironment } from "@/lib/env";

export function createClient() {
  const { url, key } = getPublicSupabaseEnvironment();
  return createBrowserClient(url, key);
}

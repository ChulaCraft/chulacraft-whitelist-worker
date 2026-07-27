import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnvironment } from "@/lib/env";
import { createBoundedFetch } from "@/lib/bounded-fetch";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getPublicSupabaseEnvironment();

  return createServerClient(url, key, {
    global: { fetch: createBoundedFetch() },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components cannot write cookies. Middleware refreshes the session instead.
        }
      }
    }
  });
}

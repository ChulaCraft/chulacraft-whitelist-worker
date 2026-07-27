"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiscordIcon } from "@/components/icons";

export function AuthButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signIn() {
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo }
      });
      if (error) router.push("/auth/error?reason=start_failed");
    } catch {
      router.push("/auth/error?reason=start_failed");
    } finally {
      setLoading(false);
    }
  }

  return <button className={compact ? "button button-header-signup" : "button button-discord"} onClick={signIn} disabled={loading}>
    {!compact && <DiscordIcon />} {loading ? "Opening Discord…" : compact ? "Sign Up Now!" : "Sign Up with Discord"}
  </button>;
}

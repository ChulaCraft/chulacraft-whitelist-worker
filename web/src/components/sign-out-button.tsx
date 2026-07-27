"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }
  return <button className="text-button" onClick={signOut} disabled={loading}>{loading ? "Signing out…" : "Sign out"}</button>;
}

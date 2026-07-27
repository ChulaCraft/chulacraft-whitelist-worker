import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidMinecraftUsername, normalizeMinecraftUsername, type RegistrationView } from "@/lib/registration";

export const runtime = "nodejs";

const ipAttempts = new Map<string, { count: number; resetsAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function safeView(row: Record<string, unknown>): RegistrationView {
  return {
    minecraftUsername: String(row.minecraft_username),
    desiredWhitelisted: Boolean(row.desired_whitelisted),
    syncStatus: row.sync_status as RegistrationView["syncStatus"],
    updatedAt: String(row.updated_at)
  };
}

function ipRateLimited(key: string) {
  const now = Date.now();
  const current = ipAttempts.get(key);
  if (!current || current.resetsAt <= now) { ipAttempts.set(key, { count: 1, resetsAt: now + RATE_WINDOW_MS }); return false; }
  if (current.count >= RATE_LIMIT) return true;
  current.count += 1;
  return false;
}

async function resolveMinecraftProfile(username: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(username)}`, { signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("PROFILE_DEPENDENCY");
    const profile = await response.json() as { id?: string; name?: string };
    if (!profile.id || !profile.name || !/^[0-9a-f]{32}$/i.test(profile.id)) throw new Error("PROFILE_INVALID");
    const uuid = `${profile.id.slice(0, 8)}-${profile.id.slice(8, 12)}-${profile.id.slice(12, 16)}-${profile.id.slice(16, 20)}-${profile.id.slice(20)}`;
    return { uuid, username: profile.name };
  } finally { clearTimeout(timeout); }
}

export async function GET() {
  const supabase = await createClient();
  let user;
  try { ({ data: { user } } = await supabase.auth.getUser()); }
  catch { return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 }); }
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  let data;
  let error;
  try { ({ data, error } = await supabase.from("minecraft_registrations").select("minecraft_username, desired_whitelisted, sync_status, updated_at").maybeSingle()); }
  catch { return NextResponse.json({ error: "Could not load registration." }, { status: 503 }); }
  if (error) return NextResponse.json({ error: "Could not load registration." }, { status: 503 });
  return NextResponse.json({ registration: data ? safeView(data) : null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  let user;
  try { ({ data: { user } } = await supabase.auth.getUser()); }
  catch { return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 }); }
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (ipRateLimited(`ip:${forwardedFor}`)) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  let allowed: boolean | null;
  try {
    const { data, error } = await supabase.rpc("consume_registration_attempt");
    if (error) return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again." }, { status: 503 });
    allowed = data;
  } catch { return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again." }, { status: 503 }); }
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });

  let rawUsername: unknown;
  try { rawUsername = (await request.json() as { minecraftUsername?: unknown }).minecraftUsername; } catch { return NextResponse.json({ error: "Send a valid registration request." }, { status: 400 }); }
  if (typeof rawUsername !== "string" || !isValidMinecraftUsername(rawUsername)) return NextResponse.json({ error: "Enter 3–16 letters, numbers, or underscores." }, { status: 400 });

  let profile: { uuid: string; username: string } | null;
  try { profile = await resolveMinecraftProfile(normalizeMinecraftUsername(rawUsername)); } catch { return NextResponse.json({ error: "Minecraft profile lookup is temporarily unavailable. Please try again." }, { status: 503 }); }
  if (!profile) return NextResponse.json({ error: "We couldn’t find that Minecraft Java Edition profile." }, { status: 400 });

  let data;
  let error;
  try { ({ data, error } = await supabase.rpc("register_minecraft_profile", { p_minecraft_uuid: profile.uuid, p_minecraft_username: profile.username })); }
  catch { return NextResponse.json({ error: "We couldn’t save the registration. Please try again." }, { status: 503 }); }
  if (error) {
    if (error.code === "23505" || error.message.includes("REGISTRATION_CONFLICT")) return NextResponse.json({ error: "This Discord or Minecraft account is already registered." }, { status: 409 });
    return NextResponse.json({ error: "We couldn’t save the registration. Please try again." }, { status: 503 });
  }
  const registration = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ registration: safeView(registration as Record<string, unknown>) }, { status: registration?.created ? 201 : 200 });
}

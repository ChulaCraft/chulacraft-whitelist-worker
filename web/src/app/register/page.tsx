import { redirect } from "next/navigation";
import Image from "next/image";
import { RegistrationPanel } from "@/components/registration-panel";
import { SignOutButton } from "@/components/sign-out-button";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import type { RegistrationView } from "@/lib/registration";

export default async function RegisterPage() {
  const supabase = await createClient();
  let user;
  try { ({ data: { user } } = await supabase.auth.getUser()); }
  catch { return <main className="simple-page"><Brand /><section className="simple-card"><span className="error-symbol">!</span><h1>Registration is temporarily unavailable</h1><p>Please refresh in a moment. Your saved registration has not been changed.</p></section></main>; }
  if (!user) redirect("/");
  let data: { minecraft_username: string; desired_whitelisted: boolean; sync_status: string; updated_at: string } | null = null;
  let lookupFailed = false;
  try {
    const lookup = await supabase.from("minecraft_registrations").select("minecraft_username, desired_whitelisted, sync_status, updated_at").maybeSingle();
    data = lookup.data;
    lookupFailed = Boolean(lookup.error);
  } catch { lookupFailed = true; }
  const registration: RegistrationView | null = data ? {
    minecraftUsername: data.minecraft_username,
    desiredWhitelisted: data.desired_whitelisted,
    syncStatus: data.sync_status as RegistrationView["syncStatus"],
    updatedAt: data.updated_at
  } : null;
  const meta = user.user_metadata;
  const displayName = typeof meta.full_name === "string" ? meta.full_name : typeof meta.user_name === "string" ? meta.user_name : "Discord player";
  const avatar = typeof meta.avatar_url === "string" ? meta.avatar_url : null;

  return <main className="register-page"><header className="register-header"><Brand /><SignOutButton /></header><div className="register-shell">
    <aside className="register-aside"><span className="eyebrow"><i /> CHULACRAFT REGISTRATION</span><h1>One quick step from your next adventure.</h1><p>We’ll validate your Java Edition profile and securely request access to the Chulacraft whitelist.</p><div className="aside-steps"><span className="done">✓ <b>Discord connected</b></span><span>2 <b>Register Minecraft account</b></span><span>3 <b>Server confirmation</b></span></div></aside>
    <div className="registration-content"><div className="player-bar">{avatar ? <Image src={avatar} alt="" width={38} height={38} unoptimized referrerPolicy="no-referrer" /> : <span className="avatar-fallback">{displayName.charAt(0).toUpperCase()}</span>}<div><small>SIGNED IN WITH DISCORD</small><strong>{displayName}</strong></div></div><RegistrationPanel initialRegistration={registration} lookupFailed={lookupFailed} /></div>
  </div><footer className="register-footer">Java Edition only <span>•</span> Your registration is private</footer></main>;
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowIcon, ShieldIcon } from "@/components/icons";
import { isValidMinecraftUsername, normalizeMinecraftUsername, statusMessage, type RegistrationView } from "@/lib/registration";

type Props = { initialRegistration: RegistrationView | null };

export function RegistrationPanel({ initialRegistration, lookupFailed = false }: Props & { lookupFailed?: boolean }) {
  const [registration, setRegistration] = useState(initialRegistration);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!registration || registration.syncStatus === "synced" || !registration.desiredWhitelisted) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch("/api/registration", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { registration: RegistrationView | null };
        if (result.registration) setRegistration(result.registration);
      } catch { /* A later interval retries; do not create an unhandled rejection. */ }
    }, 3500);
    return () => window.clearInterval(interval);
  }, [registration]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = normalizeMinecraftUsername(username);
    if (!isValidMinecraftUsername(cleaned)) {
      setError("Enter 3–16 letters, numbers, or underscores.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/registration", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minecraftUsername: cleaned })
      });
      const result = await response.json() as { registration?: RegistrationView; error?: string };
      if (!response.ok || !result.registration) {
        setError(result.error || "We couldn’t save that registration. Please try again.");
        return;
      }
      setRegistration(result.registration);
    } catch {
      setError("Connection problem. Please try again in a moment.");
    } finally { setSubmitting(false); }
  }

  if (lookupFailed) {
    return <section className="registration-card" role="status"><span className="card-label">TEMPORARILY UNAVAILABLE</span><h2>We couldn’t load your registration</h2><p className="registration-intro">Please refresh in a moment. Your saved registration has not been changed.</p></section>;
  }

  if (registration) {
    const state = !registration.desiredWhitelisted ? "revoked" : registration.syncStatus;
    return <section className={`registration-card registration-${state}`} aria-live="polite">
      <div className="registration-card-top"><div className="status-emblem">{state === "synced" ? "✓" : state === "failed" ? "!" : "…"}</div><span className="card-label">YOUR REGISTRATION</span></div>
      <h2>{registration.minecraftUsername}</h2>
      <p className="registration-status">{statusMessage(registration)}</p>
      {registration.desiredWhitelisted && registration.syncStatus !== "synced" && <p className="status-note">This page checks for updates automatically. You can leave it open or come back later.</p>}
      <div className="registration-footer"><ShieldIcon /> Your account can only have one active Minecraft registration.</div>
    </section>;
  }

  return <section className="registration-card">
    <span className="card-label">STEP 2 OF 2</span><h2>Register your Minecraft account</h2>
    <p className="registration-intro">Enter the Java Edition username you’ll use to join Chulacraft.</p>
    <form onSubmit={submit} noValidate>
      <label htmlFor="minecraft-username">Minecraft username</label>
      <div className="input-wrap"><span aria-hidden="true">◈</span><input id="minecraft-username" name="minecraftUsername" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Example_Player" autoComplete="off" autoCapitalize="off" spellCheck="false" maxLength={16} required aria-describedby="username-help username-error" /></div>
      <p id="username-help" className="field-help">3–16 letters, numbers, or underscores. Java Edition only.</p>
      {error && <p id="username-error" className="field-error" role="alert">{error}</p>}
      <button className="button button-primary submit-button" type="submit" disabled={submitting}>{submitting ? "Checking account…" : <>Register and join whitelist <ArrowIcon /></>}</button>
    </form>
    <div className="registration-footer"><ShieldIcon /> Only register a Minecraft account that belongs to you.</div>
  </section>;
}

"use client";

import { useState } from "react";

export function ServerAddressCard({ address }: { address?: string }) {
  const [feedback, setFeedback] = useState("");
  const configured = Boolean(address);

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setFeedback("Server address copied.");
    } catch {
      setFeedback("Could not copy the address. Select it and copy manually.");
    }
  }

  return <aside className="server-card" aria-label="Server information">
    <span className="card-label">MINECRAFT JAVA</span>
    <strong>{address || "Server address coming soon"}</strong>
    <p>{configured ? "Use this address in Minecraft Java Edition." : "Sign in to register your account."}</p>
    {configured && <button className="copy-address" type="button" onClick={copyAddress}>Copy server IP</button>}
    <div className="online-indicator"><i /> Registration is available</div>
    <p className="sr-only" role="status" aria-live="polite">{feedback}</p>
  </aside>;
}

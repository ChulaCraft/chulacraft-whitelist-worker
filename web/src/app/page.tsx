import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ArrowIcon, ShieldIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { ServerAddressCard } from "@/components/server-address-card";

const serverAddress = process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS;

export default function HomePage() {
  return <main className="landing-page">
    <SiteHeader />
    <section className="hero">
      <div className="hero-aurora" /><div className="hero-grid" />
      <div className="hero-inner">
        <div className="eyebrow"><span /> JAVA EDITION SURVIVAL SERVER</div>
        <h1>ADVENTURE.<br />BUILD.<br /><em>TOGETHER.</em></h1>
        <p className="hero-copy">Join Chulacraft with your friends. Sign in with Discord, register your Java Edition username, and we’ll handle the whitelist.</p>
        <div className="hero-actions"><AuthButton /><Link className="button button-outline" href="#how-it-works">How it works <ArrowIcon /></Link></div>
        <div className="trust-row"><ShieldIcon /><span>Your Discord identity and Minecraft profile are stored only to manage your server registration.</span></div>
      </div>
      <ServerAddressCard address={serverAddress} />
    </section>
    <section className="steps-section" id="how-it-works">
      <div className="section-heading"><span className="eyebrow"><i /> QUICK &amp; SIMPLE</span><h2>Ready to join the world?</h2><p>No passwords to create. Use Discord, then tell us your Minecraft Java username.</p></div>
      <div className="steps">
        <article><b>01</b><div className="step-icon">◉</div><h3>Sign in with Discord</h3><p>We use Discord only to keep one secure registration per player.</p></article>
        <article><b>02</b><div className="step-icon">⌘</div><h3>Enter your Java username</h3><p>Use the exact Minecraft account you’ll use to join the server.</p></article>
        <article><b>03</b><div className="step-icon">✓</div><h3>Wait for confirmation</h3><p>We’ll tell you as soon as the server has added you to the whitelist.</p></article>
      </div>
    </section>
    <footer><span>© {new Date().getFullYear()} Chulacraft</span><span>Java Edition only</span></footer>
  </main>;
}

import type { Metadata } from "next";
import { AuthButton } from "@/components/auth-button";
import { ArrowIcon, DiscordIcon, ShieldIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { discordCommunityUrl } from "@/lib/site-links";

export const metadata: Metadata = {
  title: "About Us | Chulacraft",
  description: "Meet the community behind Chulacraft, a friendly Minecraft Java survival server built around playing together."
};

export default function AboutPage() {
  return <main className="about-page">
    <SiteHeader />
    <section className="about-hero">
      <div className="hero-aurora" /><div className="hero-grid" />
      <div className="about-hero-inner">
        <span className="eyebrow"><i /> ABOUT CHULACRAFT</span>
        <h1>A WORLD BUILT<br /><em>TOGETHER.</em></h1>
        <p>Chulacraft is a community-first Minecraft Java survival server where friends can build, explore, and create stories at their own pace.</p>
        <div className="about-actions">
          <a className="button button-discord" href={discordCommunityUrl} target="_blank" rel="noreferrer"><DiscordIcon /> Join our community</a>
          <AuthButton compact />
        </div>
      </div>
    </section>

    <section className="about-story">
      <div>
        <span className="eyebrow"><i /> OUR STORY</span>
        <h2>More than a server.</h2>
      </div>
      <div className="about-copy">
        <p>We started Chulacraft to make a relaxed place where people can enjoy survival Minecraft without feeling rushed. Whether you want to build a quiet home, team up on a huge project, or simply explore with friends, there is room for you here.</p>
        <p>Our goal is simple: keep the community welcoming, make joining easy, and let every player leave their own mark on the world.</p>
      </div>
    </section>

    <section className="about-values" aria-labelledby="values-heading">
      <div className="section-heading">
        <span className="eyebrow"><i /> WHAT MATTERS TO US</span>
        <h2 id="values-heading">Play your way. Build together.</h2>
      </div>
      <div className="value-grid">
        <article><span className="value-icon">⌂</span><h3>Community first</h3><p>A friendly space where new players and long-time builders can feel at home.</p></article>
        <article><span className="value-icon">✦</span><h3>Shared adventures</h3><p>Explore, trade, collaborate, and turn small ideas into memorable builds.</p></article>
        <article><span className="value-icon"><ShieldIcon /></span><h3>Safe and simple</h3><p>Discord sign-in and a private whitelist keep registration clear and secure.</p></article>
      </div>
    </section>

    <section className="about-cta">
      <span className="eyebrow"><i /> COME SAY HELLO</span>
      <h2>Your next adventure starts here.</h2>
      <p>Join the Discord community, meet the players, and get ready to enter the world.</p>
      <a className="button button-outline" href={discordCommunityUrl} target="_blank" rel="noreferrer">Open Chulacraft Discord <ArrowIcon /></a>
    </section>
    <SiteFooter />
  </main>;
}

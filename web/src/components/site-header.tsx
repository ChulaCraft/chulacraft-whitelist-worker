import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthButton } from "@/components/auth-button";
import { DiscordIcon } from "@/components/icons";
import { discordCommunityUrl } from "@/lib/site-links";

export function SiteHeader({ authenticated = false }: { authenticated?: boolean }) {
  return <header className="site-header"><div className="header-inner">
    <Brand showTagline={false} />
    <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/about">About Us</Link></nav>
    <a className="button button-outline header-community" href={discordCommunityUrl} target="_blank" rel="noreferrer"><DiscordIcon /> Our Community</a>
    {authenticated ? <Link className="button button-header-signup" href="/register">Register</Link> : <AuthButton compact />}
  </div></header>;
}

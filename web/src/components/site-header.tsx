import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthButton } from "@/components/auth-button";

export function SiteHeader({ authenticated = false }: { authenticated?: boolean }) {
  return <header className="site-header"><div className="header-inner">
    <Brand />
    <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/#how-it-works">How it works</Link><Link href="/register">Register</Link></nav>
    {authenticated ? <Link className="button button-primary header-register" href="/register">Register</Link> : <AuthButton compact />}
  </div></header>;
}

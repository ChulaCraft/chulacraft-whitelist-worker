import Link from "next/link";

export const SECTIONS = [
  { t: "About me", c: "var(--sec-about,#A5323F)", href: "/about" },
  { t: "Experience", c: "var(--sec-experience,#D9782B)", href: "/experience" },
  { t: "Activity", c: "var(--sec-activity,#3C8C68)", href: "/activity" },
  { t: "Certificate", c: "var(--sec-certificate,#E0B03A)", href: "/certificate" },
  { t: "Interest", c: "var(--sec-interest,#2F63B0)", href: "/interest" },
];

// Frosted bottom-centre section nav, shown on every page except Hero.
export default function SectionPill({ current, visible }: { current: string; visible: boolean }) {
  return (
    <nav
      aria-label="Sections"
      style={{
        position: "fixed", left: "50%", bottom: 24, zIndex: 20, maxWidth: "calc(100vw - 24px)", overflowX: "auto",
        display: "flex", alignItems: "center", gap: 2, padding: 6, borderRadius: 999,
        background: "color-mix(in oklch, var(--color-bg) 70%, transparent)",
        backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        border: "1px solid color-mix(in oklch, var(--color-text) 10%, transparent)", boxShadow: "var(--shadow-lg)",
        transform: `translateX(-50%) translateY(${visible ? "0px" : "120px"})`, opacity: visible ? 1 : 0,
        transition: "transform 600ms cubic-bezier(.2,.9,.2,1.1), opacity 300ms ease",
      }}
    >
      <Link
        href="/#layers"
        aria-label="Back to the opened croissant"
        className="hover-wash"
        style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
      </Link>
      <span style={{ flex: "0 0 auto", width: 1, height: 22, background: "var(--color-divider)", margin: "0 4px" }} />
      {SECTIONS.map((s) => {
        const active = s.t === current;
        return (
          <Link
            key={s.t}
            href={active ? "#" : s.href}
            aria-current={active ? "page" : undefined}
            className="hover-wash"
            style={{
              flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px",
              borderRadius: 999, fontSize: 14, whiteSpace: "nowrap", color: "var(--color-text)",
              background: active ? "var(--color-bg)" : "transparent", boxShadow: active ? "var(--shadow-sm)" : "none",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.c }} />
            {s.t}
          </Link>
        );
      })}
    </nav>
  );
}

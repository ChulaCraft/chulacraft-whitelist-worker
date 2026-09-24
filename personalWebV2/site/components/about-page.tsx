"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import portrait from "@/assets/about/about-portrait.webp";
import SectionPill from "@/components/section-pill";
import { PAD_X, Page, PageFooter, TopBar } from "@/components/section-chrome";
import { EDUCATION, INFO_LEFT, INFO_RIGHT, ROLES, STORY, type InfoItem } from "@/content/about";

const ABOUT = "var(--sec-about,#A5323F)";
const SECTION: CSSProperties = { borderTop: "1px solid var(--color-divider)", padding: `clamp(56px,9vh,112px) ${PAD_X}`, display: "flex", flexDirection: "column", alignItems: "center" };
const H2: CSSProperties = { margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1 };
const KICKER: CSSProperties = { margin: 0, fontStyle: "italic", color: ABOUT, fontSize: 17 };
const MUTED_ITALIC: CSSProperties = { fontStyle: "italic", fontSize: 14, color: "var(--color-neutral-700)" };

// Pile offsets [x, y, rotate] that the education cards fan out from.
const PILE_WIDE = [["calc(100% + 28px)", "14px", "-6deg"], ["0px", "0px", "2deg"], ["calc(-100% - 28px)", "10px", "5deg"]];
const PILE_NARROW = [["0px", "48px", "-2deg"], ["0px", "48px", "2deg"], ["0px", "48px", "-1deg"]];

const simpleIcon = (slug: string) => `https://cdn.simpleicons.org/${slug}/3d3a36`;

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
      <p style={KICKER}>{kicker}</p>
      <h2 style={H2}>{title}</h2>
    </div>
  );
}

function InfoRow({ f, style }: { f: InfoItem; style: CSSProperties }) {
  const value: CSSProperties = { fontFamily: "var(--font-heading)", fontSize: "clamp(18px,1.8vw,26px)", lineHeight: 1.2, color: "var(--color-text)", whiteSpace: "nowrap" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <span style={MUTED_ITALIC}>{f.k}</span>
      {f.href ? <a href={f.href} style={value}>{f.v}</a> : <span style={value}>{f.v}</span>}
    </div>
  );
}

export default function AboutPage() {
  const r1 = useRef<HTMLElement>(null);
  const r2 = useRef<HTMLElement>(null);
  const r3 = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState({ v1: false, v2: false, v3: false });
  const [nav, setNav] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const r = r1.current;
      setNav(r ? r.getBoundingClientRect().bottom < 80 : scrollY > 600);
    };
    const onResize = () => setNarrow(innerWidth < 720);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    onResize();

    let io: IntersectionObserver | undefined;
    let timer: number | undefined;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion: render the final state
      setSeen({ v1: true, v2: true, v3: true });
    } else {
      const keys = new Map<Element, "v1" | "v2" | "v3">();
      ([[r1, "v1"], [r2, "v2"], [r3, "v3"]] as const).forEach(([r, k]) => r.current && keys.set(r.current, k));
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const k = keys.get(e.target)!;
        setSeen((s) => ({ ...s, [k]: true }));
        io!.unobserve(e.target);
      }), { threshold: 0.2 });
      keys.forEach((_, el) => io!.observe(el));
      timer = window.setTimeout(() => setSeen((s) => ({ ...s, v1: true })), 200);
    }

    return () => {
      io?.disconnect();
      clearTimeout(timer);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
    };
  }, []);

  const { v1, v2, v3 } = seen;
  const pile = narrow ? PILE_NARROW : PILE_WIDE;
  const rule = `2px solid ${ABOUT}`;
  const slide = (side: number, delay: number): CSSProperties => ({
    opacity: v1 ? 1 : 0,
    transform: `translateX(${v1 ? 0 : side * 40}px)`,
    transition: `all 800ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
  });

  return (
    <Page hover={ABOUT}>
      <TopBar title="About me" color={ABOUT} />
      <SectionPill current="About me" visible={nav} />

      {/* 1 · Profile */}
      <section ref={r1} style={{ ...SECTION, borderTop: "none", gap: "clamp(40px,6vh,64px)" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(56px,8vw,112px)", lineHeight: 0.9, textAlign: "center", opacity: v1 ? 1 : 0, transform: `translateY(${v1 ? 0 : 24}px)`, transition: "all 900ms cubic-bezier(.2,.7,.2,1)" }}>About me</h1>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "clamp(32px,5vw,72px)", width: "100%", maxWidth: 1200 }}>
          <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 32, alignItems: narrow ? "flex-start" : "flex-end", textAlign: narrow ? "left" : "right", order: narrow ? 3 : 1 }}>
            {INFO_LEFT.map((f, i) => (
              <InfoRow key={f.k} f={f} style={{ ...(narrow ? { paddingLeft: 20, borderLeft: rule } : { paddingRight: 20, borderRight: rule }), ...slide(1, 450 + i * 140) }} />
            ))}
          </div>
          <div style={{ flex: "0 0 auto", order: 2, position: "relative", width: "clamp(240px,26vw,340px)", height: "clamp(240px,26vw,340px)", opacity: v1 ? 1 : 0, transform: `scale(${v1 ? 1 : 0.9})`, transition: "all 1100ms cubic-bezier(.2,.8,.2,1) 150ms" }}>
            <div style={{ position: "absolute", inset: -14, border: `1px solid ${ABOUT}`, borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: -28, border: "1px solid var(--color-divider)", borderRadius: "50%" }} />
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
              <Image src={portrait} alt="Portrait of Ratchaphon Pungtamgerdpol" fill priority placeholder="blur" sizes="340px" style={{ objectFit: "cover" }} />
            </div>
          </div>
          <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 32, alignItems: "flex-start", order: 3 }}>
            {INFO_RIGHT.map((f, i) => (
              <InfoRow key={f.k} f={f} style={{ paddingLeft: 20, borderLeft: rule, ...slide(-1, 550 + i * 140) }} />
            ))}
          </div>
        </div>
      </section>

      {/* 2 · Education path */}
      <section ref={r2} style={{ ...SECTION, gap: "clamp(40px,6vh,72px)", overflow: "hidden" }}>
        <SectionHeading kicker="How I got here" title="My education path" />
        <div style={{ position: "relative", width: "100%", maxWidth: 1160, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 28 }}>
          <div style={{ position: "absolute", left: "8%", right: "8%", top: 52, height: 1, background: "var(--color-accent-300)", transformOrigin: "left", transform: `scaleX(${v2 ? 1 : 0})`, transition: "transform 1400ms cubic-bezier(.6,0,.2,1) 700ms" }} />
          {EDUCATION.map((c, i) => {
            const d = `${200 + i * 120}ms`;
            const [x, y, r] = v2 ? ["0px", "0px", "0deg"] : pile[i];
            return (
              <div key={c.n} style={{ position: "relative", minWidth: 0, minHeight: 380, background: "var(--color-bg)", border: `1px solid ${i === 2 ? ABOUT : "var(--color-divider)"}`, borderRadius: "var(--radius-md,4px)", padding: 32, display: "flex", flexDirection: "column", gap: 18, boxShadow: "var(--shadow-sm)", transform: `translateX(${x}) translateY(${y}) rotate(${r})`, opacity: v2 || !narrow ? 1 : 0, transition: `transform 1100ms cubic-bezier(.2,.8,.2,1) ${d}, opacity 500ms ease ${d}`, zIndex: i === 1 ? 2 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${ABOUT}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 22, fontFeatureSettings: "'tnum'", background: "var(--color-bg)" }}>{c.n}</span>
                  <span style={MUTED_ITALIC}>{c.k}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: "0 0 auto", width: 72, height: 72, border: "1px solid var(--color-divider)", borderRadius: "50%", padding: 4 }}>
                    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                      <Image src={c.logo} alt={`${c.t} logo`} fill sizes="64px" style={{ objectFit: "contain" }} />
                    </div>
                  </div>
                  {c.wordmark && (
                    <div style={{ flex: "0 1 auto", minWidth: 0, width: 140, height: 56, border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md,4px)", padding: "8px 10px", background: "#fff" }}>
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <Image src={c.wordmark} alt="CEDT wordmark" fill sizes="120px" style={{ objectFit: "contain" }} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, lineHeight: 1.12 }}>{c.t}</div>
                <div style={{ height: 1, background: "var(--color-divider)" }} />
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, textAlign: "justify", hyphens: "auto" }}>{c.b}</p>
              </div>
            );
          })}
        </div>
        <div style={{ width: "100%", maxWidth: 1160, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(24px,4vw,64px)", paddingTop: "clamp(24px,4vh,48px)", borderTop: "1px solid var(--color-divider)", opacity: v2 ? 1 : 0, transform: `translateY(${v2 ? 0 : 24}px)`, transition: "all 900ms ease 1200ms" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(30px,3.2vw,44px)", lineHeight: 1.15 }}>From software engineering to AI</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 17, lineHeight: 1.7, textAlign: "justify", hyphens: "auto" }}>
            {STORY.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* 3 · Tech, by role */}
      <section ref={r3} style={{ ...SECTION, gap: "clamp(40px,6vh,64px)" }}>
        <SectionHeading kicker="What I work with" title="Tech, by role" />
        <div style={{ width: "100%", maxWidth: 1240, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,360px),1fr))", gap: 24 }}>
          {ROLES.map((g, i) => (
            <div key={g.t} style={{ border: "1px solid var(--color-divider)", borderTop: `2px solid ${g.c}`, borderRadius: "var(--radius-md,4px)", padding: 28, display: "flex", flexDirection: "column", gap: 20, opacity: v3 ? 1 : 0, transform: `translateY(${v3 ? 0 : 32}px)`, transition: `all 800ms cubic-bezier(.2,.7,.2,1) ${i * 110}ms` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, lineHeight: 1.1 }}>{g.t}</div>
                <div style={{ fontStyle: "italic", fontSize: 15, color: "var(--color-neutral-700)" }}>{g.sub}</div>
              </div>
              {g.groups.map((sg, j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sg.k && <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-neutral-700)" }}>{sg.k}</div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sg.items.map(([n, slug]) => (
                      <span key={n} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--color-divider)", borderRadius: 999, padding: "6px 12px 6px 10px", fontSize: 14, lineHeight: 1.2, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {slug && <span data-si="" aria-hidden="true" style={{ flex: "0 0 auto", width: 16, height: 16, display: "block", backgroundImage: `url(${simpleIcon(slug)})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />}
                        <span>{n}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <PageFooter>
        <a href="mailto:kaikub.contact@gmail.com">kaikub.contact@gmail.com</a>
      </PageFooter>
    </Page>
  );
}

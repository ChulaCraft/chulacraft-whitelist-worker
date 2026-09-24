import Link from "next/link";
import type { CSSProperties, ReactNode, Ref } from "react";

export const PAD_X = "clamp(20px,5vw,88px)";

// Page wrapper: body font, and the section colour used for link hovers.
export function Page({ hover, children }: { hover: string; children: ReactNode }) {
  return <div style={{ fontFamily: "var(--font-body)", color: "var(--color-text)", ["--link-hover" as string]: hover }}>{children}</div>;
}

export function TopBar({ title, color }: { title: string; color: string }) {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, padding: `20px ${PAD_X}`, borderBottom: "1px solid var(--color-divider)" }}>
      <Link href="/#layers" style={{ fontStyle: "italic", fontSize: 15 }}>Back to the croissant</Link>
      <span style={{ fontStyle: "italic", fontSize: 15, color }}>{title}</span>
    </nav>
  );
}

export function PageFooter({ children }: { children: ReactNode }) {
  return (
    <footer style={{ borderTop: "1px solid var(--color-divider)", padding: `32px ${PAD_X} 120px`, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 15, fontStyle: "italic" }}>
      <Link href="/#layers">Back to the croissant</Link>
      {children}
    </footer>
  );
}

// "Layer N of five" header shared by Experience, Activity, Certificate and Interest.
export function LayerHeader({ ref, head, kicker, title, lede, color }: { ref: Ref<HTMLElement>; head: boolean; kicker: string; title: string; lede: string; color: string }) {
  const o = head ? 1 : 0;
  return (
    <section ref={ref} style={{ padding: `clamp(56px,9vh,112px) ${PAD_X} clamp(32px,5vh,56px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
      <p style={{ margin: 0, fontStyle: "italic", color: "var(--color-accent-700)", fontSize: 17, opacity: o, transition: "opacity 700ms ease" }}>{kicker}</p>
      <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(56px,8vw,112px)", lineHeight: 0.9, opacity: o, transform: `translateY(${head ? 0 : 24}px)`, transition: "all 900ms cubic-bezier(.2,.7,.2,1) 100ms" }}>{title}</h1>
      <div style={{ height: 2, background: color, width: head ? 160 : 0, transition: "width 1100ms cubic-bezier(.6,0,.2,1) 400ms" }} />
      <p style={{ margin: 0, maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, opacity: o, transition: "opacity 900ms ease 600ms" }}>{lede}</p>
    </section>
  );
}

export const TAG = (color: string): CSSProperties => ({ borderColor: color, color: "var(--color-text)", whiteSpace: "nowrap", flexShrink: 0 });
export const CHIP: CSSProperties = { border: "1px solid var(--color-divider)", borderRadius: 999, padding: "5px 12px", fontSize: 14 };
export const META: CSSProperties = { fontStyle: "italic", fontSize: 15, color: "var(--color-neutral-700)", fontFeatureSettings: "'tnum'" };
export const HAIRLINE: CSSProperties = { height: 1, background: "var(--color-divider)" };
export const BODY: CSSProperties = { margin: 0, fontSize: 17, lineHeight: 1.65, textAlign: "justify", hyphens: "auto" };
export const ORG: CSSProperties = { fontSize: 16, fontStyle: "italic", color: "var(--color-accent-700)" };
export const CAPTION: CSSProperties = { fontStyle: "italic", fontSize: 14, color: "var(--color-neutral-700)" };

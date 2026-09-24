"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "@/components/section-pill";

export const OPEN_KEY = "thunwa-open";

// Landing page: a pinned 320vh scroll that unfolds the 3D croissant into five layers.
// The croissant (lib/croissant.js) writes --unfold (0→1) onto the [data-pin] section.
export default function Hero() {
  const router = useRouter();

  useEffect(() => {
    import("@/lib/croissant");

    const onSelect = (e: Event) => {
      const s = SECTIONS.find((x) => x.t === (e as CustomEvent<{ title: string }>).detail.title);
      if (s) router.push(s.href);
    };
    document.addEventListener("part-select", onSelect);

    // Deep link: arriving via #layers (or back from a section) opens the croissant at 80%.
    let wantOpen = location.hash === "#layers";
    try { if (sessionStorage.getItem(OPEN_KEY) === "1") { wantOpen = true; sessionStorage.removeItem(OPEN_KEY); } } catch {}
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      const el = document.getElementById("hero");
      if (!el || el.offsetHeight < innerHeight * 2) return;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (el.offsetHeight - innerHeight) * 0.8, behavior: "instant" });
    };
    const onReady = () => { go(); setTimeout(go, 150); };
    if (wantOpen) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      let n = 0;
      const tick = () => { go(); if (++n < 40) timer = setTimeout(tick, 100); };
      tick();
      document.addEventListener("croissant-ready", onReady, { once: true });
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener("part-select", onSelect);
      document.removeEventListener("croissant-ready", onReady);
    };
  }, [router]);

  const unfold = "var(--unfold,0)";
  const hint: React.CSSProperties = { position: "absolute", left: 0, right: 0, bottom: "clamp(24px,5vh,48px)", display: "flex", justifyContent: "center", fontSize: 14, fontStyle: "italic", pointerEvents: "none" };

  return (
    <section id="hero" data-pin="" style={{ position: "relative", height: "320vh", background: "var(--color-bg)" }}>
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 55%, var(--color-accent-100), var(--color-bg) 75%)", opacity: unfold, pointerEvents: "none" }} />
        <div data-center="" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", padding: "0 24px", opacity: unfold, transform: `scale(calc(0.92 + ${unfold} * 0.08))` }}>
          <p style={{ margin: 0, fontStyle: "italic", color: "var(--color-accent-700)", fontSize: 17 }}>Chulalongkorn University</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.92 }}>
            <span style={{ fontSize: "clamp(48px,min(8vw,12vh),128px)", letterSpacing: "-0.02em" }}>Ratchaphon</span>
            <span style={{ fontSize: "clamp(32px,min(4.8vw,7.5vh),78px)", fontStyle: "italic", color: "var(--color-accent-700)" }}>Pungtamgerdpol</span>
          </h1>
          <div style={{ width: 120, height: 1, background: "var(--color-accent-300)" }} />
          <p style={{ margin: 0, fontSize: "clamp(15px,1.3vw,18px)" }}>Computer Engineering and Digital Technology (CEDT)</p>
        </div>
        <croissant-3d size="0.9" force="0" label-font="italic 500 26px var(--font-cormorant), serif" style={{ position: "absolute", inset: 0 }} />
        <div style={{ ...hint, opacity: `calc(1 - ${unfold} * 4)` }}>Scroll</div>
        <div style={{ ...hint, color: "var(--color-neutral-700)", opacity: `calc(${unfold} * 3 - 2)` }}>Point at a layer to see what’s inside</div>
      </div>
    </section>
  );
}

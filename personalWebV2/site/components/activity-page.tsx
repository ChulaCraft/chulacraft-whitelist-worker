"use client";

import { useRef } from "react";
import SectionPill from "@/components/section-pill";
import Slot from "@/components/slot";
import { BODY, CAPTION, CHIP, LayerHeader, META, ORG, PAD_X, Page, PageFooter, TAG, TopBar } from "@/components/section-chrome";
import { ACTIVITIES } from "@/content/activity";
import { useHeadIn, useNavVisible, useSeenList } from "@/lib/reveal";

const GREEN = "var(--sec-activity,#3C8C68)";

export default function ActivityPage() {
  const rHead = useRef<HTMLElement>(null);
  const rList = useRef<HTMLElement>(null);
  const head = useHeadIn();
  const nav = useNavVisible(rHead);
  const seen = useSeenList(rList, 0.2);

  return (
    <Page hover={GREEN}>
      <TopBar title="Activity" color={GREEN} />
      <LayerHeader ref={rHead} head={head} kicker="Layer four of five" title="Activity" lede="Competitions, programmes and volunteering, newest first." color={GREEN} />

      <section ref={rList} style={{ padding: `clamp(24px,4vh,48px) ${PAD_X} clamp(96px,14vh,160px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(72px,12vh,140px)" }}>
        {ACTIVITIES.map((x, i) => {
          const on = !!seen[i], left = i % 2 === 0, o = on ? 1 : 0;
          const y1 = on ? 0 : 16, y2 = on ? 0 : 24;
          return (
            <article key={x.title} data-reveal={i} style={{ width: "100%", maxWidth: 1200, display: "flex", flexWrap: "wrap", flexDirection: left ? "row" : "row-reverse", alignItems: "center", gap: "clamp(28px,5vw,72px)" }}>
              <figure style={{ margin: 0, flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="plate" style={{ width: "100%", aspectRatio: x.ratio, overflow: "hidden", clipPath: on ? "inset(0 0 0 0)" : left ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)", transition: "clip-path 1200ms cubic-bezier(.7,0,.2,1)" }}>
                  <div style={{ width: "100%", height: "100%", transform: `scale(${on ? 1 : 1.12})`, transition: "transform 1800ms cubic-bezier(.2,.7,.2,1)" }}>
                    <Slot src={x.photo} alt={x.ph} sizes="(max-width: 900px) 100vw, 640px" priority={i === 0} />
                  </div>
                </div>
                <figcaption style={{ ...CAPTION, opacity: o, transition: "opacity 700ms ease 900ms" }}>{x.cap}</figcaption>
              </figure>
              <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, opacity: o, transform: `translateY(${y1}px)`, transition: "all 800ms cubic-bezier(.2,.7,.2,1) 300ms" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(56px,6vw,88px)", lineHeight: 0.8, color: "transparent", WebkitTextStroke: `1px ${GREEN}`, fontFeatureSettings: "'tnum'" }}>{x.year}</span>
                  <span style={META}>{x.when}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, opacity: o, transition: "opacity 700ms ease 400ms" }}>
                  <span className="tag tag-outline" style={TAG(GREEN)}>{x.kind}</span>
                  {x.award && <span className="tag tag-outline" style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", fontFeatureSettings: "'tnum'", minHeight: 24, paddingTop: 3, paddingBottom: 3, lineHeight: 1.3 }}>{x.award}</span>}
                </div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(32px,3.4vw,48px)", lineHeight: 1.05, textWrap: "balance", opacity: o, transform: `translateY(${y2}px)`, transition: "all 900ms cubic-bezier(.2,.7,.2,1) 450ms" }}>{x.title}</h2>
                <div style={{ ...ORG, opacity: o, transition: "opacity 700ms ease 550ms" }}>{x.org}</div>
                <div style={{ height: 1, background: "var(--color-divider)", transformOrigin: "left", transform: `scaleX(${o})`, transition: "transform 900ms cubic-bezier(.6,0,.2,1) 600ms" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: o, transform: `translateY(${y2}px)`, transition: "all 900ms cubic-bezier(.2,.7,.2,1) 700ms" }}>
                  {x.paras.map((pa) => <p key={pa} style={BODY}>{pa}</p>)}
                </div>
                {x.skills && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, opacity: o, transition: "opacity 700ms ease 900ms" }}>
                    {x.skills.map((sk) => <span key={sk} style={CHIP}>{sk}</span>)}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <PageFooter>
        <a href="https://www.linkedin.com/in/ratchaphon-pungtamgerdpol/" target="_blank" rel="noopener">More on LinkedIn</a>
      </PageFooter>
      <SectionPill current="Activity" visible={nav} />
    </Page>
  );
}

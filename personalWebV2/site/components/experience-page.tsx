"use client";

import { useEffect, useRef, useState } from "react";
import SectionPill from "@/components/section-pill";
import Slot from "@/components/slot";
import { BODY, CHIP, HAIRLINE, LayerHeader, META, ORG, PAD_X, Page, PageFooter, TAG, TopBar } from "@/components/section-chrome";
import { EXPERIENCE } from "@/content/experience";
import { prefersReducedMotion, useHeadIn, useNavVisible, useSeenList } from "@/lib/reveal";

const ORANGE = "var(--sec-experience,#D9782B)";

export default function ExperiencePage() {
  const rHead = useRef<HTMLElement>(null);
  const rList = useRef<HTMLElement>(null);
  const head = useHeadIn();
  const nav = useNavVisible(rHead);
  const seen = useSeenList(rList, 0.25);
  const [lineP, setLineP] = useState(0);

  // Timeline progress line follows scroll through the list.
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const onScroll = () => {
      const l = rList.current;
      if (!l) return;
      if (reduce) return setLineP(1);
      const r = l.getBoundingClientRect();
      setLineP(Math.max(0, Math.min(1, (innerHeight * 0.7 - r.top) / Math.max(1, r.height - innerHeight * 0.2))));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Page hover={ORANGE}>
      <TopBar title="Experience" color={ORANGE} />
      <LayerHeader ref={rHead} head={head} kicker="Layer two of five" title="Experience" lede="Work, things I’ve started, and communities I help run." color={ORANGE} />

      <section ref={rList} style={{ padding: `clamp(24px,4vh,48px) ${PAD_X} clamp(96px,14vh,160px)`, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: "clamp(40px,6vh,64px)" }}>
          <div style={{ position: "absolute", left: 23, top: 24, bottom: 24, width: 1, background: "var(--color-divider)" }} />
          <div style={{ position: "absolute", left: 23, top: 24, bottom: 24, width: 1, background: ORANGE, transformOrigin: "top", transform: `scaleY(${lineP})` }} />
          {EXPERIENCE.map((x, i) => {
            const on = !!seen[i];
            return (
              <article key={x.role} data-reveal={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "48px minmax(0,1fr)", gap: "clamp(16px,3vw,40px)" }}>
                <div style={{ position: "relative", zIndex: 1, width: 48, height: 48, borderRadius: "50%", border: `1px solid ${ORANGE}`, background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 1 : 0.6})`, transition: "transform 600ms cubic-bezier(.2,.9,.2,1.2)" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: on ? ORANGE : "transparent", transition: "background 400ms ease 300ms" }} />
                </div>
                <div style={{ perspective: 1400 }}>
                  <div style={{ border: "1px solid var(--color-divider)", borderTop: `2px solid ${i === 0 ? ORANGE : "var(--color-divider)"}`, borderRadius: "var(--radius-md,4px)", background: "var(--color-bg)", boxShadow: "var(--shadow-sm)", transformOrigin: "top center", transform: `rotateX(${on ? 0 : -72}deg)`, opacity: on ? 1 : 0, transition: "transform 1000ms cubic-bezier(.2,.8,.2,1), opacity 500ms ease", display: "flex", flexDirection: "column" }}>
                    {x.plate && (
                      <div style={{ padding: "clamp(12px,1.6vw,20px) clamp(12px,1.6vw,20px) 0" }}>
                        <div className="plate" style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                          <Slot src={x.plate} alt={x.platePh} sizes="(max-width: 1080px) 100vw, 1000px" />
                        </div>
                      </div>
                    )}
                    <div style={{ padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
                        <span className="tag tag-outline" style={TAG(ORANGE)}>{x.kind}</span>
                        <span style={META}>{x.when}</span>
                        {x.place && <span style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>{x.place}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ flex: "0 0 auto", width: 56, height: 56, border: "1px solid var(--color-divider)", borderRadius: "50%", padding: 3 }}>
                          {x.logo && <Slot src={x.logo} alt={`${x.org} logo`} fit="contain" sizes="50px" round />}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                          <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(30px,3vw,40px)", lineHeight: 1.05 }}>{x.role}</h2>
                          <div style={ORG}>{x.org}</div>
                        </div>
                      </div>
                      <div style={HAIRLINE} />
                      {x.body && <p style={BODY}>{x.body}</p>}
                      {x.sub && <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 22, lineHeight: 1.2 }}>{x.sub}</p>}
                      {x.points && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {x.points.map((pt) => (
                            <div key={pt} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10, fontSize: 16, lineHeight: 1.5 }}>
                              <span style={{ marginTop: 9, width: 8, height: 1, background: ORANGE }} />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {x.skills && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {x.skills.map((sk) => <span key={sk} style={CHIP}>{sk}</span>)}
                        </div>
                      )}
                      {x.links && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                          {x.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener" className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>{l.t}</a>)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <PageFooter>
        <a href="https://www.linkedin.com/in/ratchaphon-pungtamgerdpol/" target="_blank" rel="noopener">Full history on LinkedIn</a>
      </PageFooter>
      <SectionPill current="Experience" visible={nav} />
    </Page>
  );
}

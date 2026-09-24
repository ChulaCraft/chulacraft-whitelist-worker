"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import SectionPill from "@/components/section-pill";
import Slot from "@/components/slot";
import { CAPTION, HAIRLINE, LayerHeader, META, PAD_X, Page, PageFooter, TAG, TopBar } from "@/components/section-chrome";
import { GAME_SKILLS, GENIE_SKILLS, REPOS, SIDE_PROJECTS } from "@/content/interest";
import { prefersReducedMotion, useHeadIn, useNavVisible, useScrolledInto } from "@/lib/reveal";
import genieTa from "@/assets/interest/interest-genie-ta.png";
import courseMind from "@/assets/interest/interest-coursemind.png";
import javaIsYou from "@/assets/interest/interest-java-is-you.webp";

const BLUE = "var(--sec-interest,#2F63B0)";
const H2: CSSProperties = { margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1 };
const LEAD: CSSProperties = { margin: 0, fontSize: 18, lineHeight: 1.7, textAlign: "justify", hyphens: "auto" };
const PILL: CSSProperties = { border: "1px solid var(--color-divider)", borderRadius: 999, padding: "5px 12px", fontSize: 14, whiteSpace: "nowrap", flexShrink: 0 };
const SECTION = (last = false): CSSProperties => ({ borderTop: "1px solid var(--color-divider)", padding: `clamp(72px,11vh,128px) ${PAD_X} clamp(96px,14vh,160px)`, display: "flex", ...(last ? { flexDirection: "column", alignItems: "center", gap: "clamp(40px,6vh,64px)" } : { justifyContent: "center" }) });

// A plate whose image wipes open (clip-path) and settles from a slight zoom.
function Wipe({ on, from, delay = 0, ratio, children }: { on: boolean; from: string; delay?: number; ratio: string; children: React.ReactNode }) {
  return (
    <div className="plate" style={{ width: "100%", aspectRatio: ratio, overflow: "hidden", clipPath: on ? "inset(0 0 0 0)" : from, transition: `clip-path 1400ms cubic-bezier(.7,0,.2,1) ${delay}ms` }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${on ? 1 : 1.08})`, transition: `transform 2000ms cubic-bezier(.2,.7,.2,1) ${delay}ms` }}>{children}</div>
    </div>
  );
}

export default function InterestPage() {
  const rHead = useRef<HTMLElement>(null);
  const rMain = useRef<HTMLElement>(null);
  const rTwo = useRef<HTMLElement>(null);
  const rThree = useRef<HTMLElement>(null);
  const rMore = useRef<HTMLElement>(null);
  const head = useHeadIn();
  const nav = useNavVisible(rHead);
  const main = useScrolledInto(rMain, 0.85);
  const two = useScrolledInto(rTwo, 0.8);
  const three = useScrolledInto(rThree, 0.8);
  const more = useScrolledInto(rMore, 0.8);
  const [par, setPar] = useState(0);

  // "2026" numeral drifts ±40px with scroll.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onScroll = () => {
      const m = rMain.current;
      if (!m) return;
      const r = m.getBoundingClientRect();
      setPar(Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight)));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const mo = main ? 1 : 0;
  const rise = (on: boolean, px = 24) => `translateY(${on ? 0 : px}px)`;

  return (
    <Page hover={BLUE}>
      <TopBar title="Interest" color={BLUE} />
      <LayerHeader ref={rHead} head={head} kicker="Layer five of five" title="Interest" lede="What I’m studying and exploring right now." color={BLUE} />

      {/* Genie TA */}
      <section ref={rMain} style={{ padding: `clamp(24px,4vh,48px) ${PAD_X} clamp(96px,14vh,160px)`, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexDirection: "column", gap: "clamp(32px,5vh,56px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px 40px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flex: "1 1 520px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px", opacity: mo, transition: "opacity 700ms ease 100ms" }}>
                <span className="tag tag-outline" style={TAG(BLUE)}>Individual study</span>
                <span style={META}>2026 · Now</span>
              </div>
              <h2 style={{ ...H2, textWrap: "balance", opacity: mo, transform: rise(main), transition: "all 900ms cubic-bezier(.2,.7,.2,1) 200ms" }}>RAG model evaluation for Genie TA</h2>
              <div style={{ fontSize: 17, fontStyle: "italic", color: "var(--color-accent-700)", opacity: mo, transition: "opacity 700ms ease 350ms" }}>Chulalongkorn University</div>
            </div>
            <span aria-hidden="true" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(88px,12vw,180px)", lineHeight: 0.75, color: "transparent", WebkitTextStroke: `1px ${BLUE}`, fontFeatureSettings: "'tnum'", transform: `translateY(${(par * 40).toFixed(1)}px)`, opacity: mo, transition: "opacity 900ms ease 300ms" }}>2026</span>
          </div>
          <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <Wipe on={main} from="inset(100% 0 0 0)" delay={300} ratio="1881/930">
              <Slot src={genieTa} alt="Genie TA screenshot" fit="contain" sizes="(max-width: 1200px) 100vw, 1200px" priority />
            </Wipe>
            <figcaption style={CAPTION}>Genie TA, a course learning assistant powered by Chula AI.</figcaption>
          </figure>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(24px,4vw,64px)", paddingTop: "clamp(24px,4vh,40px)", borderTop: "1px solid var(--color-divider)", opacity: mo, transform: rise(main), transition: "all 900ms cubic-bezier(.2,.7,.2,1)" }}>
            <p style={LEAD}>I am enrolled in an individual study at Chulalongkorn University, evaluating the retrieval-augmented generation (RAG) model behind Genie TA, a personal learning assistant that answers students’ questions for a specific course.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontStyle: "italic", fontSize: 14, color: "var(--color-neutral-700)" }}>Related skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{GENIE_SKILLS.map((sk) => <span key={sk} style={PILL}>{sk}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CourseMind */}
      <section ref={rTwo} style={SECTION()}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,72px)" }}>
          <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18, opacity: two ? 1 : 0, transform: rise(two), transition: "all 900ms cubic-bezier(.2,.7,.2,1) 200ms" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
              <span className="tag tag-outline" style={TAG(BLUE)}>Prototype</span>
              <span style={{ fontStyle: "italic", fontSize: 15, color: "var(--color-neutral-700)" }}>AI for education</span>
            </div>
            <h2 style={H2}>CourseMind</h2>
            <div style={HAIRLINE} />
            <p style={LEAD}>A prototype of how AI could support learning: a student workspace where lectures, sources and AI study tools stay organized inside each course.</p>
            <a href="https://cuxum.ratchaphon.com/" target="_blank" rel="noopener" className="btn btn-secondary" style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>Open the prototype</a>
          </div>
          <figure style={{ margin: 0, flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <Wipe on={two} from="inset(0 0 0 100%)" ratio="1881/930">
              <Slot src={courseMind} alt="CourseMind screenshot" fit="contain" sizes="(max-width: 1200px) 100vw, 760px" />
            </Wipe>
            <figcaption style={CAPTION}>The CourseMind course library.</figcaption>
          </figure>
        </div>
      </section>

      {/* Java Is You */}
      <section ref={rThree} style={SECTION()}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexWrap: "wrap-reverse", alignItems: "center", gap: "clamp(32px,5vw,72px)" }}>
          <figure style={{ margin: 0, flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <Wipe on={three} from="inset(0 100% 0 0)" ratio="16/9">
              <Slot src={javaIsYou} alt="Java Is You screenshot" sizes="(max-width: 1200px) 100vw, 760px" />
            </Wipe>
            <figcaption style={CAPTION}>Java Is You, 31 levels themed around computer science concepts.</figcaption>
          </figure>
          <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18, opacity: three ? 1 : 0, transform: rise(three), transition: "all 900ms cubic-bezier(.2,.7,.2,1) 200ms" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
              <span className="tag tag-outline" style={TAG(BLUE)}>Team project</span>
              <span style={META}>2025 · Game</span>
            </div>
            <h2 style={H2}>Java Is You</h2>
            <div style={HAIRLINE} />
            <p style={LEAD}>A grid-based puzzle game inspired by Baba Is You, built from scratch with my team in Java and JavaFX. You push blocks around a grid to form rules, which change how the world behaves in real time.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{GAME_SKILLS.map((sk) => <span key={sk} style={PILL}>{sk}</span>)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a href="https://java-is-you.ratchaphon.com/" target="_blank" rel="noopener" className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>Visit the website</a>
              <a href="https://github.com/Bookdodo5/java-is-you" target="_blank" rel="noopener" className="btn btn-ghost" style={{ whiteSpace: "nowrap" }}>GitHub</a>
              <a href="https://youtu.be/HdFx5f9YEyg" target="_blank" rel="noopener" className="btn btn-ghost" style={{ whiteSpace: "nowrap" }}>Watch the video</a>
            </div>
          </div>
        </div>
      </section>

      {/* More projects */}
      <section ref={rMore} style={SECTION(true)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
          <p style={{ margin: 0, fontStyle: "italic", color: "var(--color-accent-700)", fontSize: 17 }}>2025</p>
          <h2 style={H2}>More projects</h2>
        </div>
        <div style={{ width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: 28 }}>
          {SIDE_PROJECTS.map((s, i) => (
            <div key={s.t} style={{ border: "1px solid var(--color-divider)", borderTop: `2px solid ${BLUE}`, borderRadius: "var(--radius-md,4px)", background: "var(--color-bg)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden", opacity: more ? 1 : 0, transform: rise(more, 32), transition: `all 900ms cubic-bezier(.2,.7,.2,1) ${i * 150}ms` }}>
              <div style={{ padding: "14px 14px 0" }}>
                <div className="plate" style={{ width: "100%", aspectRatio: "1881/930", overflow: "hidden" }}>
                  <Slot src={s.img} alt={s.t} fit="contain" sizes="(max-width: 1000px) 100vw, 580px" />
                </div>
              </div>
              <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
                  <span className="tag tag-outline" style={TAG(BLUE)}>Side project</span>
                  <span style={{ fontStyle: "italic", fontSize: 15, color: "var(--color-neutral-700)" }}>{s.k}</span>
                </div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(30px,3vw,40px)", lineHeight: 1.05 }}>{s.t}</h3>
                <p style={{ margin: 0, flex: 1, fontSize: 17, lineHeight: 1.65, textAlign: "justify", hyphens: "auto" }}>{s.b}</p>
                <a href={s.href} target="_blank" rel="noopener" className="btn btn-secondary" style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>{s.cta}</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 20 }}>
          {REPOS.map((r, i) => {
            const d = `${300 + i * 110}ms`;
            return (
              <a key={r.href} href={r.href} target="_blank" rel="noopener" className="repo" style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md,4px)", padding: 24, display: "flex", flexDirection: "column", gap: 12, color: "var(--color-text)", opacity: more ? 1 : 0, transform: rise(more), transition: `opacity 700ms ease ${d}, transform 700ms cubic-bezier(.2,.7,.2,1) ${d}, border-color 200ms ease` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontStyle: "italic", fontSize: 14, color: "var(--color-neutral-700)" }}>{r.k}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{r.t}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{r.b}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto", paddingTop: 6 }}>
                  {r.tech.map((tc) => <span key={tc} style={{ border: "1px solid var(--color-divider)", borderRadius: 999, padding: "3px 10px", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>{tc}</span>)}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <PageFooter>
        <a href="mailto:kaikub.contact@gmail.com">kaikub.contact@gmail.com</a>
      </PageFooter>
      <SectionPill current="Interest" visible={nav} />
    </Page>
  );
}

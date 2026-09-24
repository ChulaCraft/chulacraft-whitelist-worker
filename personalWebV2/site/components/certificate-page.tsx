"use client";

import { useRef } from "react";
import SectionPill from "@/components/section-pill";
import Slot from "@/components/slot";
import { BODY, HAIRLINE, LayerHeader, META, ORG, PAD_X, Page, PageFooter, TAG, TopBar } from "@/components/section-chrome";
import { CREDENTIALS, GOOGLE_SKILLS_PROFILE } from "@/content/certificate";
import { useHeadIn, useNavVisible, useScrolledInto } from "@/lib/reveal";
import scan from "@/assets/certificate/cert-cp-distinction.jpg";
import ceremony from "@/assets/certificate/cert-cp-distinction-ceremony.jpg";

const YELLOW = "var(--sec-certificate,#E0B03A)";

export default function CertificatePage() {
  const rHead = useRef<HTMLElement>(null);
  const rAward = useRef<HTMLElement>(null);
  const rCreds = useRef<HTMLElement>(null);
  const head = useHeadIn();
  const nav = useNavVisible(rHead);
  const award = useScrolledInto(rAward, 0.8);
  const creds = useScrolledInto(rCreds, 0.8);

  return (
    <Page hover="var(--color-accent-800)">
      <TopBar title="Certificate" color={YELLOW} />
      <LayerHeader ref={rHead} head={head} kicker="Layer one of five" title="Certificate" lede="Awards and verified credentials." color={YELLOW} />

      {/* Featured award: scan tilts up, ceremony photo lands on its corner */}
      <section ref={rAward} style={{ padding: `clamp(24px,4vh,48px) ${PAD_X} clamp(72px,10vh,120px)`, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,72px)" }}>
          <div style={{ flex: "1 1 520px", minWidth: 0, position: "relative", perspective: 1600, paddingBottom: "clamp(40px,8vw,96px)", paddingRight: "clamp(40px,8vw,96px)" }}>
            <div className="plate" style={{ position: "relative", zIndex: 2, aspectRatio: "2268/1628", overflow: "hidden", boxShadow: "var(--shadow-md)", transformOrigin: "bottom center", transform: `rotateX(${award ? 0 : 58}deg) translateY(${award ? 0 : 60}px)`, opacity: award ? 1 : 0, transition: "transform 1400ms cubic-bezier(.2,.8,.2,1), opacity 600ms ease" }}>
              <Slot src={scan} alt="CP Academic Distinction certificate" fit="contain" sizes="(max-width: 900px) 100vw, 700px" />
            </div>
            <div className="plate" style={{ position: "absolute", zIndex: 3, right: 0, bottom: 0, width: "46%", aspectRatio: "16/9", overflow: "hidden", boxShadow: "var(--shadow-lg)", transform: `translate(${award ? 0 : -40}px, ${award ? 0 : -60}px) rotate(${award ? 3 : -8}deg)`, opacity: award ? 1 : 0, transition: "transform 1200ms cubic-bezier(.2,.8,.2,1) 500ms, opacity 500ms ease 500ms" }}>
              <Slot src={ceremony} alt="Award ceremony photo" sizes="(max-width: 900px) 46vw, 330px" />
            </div>
          </div>
          <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18, opacity: award ? 1 : 0, transform: `translateY(${award ? 0 : 24}px)`, transition: "all 900ms cubic-bezier(.2,.7,.2,1) 700ms" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
              <span className="tag tag-outline" style={TAG(YELLOW)}>Award</span>
              <span style={META}>27 August 2026</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(36px,4vw,56px)", lineHeight: 1.02, textWrap: "balance" }}>Computer Engineering Academic Distinction Award</h2>
            <div style={ORG}>Department of Computer Engineering, Faculty of Engineering, Chulalongkorn University</div>
            <div style={HAIRLINE} />
            <p style={BODY}>CP Academic Distinction Award, given “in recognition of your contribution in bringing recognition to the department.” Presented by the department at the 2026 Wai Khru ceremony.</p>
          </div>
        </div>
      </section>

      {/* Verified credentials: cards flip in */}
      <section ref={rCreds} style={{ borderTop: "1px solid var(--color-divider)", padding: `clamp(56px,9vh,112px) ${PAD_X} clamp(96px,14vh,160px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(32px,5vh,56px)" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(36px,4.4vw,60px)", lineHeight: 1, textAlign: "center" }}>Verified credentials</h2>
        <div style={{ width: "100%", maxWidth: 1000, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 28 }}>
          {CREDENTIALS.map((c, i) => {
            const d = `${i * 180}ms`;
            return (
              <div key={c.title} style={{ perspective: 1400 }}>
                <div style={{ position: "relative", height: "100%", border: "1px solid var(--color-divider)", borderTop: `2px solid ${YELLOW}`, borderRadius: "var(--radius-md,4px)", background: "var(--color-bg)", boxShadow: "var(--shadow-sm)", padding: 32, display: "flex", flexDirection: "column", gap: 18, transform: `rotateY(${creds ? 0 : -100}deg)`, opacity: creds ? 1 : 0, transition: `transform 1100ms cubic-bezier(.2,.8,.2,1) ${d}, opacity 400ms ease ${d}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ flex: "0 0 auto", width: 88, height: 88, border: "1px solid var(--color-divider)", borderRadius: "50%", padding: 6, background: "#fff" }}>
                      <Slot src={c.badge} alt={`${c.title} badge`} fit="contain" sizes="76px" round />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                      <span style={{ fontStyle: "italic", fontSize: 14, color: "var(--color-neutral-700)" }}>{c.issuer}</span>
                      <span className="tag tag-outline" style={{ ...TAG(YELLOW), alignSelf: "flex-start" }}>{c.kind}</span>
                    </div>
                  </div>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "clamp(28px,2.6vw,34px)", lineHeight: 1.1 }}>{c.title}</h3>
                  <div style={HAIRLINE} />
                  <p style={{ ...BODY, flex: 1, fontSize: 16 }}>{c.body}</p>
                  <a href={c.href} target="_blank" rel="noopener" className="btn btn-secondary" style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>Verify credential</a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <PageFooter>
        <a href={GOOGLE_SKILLS_PROFILE} target="_blank" rel="noopener">Google Skills profile</a>
      </PageFooter>
      <SectionPill current="Certificate" visible={nav} />
    </Page>
  );
}

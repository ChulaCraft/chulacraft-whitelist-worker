"use client";

import { useEffect, useState, type RefObject } from "react";

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Header fades in 150ms after mount (immediately with reduced motion).
export function useHeadIn() {
  const [head, setHead] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHead(true), prefersReducedMotion() ? 0 : 150);
    return () => clearTimeout(t);
  }, []);
  return head;
}

// Section pill appears once the header has scrolled away.
export function useNavVisible(headRef: RefObject<HTMLElement | null>) {
  const [nav, setNav] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = headRef.current;
      setNav(h ? h.getBoundingClientRect().bottom < 80 : scrollY > 400);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, [headRef]);
  return nav;
}

// Reveals `[data-reveal="i"]` children of `listRef` as they enter view. Items already
// above the fold (fast scrolls, anchor jumps) are revealed by the scroll fallback.
export function useSeenList(listRef: RefObject<HTMLElement | null>, threshold: number) {
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const els = () => root.querySelectorAll<HTMLElement>("[data-reveal]");
    const mark = (ids: string[]) => ids.length && setSeen((s) => (ids.every((i) => s[i]) ? s : { ...s, ...Object.fromEntries(ids.map((i) => [i, true])) }));

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      mark([...els()].map((el) => el.dataset.reveal!));
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      mark([e.target.getAttribute("data-reveal")!]);
      io.unobserve(e.target);
    }), { threshold });
    els().forEach((el) => io.observe(el));
    const onScroll = () => mark([...els()].filter((el) => el.getBoundingClientRect().top < innerHeight * 0.85).map((el) => el.dataset.reveal!));
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); removeEventListener("scroll", onScroll); };
  }, [listRef, threshold]);
  return seen;
}

// One-shot flag: true once `ref`'s top passes `frac` of the viewport height.
export function useScrolledInto(ref: RefObject<HTMLElement | null>, frac: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (prefersReducedMotion() || (el && el.getBoundingClientRect().top < innerHeight * frac)) {
        setOn(true);
        removeEventListener("scroll", check);
      }
    };
    addEventListener("scroll", check, { passive: true });
    const t = setTimeout(check, 300);
    return () => { clearTimeout(t); removeEventListener("scroll", check); };
  }, [ref, frac]);
  return on;
}

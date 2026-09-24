"use client";

import { useEffect, useState } from "react";

import { THEME_KEY } from "@/lib/theme";

type Theme = "auto" | "dark" | "light";
const ORDER: Theme[] = ["auto", "dark", "light"];

const svg = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS: Record<Theme, React.ReactNode> = {
  auto: <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" /></svg>,
  light: <svg {...svg}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  dark: <svg {...svg}><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" /></svg>,
};

// Cycles Device -> Dark -> Light; persisted in localStorage (the inline script in layout applies it before paint).
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the attribute set pre-hydration
    setTheme((document.documentElement.getAttribute("data-theme") as Theme) || "auto");
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    if (next === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
    try {
      if (next === "auto") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      id="site-theme"
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme === "auto" ? "follows device" : theme}. Click to change.`}
      title={theme === "auto" ? "Theme: device" : `Theme: ${theme}`}
    >
      {ICONS[theme]}
    </button>
  );
}

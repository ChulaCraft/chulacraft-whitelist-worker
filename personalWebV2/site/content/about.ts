import type { StaticImageData } from "next/image";
import patai from "@/assets/about/edu-logo-patai.webp";
import samsen from "@/assets/about/edu-logo-samsen.webp";
import cedt from "@/assets/about/edu-logo-cedt.webp";
import cedtWordmark from "@/assets/about/cedt-logo.png";

export type InfoItem = { k: string; v: string; href?: string };

export const INFO_LEFT: InfoItem[] = [
  { k: "Name", v: "Ratchaphon Pungtamgerdpol" },
  { k: "Studying", v: "Sophomore, CEDT" },
  { k: "Location", v: "Bangkok, Thailand" },
];

export const INFO_RIGHT: InfoItem[] = [
  { k: "Email", v: "kaikub.contact@gmail.com", href: "mailto:kaikub.contact@gmail.com" },
  { k: "GitHub", v: "kaikubEZ", href: "https://github.com/kaikubEZ" },
  { k: "LinkedIn", v: "Ratchaphon Pungtamgerdpol", href: "https://www.linkedin.com/search/results/all/?keywords=Ratchaphon%20Pungtamgerdpol" },
];

export type EducationStep = { n: string; k: string; t: string; b: string; logo: StaticImageData; wordmark?: StaticImageData };

export const EDUCATION: EducationStep[] = [
  { n: "1", k: "Grades 1–6", t: "Patai Udom Suksa School", b: "Primary school, where I spent my first six years of study.", logo: patai },
  { n: "2", k: "Grades 7–12", t: "Samsenwittayalai School", b: "Lower and upper secondary school in Bangkok, where I first got into programming.", logo: samsen },
  { n: "3", k: "University", t: "Got into CEDT, Chulalongkorn University", b: "Computer Engineering and Digital Technology, the program where every project since has added another layer.", logo: cedt, wordmark: cedtWordmark },
];

export const STORY = [
  "I started out as a software engineer, building full-stack web apps: front ends in React, APIs in Node.js and Express, and databases in PostgreSQL and MongoDB. That work taught me how real products are put together, from authentication to deployment.",
  "Along the way I became more and more interested in AI. Today it is the field I focus on most, working with PyTorch, retrieval-augmented generation, Hugging Face models and vector databases, while still using my software background to turn models into things people can use.",
];

// [name, simple-icons slug?]
type Item = [string, string?];
export type Role = { t: string; sub: string; c: string; groups: { k: string; items: Item[] }[] };

export const ROLES: Role[] = [
  { t: "AI engineer", sub: "The field I focus on most", c: "var(--sec-about,#A5323F)", groups: [
    { k: "Machine learning and AI", items: [["PyTorch", "pytorch"], ["RAG"], ["Hugging Face", "huggingface"], ["Vector DBs"]] },
    { k: "Generative AI tools", items: [["Codex"], ["Claude Code", "claude"], ["Claude Design", "claude"], ["Hermes"], ["OpenCode"], ["Qwen"], ["OpenRouter"], ["Loop engineering"], ["Graph engineering"]] }] },
  { t: "Full-stack developer", sub: "Where I started", c: "var(--sec-experience,#D9782B)", groups: [
    { k: "Languages", items: [["Python", "python"], ["C++", "cplusplus"], ["Java", "openjdk"], ["HTML", "html5"], ["CSS", "css"], ["JavaScript", "javascript"], ["TypeScript", "typescript"], ["SQL"]] },
    { k: "Frontend", items: [["React", "react"], ["Tailwind CSS", "tailwindcss"]] },
    { k: "Backend", items: [["Node.js", "nodedotjs"], ["Express.js", "express"], ["REST APIs"], ["Authentication / OAuth"], ["Supabase", "supabase"], ["PostgreSQL", "postgresql"], ["MongoDB", "mongodb"], ["SQL"]] }] },
  { t: "Cloud and DevOps", sub: "Shipping and running what I build", c: "var(--sec-interest,#2F63B0)", groups: [
    { k: "", items: [["Cloudflare", "cloudflare"], ["Azure"], ["AWS"], ["Docker", "docker"], ["Linux", "linux"], ["Git", "git"], ["GitHub", "github"], ["Vercel", "vercel"], ["Supabase", "supabase"], ["Networking"], ["CI/CD", "githubactions"]] }] },
  { t: "Data scientist", sub: "Exploring and modelling data", c: "var(--sec-activity,#3C8C68)", groups: [
    { k: "", items: [["NumPy", "numpy"], ["pandas", "pandas"], ["Matplotlib"], ["scikit-learn", "scikitlearn"], ["Machine learning"]] }] },
  { t: "Software tester", sub: "Checking that it works", c: "var(--sec-certificate,#E0B03A)", groups: [
    { k: "", items: [["Postman", "postman"], ["Playwright"], ["Swagger", "swagger"]] }] },
  { t: "Network engineer", sub: "VPNs and private networks", c: "#8a7f72", groups: [
    { k: "", items: [["Tailscale", "tailscale"], ["WireGuard", "wireguard"]] }] },
];

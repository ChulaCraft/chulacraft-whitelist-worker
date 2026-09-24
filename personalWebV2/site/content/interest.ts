import type { StaticImageData } from "next/image";
import makkhum from "@/assets/interest/project-makkhum.png";
import genie from "@/assets/interest/project-genie.png";

export const GENIE_SKILLS = ["RAG", "Vector DBs", "Hugging Face", "PyTorch"];
export const GAME_SKILLS = ["Java", "JavaFX", "Game design"];

export type SideProject = { t: string; k: string; b: string; href: string; cta: string; img: StaticImageData };

export const SIDE_PROJECTS: SideProject[] = [
  { t: "Mak Khum", k: "Thai traditional mancala", b: "A playable version of Mak Khum (หมากขุม), the Thai traditional mancala board game, with rules, settings and a multiplayer mode.", href: "https://makkhum.ratchaphon.com/", cta: "Play Mak Khum", img: makkhum },
  { t: "Be careful what you wish for", k: "Wish-writing game", b: "Write a wish. A genie will grant it — technically. Seven genies, seven escalating ways to twist your words against you. Close every loophole before The Old One finds it.", href: "https://genie.ratchaphon.com/", cta: "Make a wish", img: genie },
];

export type Repo = { k: string; t: string; b: string; tech: string[]; href: string };

export const REPOS: Repo[] = [
  { k: "Team project · Web app", t: "AI Leave Request System", b: "Generates polite leave-request emails in Thai and English from a student’s timetable and reason for absence, for review before sending.", tech: ["Node.js", "Express", "MongoDB", "Gemini API"], href: "https://github.com/kaikubEZ/ai-leave-request-system" },
  { k: "Python script", t: "7-Eleven product count monitor", b: "Checks the number of products on a 7-Eleven promotion page and sends a Discord alert when the count changes.", tech: ["Python", "BeautifulSoup", "Discord webhook"], href: "https://github.com/kaikubEZ/7-eleven-goods-tracking" },
  { k: "Educational AI experiment", t: "Thai political sentiment generator", b: "An educational experiment in how an LLM can generate simulated political comments in different moods. For study only, not for real use.", tech: ["Python", "Gemini API"], href: "https://github.com/kaikubEZ/Political_Information_Operation" },
  { k: "Python practice", t: "Rickroll with Python", b: "A “free Robux” prank that rickrolls whoever runs it, made to practise Python, GitHub and English.", tech: ["Python"], href: "https://github.com/kaikubEZ/Prank-kids-for-free-robux-by-using-python-and-rickroll" },
];

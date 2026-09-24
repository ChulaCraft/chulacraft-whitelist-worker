import type { StaticImageData } from "next/image";
import talentPlate from "@/assets/experience/exp-plate-talentjourney.webp";
import talentLogo from "@/assets/experience/exp-logo-talentjourney.webp";
import policePlate from "@/assets/experience/exp-plate-police.webp";
import policeLogo from "@/assets/experience/exp-logo-police.webp";
import roamieLogo from "@/assets/experience/exp-logo-myroamie.webp";
import roamiePlate from "@/assets/experience/my-roamie.png";

type Img = StaticImageData | string;

export type Experience = {
  kind: string; when: string; place?: string; role: string; org: string;
  body?: string; sub?: string; points?: string[]; skills?: string[];
  links?: { t: string; href: string }[];
  logo?: Img; plate?: Img; platePh: string;
};

export const EXPERIENCE: Experience[] = [
  {
    kind: "Leadership", when: "Present", place: "Chulalongkorn University", role: "President", org: "ChulaCraft club, CEDT, Chulalongkorn University",
    body: "I lead ChulaCraft, a Minecraft Java server for Chulalongkorn University students and friends, built around one shared world made by the community.",
    points: ["Survival and creative play in a shared world", "Community events on the server and on Discord", "Community-made plugins and quality-of-life features for CU players"],
    links: [{ t: "chulacraft.com", href: "https://chulacraft.com/" }, { t: "Join the Discord", href: "https://discord.gg/TQ65Fkdx6A" }],
    logo: "https://www.chulacraft.com/_next/image?url=%2Fimages%2Fchulacraft-logo-lockup.png&w=256&q=75",
    plate: "https://www.chulacraft.com/_next/image?url=%2Fimages%2Flandingpage-bg.png&w=1200&q=75",
    platePh: "ChulaCraft",
  },
  {
    kind: "Part-time", when: "Sep 2025 – Present", place: "Bangkok, Thailand · Hybrid", role: "Quality Assurance Tester", org: "Talent Journey, Chulalongkorn University",
    sub: "Junior QA Tester",
    points: ["Tested REST APIs and web workflows for an academic activity-booking platform.", "Performed API testing, UI verification, regression testing, and deployment-readiness checks.", "Identified, reproduced, documented, and communicated software defects to the development team.", "Worked with a web stack involving Node.js, Express, PostgreSQL, and modern frontend technologies.", "Gained experience evaluating software from both user-facing and backend/API perspectives."],
    skills: ["Software Testing", "System Testing", "Manual Testing", "Test Engineering", "Full-Stack Development"],
    logo: talentLogo, plate: talentPlate, platePh: "Talent Journey",
  },
  {
    kind: "Internship", when: "May 2026 – Jul 2026", place: "Bangkok, Thailand · On-site", role: "Crime Suppression Intern", org: "Royal Thai Police",
    sub: "Engineering Intern — Royal Thai Police",
    points: ["Worked on problem discovery and system-design activities for operational processes within the organization.", "Analyzed real-world workflow constraints and explored how software and optimization techniques could improve existing processes.", "Participated in the design and research of a transportation-planning system involving routing, assignment, capacity, and operational constraints.", "Explored algorithmic approaches including shortest-path search, matching, scheduling, and constraint validation.", "Worked in a hybrid environment involving technical research, requirement analysis, system design, and prototyping."],
    logo: policeLogo, plate: policePlate, platePh: "My picture at Royal Thai Police Headquarters",
  },
  {
    kind: "Startup", when: "Oct 2025 – Mar 2026", place: "Bangkok, Thailand · Hybrid", role: "COO & Co-Founder", org: "My Roamie",
    sub: "COO — My Roamie",
    points: ["Helped develop My Roamie, a personalized travel-planning platform designed to generate travel experiences based on users' preferences and group dynamics.", "Worked across product strategy, technical planning, operations, and coordination between product and engineering.", "Contributed to defining product requirements and translating user needs into implementable features.", "Collaborated with the team on developing and iterating the platform from concept toward a working product."],
    links: [{ t: "my-roamie.com", href: "https://www.my-roamie.com/" }],
    logo: roamieLogo, plate: roamiePlate, platePh: "My Roamie",
  },
];

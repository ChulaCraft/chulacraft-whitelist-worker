import type { StaticImageData } from "next/image";
import chulaUm from "@/assets/activity/activity-chula-um.jpg";
import bjm from "@/assets/activity/activity-bjm-hackathon.jpeg";
import posn from "@/assets/activity/activity-posn-camp.jpeg";
import medical from "@/assets/activity/activity-medical-volunteer.png";

export type Activity = {
  year: string; when: string; kind: string; award?: string; title: string; org: string;
  paras: string[]; skills?: string[]; photo: StaticImageData; ratio: string; ph: string; cap: string;
};

// Newest first.
export const ACTIVITIES: Activity[] = [
  {
    year: "2026", when: "1–5 Sep 2026", kind: "Student mobility", award: "Fully funded by Chulalongkorn University",
    title: "Chula x UM: Student Mobility Programme 2026", org: "Chulalongkorn University and Universiti Malaya, Malaysia",
    paras: ["Selected for a fully funded student mobility programme at Universiti Malaya in Malaysia.", "Topics I studied included eye-tracking AI technology and front-end design."],
    photo: chulaUm, ratio: "4/3", ph: "Chula x UM photo", cap: "With the programme group in Malaysia.",
  },
  {
    year: "2025", when: "Nov 2025", kind: "Hackathon", award: "Award: THB 25,000",
    title: "Grand Prize Winner — BJM MediaX: AI Innovation Hackathon 2025", org: "Team Aim Tomorrow",
    paras: ["Won the Grand Prize as part of Team Aim Tomorrow for LearnLoop, an AI-assisted learning platform designed to understand learners’ behavior and provide personalized support.", "Contributed to developing the product concept, solution design, and presentation during the hackathon."],
    photo: bjm, ratio: "4/3", ph: "Hackathon photo", cap: "Team Aim Tomorrow with the Grand Winner board.",
  },
  {
    year: "2023", when: "2023 – 2025", kind: "Olympiad camp",
    title: "Geography Olympiad (POSN) training camp", org: "Samsenwittayalai School",
    paras: ["Competitively selected among top-performing students to attend the Geography Olympiad (POSN) training camp."],
    photo: posn, ratio: "3/2", ph: "POSN camp photo", cap: "Opening ceremony of the Geography Olympiad camp.",
  },
  {
    year: "2023", when: "2023 – 2025 · 3 years", kind: "Volunteering",
    title: "Volunteer medical assistant, school sports events", org: "Samsenwittayalai School",
    paras: ["Volunteer medical assistant during annual school sports events for 3 consecutive years. Supported first aid services, monitored students’ well-being, and collaborated with the school medical team."],
    skills: ["Leadership", "Communication", "Endurance", "Empathy", "Social Responsibility"],
    photo: medical, ratio: "3/2", ph: "Medical volunteer photo", cap: "On duty as a medical volunteer at the school sports day.",
  },
];

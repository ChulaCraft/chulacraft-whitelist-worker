import type { StaticImageData } from "next/image";
import coursera from "@/assets/certificate/cert-badge-coursera.webp";

export type Credential = { issuer: string; kind: string; title: string; body: string; href: string; badge: StaticImageData | string };

export const GOOGLE_SKILLS_PROFILE = "https://www.skills.google/public_profiles/b5bb2451-7e4c-4f1c-9496-623c469ecb2e";

export const CREDENTIALS: Credential[] = [
  {
    issuer: "Google Cloud · Google Skills", kind: "Skill badge", title: "The Basics of Google Cloud Compute",
    body: "Skill badge for working with virtual machines (VMs), persistent disks, and web servers using Compute Engine.",
    href: `${GOOGLE_SKILLS_PROFILE}/badges/23118163`,
    badge: "https://cdn.qwiklabs.com/9lB99Ij%2BMz%2FyOV0484V995beQHBMMCw0kimBFfZVtcM%3D",
  },
  {
    issuer: "Google · Coursera", kind: "Certificate · Aug 25, 2025", title: "Google AI Essentials",
    body: "An online course authorized by Google and offered through Coursera, completed on August 25, 2025.",
    href: "https://www.coursera.org/account/accomplishments/verify/0Q46NH9Z8VBH",
    badge: coursera,
  },
];

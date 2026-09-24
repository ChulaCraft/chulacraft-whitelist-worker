import type { Metadata } from "next";
import AboutPage from "@/components/about-page";

export const metadata: Metadata = { title: "About me · Ratchaphon Pungtamgerdpol" };

export default function Page() {
  return <AboutPage />;
}

import type { Metadata } from "next";
import ActivityPage from "@/components/activity-page";

export const metadata: Metadata = { title: "Activity · Ratchaphon Pungtamgerdpol" };

export default function Page() {
  return <ActivityPage />;
}

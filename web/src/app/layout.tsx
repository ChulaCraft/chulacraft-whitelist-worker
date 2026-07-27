import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chulacraft | Minecraft Server",
  description: "Register your Minecraft Java Edition account for Chulacraft."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

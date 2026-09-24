import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import PageLoader from "@/components/page-loader";
import ThemeToggle from "@/components/theme-toggle";
import { THEME_KEY } from "@/lib/theme";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ratchaphon Pungtamgerdpol",
  description: "Personal site of Ratchaphon (Thunwa) Pungtamgerdpol, CEDT, Chulalongkorn University.",
};

// Runs before paint so a saved theme doesn't flash.
const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript><style>{"#site-loader{display:none}"}</style></noscript>
      </head>
      <body>
        {children}
        <ThemeToggle />
        <PageLoader />
      </body>
    </html>
  );
}

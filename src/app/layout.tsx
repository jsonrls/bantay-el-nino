import type { Metadata } from "next";
import { IBM_Plex_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Typefaces: Public Sans for clean civic display and body text,
// IBM Plex Mono for data figures and tabular metrics (R-06).
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bantay El Niño: Philippine Climate Intelligence",
    template: "%s · Bantay El Niño",
  },
  description:
    "Know the heat. Track the water. Protect your community. Understand how El Niño is affecting your province in the Philippines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}



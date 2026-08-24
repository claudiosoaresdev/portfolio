import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import MotionProvider from "@/components/ui/motion-provider";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import "./globals.css";

// Orbitron is a variable font (display); Rajdhani is not, so weights are explicit.
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "claudio soares dev — programming portfolio",
  description:
    "Portfolio of Claudio Soares, a mobile and web developer — programming projects, experiments, and interface craft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${orbitron.variable} ${rajdhani.variable}`}
    >
      <body>
        <MotionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}

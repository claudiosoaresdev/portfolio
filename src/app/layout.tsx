import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import MotionProvider from "@/components/ui/motion-provider";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import Analytics from "@/components/consent/analytics";
import CookieBanner from "@/components/consent/cookie-banner";
import JsonLd from "@/components/seo/json-ld";
import { personSchema, websiteSchema } from "@/lib/structured-data";
import { absoluteUrl, ogImage, site } from "@/lib/site";
import "./globals.css";

// Orbitron é fonte variável (display) e cobre todos os pesos num arquivo só.
// Rajdhani não é: cada peso declarado vira um woff2 separado, com preload
// próprio disputando banda com o LCP. Só 400 (corpo) e 700 (`font-bold`) são
// usados no código — pedir mais que isso é download morto.
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  // Base absoluta para canonical e imagens de OG — sem ela as URLs saem
  // relativas e nenhum crawler externo consegue resolvê-las.
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.url }],
  creator: site.author,
  publisher: site.author,
  keywords: [
    "Claudio Soares",
    "engenheiro de software",
    "desenvolvedor mobile",
    "Android",
    "Kotlin",
    "React Native",
    "Flutter",
    "iOS",
    "portfólio",
  ],
  // Absolutas de propósito: com basePath, um caminho relativo resolvido
  // contra o metadataBase perderia o prefixo do repo.
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [ogImage("home", site.title)],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [ogImage("home", site.title)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={site.lang}
      data-scroll-behavior="smooth"
      className={`${orbitron.variable} ${rajdhani.variable}`}
    >
      <body>
        {/* As animações de entrada renderizam no HTML já deslocadas
            (`translateY(110%)` dentro de uma máscara `overflow-hidden`), então
            sem JS o texto existe no DOM mas fica invisível. Isto devolve o
            estado final para quem não executa script — inclusive crawlers de
            IA, que em geral não rodam JS. */}
        <noscript>
          <style>{`[data-reveal]{transform:none!important;opacity:1!important}`}</style>
        </noscript>

        {/* Primeiro tab-stop da página: pula o header fixo e vai ao conteúdo.
            Fora de foco fica fora da tela, sem `display:none` (que o tiraria
            da ordem de foco). */}
        <a
          href="#conteudo"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:border focus-visible:border-primary focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:font-body focus-visible:text-sm focus-visible:uppercase focus-visible:tracking-widest focus-visible:text-primary"
        >
          Pular para o conteúdo
        </a>

        <MotionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieBanner />
        </MotionProvider>

        <Analytics />

        <JsonLd data={personSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}

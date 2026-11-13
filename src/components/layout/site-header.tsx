import Link from "next/link";
import { assetPath, site } from "@/lib/site";

export default function SiteHeader() {
  return (
    // pointer-events-none lets clicks fall through the empty bar to content below;
    // interactive children re-enable pointer events. viewTransitionName anchors the
    // header so it stays static during view-transition morphs (see globals.css).
    <header
      style={{ viewTransitionName: "site-header" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="pointer-events-auto block shrink-0"
        >
          {/* <img> puro: em export estático não há otimizador da Next, e o
              WebP já sai no tamanho certo de scripts/optimize-images.mjs.
              Proporção 1883×101 do arquivo → width/height evitam layout shift. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath("/images/logo-claudio-soares-dev.webp")}
            alt={site.name}
            width={1000}
            height={54}
            decoding="async"
            className="h-3.5 w-auto sm:h-4"
          />
        </Link>
        <nav
          aria-label="Principal"
          className="pointer-events-auto flex items-center gap-6 font-body text-[0.7rem] uppercase tracking-[0.25em]"
        >
          <Link
            href="/blog"
            className="text-foreground transition-colors hover:text-primary"
          >
            Blog
          </Link>
          <span className="hidden text-muted sm:inline">
            Portfólio / {new Date().getFullYear()}
          </span>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

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
          className="pointer-events-auto font-display text-sm uppercase tracking-widest text-foreground"
        >
          Claudio Soares <span className="text-primary">Dev</span>
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

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
        <span className="pointer-events-auto font-body text-[0.7rem] uppercase tracking-[0.25em] text-muted">
          Portfolio / 2026
        </span>
      </div>
    </header>
  );
}

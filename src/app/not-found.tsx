import Link from "next/link";

export default function NotFound() {
  return (
    <main id="conteudo" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
        Signal lost
      </span>

      {/* Chromatic-aberration glitch built from token colors only. The two offset
          layers are aria-hidden, so the h1's accessible name resolves to "404". */}
      <h1 className="relative mt-6 font-display font-bold leading-none text-[clamp(4rem,20vw,12rem)]">
        <span
          aria-hidden="true"
          className="absolute inset-0 translate-x-[0.06em] text-primary"
        >
          404
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-[0.06em] text-secondary"
        >
          404
        </span>
        <span className="relative text-foreground">404</span>
      </h1>

      <p className="mt-8 font-body text-muted">This route does not exist.</p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 border border-foreground/15 px-6 py-3 font-body text-sm uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <span aria-hidden="true">←</span> Return home
      </Link>
    </main>
  );
}

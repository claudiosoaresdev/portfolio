import Image from "next/image";
import TextReveal from "@/components/ui/text-reveal";
import Reveal from "@/components/ui/reveal";
import SocialLinks from "@/components/layout/social-links";
import { getProfile } from "@/data/profile";
import { assetPath } from "@/lib/site";

// Server component: static HUD atmosphere + client reveal primitives.
// All copy comes from public/profile.json (edit there, not here).
export default function Hero() {
  const profile = getProfile();
  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 pt-28 pb-24 sm:px-10 lg:px-16">
      {/* Indigo glow, offset asymmetrically toward the top-right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-[38rem] w-[38rem] rounded-full bg-secondary/20 blur-[120px]"
      />
      {/* Lime glow near the headline, lower-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[6%] h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
      />

      {/* 1px technical grid; currentColor derives from the foreground token. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-foreground opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* Vignette fades the grid + glows to the background token at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-background"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 35%, currentColor 92%)",
        }}
      />

      {/* Corner-bracket frame — two opposite corners for the HUD precision feel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 left-6 h-10 w-10 border-t border-l border-foreground/20 sm:left-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 bottom-6 h-10 w-10 border-r border-b border-foreground/20 sm:right-10"
      />

      {/* Technical micro-label. */}
      <span className="pointer-events-none absolute top-24 left-20 hidden font-body text-xs uppercase tracking-[0.3em] text-muted sm:left-24 sm:block">
        Portfólio — {new Date().getFullYear()}
      </span>

      <div className="relative z-10 mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
        {/* Presentation copy */}
        <div>
          <TextReveal
            as="p"
            text={profile.eyebrow}
            className="font-body text-sm uppercase tracking-[0.3em] text-primary"
          />

          <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.95] uppercase">
            {profile.title.lines.map((line, index) => (
              <TextReveal
                key={line}
                as="span"
                text={line}
                delay={0.15 * (index + 1)}
                className="block"
              />
            ))}
            <TextReveal
              as="span"
              text={profile.title.accent}
              delay={0.15 * (profile.title.lines.length + 1)}
              className="block text-primary"
            />
          </h1>

          <Reveal delay={0.6}>
            <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-muted sm:text-lg">
              {profile.description}
            </p>
          </Reveal>

          <Reveal delay={0.75}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <li
                  key={skill}
                  className="border border-secondary/40 px-3 py-1 font-body text-xs uppercase tracking-widest text-muted"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Profile portrait in a HUD frame */}
        <Reveal delay={0.35} className="mt-14 lg:mt-0">
          <div className="relative mx-auto w-56 sm:w-64 lg:w-80">
            {/* Indigo backing glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-full bg-secondary/20 blur-[70px]"
            />

            {/* Lime corner brackets, floated just outside the frame */}
            <div aria-hidden className="pointer-events-none absolute -inset-2 z-20">
              <span className="absolute top-0 left-0 h-5 w-5 border-t border-l border-primary/70" />
              <span className="absolute top-0 right-0 h-5 w-5 border-t border-r border-primary/70" />
              <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-primary/70" />
              <span className="absolute right-0 bottom-0 h-5 w-5 border-b border-r border-primary/70" />
            </div>

            <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-foreground/15 bg-foreground/5">
              <Image
                src={assetPath(profile.photo)}
                alt={profile.photoAlt}
                fill
                preload
                sizes="(min-width: 1024px) 20rem, 16rem"
                // Tailwind v4 compiles scale-* to the standalone `scale` CSS
                // property, so it must be listed alongside filter/transform or
                // the hover zoom snaps instead of easing.
                className="object-cover grayscale-[35%] transition-[filter,transform,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grayscale-0 motion-safe:group-hover:scale-[1.04]"
              />
              {/* Bottom scrim + meta, same treatment as the project cards */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
                <span className="self-end font-display text-xs text-primary/70">
                  01
                </span>
                <p className="font-body text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                  Profile
                  <span aria-hidden className="mx-1.5 text-foreground/30">
                    /
                  </span>
                  41.1579°N · 8.6291°W
                </p>
              </div>
            </div>
          </div>

          {/* Same social set as the footer, sourced from profile.json.
              Outside the bracketed frame so the corner marks hug the photo. */}
          <SocialLinks
            social={profile.social}
            size="md"
            className="mt-8 justify-center"
          />
        </Reveal>
      </div>

      {/* Scroll cue: a lime segment bounces inside a faint vertical track. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-muted">
          Scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-foreground/10">
          <span className="block h-4 w-px bg-primary motion-safe:animate-bounce" />
        </span>
      </div>
    </section>
  );
}

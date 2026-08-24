import type { ReactNode } from "react";
import type {
  ProjectArchitecture,
  ProjectExtra,
  ProjectFeature,
  ProjectLinks,
} from "@/data/types";

// Shared HUD section heading: numbered micro-label above an Orbitron title.
function SectionHeading({
  index,
  kicker,
  title,
}: {
  index: string;
  kicker: string;
  title: string;
}) {
  return (
    <header className="mb-12">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
        {index} / {kicker}
      </span>
      <h2 className="mt-4 font-display text-2xl uppercase tracking-wide text-foreground sm:text-3xl">
        {title}
      </h2>
    </header>
  );
}

// Consistent vertical rhythm + reading column for every content section.
function Section({ children }: { children: ReactNode }) {
  return (
    <section className="border-t border-foreground/10">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-28">{children}</div>
    </section>
  );
}

export function AboutSection({
  index,
  description,
}: {
  index: string;
  description: string;
}) {
  return (
    <Section>
      <SectionHeading index={index} kicker="Overview" title="About the project" />
      <p className="max-w-2xl font-body text-lg leading-relaxed text-muted">
        {description}
      </p>
    </Section>
  );
}

export function FeaturesGrid({
  index,
  features,
}: {
  index: string;
  features: ProjectFeature[];
}) {
  return (
    <Section>
      <SectionHeading index={index} kicker="Features" title="What it does" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {features.map((feature, i) => (
          <li
            key={feature.title}
            className="rounded-lg border border-foreground/10 p-6"
          >
            <span className="font-display text-sm text-primary/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-display text-sm uppercase tracking-wider text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 font-body leading-relaxed text-muted">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ArchitectureSection({
  index,
  architecture,
}: {
  index: string;
  architecture: ProjectArchitecture;
}) {
  return (
    <Section>
      <SectionHeading
        index={index}
        kicker="Architecture"
        title="Under the hood"
      />
      <p className="max-w-2xl font-body text-lg leading-relaxed text-muted">
        {architecture.summary}
      </p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {architecture.stack.map((tech) => (
          <li
            key={tech}
            // Indigo (secondary) stays as the accent border; chip text uses muted
            // because secondary on the near-black background is only ~3.1:1 — below
            // the WCAG AA 4.5:1 floor for this 12px label (NFR-001).
            className="rounded-full border border-secondary/40 px-3 py-1 font-body text-xs uppercase tracking-widest text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ExtraSections({
  index,
  extras,
}: {
  index: string;
  extras?: ProjectExtra[];
}) {
  if (!extras?.length) return null;

  return (
    <Section>
      <SectionHeading index={index} kicker="Details" title="Deep dive" />
      <div className="space-y-12">
        {extras.map((extra, i) => (
          <article
            key={extra.title}
            className={i > 0 ? "border-t border-foreground/10 pt-12" : undefined}
          >
            <h3 className="font-display text-lg uppercase tracking-wide text-foreground">
              {extra.title}
            </h3>
            <p className="mt-4 max-w-2xl font-body leading-relaxed text-muted">
              {extra.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function LinksRow({
  index,
  links,
}: {
  index: string;
  links: ProjectLinks;
}) {
  const entries = [
    { label: "GitHub", href: links.github },
    { label: "Play Store", href: links.playStore },
    { label: "App Store", href: links.appStore },
    { label: "Website", href: links.website },
  ].filter((entry): entry is { label: string; href: string } =>
    Boolean(entry.href),
  );

  if (entries.length === 0) return null;

  return (
    <Section>
      <SectionHeading index={index} kicker="Links" title="Explore the project" />
      <ul className="flex flex-wrap gap-4">
        {entries.map((entry) => (
          <li key={entry.label}>
            <a
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/15 px-6 py-3 font-body text-sm uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {entry.label}
              {/* The arrow is decorative; the sr-only text tells non-visual users
                  the link opens in a new tab (matches target="_blank"). */}
              <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

"use client";

import type { ReactNode } from "react";
import type { Project } from "@/data/types";
import { useLocalized } from "./lang";
import MediaCarousel from "./media-carousel";

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
// `data-rail-index` lets the page-wide ScrollRail track the current section.
function Section({ index, children }: { index: string; children: ReactNode }) {
  return (
    <section data-rail-index={index} className="border-t border-foreground/10">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-28">{children}</div>
    </section>
  );
}

export function AboutSection({
  index,
  project: base,
}: {
  index: string;
  project: Project;
}) {
  const { project, t } = useLocalized(base);
  return (
    <Section index={index}>
      <SectionHeading index={index} kicker={t.overview} title={t.about} />
      <p className="max-w-2xl font-body text-lg leading-relaxed text-muted">
        {project.description}
      </p>
    </Section>
  );
}

export function FeaturesGrid({
  index,
  project: base,
}: {
  index: string;
  project: Project;
}) {
  const { project, t } = useLocalized(base);
  return (
    <Section index={index}>
      <SectionHeading index={index} kicker={t.features} title={t.whatItDoes} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {project.features.map((feature, i) => (
          <li key={i} className="rounded-lg border border-foreground/10 p-6">
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

/**
 * Arquitetura: resumo, "como foi construído", stack e — logo em seguida — o
 * carrossel web e o carrossel mobile, que mostram o resultado.
 */
export function ArchitectureSection({
  index,
  project: base,
}: {
  index: string;
  project: Project;
}) {
  const { project, t } = useLocalized(base);
  const { architecture, gallery = [] } = project;
  const web = gallery.filter((item) => item.frame === "desktop");
  const mobile = gallery.filter((item) => item.frame === "mobile");
  const labels = { prev: t.prev, next: t.next, slide: t.slide };

  return (
    <Section index={index}>
      <SectionHeading
        index={index}
        kicker={t.architecture}
        title={t.underTheHood}
      />
      <p className="max-w-2xl font-body text-lg leading-relaxed text-muted">
        {architecture.summary}
      </p>

      {architecture.build?.length ? (
        <div className="mt-12">
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            {t.howBuilt}
          </h3>
          <div className="mt-4 max-w-2xl space-y-4 font-body leading-relaxed text-muted">
            {architecture.build.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="mt-10 flex flex-wrap gap-3" aria-label={t.stack}>
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

      {web.length ? (
        <MediaCarousel title={t.webCarousel} items={web} labels={labels} />
      ) : null}
      {mobile.length ? (
        <MediaCarousel title={t.mobileCarousel} items={mobile} labels={labels} />
      ) : null}
    </Section>
  );
}

export function ExtraSections({
  index,
  project: base,
}: {
  index: string;
  project: Project;
}) {
  const { project, t } = useLocalized(base);
  if (!project.extras?.length) return null;

  return (
    <Section index={index}>
      <SectionHeading index={index} kicker={t.details} title={t.deepDive} />
      <div className="space-y-12">
        {project.extras.map((extra, i) => (
          <article
            key={i}
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
  project: base,
}: {
  index: string;
  project: Project;
}) {
  const { project, t } = useLocalized(base);
  const { links } = project;
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
    <Section index={index}>
      <SectionHeading index={index} kicker={t.links} title={t.explore} />
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
              <span className="sr-only">{t.opensNewTab}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getProjects } from "@/data/projects";
import ProjectHero from "@/components/project/project-hero";
import DeviceShowcase from "@/components/project/device-showcase";
import {
  AboutSection,
  ArchitectureSection,
  ExtraSections,
  FeaturesGrid,
  LinksRow,
} from "@/components/project/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Not found — claudio soares dev" };
  }

  return {
    title: `${project.name} — claudio soares dev`,
    description: project.tagline,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  // Sequential HUD index that stays gap-free when optional sections are absent.
  let step = 0;
  const nextIndex = () => String(++step).padStart(2, "0");

  return (
    <main>
      <ProjectHero project={project} />

      <DeviceShowcase project={project} />

      <AboutSection index={nextIndex()} description={project.description} />
      <FeaturesGrid index={nextIndex()} features={project.features} />
      <ArchitectureSection
        index={nextIndex()}
        architecture={project.architecture}
      />
      {project.extras?.length ? (
        <ExtraSections index={nextIndex()} extras={project.extras} />
      ) : null}
      <LinksRow index={nextIndex()} links={project.links} />

      <div className="border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden="true">←</span> All projects
          </Link>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/data/projects";
import JsonLd from "@/components/seo/json-ld";
import { absoluteUrl, ogImage } from "@/lib/site";
import {
  projectBreadcrumbSchema,
  projectSchema,
} from "@/lib/structured-data";
import { BackLink, LangToggle } from "@/components/project/lang";
import ScrollRail from "@/components/project/scroll-rail";
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
    return { title: "Projeto não encontrado" };
  }

  const url = absoluteUrl(`/projects/${slug}`);
  const image = ogImage(slug, `${project.name} — ${project.tagline}`);
  // A descrição de busca usa o parágrafo completo (mais contexto para o
  // snippet); a tagline fica como título social, onde espaço é curto.
  const description = project.description;

  return {
    title: project.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${project.name} — ${project.tagline}`,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — ${project.tagline}`,
      description,
      images: [image],
    },
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
    <main id="conteudo">
      <JsonLd data={projectSchema(project)} />
      <JsonLd data={projectBreadcrumbSchema(project)} />

      <LangToggle project={project} />
      <ScrollRail />
      <ProjectHero project={project} />

      <DeviceShowcase project={project} />

      <AboutSection index={nextIndex()} project={project} />
      <FeaturesGrid index={nextIndex()} project={project} />
      <ArchitectureSection index={nextIndex()} project={project} />
      {project.extras?.length ? (
        <ExtraSections index={nextIndex()} project={project} />
      ) : null}
      <LinksRow index={nextIndex()} project={project} />

      <div className="border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <BackLink project={project} />
        </div>
      </div>
    </main>
  );
}

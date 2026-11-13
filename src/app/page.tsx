import Hero from "@/components/home/hero";
import ProjectShowcase from "@/components/home/project-showcase";
import { getProjects } from "@/data/projects";

export default function Home() {
  return (
    <main id="conteudo">
      <Hero />
      <section aria-labelledby="projects-heading" className="pb-28 pt-8">
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary">
            01 / Selected work
          </p>
          <h2
            id="projects-heading"
            className="mt-3 font-display text-3xl uppercase tracking-wide sm:text-4xl"
          >
            Projects
          </h2>
          <p className="mt-3 max-w-xl font-body text-muted">
            Drag to explore. Click a project to dive into its build.
          </p>
        </div>
        <ProjectShowcase projects={getProjects()} />
      </section>
    </main>
  );
}

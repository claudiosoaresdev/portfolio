import Hero from "@/components/home/hero";
import ProjectCarousel from "@/components/home/project-carousel";
import { getProjects } from "@/data/projects";

export default function Home() {
  return (
    <main>
      <Hero />
      <section aria-labelledby="projects-heading" className="pb-28 pt-8">
        <div className="mx-auto max-w-6xl px-6 pb-10">
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
        <ProjectCarousel projects={getProjects()} />
      </section>
    </main>
  );
}

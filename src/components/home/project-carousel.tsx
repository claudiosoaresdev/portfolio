"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useReducedMotion } from "motion/react";

import type { Project } from "@/data/types";
import { assetPath } from "@/lib/site";

function CarouselCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div className="flex-[0_0_auto] pl-4">
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open project: ${project.name}`}
        // Inset ring keeps the focus indicator inside the clipped viewport
        // (a default outline would be cropped by the overflow-hidden track).
        className="group relative block w-60 overflow-hidden rounded-xl border border-foreground/10 transition-colors duration-300 hover:border-primary/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:w-72"
      >
        <ViewTransition name={`project-${project.slug}`} share="morph">
          <div className="relative aspect-[9/16] w-full bg-foreground/5">
            <Image
              src={assetPath(project.cover)}
              alt={`${project.name} cover`}
              fill
              sizes="(min-width: 640px) 18rem, 15rem"
              // Sem `preload`: o carrossel fica abaixo da dobra, então estas
              // capas nunca são o LCP — pré-carregá-las só roubava banda da
              // foto do hero, que é. O lazy-load padrão é o certo aqui.
              className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-105"
            />
            {/* Scrim INSIDE the shared element so the morph snapshot carries
                the mask — outside it, the raw cover flies solo during the
                transition. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </div>
        </ViewTransition>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <span className="font-display text-sm text-primary/70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden
              className="mt-1 h-3 w-3 border-t border-r border-foreground/30"
            />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 font-body text-[0.6rem] uppercase tracking-[0.3em] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              View project
              <span aria-hidden>&rarr;</span>
            </span>
            <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
              {project.name}
            </h3>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.25em] text-muted">
              {project.year}
              <span aria-hidden className="mx-1.5 text-foreground/30">
                /
              </span>
              {project.device}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ProjectCarousel({
  projects,
}: {
  projects: Project[];
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportEl = useRef<HTMLDivElement | null>(null);

  // Loop + auto-scroll only make sense when the cards actually overflow the
  // viewport; with few projects the track just sits still (and Embla itself
  // is deactivated so nothing can be dragged out of view).
  const [overflow, setOverflow] = useState(false);

  const [emblaRef] = useEmblaCarousel(
    { active: overflow, loop: overflow, dragFree: true, align: "start" },
    overflow && !reduce
      ? [
          AutoScroll({
            speed: 1,
            startDelay: 0,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            playOnInit: true,
          }),
        ]
      : [],
  );

  // Single callback ref feeds both Embla and the overflow measurement.
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportEl.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  useEffect(() => {
    const viewport = viewportEl.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      // rAF keeps the setState off the observer/effect's synchronous path.
      frame = requestAnimationFrame(() => {
        // Sum the slides instead of reading scrollWidth: with justify-center
        // the left-side overflow is not reported by scrollWidth.
        const content = Array.from(track.children).reduce(
          (width, child) => width + child.getBoundingClientRect().width,
          0,
        );
        setOverflow(content > viewport.clientWidth + 1);
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={setViewportRef}>
        {/* touch-pan-y lets the page scroll vertically while Embla owns horizontal drag */}
        <div
          ref={trackRef}
          className={`flex touch-pan-y ${overflow ? "" : "justify-center"}`}
        >
          {projects.map((project, index) => (
            <CarouselCard
              key={project.slug}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Edge fades blend the moving track into the section background */}
      {overflow && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ViewTransition } from "react";
import { motion } from "motion/react";
import type { Project } from "@/data/types";
import { assetPath } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: {
      // Waits out the ~500ms shared-element morph so the copy reads as a
      // deliberate reveal instead of popping mid-transition.
      delayChildren: 0.45,
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function ProjectHero({ project }: { project: Project }) {
  const [coverLoaded, setCoverLoaded] = useState(false);

  // next/image may skip onLoad for a cache-complete image that hydrated late;
  // the timeout guarantees the hero copy can never stay hidden.
  useEffect(() => {
    const t = setTimeout(() => setCoverLoaded(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const revealed = coverLoaded;

  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      {/*
        Shared-element morph target (REQ-010 counterpart to the home carousel).
        The scrim lives INSIDE the ViewTransition so the morph snapshot carries
        the darkened mask with it — otherwise the raw cover flies in first and
        the mask pops on afterwards.
      */}
      <ViewTransition name={`project-${project.slug}`} share="morph">
        <div className="absolute inset-0">
          <Image
            src={assetPath(project.cover)}
            alt={`${project.name} cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onLoad={() => setCoverLoaded(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      </ViewTransition>

      {/* HUD corner brackets, inset below the fixed site header. */}
      <div className="pointer-events-none absolute inset-x-6 bottom-6 top-20 z-20">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-foreground/30" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-foreground/30" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-foreground/30" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-foreground/30" />
      </div>

      {/* HUD loader — visible only while the cover is still loading. */}
      <div
        aria-hidden
        className={`absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 transition-opacity duration-300 ${
          revealed ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="font-body text-[0.65rem] uppercase tracking-[0.4em] text-primary motion-safe:animate-pulse">
          Loading
        </span>
        <span className="relative h-px w-16 overflow-hidden bg-foreground/15">
          <span className="absolute inset-y-0 left-0 w-1/3 bg-primary motion-safe:animate-[hud-scan_1s_ease-in-out_infinite]" />
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
        className="relative z-30 mx-auto w-full max-w-6xl px-6 pb-24"
      >
        <motion.div
          variants={item}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-xs uppercase tracking-[0.3em] text-muted"
        >
          <span className="text-primary">{project.year}</span>
          <span aria-hidden="true" className="text-foreground/30">
            /
          </span>
          <span>{project.role}</span>
          <span aria-hidden="true" className="text-foreground/30">
            /
          </span>
          <span className="border border-primary/40 px-2 py-1 text-primary">
            {project.device === "ios" ? "iOS" : "Android"}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 font-display font-bold uppercase leading-[0.95] text-foreground text-[clamp(2.5rem,8vw,6rem)]"
        >
          {project.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl font-body text-xl text-muted"
        >
          {project.tagline}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-16 flex items-center gap-3 font-body text-[0.7rem] uppercase tracking-[0.3em] text-muted"
        >
          <span>Scroll</span>
          <span aria-hidden="true" className="h-8 w-px bg-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

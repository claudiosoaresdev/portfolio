"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import type { Project } from "@/data/types";
import DeviceCanvas from "./device-canvas";
import StaticDeviceFallback from "./static-device-fallback";

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
      {children}
    </span>
  );
}

// Phase content is factored out so the animated (cross-fading) and reduced-motion
// (plain stacked) renders share identical markup and DOM reading order.
function AppPhase({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <MicroLabel>The app</MicroLabel>
      <p className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
        {project.tagline}
      </p>
      <p className="line-clamp-3 font-body text-sm leading-relaxed text-muted">
        {project.description}
      </p>
    </div>
  );
}

function PlatformPhase({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <MicroLabel>Platform</MicroLabel>
      <div>
        <span className="inline-flex border border-primary/40 px-3 py-1 font-body text-sm uppercase tracking-widest text-primary">
          {project.device === "ios" ? "iOS" : "Android"}
        </span>
      </div>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-muted">
        {project.year}
        <span aria-hidden="true" className="mx-2 text-foreground/30">
          /
        </span>
        {project.role}
      </p>
    </div>
  );
}

function HighlightPhase({ project }: { project: Project }) {
  const feature = project.features[0];
  return (
    <div className="space-y-4">
      <MicroLabel>Highlight</MicroLabel>
      {/* Not a heading: this scroll showcase sits between the page h1 and the
          first section h2, and it re-surfaces feature[0] which already has an
          h3 in FeaturesGrid. Using <p> avoids an h1->h3 skip and a duplicate
          heading while keeping the visual style identical to AppPhase. */}
      <p className="font-display text-xl uppercase tracking-wide text-foreground sm:text-2xl">
        {feature.title}
      </p>
      <p className="line-clamp-3 font-body text-sm leading-relaxed text-muted">
        {feature.description}
      </p>
    </div>
  );
}

export default function DeviceShowcase({ project }: { project: Project }) {
  const reduce = useReducedMotion();

  const ref = useRef<HTMLDivElement>(null);
  // Defer mounting the WebGL scene until the section is actually scrolled into
  // view — the three.js chunk otherwise evaluates during initial load and blows
  // the interactivity budget (NFR-003). Until then the static frame stands in.
  const canvasInView = useInView(ref, { once: true, amount: 0.05 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.6,
  });

  // The phases are absolutely-stacked layers in the same box, so their opacity
  // windows must NOT overlap — one block fades fully out before the next fades
  // in (0.30–0.32 and 0.66–0.68 stay empty), otherwise two texts show at once.
  //
  // Every range MUST span the full 0–1 domain with explicit endpoints: motion
  // compiles these into ScrollTimeline WAAPI keyframes, and a last keyframe at
  // an offset < 1 gets an implicit final keyframe from the element's BASE value
  // (inline opacity: 1) — which fades the block back in near the section end.
  const appOpacity = useTransform(
    scrollYProgress,
    [0, 0.24, 0.3, 1],
    [1, 1, 0, 0],
  );
  const appY = useTransform(scrollYProgress, [0, 0.3, 1], [0, -24, -24]);
  const platformOpacity = useTransform(
    scrollYProgress,
    [0, 0.32, 0.38, 0.6, 0.66, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const platformY = useTransform(
    scrollYProgress,
    [0, 0.32, 0.38, 0.6, 0.66, 1],
    [24, 24, 0, 0, -24, -24],
  );
  const highlightOpacity = useTransform(
    scrollYProgress,
    [0, 0.68, 0.74, 1],
    [0, 0, 1, 1],
  );
  const highlightY = useTransform(
    scrollYProgress,
    [0, 0.68, 0.74, 1],
    [24, 24, 0, 0],
  );

  const alt = `${project.name} app screenshot`;

  // Reduced motion (REQ-018): no scroll binding, no sticky pin — a flat two-column
  // layout with the static phone and all three phases stacked in reading order.
  if (reduce) {
    return (
      <section
        aria-label={`${project.name} device showcase`}
        className="border-t border-foreground/10"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div className="order-2 space-y-10 lg:order-1">
            <AppPhase project={project} />
            <PlatformPhase project={project} />
            <HighlightPhase project={project} />
          </div>
          <div className="order-1 h-[28rem] lg:order-2">
            <StaticDeviceFallback
              device={project.device}
              screenshot={project.screenshot}
              alt={alt}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label={`${project.name} device showcase`}
      className="relative h-[260vh]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* Progress rail — far-left HUD track that fills as the section scrolls. */}
        <div className="pointer-events-none absolute inset-y-0 left-4 z-30 hidden flex-col items-center py-24 sm:flex">
          <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
            Scroll
          </span>
          <div className="relative my-4 w-px flex-1 overflow-hidden bg-foreground/15">
            <motion.div
              style={{ scaleY: scrollYProgress }}
              className="absolute inset-0 origin-top bg-primary"
            />
          </div>
          <div className="flex flex-col items-center gap-2 font-display text-[0.6rem] text-muted">
            <span>01</span>
            <span>02</span>
            <span>03</span>
          </div>
        </div>

        {/* Canvas — full-bleed behind content on mobile, right 55% column on lg. */}
        <div className="absolute inset-0 z-0 lg:left-[45%]">
          <div className="h-full w-full">
            {canvasInView ? (
              <DeviceCanvas
                device={project.device}
                screenshot={project.screenshot}
                progress={progress}
                alt={alt}
              />
            ) : (
              /* Same box the frame occupies inside DeviceCanvas, so the
                 deferred mount swap doesn't shift or resize the phone. */
              <StaticDeviceFallback
                device={project.device}
                screenshot={project.screenshot}
                alt={alt}
              />
            )}
          </div>
        </div>

        {/* Scrim keeps the overlaid phases legible over the canvas on mobile only. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent lg:hidden" />

        {/* Content phases — bottom overlay on mobile, left 45% column on lg. */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-16 pl-16 sm:pl-20 lg:inset-y-0 lg:right-auto lg:flex lg:w-[45%] lg:items-center lg:pb-0">
          <div className="relative h-64 w-full max-w-md">
            <motion.div
              style={{ opacity: appOpacity, y: appY }}
              className="pointer-events-none absolute inset-0 flex flex-col justify-end lg:justify-center"
            >
              <AppPhase project={project} />
            </motion.div>
            <motion.div
              style={{ opacity: platformOpacity, y: platformY }}
              className="pointer-events-none absolute inset-0 flex flex-col justify-end lg:justify-center"
            >
              <PlatformPhase project={project} />
            </motion.div>
            <motion.div
              style={{ opacity: highlightOpacity, y: highlightY }}
              className="pointer-events-none absolute inset-0 flex flex-col justify-end lg:justify-center"
            >
              <HighlightPhase project={project} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";

/**
 * Page-wide HUD scroll rail for the project detail page: fixed on the left
 * (sm+), lime fill = scroll progress of the whole page, and one number per
 * numbered content section (the same `01 / Overview`… sequence), the current
 * one in lime. Sections opt in with `data-rail-index="NN"`; the numbers are
 * read from the DOM, so a section that renders nothing never gets a number.
 */
export default function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const [indices, setIndices] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rail-index]"),
    );
    if (els.length === 0) return;

    // Current section = the last one whose top has crossed the viewport middle.
    const pick = () => {
      const mid = window.innerHeight / 2;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= mid) {
          current = el.dataset.railIndex ?? null;
        }
      }
      setIndices(els.map((el) => el.dataset.railIndex ?? ""));
      setActive(current);
    };

    // A line across the middle of the viewport: any crossing re-picks (the
    // observer also fires once on observe, which seeds the list).
    const observer = new IntersectionObserver(pick, {
      rootMargin: "-50% 0px -50% 0px",
    });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-4 z-40 hidden flex-col items-center pb-24 pt-28 sm:flex"
    >
      <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
        Scroll
      </span>
      <div className="relative my-4 w-px flex-1 overflow-hidden bg-foreground/15">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute inset-0 origin-top bg-primary"
        />
      </div>
      <div className="flex flex-col items-center gap-2 font-display text-[0.6rem]">
        {indices.map((n) => (
          <span
            key={n}
            className={`transition-colors duration-300 ${
              active === n ? "text-primary" : "text-muted"
            }`}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll } from "motion/react";

/**
 * Scroll offsets where each numbered section "arrives" (its top at the
 * viewport middle). Segment k spans [bounds[k], bounds[k+1]]: segment 0 is the
 * intro (hero + device showcase) before 01, segment k ≥ 1 is section k.
 */
function segmentAt(y: number, bounds: number[]): { k: number; local: number } {
  for (let k = 0; k < bounds.length - 1; k++) {
    if (y < bounds[k + 1]) {
      const span = Math.max(bounds[k + 1] - bounds[k], 1);
      return { k, local: Math.min(Math.max((y - bounds[k]) / span, 0), 1) };
    }
  }
  return { k: bounds.length - 2, local: 1 };
}

/**
 * Page-wide HUD scroll rail for the project detail page, fixed on the left
 * (sm+), built as an accordion of segments separated by the section numbers
 * (`01 / Overview`…):
 *
 *   intro ─ 01 ─ section 1 ─ 02 ─ section 2 ─ … ─ NN ─ section N
 *
 * The segment of the section you're in EXPANDS and fills lime with your
 * progress through it; every other segment COLLAPSES to a short stub (lime if
 * already passed, gray if ahead). Arriving at a section moves the expansion
 * to the segment right under its number.
 *
 * Sections opt in with `data-rail-index="NN"`; numbers are read from the DOM,
 * so a section that renders nothing never gets one.
 */
export default function ScrollRail() {
  const { scrollY } = useScroll();
  const local = useMotionValue(0);
  const boundsRef = useRef<number[]>([0, 1]);
  const [indices, setIndices] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rail-index]"),
    );

    const update = (y: number) => {
      const { k, local: l } = segmentAt(y, boundsRef.current);
      local.set(l);
      setActive(k);
    };

    const measure = () => {
      const mid = window.innerHeight / 2;
      const offsets = els.map(
        (el) => el.getBoundingClientRect().top + window.scrollY - mid,
      );
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const last = offsets.length ? offsets[offsets.length - 1] : 0;
      boundsRef.current = [0, ...offsets, Math.max(max, last + 1)];
      setIndices(els.map((el) => el.dataset.railIndex ?? ""));
      update(window.scrollY);
    };

    // Layout shifts (images, fonts, resize) move the sections: re-measure.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const unsubscribe = scrollY.on("change", update);
    return () => {
      ro.disconnect();
      unsubscribe();
    };
  }, [scrollY, local]);

  // Segments: 0 = intro, then one after each number.
  const segments = indices.length + 1;

  const segment = (k: number) => {
    const isActive = k === active;
    const passed = k < active;
    return (
      <div
        key={`seg-${k}`}
        className={`relative min-h-3 w-px basis-0 overflow-hidden transition-[flex-grow] duration-500 ease-out motion-reduce:transition-none ${
          isActive ? "grow-[12]" : "grow"
        } ${passed ? "bg-primary/60" : "bg-foreground/15"}`}
      >
        {isActive && (
          <motion.div
            style={{ scaleY: local }}
            className="absolute inset-0 origin-top bg-primary"
          />
        )}
      </div>
    );
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-4 z-40 hidden flex-col items-center pb-16 pt-28 sm:flex"
    >
      <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
        Scroll
      </span>
      <div className="mt-4 flex flex-1 flex-col items-center">
        {segments > 1 && segment(0)}
        {indices.map((index, i) => (
          <div key={index} className="contents">
            <span
              className={`py-1.5 font-display text-[0.6rem] leading-none transition-colors duration-300 ${
                i + 1 === active
                  ? "text-primary"
                  : i + 1 < active
                    ? "text-primary/50"
                    : "text-muted"
              }`}
            >
              {index}
            </span>
            {segment(i + 1)}
          </div>
        ))}
      </div>
    </div>
  );
}

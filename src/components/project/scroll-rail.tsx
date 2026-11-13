"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll } from "motion/react";

type Stop = { index: string; offset: number };

/** Marker position along the track (0 = top, 1 = bottom) for stop i of n. */
const markerAt = (i: number, n: number) => (i + 1) / (n + 1);

/**
 * Piecewise map: scrollY → fill (0..1) so the fill tip reaches marker i
 * exactly when section i's top crosses the viewport middle, and runs on to
 * the bottom of the track at the end of the page.
 */
function fillFor(y: number, stops: Stop[], maxScroll: number): number {
  const n = stops.length;
  if (n === 0) return maxScroll > 0 ? y / maxScroll : 0;
  const xs = [0, ...stops.map((s) => s.offset), Math.max(maxScroll, stops[n - 1].offset + 1)];
  const ys = [0, ...stops.map((_, i) => markerAt(i, n)), 1];
  if (y <= xs[0]) return 0;
  for (let k = 1; k < xs.length; k++) {
    if (y <= xs[k]) {
      const t = (y - xs[k - 1]) / Math.max(xs[k] - xs[k - 1], 1);
      return ys[k - 1] + t * (ys[k] - ys[k - 1]);
    }
  }
  return 1;
}

/**
 * Page-wide HUD scroll rail for the project detail page: fixed on the left
 * (sm+). One number per numbered content section (`01 / Overview`…) sits ON
 * the track; the lime fill reaches a number exactly when its section arrives
 * (section top at the viewport middle), so the line runs "under" 01, 02, 03…
 * in step with the page. Reached numbers turn lime, the current one brightest.
 * Sections opt in with `data-rail-index="NN"`; numbers are read from the DOM,
 * so a section that renders nothing never gets one.
 */
export default function ScrollRail() {
  const { scrollY } = useScroll();
  const fill = useMotionValue(0);
  const stopsRef = useRef<Stop[]>([]);
  const maxRef = useRef(0);
  const [indices, setIndices] = useState<string[]>([]);
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rail-index]"),
    );

    const update = (y: number) => {
      const stops = stopsRef.current;
      fill.set(fillFor(y, stops, maxRef.current));
      let r = -1;
      stops.forEach((s, i) => {
        if (y >= s.offset) r = i;
      });
      setReached(r);
    };

    // Offsets = scroll position at which each section's top hits mid-viewport.
    const measure = () => {
      const mid = window.innerHeight / 2;
      stopsRef.current = els.map((el) => ({
        index: el.dataset.railIndex ?? "",
        offset: el.getBoundingClientRect().top + window.scrollY - mid,
      }));
      maxRef.current =
        document.documentElement.scrollHeight - window.innerHeight;
      setIndices(stopsRef.current.map((s) => s.index));
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
  }, [scrollY, fill]);

  const n = indices.length;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-4 z-40 hidden flex-col items-center pb-16 pt-28 sm:flex"
    >
      <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl]">
        Scroll
      </span>
      <div className="relative mt-4 w-px flex-1 bg-foreground/15">
        <motion.div
          style={{ scaleY: fill }}
          className="absolute inset-0 origin-top bg-primary"
        />
        {indices.map((index, i) => (
          <span
            key={index}
            style={{ top: `${markerAt(i, n) * 100}%` }}
            // Number sits just above its marker, so the fill tip stops right
            // under it when the section arrives.
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-full bg-background px-0.5 py-1 font-display text-[0.6rem] leading-none transition-colors duration-300 ${
              i === reached
                ? "text-primary"
                : i < reached
                  ? "text-primary/50"
                  : "text-muted"
            }`}
          >
            {index}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";

type TextRevealElement = "h1" | "h2" | "p" | "span";

// Polymorphic map: the container carries the stagger orchestration, so it must be
// a motion element. Each `as` value maps to its motion tag; all share the prop
// surface we use (variants/initial/animate/className), so a single-tag cast is safe.
const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
  span: motion.span,
} as const;

type TextRevealProps = {
  text: string;
  as?: TextRevealElement;
  className?: string;
  delay?: number;
  /** Reveal on scroll-into-view instead of on mount. */
  inView?: boolean;
};

const word: Variants = {
  hidden: { y: "110%" },
  show: {
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TextReveal({
  text,
  as = "span",
  className,
  delay = 0,
  inView = false,
}: TextRevealProps) {
  const MotionTag = MOTION_TAGS[as] as typeof motion.span;
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.045, delayChildren: delay },
    },
  };

  // Default trigger fires on mount (used by the hero); inView defers to scroll.
  const trigger = inView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.6 } }
    : { animate: "show" as const };

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      {...trigger}
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {/* Mask box clips the word; pb keeps descenders from being cut. */}
          <span className="inline-block overflow-hidden pb-[0.15em]">
            <motion.span
              data-reveal
              className="inline-block"
              variants={word}
            >
              {w}
            </motion.span>
          </span>
          {/* Real space between whole-word spans preserves spacing and wrapping. */}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </MotionTag>
  );
}

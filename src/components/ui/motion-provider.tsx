"use client";

import { MotionConfig } from "motion/react";

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // reducedMotion="user" defers to the OS prefers-reduced-motion setting.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { INDIGO, KEY_LIGHT, LIME } from "./device-materials";

// How far (radians) the reflections swing when the pointer reaches an edge.
const SWING = 0.4;
// Damping rate (1/s) for easing the environment toward the pointer.
const LAMBDA = 4;
const EPSILON = 1e-3;

// "Has a real hover pointer" is a fixed device capability → external store.
const HOVER_QUERY = "(hover: hover)";
function subscribeHover(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
const getHover = () => window.matchMedia(HOVER_QUERY).matches;

/**
 * Code-built light studio. Metals only show what they reflect, so the bodies
 * need an environment: a few Lightformers (soft white key, white + lime rim
 * strips, indigo fill) baked once into a cube map — no HDR download.
 *
 * Reactive part: on hover-capable devices (and without reduced motion) the
 * baked environment is rotated toward the pointer, so highlights slide along
 * the edges. Rotating `scene.environmentRotation` re-uses the baked map; the
 * scene only re-renders while the rotation is still easing.
 */
export default function StudioLighting() {
  const hover = useSyncExternalStore(subscribeHover, getHover, () => false);
  const reduce = useReducedMotion();
  const reactive = hover && !reduce;

  const invalidate = useThree((state) => state.invalidate);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!reactive) {
      target.current = { x: 0, y: 0 };
      invalidate();
      return;
    }
    const onMove = (e: PointerEvent) => {
      // Normalized −1..1 across the viewport (the canvas sits under text).
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reactive, invalidate]);

  useFrame(({ scene }, delta) => {
    const rot = scene.environmentRotation;
    const ty = target.current.x * SWING;
    const tx = target.current.y * SWING * 0.5;
    rot.y = THREE.MathUtils.damp(rot.y, ty, LAMBDA, delta);
    rot.x = THREE.MathUtils.damp(rot.x, tx, LAMBDA, delta);
    // Keep rendering only while still easing toward the pointer.
    if (Math.abs(rot.y - ty) > EPSILON || Math.abs(rot.x - tx) > EPSILON) {
      invalidate();
    }
  });

  return (
    <>
      {/* Weak base + key so non-metal parts keep some form shading. */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 5]} intensity={0.6} color={KEY_LIGHT} />

      <Environment frames={1} resolution={256}>
        {/* Ceiling softbox: what flat tops (keyboard deck, phone sides) mirror */}
        <Lightformer
          form="rect"
          intensity={0.8}
          color={KEY_LIGHT}
          position={[0, 7, 0]}
          scale={[14, 10, 1]}
        />
        {/* Back-top strip: catches the deck and lid edges at grazing angles */}
        <Lightformer
          form="rect"
          intensity={1.4}
          color={KEY_LIGHT}
          position={[0, 4, -7]}
          scale={[12, 1.2, 1]}
        />
        {/* Soft key: big rect above-front-right */}
        <Lightformer
          form="rect"
          intensity={2}
          color={KEY_LIGHT}
          position={[3, 4, 5]}
          scale={[8, 5, 1]}
        />
        {/* White rim strip, left */}
        <Lightformer
          form="rect"
          intensity={1.6}
          color={KEY_LIGHT}
          position={[-6, 1, 1]}
          scale={[0.6, 8, 1]}
        />
        {/* Lime brand rim, right-back */}
        <Lightformer
          form="rect"
          intensity={1.5}
          color={LIME}
          position={[6, 0, -2]}
          scale={[0.5, 7, 1]}
        />
        {/* Indigo fill from below-left */}
        <Lightformer
          form="circle"
          intensity={0.8}
          color={INDIGO}
          position={[-3, -4, 3]}
          scale={5}
        />
      </Environment>
    </>
  );
}

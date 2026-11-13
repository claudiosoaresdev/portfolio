"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import type { DeviceSpec } from "@/data/types";
import { hasDesktop } from "@/data/platform";
import StaticDeviceFallback from "./static-device-fallback";

import LaptopModel from "./laptop-model";
import PhoneModel from "./phone-model";
import StudioLighting from "./studio-lighting";
import { FOV, PAIR_POSE, PHONE_POSE } from "./device-pose";

// Pair bounding box (scene units, incl. swing margin) used to frame the camera:
// the camera backs off until this box fits the framing column. The pair's real
// swing envelope is ≈ 8.1×5.5 units, centred on the origin.
// static-device-fallback.tsx sizes its CSS pair from these numbers — keep in sync.
const PAIR_FRAME = { w: 9.4, h: 5.6 };
// From lg up the canvas is a full-bleed background layer behind the copy. The
// pair is framed against the right 55% column with a box 25% narrower (so it
// renders 25% larger) and is centred at 68% of the width, which keeps its swing
// clear of the right edge while it bleeds slightly left of the column.
const PAIR_FRAME_LG = { w: PAIR_FRAME.w / 1.25, h: PAIR_FRAME.h };
const LG_MIN_WIDTH = 1024;
const LG_COLUMN = 0.55;
const PAIR_CENTER_X_LG = 0.68;
// The phone-only scene keeps its old spot: the centre of the right 55% column.
const PHONE_CENTER_X_LG = 0.725;
// Phone-only framing, same idea as the pair: the 2.2×4.6 body plus its swing
// (PHONE_POSE: posY ±0.35, rotY ±0.55) fits a 3.4×5.6 box, and the phone never grows
// past 34rem tall — the static fallback's cap. Keep in sync with
// static-device-fallback.tsx (phone height = min(4.6/5.6 cqh, 34rem, …)).
const PHONE_FRAME = { w: 3.4, h: 5.6 };
const PHONE_BODY_H = 4.6;
const PHONE_MAX_PX = 34 * 16;
const PHONE_CAMERA_Z = 6.2;

/** Calls `onReady` once every texture in the scene has loaded. */
function useAllReady(count: number, onReady?: () => void) {
  const loaded = useRef(0);
  return useCallback(() => {
    loaded.current += 1;
    if (loaded.current === count) onReady?.();
  }, [count, onReady]);
}

function DeviceRig({
  spec,
  progress,
  onReady,
}: {
  spec: DeviceSpec;
  progress: MotionValue<number>;
  onReady?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const pair = hasDesktop(spec.kind) && !!spec.desktopScreenshot;
  const textureReady = useAllReady(pair ? 2 : 1, onReady);

  // frameloop="demand" only renders on invalidate — repaint whenever scroll
  // progress changes. `.on` returns its own unsubscribe.
  useEffect(() => progress.on("change", invalidate), [progress, invalidate]);

  useFrame(({ camera, size }) => {
    const g = group.current;
    if (!g) return;

    // Framing: the camera backs off until the device's bounding box fits both
    // the canvas height and the framing width.
    // From lg the canvas spans the whole viewport, so the framing width is the
    // right-hand column and a view offset slides the devices off-centre (the
    // projection stays on-axis, so they look exactly as in a narrower canvas).
    const lg = window.innerWidth >= LG_MIN_WIDTH;
    const { width, height } = size;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const frameWidth = lg ? width * LG_COLUMN : width;
    const aspect = frameWidth / Math.max(height, 1);
    const frame = pair ? (lg ? PAIR_FRAME_LG : PAIR_FRAME) : PHONE_FRAME;
    let z = Math.max(frame.h / 2 / tan, frame.w / 2 / (tan * aspect));
    // Cap the phone's on-screen height (visible height = PHONE_BODY_H at most
    // PHONE_MAX_PX of the canvas height).
    if (!pair) {
      z = Math.max(z, (PHONE_BODY_H * height) / PHONE_MAX_PX / 2 / tan);
    }
    const cam = camera as THREE.PerspectiveCamera;
    const offsetX = lg
      ? width / 2 - width * (pair ? PAIR_CENTER_X_LG : PHONE_CENTER_X_LG)
      : 0;
    const view = cam.view;
    const viewChanged = lg
      ? !view?.enabled ||
        view.offsetX !== offsetX ||
        view.fullWidth !== width ||
        view.fullHeight !== height
      : !!view?.enabled;
    if (cam.position.z !== z || viewChanged) {
      cam.position.z = z;
      if (lg) cam.setViewOffset(width, height, offsetX, 0, width, height);
      else cam.clearViewOffset();
      cam.updateProjectionMatrix();
    }

    const p = progress.get();
    const pose = pair ? PAIR_POSE : PHONE_POSE;
    g.rotation.y = THREE.MathUtils.lerp(pose.rotY[0], pose.rotY[1], p);
    g.rotation.x = THREE.MathUtils.lerp(pose.rotX[0], pose.rotX[1], p);
    g.rotation.z = THREE.MathUtils.lerp(pose.rotZ[0], pose.rotZ[1], p);
    g.position.y = THREE.MathUtils.lerp(pose.posY[0], pose.posY[1], p);
  });

  if (!pair) {
    return (
      <group ref={group}>
        <PhoneModel
          device={spec.phone}
          screenshot={spec.screenshot}
          onReady={textureReady}
        />
      </group>
    );
  }

  return (
    <group ref={group}>
      {/* Laptop left of center, tipped toward the camera so the deck reads. */}
      <group position={[-0.8, 0.1, 0]} rotation={[0.28, 0, 0]}>
        <LaptopModel
          screenshot={spec.desktopScreenshot!}
          onReady={textureReady}
        />
      </group>
      {/* Phone front-right, overlapping the laptop's right edge. */}
      <group position={[2.75, -0.75, 1.6]} rotation={[0, -0.18, 0]} scale={0.72}>
        <PhoneModel
          device={spec.phone}
          screenshot={spec.screenshot}
          onReady={textureReady}
        />
      </group>
    </group>
  );
}

export default function DeviceScene({
  spec,
  progress,
  alt,
  onReady,
}: {
  spec: DeviceSpec;
  progress: MotionValue<number>;
  alt: string;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, PHONE_CAMERA_Z], fov: FOV }}
      fallback={
        <StaticDeviceFallback spec={spec} alt={alt} layer />
      }
    >
      <StudioLighting />

      <Suspense fallback={null}>
        <DeviceRig
          spec={spec}
          progress={progress}
          onReady={onReady}
        />
      </Suspense>

      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.4}
        scale={hasDesktop(spec.kind) ? 14 : 8}
        blur={2.5}
        far={4}
        frames={1}
      />
    </Canvas>
  );
}

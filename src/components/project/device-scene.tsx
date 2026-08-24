"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import type { DeviceKind } from "@/data/types";
import StaticDeviceFallback from "./static-device-fallback";

// Three.js material/light colors are not CSS, so the design tokens are mirrored
// here as literals. Keep in sync with globals.css @theme:
//   --color-primary   (lime)   #A9FE00
//   --color-secondary (indigo) #4E47E3
//   --color-background         #0A0A0A
const LIME = "#A9FE00"; // --color-primary — rim light + accent edge strip
const INDIGO = "#4E47E3"; // --color-secondary — atmospheric fill light
const KEY_LIGHT = "#FFFFFF"; // neutral key light
const BODY_COLOR = "#101014"; // chassis, a touch deeper than --color-background
const BEZEL_COLOR = "#050506"; // screen surround, darkest
const CUTOUT_COLOR = "#000000"; // camera punch-hole / dynamic island

// Scroll-driven pose extremes, interpolated by `progress` in [0, 1].
const ROT_Y = [-0.55, 0.55] as const;
const ROT_X = [0.08, -0.08] as const;
const ROT_Z = [0.05, -0.05] as const;
const POS_Y = [0.35, -0.35] as const;

function PhoneModel({
  device,
  screenshot,
  onReady,
}: {
  device: DeviceKind;
  screenshot: string;
  onReady?: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  // Configure the loaded texture in useTexture's onLoad (drei runs it in a
  // layout effect, off the render path). TextureLoader defaults to
  // NoColorSpace; screenshots are authored in sRGB. Stable so it runs once.
  // onReady tells the wrapper the scene has textured content, so it can fade
  // out the static stand-in without a visible gap.
  const configureTexture = useCallback(
    (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      invalidate();
      onReady?.();
    },
    [invalidate, onReady],
  );
  const texture = useTexture(screenshot, configureTexture);

  const isIos = device === "ios";
  // Subtly squarer silhouette for iOS, rounder for Android.
  const bodyRadius = isIos ? 0.18 : 0.12;

  return (
    <group>
      {/* Chassis */}
      <RoundedBox
        args={[2.2, 4.6, 0.28]}
        radius={bodyRadius}
        smoothness={8}
        bevelSegments={4}
      >
        <meshStandardMaterial
          color={BODY_COLOR}
          metalness={0.7}
          roughness={0.32}
        />
      </RoundedBox>

      {/* Bezel plate directly behind the screen */}
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[2.1, 4.5]} />
        <meshStandardMaterial color={BEZEL_COLOR} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Screen — unlit so the screenshot shows in true colors */}
      <mesh position={[0, 0, 0.146]}>
        <planeGeometry args={[2.02, 4.38]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Lime accent strip along the right edge */}
      <mesh position={[1.09, 0, 0.05]}>
        <boxGeometry args={[0.02, 3.4, 0.16]} />
        <meshBasicMaterial color={LIME} toneMapped={false} />
      </mesh>

      {/* Front-camera differentiator */}
      {isIos ? (
        <mesh position={[0, 1.9, 0.152]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.07, 0.34, 4, 16]} />
          <meshStandardMaterial color={CUTOUT_COLOR} metalness={0.2} roughness={0.6} />
        </mesh>
      ) : (
        <mesh position={[0, 1.98, 0.152]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color={CUTOUT_COLOR} metalness={0.2} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

function DeviceRig({
  device,
  screenshot,
  progress,
  onReady,
}: {
  device: DeviceKind;
  screenshot: string;
  progress: MotionValue<number>;
  onReady?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  // frameloop="demand" only renders on invalidate — repaint whenever scroll
  // progress changes. `.on` returns its own unsubscribe.
  useEffect(() => progress.on("change", invalidate), [progress, invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    g.rotation.y = THREE.MathUtils.lerp(ROT_Y[0], ROT_Y[1], p);
    g.rotation.x = THREE.MathUtils.lerp(ROT_X[0], ROT_X[1], p);
    g.rotation.z = THREE.MathUtils.lerp(ROT_Z[0], ROT_Z[1], p);
    g.position.y = THREE.MathUtils.lerp(POS_Y[0], POS_Y[1], p);
  });

  return (
    <group ref={group}>
      <PhoneModel device={device} screenshot={screenshot} onReady={onReady} />
    </group>
  );
}

export default function DeviceScene({
  device,
  screenshot,
  progress,
  alt,
  onReady,
}: {
  device: DeviceKind;
  screenshot: string;
  progress: MotionValue<number>;
  alt: string;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      fallback={
        <StaticDeviceFallback device={device} screenshot={screenshot} alt={alt} />
      }
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 5]} intensity={1.1} color={KEY_LIGHT} />
      <directionalLight position={[-5, 1, 2]} intensity={0.4} color={INDIGO} />
      <directionalLight position={[-2, -1, 4]} intensity={0.25} color={LIME} />

      <Suspense fallback={null}>
        <DeviceRig
          device={device}
          screenshot={screenshot}
          progress={progress}
          onReady={onReady}
        />
      </Suspense>

      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
        frames={1}
      />
    </Canvas>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, useTexture } from "@react-three/drei";
import { assetPath } from "@/lib/site";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import type { DeviceSpec, PhoneKind } from "@/data/types";
import { hasDesktop } from "@/data/platform";
import StaticDeviceFallback from "./static-device-fallback";

import {
  BEZEL_COLOR,
  BODY_COLOR,
  CUTOUT_COLOR,
  INDIGO,
  KEY_LIGHT,
  LIME,
} from "./device-materials";
import LaptopModel from "./laptop-model";

// Scroll-driven pose extremes, interpolated by `progress` in [0, 1].
const ROT_Y = [-0.55, 0.55] as const;
const ROT_X = [0.08, -0.08] as const;
const ROT_Z = [0.05, -0.05] as const;
const POS_Y = [0.35, -0.35] as const;

// MacBook + phone pair: wider object, so a calmer swing keeps it in frame.
const PAIR_ROT_Y = [-0.32, 0.32] as const;
const PAIR_ROT_X = [0.05, -0.05] as const;
const PAIR_ROT_Z = [0.02, -0.02] as const;
const PAIR_POS_Y = [0.2, -0.2] as const;
// Pair bounding box (scene units, incl. swing margin) used to frame the camera.
const PAIR_FRAME = { w: 9.4, h: 5.6 };
const PHONE_CAMERA_Z = 6.2;
const FOV = 35;

function PhoneModel({
  device,
  screenshot,
  onReady,
}: {
  device: PhoneKind;
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
  // `useTexture` faz fetch direto, sem passar pelo roteador da Next, então o
  // basePath tem que ser aplicado à mão — sem isso a textura 404 sob
  // /<repo> e a cena cai no fallback estático.
  const texture = useTexture(assetPath(screenshot), configureTexture);

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

    // Framing: the phone keeps its fixed camera; the pair backs the camera off
    // until its bounding box fits both the canvas height and width.
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const aspect = size.width / Math.max(size.height, 1);
    const z = pair
      ? Math.max(PAIR_FRAME.h / 2 / tan, PAIR_FRAME.w / 2 / (tan * aspect))
      : PHONE_CAMERA_Z;
    if (camera.position.z !== z) {
      camera.position.z = z;
      camera.updateProjectionMatrix();
    }

    const p = progress.get();
    const [ry, rx, rz, py] = pair
      ? [PAIR_ROT_Y, PAIR_ROT_X, PAIR_ROT_Z, PAIR_POS_Y]
      : [ROT_Y, ROT_X, ROT_Z, POS_Y];
    g.rotation.y = THREE.MathUtils.lerp(ry[0], ry[1], p);
    g.rotation.x = THREE.MathUtils.lerp(rx[0], rx[1], p);
    g.rotation.z = THREE.MathUtils.lerp(rz[0], rz[1], p);
    g.position.y = THREE.MathUtils.lerp(py[0], py[1], p);
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
        <StaticDeviceFallback spec={spec} alt={alt} />
      }
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 5]} intensity={1.1} color={KEY_LIGHT} />
      <directionalLight position={[-5, 1, 2]} intensity={0.4} color={INDIGO} />
      <directionalLight position={[-2, -1, 4]} intensity={0.25} color={LIME} />

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

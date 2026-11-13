"use client";

import { useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { assetPath } from "@/lib/site";
import type { PhoneKind } from "@/data/types";
import {
  BEZEL_COLOR,
  CUTOUT_COLOR,
  LIME,
  METAL_COLOR,
  METAL_LIGHT,
} from "./device-materials";
import ScreenGlass from "./screen-glass";

// Scene units. Overall silhouette (2.2 × 4.6) is unchanged so camera framing
// and the static fallback stay in sync.
const BODY = { w: 2.2, h: 4.6, d: 0.28 };
const SCREEN = { w: 2.02, h: 4.38 };
const FRONT = BODY.d / 2;
const BACK = -BODY.d / 2;
const SIDE = BODY.w / 2;

function Metal({ light = false }: { light?: boolean }) {
  return (
    <meshPhysicalMaterial
      color={light ? METAL_LIGHT : METAL_COLOR}
      metalness={0.9}
      roughness={light ? 0.22 : 0.3}
      clearcoat={0.4}
      clearcoatRoughness={0.2}
    />
  );
}

/** Rear lens: metal ring + dark glass element. */
function Lens({ position, r = 0.13 }: { position: [number, number, number]; r?: number }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[r, r, 0.05, 32]} />
        <Metal light />
      </mesh>
      <mesh position={[0, -0.026, 0]}>
        <cylinderGeometry args={[r * 0.72, r * 0.72, 0.01, 32]} />
        <meshPhysicalMaterial
          color={CUTOUT_COLOR}
          metalness={0}
          roughness={0.05}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

/**
 * Procedural phone: graphite shell with a lighter metal frame band, side
 * buttons, rear camera module (iOS: square, 3 lenses; Android: bar), glossy
 * black bezel, true-color screen under a thin glass layer, lime edge accent.
 */
export default function PhoneModel({
  device,
  screenshot,
  onReady,
}: {
  device: PhoneKind;
  screenshot: string;
  onReady?: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  // Configure the texture in useTexture's onLoad (layout effect, off the render
  // path): TextureLoader defaults to NoColorSpace; screenshots are sRGB.
  // onReady lets the wrapper fade out the static stand-in without a gap.
  const configureTexture = useCallback(
    (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      invalidate();
      onReady?.();
    },
    [invalidate, onReady],
  );
  // useTexture fetches directly (no Next router), so basePath is applied here.
  const texture = useTexture(assetPath(screenshot), configureTexture);

  const isIos = device === "ios";
  // Subtly squarer silhouette for iOS, rounder for Android.
  const bodyRadius = isIos ? 0.18 : 0.12;

  return (
    <group>
      {/* Shell */}
      <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={bodyRadius} smoothness={8} bevelSegments={4}>
        <Metal />
      </RoundedBox>

      {/* Frame band — a lighter metal stripe around the edges */}
      <RoundedBox
        args={[BODY.w + 0.03, BODY.h + 0.03, BODY.d * 0.5]}
        radius={bodyRadius}
        smoothness={8}
        bevelSegments={4}
      >
        <Metal light />
      </RoundedBox>

      {/* Side buttons: volume ×2 (left), power (right) */}
      {[1.15, 0.6].map((y) => (
        <RoundedBox key={y} args={[0.05, 0.42, 0.09]} radius={0.02} smoothness={4} position={[-SIDE - 0.03, y, 0]}>
          <Metal light />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.05, 0.62, 0.09]} radius={0.02} smoothness={4} position={[SIDE + 0.03, 1.0, 0]}>
        <Metal light />
      </RoundedBox>

      {/* Lime accent strip, right edge below the power button */}
      <mesh position={[SIDE + 0.017, -0.7, 0]}>
        <boxGeometry args={[0.012, 2.2, 0.05]} />
        <meshBasicMaterial color={LIME} toneMapped={false} />
      </mesh>

      {/* Rear camera module */}
      {isIos ? (
        <group position={[-0.5, 1.6, BACK - 0.03]}>
          <RoundedBox args={[0.86, 0.86, 0.06]} radius={0.16} smoothness={6}>
            <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0.2} roughness={0.2} clearcoat={1} />
          </RoundedBox>
          <Lens position={[-0.18, 0.18, -0.04]} />
          <Lens position={[-0.18, -0.18, -0.04]} />
          <Lens position={[0.2, 0, -0.04]} />
        </group>
      ) : (
        <group position={[0, 1.6, BACK - 0.03]}>
          <RoundedBox args={[1.9, 0.48, 0.06]} radius={0.12} smoothness={6}>
            <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0.2} roughness={0.2} clearcoat={1} />
          </RoundedBox>
          <Lens position={[-0.55, 0, -0.04]} />
          <Lens position={[-0.18, 0, -0.04]} />
          <Lens position={[0.2, 0, -0.04]} r={0.08} />
        </group>
      )}

      {/* Glossy black bezel */}
      <mesh position={[0, 0, FRONT]}>
        <planeGeometry args={[2.1, 4.5]} />
        <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* Screen — unlit so the screenshot shows in true colors */}
      <mesh position={[0, 0, FRONT + 0.006]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <ScreenGlass width={SCREEN.w} height={SCREEN.h} position={[0, 0, FRONT + 0.009]} />

      {/* Front-camera differentiator */}
      {isIos ? (
        <mesh position={[0, 1.9, FRONT + 0.012]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.07, 0.34, 4, 16]} />
          <meshStandardMaterial color={CUTOUT_COLOR} metalness={0.2} roughness={0.6} />
        </mesh>
      ) : (
        <mesh position={[0, 1.98, FRONT + 0.012]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color={CUTOUT_COLOR} metalness={0.2} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

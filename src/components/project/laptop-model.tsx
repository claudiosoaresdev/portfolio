"use client";

import { useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { assetPath } from "@/lib/site";
import { BEZEL_COLOR, LIME, METAL_COLOR } from "./device-materials";

// Scene units. The lid hinges on the base's back edge; the group origin sits
// roughly at the visual center of the open laptop so the rig rotates it in place.
const BASE = { w: 5.9, h: 0.12, d: 3.8 };
const LID = { w: 5.6, h: 3.6, d: 0.08 };
const SCREEN = { w: 5.3, h: 3.3 }; // 16:10 — matches the 1600x1000 texture
const LID_TILT = -0.17; // ~10° back from vertical (~100° from the base)
const KEY_ROWS = 5;
const KEY_COLS = 14;

/**
 * Procedural MacBook. Stylized like the phone (no GLTF): base slab with a key
 * grid and a lime front strip, lid with bezel and the desktop screenshot on an
 * unlit plane so it shows in true colors.
 */
export default function LaptopModel({
  screenshot,
  onReady,
}: {
  screenshot: string;
  onReady?: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const configureTexture = useCallback(
    (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      invalidate();
      onReady?.();
    },
    [invalidate, onReady],
  );
  // Same basePath rule as the phone texture: useTexture bypasses the router.
  const texture = useTexture(assetPath(screenshot), configureTexture);

  const keyW = (BASE.w * 0.8) / KEY_COLS;
  const keyD = (BASE.d * 0.42) / KEY_ROWS;

  return (
    <group position={[0, -1.7, 0]}>
      {/* Base */}
      <RoundedBox args={[BASE.w, BASE.h, BASE.d]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial color={METAL_COLOR} metalness={0.9} roughness={0.3} clearcoat={0.4} clearcoatRoughness={0.2} />
      </RoundedBox>

      {/* Key grid — suggestion only */}
      <group position={[0, BASE.h / 2 + 0.002, -BASE.d * 0.12]}>
        {Array.from({ length: KEY_ROWS * KEY_COLS }, (_, i) => {
          const col = i % KEY_COLS;
          const row = Math.floor(i / KEY_COLS);
          return (
            <mesh
              key={i}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[
                (col - (KEY_COLS - 1) / 2) * keyW,
                0,
                (row - (KEY_ROWS - 1) / 2) * keyD,
              ]}
            >
              <planeGeometry args={[keyW * 0.82, keyD * 0.78]} />
              <meshStandardMaterial color={BEZEL_COLOR} metalness={0.3} roughness={0.7} />
            </mesh>
          );
        })}
        {/* Trackpad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BASE.d * 0.36]}>
          <planeGeometry args={[BASE.w * 0.3, BASE.d * 0.22]} />
          <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0.2} roughness={0.25} clearcoat={0.6} />
        </mesh>
      </group>

      {/* Lime accent strip along the front edge */}
      <mesh position={[0, 0, BASE.d / 2 + 0.002]}>
        <planeGeometry args={[BASE.w * 0.6, 0.03]} />
        <meshBasicMaterial color={LIME} toneMapped={false} />
      </mesh>

      {/* Lid, hinged on the back edge */}
      <group position={[0, BASE.h / 2, -BASE.d / 2 + 0.04]} rotation={[LID_TILT, 0, 0]}>
        <RoundedBox
          args={[LID.w, LID.h, LID.d]}
          radius={0.04}
          smoothness={4}
          position={[0, LID.h / 2, 0]}
        >
          <meshPhysicalMaterial color={METAL_COLOR} metalness={0.9} roughness={0.3} clearcoat={0.4} clearcoatRoughness={0.2} />
        </RoundedBox>
        <mesh position={[0, LID.h / 2, LID.d / 2 + 0.001]}>
          <planeGeometry args={[LID.w - 0.12, LID.h - 0.12]} />
          <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        <mesh position={[0, LID.h / 2 + 0.04, LID.d / 2 + 0.004]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

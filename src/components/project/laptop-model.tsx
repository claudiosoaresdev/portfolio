"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { assetPath } from "@/lib/site";
import {
  BEZEL_COLOR,
  CUTOUT_COLOR,
  LIME,
  METAL_COLOR,
  METAL_LIGHT,
} from "./device-materials";
import ScreenGlass from "./screen-glass";

// Scene units. The lid hinges on the base's back edge; the group origin sits
// roughly at the visual center of the open laptop so the rig rotates it in place.
// Overall size is unchanged so camera framing and the static fallback stay in sync.
const BASE = { w: 5.9, h: 0.12, d: 3.8 };
const LID = { w: 5.6, h: 3.6, d: 0.08 };
const SCREEN = { w: 5.3, h: 3.3 }; // 16:10 — matches the 1600x1000 texture
const LID_TILT = -0.17; // ~10° back from vertical (~100° from the base)
const DECK_Y = BASE.h / 2;

// Keyboard: 5 rows × 14 columns, the bottom row's middle six keys merged into
// a space bar. Placed in a dark well; each key is a short box (real relief).
const KEY_ROWS = 5;
const KEY_COLS = 14;
const KB = { w: BASE.w * 0.78, d: BASE.d * 0.4, z: -BASE.d * 0.13 };
const KEY_H = 0.025;
const SPACE = { from: 4, to: 9 };

// Speaker grilles either side of the keyboard: perforation dots.
const GRILLE = { cols: 4, rows: 18, pitch: 0.075, r: 0.016 };

type KeySlot = { x: number; z: number; w: number };

function keyLayout(): KeySlot[] {
  const pitchX = KB.w / KEY_COLS;
  const pitchZ = KB.d / KEY_ROWS;
  const slots: KeySlot[] = [];
  for (let row = 0; row < KEY_ROWS; row++) {
    const z = KB.z + (row - (KEY_ROWS - 1) / 2) * pitchZ;
    for (let col = 0; col < KEY_COLS; col++) {
      const x = -KB.w / 2 + (col + 0.5) * pitchX;
      if (row === KEY_ROWS - 1 && col >= SPACE.from && col <= SPACE.to) {
        if (col === SPACE.from) {
          const span = SPACE.to - SPACE.from + 1;
          slots.push({ x: x + ((span - 1) * pitchX) / 2, z, w: span * pitchX - pitchX * 0.18 });
        }
        continue;
      }
      slots.push({ x, z, w: pitchX * 0.82 });
    }
  }
  return slots;
}

/** Fills an instancedMesh with per-instance matrices once. */
function useInstances(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  matrices: THREE.Matrix4[],
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [ref, matrices]);
}

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

/**
 * Procedural MacBook. Stylized like the phone (no GLTF): graphite base with
 * keys in relief (instanced), speaker grilles, glass trackpad, lid-open notch,
 * lime front strip and hinge barrel; lid with glossy bezel, camera notch and
 * the desktop screenshot on an unlit plane (true colors) under a glass layer.
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

  const keysRef = useRef<THREE.InstancedMesh>(null);
  const grilleRef = useRef<THREE.InstancedMesh>(null);

  const keyMatrices = useMemo(() => {
    const pitchZ = KB.d / KEY_ROWS;
    return keyLayout().map(({ x, z, w }) =>
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, DECK_Y + KEY_H / 2 + 0.004, z),
        new THREE.Quaternion(),
        new THREE.Vector3(w, KEY_H, pitchZ * 0.78),
      ),
    );
  }, []);

  const grilleMatrices = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const flat = new THREE.Quaternion();
    for (const side of [-1, 1]) {
      const cx = side * (KB.w / 2 + 0.3);
      for (let c = 0; c < GRILLE.cols; c++) {
        for (let r = 0; r < GRILLE.rows; r++) {
          m.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(
                cx + (c - (GRILLE.cols - 1) / 2) * GRILLE.pitch,
                DECK_Y + 0.002,
                KB.z + (r - (GRILLE.rows - 1) / 2) * GRILLE.pitch,
              ),
              flat,
              new THREE.Vector3(1, 1, 1),
            ),
          );
        }
      }
    }
    return m;
  }, []);

  useInstances(keysRef, keyMatrices);
  useInstances(grilleRef, grilleMatrices);

  const screenY = LID.h / 2 + 0.04;
  const lidFront = LID.d / 2;

  return (
    <group position={[0, -1.7, 0]}>
      {/* Base */}
      <RoundedBox args={[BASE.w, BASE.h, BASE.d]} radius={0.05} smoothness={4}>
        <Metal />
      </RoundedBox>

      {/* Keyboard well + keys with relief (one draw call) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK_Y + 0.002, KB.z]}>
        <planeGeometry args={[KB.w + 0.1, KB.d + 0.08]} />
        <meshStandardMaterial color={BEZEL_COLOR} metalness={0.2} roughness={0.8} />
      </mesh>
      <instancedMesh ref={keysRef} args={[undefined, undefined, keyMatrices.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#16171b" metalness={0.1} roughness={0.55} clearcoat={0.2} />
      </instancedMesh>

      {/* Speaker grilles */}
      <instancedMesh ref={grilleRef} args={[undefined, undefined, grilleMatrices.length]}>
        <cylinderGeometry args={[GRILLE.r, GRILLE.r, 0.004, 8]} />
        <meshStandardMaterial color={CUTOUT_COLOR} roughness={0.9} />
      </instancedMesh>

      {/* Trackpad — glass slab */}
      <RoundedBox
        args={[BASE.w * 0.3, 0.008, BASE.d * 0.22]}
        radius={0.004}
        smoothness={2}
        position={[0, DECK_Y + 0.004, BASE.d * 0.24]}
      >
        <meshPhysicalMaterial color="#2a2c32" metalness={0.3} roughness={0.18} clearcoat={1} />
      </RoundedBox>

      {/* Lid-open notch on the front edge */}
      <mesh position={[0, DECK_Y - 0.015, BASE.d / 2 - 0.01]}>
        <boxGeometry args={[0.7, 0.035, 0.05]} />
        <meshStandardMaterial color={CUTOUT_COLOR} roughness={0.6} />
      </mesh>

      {/* Lime accent strip along the front edge */}
      <mesh position={[0, -0.01, BASE.d / 2 + 0.002]}>
        <planeGeometry args={[BASE.w * 0.6, 0.03]} />
        <meshBasicMaterial color={LIME} toneMapped={false} />
      </mesh>

      {/* Hinge barrel along the back edge */}
      <mesh position={[0, DECK_Y + 0.02, -BASE.d / 2 + 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, LID.w * 0.86, 24]} />
        <Metal light />
      </mesh>

      {/* Lid, hinged on the back edge */}
      <group position={[0, DECK_Y, -BASE.d / 2 + 0.04]} rotation={[LID_TILT, 0, 0]}>
        <RoundedBox args={[LID.w, LID.h, LID.d]} radius={0.04} smoothness={4} position={[0, LID.h / 2, 0]}>
          <Metal />
        </RoundedBox>
        {/* Glossy black bezel */}
        <mesh position={[0, LID.h / 2, lidFront + 0.001]}>
          <planeGeometry args={[LID.w - 0.12, LID.h - 0.12]} />
          <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        {/* Screen (true color) + glass */}
        <mesh position={[0, screenY, lidFront + 0.004]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <ScreenGlass width={SCREEN.w} height={SCREEN.h} position={[0, screenY, lidFront + 0.007]} />
        {/* Camera notch */}
        <RoundedBox
          args={[0.42, 0.12, 0.004]}
          radius={0.002}
          smoothness={2}
          position={[0, screenY + SCREEN.h / 2 - 0.03, lidFront + 0.009]}
        >
          <meshPhysicalMaterial color={BEZEL_COLOR} metalness={0} roughness={0.12} clearcoat={1} />
        </RoundedBox>
      </group>
    </group>
  );
}

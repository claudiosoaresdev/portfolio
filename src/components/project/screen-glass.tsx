import * as THREE from "three";

/**
 * Thin glossy layer over a screen. Black base + additive blending means it only
 * ADDS the specular/clearcoat reflection of the studio lights — it never dims
 * or veils the true-color screenshot below. No depth write so it never hides
 * the unlit screen plane.
 */
export default function ScreenGlass({
  width,
  height,
  position,
}: {
  width: number;
  height: number;
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        color="#000000"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        metalness={0}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.04}
        depthWrite={false}
      />
    </mesh>
  );
}

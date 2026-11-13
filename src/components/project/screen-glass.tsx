/**
 * Thin glossy layer over a screen: catches a faint reflection of the studio
 * lights without washing out the screenshot below (low opacity, no depth write
 * so it never hides the unlit screen plane).
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
        color="#ffffff"
        transparent
        opacity={0.1}
        metalness={0}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.04}
        depthWrite={false}
      />
    </mesh>
  );
}

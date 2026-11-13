// Scroll-driven pose extremes shared by the 3D scene and its static stand-in.
// Server-safe (plain numbers, no three.js) so the CSS fallback can mirror the
// scene's opening pose without pulling the WebGL chunk.

/** Vertical field of view of the scene camera, in degrees. */
export const FOV = 35;

export type Pose = {
  rotY: readonly [number, number];
  rotX: readonly [number, number];
  rotZ: readonly [number, number];
  posY: readonly [number, number];
};

/** Single phone, interpolated by `progress` in [0, 1]. */
export const PHONE_POSE: Pose = {
  rotY: [-0.55, 0.55],
  rotX: [0.08, -0.08],
  rotZ: [0.05, -0.05],
  posY: [0.35, -0.35],
};

/** MacBook + phone pair: wider object, so a calmer swing keeps it in frame. */
export const PAIR_POSE: Pose = {
  rotY: [-0.32, 0.32],
  rotX: [0.05, -0.05],
  rotZ: [0.02, -0.02],
  posY: [0.2, -0.2],
};

/**
 * CSS transform reproducing a pose's opening frame (progress 0) on a flat
 * element whose height spans `heightUnits` scene units. Meant for an element
 * centred in a size container that matches the canvas: the camera sits
 * H / (2·tan(FOV/2)) away in pixels whatever its framing, so the perspective
 * is expressed in cqh. Three.js is y-up and applies Euler XYZ as Rx·Ry·Rz;
 * CSS is y-down, hence the flipped X/Z/translate signs.
 */
export function openingPoseTransform(pose: Pose, heightUnits: number): string {
  const perspective = 100 / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
  const lift = (pose.posY[0] / heightUnits) * 100;
  return [
    `perspective(${perspective.toFixed(2)}cqh)`,
    `translateY(${(-lift).toFixed(2)}%)`,
    `rotateX(${-pose.rotX[0]}rad)`,
    `rotateY(${pose.rotY[0]}rad)`,
    `rotateZ(${-pose.rotZ[0]}rad)`,
  ].join(" ");
}

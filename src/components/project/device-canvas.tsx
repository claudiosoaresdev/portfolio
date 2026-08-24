"use client";

import { Component, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import type { MotionValue } from "motion/react";
import type { DeviceKind } from "@/data/types";
import StaticDeviceFallback from "./static-device-fallback";

const DeviceScene = dynamic(() => import("./device-scene"), { ssr: false });

// Degrades a crashed WebGL scene to the static fallback rather than tearing
// down the surrounding page.
class SceneErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  componentDidCatch() {
    this.setState({ hasError: true });
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// WebGL support is a fixed browser capability, so it's read as an external
// store (probed once, cached) rather than mirrored into state via an effect.
let webglSupport: boolean | null = null;
function detectWebGL(): boolean {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
// The capability never changes at runtime, so there is nothing to subscribe to.
const subscribeNoop = () => () => {};

// `null` during SSR/hydration (optimistic scene path); `false` means no WebGL.
function useWebGLSupported(): boolean | null {
  return useSyncExternalStore(subscribeNoop, detectWebGL, () => null);
}

export default function DeviceCanvas({
  device,
  screenshot,
  progress,
  alt,
}: {
  device: DeviceKind;
  screenshot: string;
  progress: MotionValue<number>;
  alt: string;
}) {
  const webglSupported = useWebGLSupported();
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

  const showScene = webglSupported !== false && !sceneFailed;
  const revealScene = showScene && sceneReady;

  // The static frame stays mounted UNDER the (transparent) canvas and only
  // fades out once the scene has a textured first frame. Swapping the two
  // used to leave a few-ms gap — chunk load + WebGL init + texture suspense —
  // where neither the frame nor the 3D phone was visible.
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden={revealScene || undefined}
        className={`absolute inset-0 transition-opacity duration-500 ${
          revealScene ? "opacity-0" : "opacity-100"
        }`}
      >
        <StaticDeviceFallback
          device={device}
          screenshot={screenshot}
          alt={alt}
        />
      </div>

      {showScene && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            revealScene ? "opacity-100" : "opacity-0"
          }`}
        >
          <SceneErrorBoundary onError={() => setSceneFailed(true)}>
            <DeviceScene
              device={device}
              screenshot={screenshot}
              progress={progress}
              alt={alt}
              onReady={() => setSceneReady(true)}
            />
          </SceneErrorBoundary>
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import type { DeviceKind } from "@/data/types";

/**
 * CSS-only phone mock. Server-safe (no browser APIs) so it can render as the
 * dynamic-import loading state, the WebGL-unavailable fallback, and the
 * reduced-motion static frame. Screen aspect mirrors the 1080x2340 texture.
 */
export default function StaticDeviceFallback({
  device,
  screenshot,
  alt,
}: {
  device: DeviceKind;
  screenshot: string;
  alt: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative aspect-[1080/2340] h-full max-h-[34rem] overflow-hidden rounded-[2.5rem] border border-foreground/15 bg-background shadow-[0_0_60px_-18px_var(--color-primary)]">
        {/* Screen */}
        <div className="absolute inset-[4px] overflow-hidden rounded-[2.2rem]">
          <Image
            src={screenshot}
            alt={alt}
            fill
            sizes="20rem"
            className="object-cover"
          />
        </div>

        {/* Front-camera differentiator */}
        {device === "android" ? (
          <span
            aria-hidden
            className="absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-foreground/25 bg-background"
          />
        ) : (
          <span
            aria-hidden
            className="absolute left-1/2 top-2.5 h-5 w-16 -translate-x-1/2 rounded-full bg-background"
          />
        )}
      </div>
    </div>
  );
}

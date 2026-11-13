import Image from "next/image";
import type { DeviceSpec, PhoneKind } from "@/data/types";
import { hasDesktop } from "@/data/platform";
import { assetPath } from "@/lib/site";

/** CSS phone: screen aspect mirrors the 1080x2340 texture. */
function PhoneFrame({
  phone,
  screenshot,
  alt,
  sizes,
  className,
  compact = false,
}: {
  phone: PhoneKind;
  screenshot: string;
  alt: string;
  sizes: string;
  className: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`aspect-[1080/2340] overflow-hidden border border-foreground/15 bg-background shadow-[0_0_60px_-18px_var(--color-primary)] ${
        compact ? "rounded-[1.1rem]" : "rounded-[2.5rem]"
      } ${className}`}
    >
      {/* Screen */}
      <div
        className={`absolute overflow-hidden ${
          compact ? "inset-[2px] rounded-[1rem]" : "inset-[4px] rounded-[2.2rem]"
        }`}
      >
        <Image
          src={assetPath(screenshot)}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>

      {/* Front-camera differentiator */}
      {phone === "android" ? (
        <span
          aria-hidden
          className={`absolute left-1/2 -translate-x-1/2 rounded-full border border-foreground/25 bg-background ${
            compact ? "top-1.5 h-1.5 w-1.5" : "top-3 h-2.5 w-2.5"
          }`}
        />
      ) : (
        <span
          aria-hidden
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-background ${
            compact ? "top-1 h-2 w-7" : "top-2.5 h-5 w-16"
          }`}
        />
      )}
    </div>
  );
}

/**
 * CSS-only device mock. Server-safe (no browser APIs) so it can render as the
 * dynamic-import loading state, the WebGL-unavailable fallback, and the
 * reduced-motion static frame.
 *
 * Phone-only types render a single phone; web/fullstack render a MacBook with
 * the phone overlapping its bottom-right corner, laid out in a 16:11 box sized
 * by the same rule as the 3D camera framing (pair ≈ 7.3×5.0 units inside
 * device-scene's PAIR_FRAME 9.4×5.6 → 78% of width / 89% of height), so the
 * static → 3D fade never resizes the pair. Keep in sync with PAIR_FRAME.
 *
 * `layer` mirrors the scroll showcase's full-bleed background canvas: from lg
 * the pair is framed against the right 55% column with PAIR_FRAME_LG 7.52×5.6
 * (7.3/7.52 → 97% of 55cqw ≈ 53.35cqw) and centred at 68% of the width; the
 * phone sits centred in that column (72.5%). Keep in sync with device-scene.
 *
 * The phone mirrors device-scene's PHONE_FRAME 3.4×5.6 and 34rem cap: body
 * height 4.6 → min(4.6/5.6 = 82.14cqh, 34rem, 4.6/3.4 = 135.3% of the framing
 * width — 100cqw, or the 55cqw column from lg in `layer` mode → 74.4cqw).
 */
export default function StaticDeviceFallback({
  spec,
  alt,
  layer = false,
}: {
  spec: DeviceSpec;
  alt: string;
  layer?: boolean;
}) {
  if (!hasDesktop(spec.kind) || !spec.desktopScreenshot) {
    return (
      <div className="flex h-full w-full items-center justify-center [container-type:size]">
        <PhoneFrame
          phone={spec.phone}
          screenshot={spec.screenshot}
          alt={alt}
          sizes="20rem"
          className={`relative h-[min(82.14cqh,34rem,135.3cqw)] ${
            layer
              ? "lg:h-[min(82.14cqh,34rem,74.4cqw)] lg:translate-x-[22.5cqw]"
              : ""
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center [container-type:size]">
      <div
        className={`relative aspect-[16/11] w-[min(78cqw,calc(89cqh*16/11))] ${
          layer
            ? "lg:w-[min(53.35cqw,calc(89cqh*16/11))] lg:translate-x-[18cqw]"
            : ""
        }`}
      >
        {/* MacBook — lid (16:10 screen in a bezel) + thin base */}
        <div className="absolute left-0 top-0 w-[82%]">
          <div className="rounded-[0.9rem] border border-foreground/15 bg-background p-[2.2%] shadow-[0_0_60px_-18px_var(--color-primary)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[0.35rem]">
              <Image
                src={assetPath(spec.desktopScreenshot)}
                alt={alt}
                fill
                sizes="40rem"
                className="object-cover"
              />
            </div>
          </div>
          <div className="relative mx-[-4%] h-2.5 rounded-b-[0.9rem] border border-t-0 border-foreground/15 bg-foreground/10">
            <span
              aria-hidden
              className="absolute inset-x-[42%] top-0 h-1 rounded-b-md bg-background/80"
            />
          </div>
        </div>

        {/* Phone — front-right, overlapping the laptop's right edge */}
        <PhoneFrame
          phone={spec.phone}
          screenshot={spec.screenshot}
          alt=""
          sizes="10rem"
          compact
          className="absolute bottom-0 right-0 w-[22%]"
        />
      </div>
    </div>
  );
}

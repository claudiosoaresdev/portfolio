"use client";

import { useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { assetPath } from "@/lib/site";
import type { ProjectGalleryItem } from "@/data/types";

type Labels = { prev: string; next: string; slide: string };

// Desktop = janela de navegador (16:10, um slide por vez); mobile = celular
// (9:19,5, vários lado a lado). A moldura reserva a proporção: sem layout shift.
const FRAME = {
  desktop: {
    slide: "basis-full",
    box: "aspect-[16/10] rounded-lg",
    sizes: "(min-width: 896px) 832px, 100vw",
  },
  mobile: {
    slide: "basis-[62%] sm:basis-[34%]",
    box: "mx-auto aspect-[390/844] w-full max-w-[240px] rounded-[2rem]",
    sizes: "240px",
  },
} as const;

function Media({ item }: { item: ProjectGalleryItem }) {
  const src = assetPath(item.src);
  return item.type === "video" ? (
    <video
      src={src}
      aria-label={item.alt}
      className="h-full w-full object-cover object-top"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  ) : (
    <Image
      src={src}
      alt={item.alt}
      fill
      sizes={FRAME[item.frame].sizes}
      className="object-cover object-top"
    />
  );
}

export default function MediaCarousel({
  title,
  items,
  labels,
}: {
  title: string;
  items: ProjectGalleryItem[];
  labels: Labels;
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  // Posição/quantidade de snaps vêm do embla como store externa.
  const subscribe = useCallback(
    (cb: () => void) => {
      embla?.on("select", cb).on("reInit", cb);
      return () => {
        embla?.off("select", cb).off("reInit", cb);
      };
    },
    [embla],
  );
  const index = useSyncExternalStore(
    subscribe,
    () => embla?.selectedScrollSnap() ?? 0,
    () => 0,
  );
  const snaps = useSyncExternalStore(
    subscribe,
    () => embla?.scrollSnapList().length ?? 0,
    () => 0,
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      className="mt-14"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            aria-label={labels.prev}
            className="h-9 w-9 border border-foreground/20 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            aria-label={labels.next}
            className="h-9 w-9 border border-foreground/20 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <ul className="flex gap-4">
          {items.map((item) => (
            <li
              key={item.src}
              role="group"
              aria-roledescription="slide"
              className={`min-w-0 shrink-0 grow-0 ${FRAME[item.frame].slide}`}
            >
              <figure>
                <div
                  className={`relative overflow-hidden border border-foreground/15 bg-foreground/5 ${FRAME[item.frame].box}`}
                >
                  <Media item={item} />
                </div>
                <figcaption className="mt-3 text-center font-body text-xs uppercase tracking-[0.25em] text-muted">
                  {item.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex justify-center gap-2" aria-hidden={snaps <= 1}>
        {Array.from({ length: snaps }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => embla?.scrollTo(i)}
            aria-label={`${labels.slide} ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 transition-all ${
              i === index ? "w-6 bg-primary" : "w-3 bg-foreground/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

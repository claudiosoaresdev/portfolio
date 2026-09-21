import type { MetadataRoute } from "next";
import { assetPath, site } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.name,
    description: site.description,
    lang: site.lang,
    // O manifest é servido como arquivo estático: a Next não reescreve estes
    // caminhos, então o basePath entra à mão.
    start_url: assetPath("/"),
    display: "standalone",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: assetPath("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      {
        src: assetPath("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

import type { MetadataRoute } from "next";
import { getProjects } from "@/data/projects";
import { absoluteUrl } from "@/lib/site";

// Em `output: "export"` isto vira um /sitemap.xml estático no build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Build estático: não há histórico de edição por rota, então a data do
  // build é o sinal de frescor mais honesto que dá para emitir.
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...getProjects().map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}

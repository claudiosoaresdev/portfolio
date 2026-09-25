import type { MetadataRoute } from "next";
import { blogPagePath, getPostMetas, POSTS_PER_PAGE } from "@/data/posts";
import { getProjects } from "@/data/projects";
import { absoluteUrl } from "@/lib/site";

// Em `output: "export"` isto vira um /sitemap.xml estático no build.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostMetas();

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
    {
      url: absoluteUrl("/blog"),
      // O índice muda quando sai post novo — a data do mais recente é o sinal
      // honesto aqui, e não a data do build.
      lastModified: posts[0]?.date ?? lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    // Páginas 2+ da listagem. Todo post novo empurra um item para a página
    // seguinte, então o conteúdo de todas muda junto com o post mais recente.
    ...Array.from(
      { length: Math.max(0, Math.ceil(posts.length / POSTS_PER_PAGE) - 1) },
      (_, i) => ({
        url: absoluteUrl(blogPagePath(i + 2)),
        lastModified: posts[0].date,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      }),
    ),
    // Posts têm data de verdade no frontmatter, então não caem no fallback
    // da data de build usado acima.
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated ?? post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

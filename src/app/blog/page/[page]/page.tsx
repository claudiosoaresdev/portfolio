import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPagePath, getPostPage } from "@/data/posts";
import BlogIndex from "@/components/blog/blog-index";
import { absoluteUrl, blog, ogImage, site } from "@/lib/site";

export const dynamicParams = false;

// Páginas 2..N da listagem — a 1 é o próprio /blog.
export async function generateStaticParams() {
  const { totalPages } = (await getPostPage(1))!;
  const pages = Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
  // Com até POSTS_PER_PAGE posts não há página 2, e `output: "export"` recusa
  // lista vazia ("missing generateStaticParams()"). O placeholder cai no
  // notFound() abaixo: vira um 404 com noindex, fora do sitemap e sem nenhum
  // link apontando para ele. Some sozinho quando o 11º post sair.
  return pages.length > 0 ? pages : [{ page: "2" }];
}

async function resolvePage(params: Promise<{ page: string }>) {
  const { page } = await params;
  // Só dígitos: "02" ou "2.0" não viram página 2 com URL duplicada.
  if (!/^[1-9]\d*$/.test(page) || page === "1") return undefined;
  return getPostPage(Number(page));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const data = await resolvePage(params);
  if (!data) return { title: "Página não encontrada" };

  const title = `${blog.title} — página ${data.page}`;
  const url = absoluteUrl(blogPagePath(data.page));

  return {
    title,
    description: blog.description,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": absoluteUrl("/blog/rss.xml") },
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} — ${site.name}`,
      description: blog.description,
      images: [ogImage("blog", `${blog.title} — ${site.name}`)],
    },
  };
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const data = await resolvePage(params);
  if (!data) notFound();
  return <BlogIndex data={data} />;
}

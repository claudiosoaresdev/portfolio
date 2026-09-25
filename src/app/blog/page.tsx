import type { Metadata } from "next";
import { getPostPage } from "@/data/posts";
import BlogIndex from "@/components/blog/blog-index";
import { absoluteUrl, blog, ogImage, site } from "@/lib/site";

const { title, description } = blog;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/blog"),
    types: { "application/rss+xml": absoluteUrl("/blog/rss.xml") },
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    title: `${title} — ${site.name}`,
    description,
    images: [ogImage("blog", `${title} — ${site.name}`)],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — ${site.name}`,
    description,
    images: [ogImage("blog", `${title} — ${site.name}`)],
  },
};

// Página 1 da listagem. As demais vivem em /blog/page/[page].
export default async function BlogPage() {
  // A página 1 existe sempre, mesmo com zero posts.
  const data = (await getPostPage(1))!;
  return <BlogIndex data={data} />;
}

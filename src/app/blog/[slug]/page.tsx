import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPostDate, getPost, getPosts } from "@/data/posts";
import PostMetaLine from "@/components/blog/post-meta-line";
import PostReader from "@/components/blog/post-reader";
import JsonLd from "@/components/seo/json-ld";
import HudBackdrop from "@/components/ui/hud-backdrop";
import { postBreadcrumbSchema, postSchema } from "@/lib/structured-data";
import { absoluteUrl, ogImage, site } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post não encontrado" };
  }

  const url = absoluteUrl(`/blog/${slug}`);
  const image = ogImage(`blog/${slug}`, post.title);

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    // Rascunho só existe em dev, mas se um dia vazar não deve ser indexado.
    ...(post.draft && { robots: { index: false, follow: false } }),
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.author],
      tags: post.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <main id="conteudo" className="min-h-svh pt-36 pb-24">
      <JsonLd data={postSchema(post)} />
      <JsonLd data={postBreadcrumbSchema(post)} />
      <HudBackdrop fixed />

      <article className="blur-panel mx-auto max-w-3xl px-6">
        <header className="mb-14 border-b border-foreground/10 pb-10">
          <Link
            href="/blog"
            className="font-body text-xs uppercase tracking-[0.3em] text-primary transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Blog
          </Link>
          <h1 className="mt-6 font-display text-3xl uppercase leading-tight tracking-wide text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-5 font-body text-xl leading-relaxed text-muted">
            {post.description}
          </p>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <PostMetaLine post={post} />
            {/* Só aparece se o navegador tiver speechSynthesis e voz pt. */}
            <PostReader />
          </div>
        </header>

        {/* HTML gerado no build a partir de um .md versionado no próprio
            repo — conteúdo do autor, não entrada de usuário. */}
        <div
          id="post-body"
          className="post-body prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.updated ? (
          <p className="mt-16 font-body text-xs uppercase tracking-[0.25em] text-muted">
            Atualizado em{" "}
            <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
          </p>
        ) : null}
      </article>

      <div className="mt-20 border-t border-foreground/10">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden="true">←</span> Todos os posts
          </Link>
        </div>
      </div>
    </main>
  );
}

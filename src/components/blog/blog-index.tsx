import Link from "next/link";
import { blogPagePath, getPostArchive, type PostPage } from "@/data/posts";
import BlogShell from "@/components/blog/blog-shell";
import PostMetaLine from "@/components/blog/post-meta-line";
import JsonLd from "@/components/seo/json-ld";
import HudBackdrop from "@/components/ui/hud-backdrop";
import { blogSchema } from "@/lib/structured-data";
import { blog } from "@/lib/site";

const pad = (n: number) => String(n).padStart(2, "0");

// Listagem do blog — a mesma tela para /blog (página 1) e /blog/page/<n>.
export default async function BlogIndex({ data }: { data: PostPage }) {
  const { posts, page, totalPages, totalPosts } = data;
  // O arquivo lista todos os posts, não só os desta página.
  const archive = await getPostArchive();

  return (
    <main id="conteudo" className="mx-auto min-h-svh max-w-7xl px-6 pt-36 pb-24">
      <JsonLd data={blogSchema(posts, blogPagePath(page))} />
      <HudBackdrop fixed />

      <BlogShell archive={archive}>
        <div className="blur-panel">
          <header className="mb-16">
            {/* Total do blog, não da página — é o tamanho do log inteiro. */}
            <span className="font-body text-xs uppercase tracking-[0.3em] text-primary">
              Log / {pad(totalPosts)} entradas
              {totalPages > 1 ? (
                <span className="text-muted">
                  {" "}
                  / página {pad(page)} de {pad(totalPages)}
                </span>
              ) : null}
            </span>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-foreground sm:text-5xl">
              Blog
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-muted">
              {blog.description}
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="font-body text-muted">Nenhum post publicado ainda.</p>
          ) : (
            <ol className="border-t border-foreground/10">
              {posts.map((post) => (
                <li key={post.slug} className="border-b border-foreground/10">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block py-10 transition-colors"
                  >
                    <PostMetaLine post={post} />
                    <h2 className="mt-4 font-display text-xl uppercase tracking-wide text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted">
                      {post.description}
                    </p>
                    {post.tags.length > 0 ? (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <li
                            key={tag}
                            className="border border-foreground/15 px-2.5 py-1 font-body text-[0.7rem] uppercase tracking-[0.2em] text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          )}

          {totalPages > 1 ? (
            <Pagination page={page} totalPages={totalPages} />
          ) : null}
        </div>
      </BlogShell>
    </main>
  );
}

// Navegação entre páginas: links reais (é o que o buscador segue — rel=prev/next
// não é mais usado pelo Google), com o lado indisponível mantido no layout
// para o indicador central não pular de posição.
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const linkClass =
    "inline-flex items-center gap-2 border border-foreground/15 px-4 py-2.5 transition-colors hover:border-primary hover:text-primary";
  const disabledClass =
    "inline-flex items-center gap-2 border border-foreground/5 px-4 py-2.5 text-muted/30";

  return (
    <nav
      aria-label="Paginação do blog"
      className="mt-14 flex items-center justify-between gap-4 font-body text-xs uppercase tracking-[0.25em]"
    >
      {page > 1 ? (
        <Link
          href={blogPagePath(page - 1)}
          rel="prev"
          aria-label="Posts mais recentes"
          className={linkClass}
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">Mais recentes</span>
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledClass}>
          ← <span className="hidden sm:inline">Mais recentes</span>
        </span>
      )}

      <span className="text-muted">
        <span className="sr-only">
          Página {page} de {totalPages}
        </span>
        <span aria-hidden="true">
          <span className="text-primary">{pad(page)}</span> / {pad(totalPages)}
        </span>
      </span>

      {page < totalPages ? (
        <Link
          href={blogPagePath(page + 1)}
          rel="next"
          aria-label="Posts mais antigos"
          className={linkClass}
        >
          <span className="hidden sm:inline">Mais antigos</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledClass}>
          <span className="hidden sm:inline">Mais antigos</span> →
        </span>
      )}
    </nav>
  );
}

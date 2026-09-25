import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { rehypeSiteLinks } from "@/lib/rehype-site-links";
import type { ArchiveYear, Post, PostMeta } from "./types";

// Fonte de verdade do blog: um arquivo .md por post em content/blog/,
// versionado junto com o código. Nome do arquivo = `YYYY-MM-DD-<slug>.md`
// (o prefixo de data é opcional e só serve para ordenar no editor/git — a data
// que vale é a do frontmatter, porque o checkout raso do CI não tem histórico
// para derivar data de commit).
const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Rascunhos aparecem em `next dev` para revisão e somem do build publicado.
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: "wrap",
    properties: { className: ["heading-anchor"] },
  })
  .use(rehypePrettyCode, {
    theme: "github-dark-dimmed",
    // O fundo do bloco vem do CSS do site, não do tema.
    keepBackground: false,
  })
  .use(rehypeSiteLinks)
  .use(rehypeStringify);

let cached: Post[] | null = null;

/** Todos os posts publicáveis, do mais recente para o mais antigo. */
export async function getPosts(): Promise<Post[]> {
  // Mesmo contrato dos outros loaders: relê em dev (edição aparece sem
  // restart), cacheia no build de produção.
  if (cached && process.env.NODE_ENV === "production") return cached;

  const files = readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md"));
  const posts = await Promise.all(files.map(loadPost));

  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`content/blog: slug duplicado "${post.slug}"`);
    }
    seen.add(post.slug);
  }

  cached = posts
    .filter((post) => SHOW_DRAFTS || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
  return cached;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((post) => post.slug === slug);
}

/** Só os metadados — para listagem, sitemap e RSS, sem carregar o HTML. */
export async function getPostMetas(): Promise<PostMeta[]> {
  return (await getPosts()).map((post) => {
    const meta: PostMeta & { html?: string } = { ...post };
    delete meta.html;
    return meta;
  });
}

/** Posts por página na listagem do blog. */
export const POSTS_PER_PAGE = 10;

export interface PostPage {
  posts: PostMeta[];
  page: number; // 1-based
  totalPages: number; // >= 1, mesmo sem nenhum post
  totalPosts: number;
}

/**
 * Uma página da listagem, ou `undefined` se `page` estiver fora do intervalo.
 * A página 1 existe sempre — é o /blog, mesmo com zero posts.
 */
export async function getPostPage(page: number): Promise<PostPage | undefined> {
  const metas = await getPostMetas();
  const totalPages = Math.max(1, Math.ceil(metas.length / POSTS_PER_PAGE));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return undefined;

  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: metas.slice(start, start + POSTS_PER_PAGE),
    page,
    totalPages,
    totalPosts: metas.length,
  };
}

/**
 * URL de uma página da listagem. A página 1 mora só em /blog — não existe
 * /blog/page/1, para o buscador não ver duas URLs com o mesmo conteúdo.
 */
export function blogPagePath(page: number): string {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

/**
 * Todos os posts agrupados em ano → mês → dia, para o menu de arquivo da
 * listagem. Herda a ordem de `getPosts()` (mais recente primeiro), então cada
 * nível já sai ordenado sem sort adicional.
 */
export async function getPostArchive(): Promise<ArchiveYear[]> {
  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  });
  const years: ArchiveYear[] = [];

  for (const { slug, title, date } of await getPostMetas()) {
    const [y, m, d] = date.split("-");

    let year = years.at(-1);
    if (year?.year !== y) {
      year = { year: y, count: 0, months: [] };
      years.push(year);
    }
    let month = year.months.at(-1);
    if (month?.key !== `${y}-${m}`) {
      month = {
        key: `${y}-${m}`,
        label: monthName.format(new Date(`${date}T00:00:00Z`)),
        count: 0,
        days: [],
      };
      year.months.push(month);
    }
    let day = month.days.at(-1);
    if (day?.key !== date) {
      day = { key: date, label: d, posts: [] };
      month.days.push(day);
    }

    day.posts.push({ slug, title });
    month.count++;
    year.count++;
  }

  return years;
}

async function loadPost(file: string): Promise<Post> {
  const filePath = path.join(CONTENT_DIR, file);
  const { data, content } = matter(readFileSync(filePath, "utf8"));
  const where = `content/blog/${file}`;

  const slug = file.replace(/\.md$/, "").replace(DATE_PREFIX, "");
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `${where}: nome de arquivo precisa ser "YYYY-MM-DD-slug-em-kebab-case.md"`,
    );
  }

  const title = requireString(data.title, "title", where);
  const description = requireString(data.description, "description", where);
  const date = toIsoDate(data.date, "date", where);
  const updated =
    data.updated === undefined
      ? undefined
      : toIsoDate(data.updated, "updated", where);

  if (data.tags !== undefined && !isStringArray(data.tags)) {
    throw new Error(`${where}: "tags" precisa ser uma lista de textos`);
  }
  if (data.cover !== undefined && typeof data.cover !== "string") {
    throw new Error(`${where}: "cover" precisa ser um caminho de public/`);
  }

  const html = String(await processor.process(content));

  return {
    slug,
    title,
    description,
    date,
    ...(updated && { updated }),
    tags: data.tags ?? [],
    draft: data.draft === true,
    ...(data.cover && { cover: data.cover }),
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    html,
  };
}

function requireString(value: unknown, field: string, where: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where}: campo "${field}" obrigatório no frontmatter`);
  }
  return value.trim();
}

/**
 * O YAML do frontmatter lê `date: 2026-09-24` como Date à meia-noite UTC.
 * Normaliza para a string "YYYY-MM-DD" — sem horário, sem fuso — para que a
 * data exibida nunca "volte um dia" em quem está a oeste de Greenwich.
 */
function toIsoDate(value: unknown, field: string, where: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  throw new Error(`${where}: "${field}" precisa estar no formato YYYY-MM-DD`);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/** "24 de setembro de 2026" — formatado em UTC pelo mesmo motivo acima. */
export function formatPostDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

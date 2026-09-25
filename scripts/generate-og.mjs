#!/usr/bin/env node
/**
 * generate-og.mjs — gera as imagens de Open Graph como PNG estáticos.
 *
 * Saídas:
 *   public/og/home.png      a home
 *   public/og/<slug>.png    uma por projeto
 *   public/og/blog.png      o índice do blog
 *   public/og/blog/<slug>.png  uma por post publicado (rascunhos ficam de fora)
 *
 * Por que script e não a convenção `opengraph-image.tsx` da Next: no export
 * estático aquela convenção emite arquivos SEM extensão (out/opengraph-image),
 * e o GitHub Pages os serve como application/octet-stream — scrapers de rede
 * social recusam. Arquivo .png em public/ tem o Content-Type certo em qualquer
 * host estático.
 *
 * Conteúdo vem dos mesmos JSON e markdown que alimentam o site, então as imagens não saem
 * de sincronia com o texto das páginas.
 *
 * Uso:
 *   node scripts/generate-og.mjs          # gera
 *   node scripts/generate-og.mjs --check  # falha se faltar alguma (CI)
 */
import { mkdir, readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ImageResponse } from "next/og.js";
import { OG_SIZE, ogFrame } from "./og-frame.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "og");
const CHECK_ONLY = process.argv.includes("--check");

const readJson = async (...segments) =>
  JSON.parse(await readFile(path.join(ROOT, ...segments), "utf8"));

const profile = await readJson("public", "profile.json");
const { projects } = await readJson("public", "projects", "projects.json");

// Mesma convenção de src/data/posts.ts: slug = nome do arquivo sem o prefixo
// de data. A validação completa do frontmatter fica no build da Next.
const BLOG_DIR = path.join(ROOT, "content", "blog");
const posts = [];
for (const file of (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(await readFile(path.join(BLOG_DIR, file), "utf8"));
  if (data.draft === true) continue;
  const date =
    data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  posts.push({
    slug: file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
    title: String(data.title),
    date,
    tags: Array.isArray(data.tags) ? data.tags : [],
  });
}

const formatDate = (iso) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

const images = [
  {
    file: "home.png",
    frame: {
      eyebrow: "Claudio Soares",
      title: [...profile.title.lines, profile.title.accent].join(" "),
      // Três competências cabem em uma linha a 30px; a quarta quebra e deixa
      // o separador órfão no início da linha seguinte.
      subtitle: profile.skills.slice(0, 3).join("  ·  "),
      footer: "Portfólio",
    },
  },
  ...projects.map((project) => ({
    file: `${project.slug}.png`,
    frame: {
      eyebrow: `${project.device === "ios" ? "iOS" : "Android"} / ${project.year}`,
      title: project.name,
      subtitle: project.tagline,
      footer: project.architecture.stack.slice(0, 3).join("  ·  "),
    },
  })),
  {
    file: "blog.png",
    frame: {
      eyebrow: "Claudio Soares",
      title: "Blog",
      subtitle: "Notas de engenharia mobile e arquitetura",
      footer: "Log",
    },
  },
  ...posts.map((post) => ({
    file: `blog/${post.slug}.png`,
    frame: {
      eyebrow: `Blog / ${formatDate(post.date)}`,
      title: post.title,
      subtitle: "Claudio Soares",
      footer: post.tags.slice(0, 3).join("  ·  "),
    },
  })),
];

if (CHECK_ONLY) {
  const missing = [];
  for (const { file } of images) {
    const ok = await stat(path.join(OUT_DIR, file)).then(
      () => true,
      () => false,
    );
    if (!ok) missing.push(file);
  }
  if (missing.length > 0) {
    console.error(
      `Imagens de OG ausentes:\n  ${missing.join("\n  ")}\n` +
        "Rode `npm run og` e faça commit do resultado.",
    );
    process.exit(1);
  }
  console.log(`${images.length} imagens de OG em dia.`);
  process.exit(0);
}

// A Orbitron é lida do repo, e não do Google Fonts, para o build não depender
// de rede externa.
const orbitron = await readFile(
  path.join(ROOT, "assets", "fonts", "Orbitron-Bold.ttf"),
);

await mkdir(OUT_DIR, { recursive: true });

for (const { file, frame } of images) {
  const response = new ImageResponse(ogFrame(frame), {
    ...OG_SIZE,
    fonts: [
      { name: "Orbitron", data: orbitron, weight: 700, style: "normal" },
    ],
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(path.join(OUT_DIR, file)), { recursive: true });
  await writeFile(path.join(OUT_DIR, file), buffer);
  console.log(`  public/og/${file.padEnd(40)} ${(buffer.length / 1024).toFixed(1)} KB`);
}

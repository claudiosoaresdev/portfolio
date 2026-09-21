#!/usr/bin/env node
/**
 * generate-og.mjs — gera as imagens de Open Graph como PNG estáticos.
 *
 * Saídas:
 *   public/og/home.png      a home
 *   public/og/<slug>.png    uma por projeto
 *
 * Por que script e não a convenção `opengraph-image.tsx` da Next: no export
 * estático aquela convenção emite arquivos SEM extensão (out/opengraph-image),
 * e o GitHub Pages os serve como application/octet-stream — scrapers de rede
 * social recusam. Arquivo .png em public/ tem o Content-Type certo em qualquer
 * host estático.
 *
 * Conteúdo vem dos mesmos JSON que alimentam o site, então as imagens não saem
 * de sincronia com o texto das páginas.
 *
 * Uso:
 *   node scripts/generate-og.mjs          # gera
 *   node scripts/generate-og.mjs --check  # falha se faltar alguma (CI)
 */
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og.js";
import { OG_SIZE, ogFrame } from "./og-frame.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "og");
const CHECK_ONLY = process.argv.includes("--check");

const readJson = async (...segments) =>
  JSON.parse(await readFile(path.join(ROOT, ...segments), "utf8"));

const profile = await readJson("public", "profile.json");
const { projects } = await readJson("public", "projects", "projects.json");

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
  await writeFile(path.join(OUT_DIR, file), buffer);
  console.log(`  public/og/${file.padEnd(22)} ${(buffer.length / 1024).toFixed(1)} KB`);
}

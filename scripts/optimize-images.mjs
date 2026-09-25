#!/usr/bin/env node
/**
 * optimize-images.mjs — converte os PNG servidos para WebP no tamanho de exibição.
 *
 * Por que existe: em `output: "export"` (GitHub Pages) não há otimizador de
 * imagem da Next, então o que está em public/ é exatamente o que o browser
 * baixa. Os PNG de origem somam ~5,7 MB — a foto do hero sozinha tem 1,7 MB
 * para ser exibida a 320 px.
 *
 * Fluxo (idempotente):
 *   1. O PNG original é arquivado em assets/raw/<caminho> na primeira execução.
 *      Nada é perdido: assets/ fica fora de public/, então não é publicado.
 *   2. O WebP é gerado em public/<caminho>.webp a partir do original arquivado.
 *   3. O PNG em public/ é removido (o original continua em assets/raw/).
 *
 * Rodar de novo sempre parte de assets/raw/, então a qualidade nunca degrada
 * por recompressão sucessiva.
 *
 * Uso:
 *   node scripts/optimize-images.mjs          # otimiza
 *   node scripts/optimize-images.mjs --check  # falha se algo estiver desatualizado (CI)
 */
import { mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const RAW_DIR = path.join(ROOT, "assets", "raw");
const CHECK_ONLY = process.argv.includes("--check");

/**
 * Largura máxima por tipo de asset, derivada do maior tamanho de exibição
 * real (ver `sizes` em cada <Image>), com margem para telas 2x.
 */
const RULES = [
  {
    match: (rel) => rel === "images/profile.png",
    maxWidth: 640, // exibida a 20rem (320px) no hero → 2x
    quality: 80,
  },
  {
    match: (rel) => rel.endsWith("/cover.png"),
    maxWidth: 1080, // hero de projeto é full-bleed (sizes="100vw")
    quality: 74,
  },
  {
    match: (rel) => rel.endsWith("/screen.png"),
    maxWidth: 1080, // textura WebGL do device 3D — aguenta zoom
    quality: 80,
  },
  {
    // Imagens dos posts (public/blog/<slug>/*.png): a coluna de leitura tem
    // no máximo 48rem (768px) → 2x.
    match: (rel) => rel.startsWith("blog/"),
    maxWidth: 1536,
    quality: 78,
  },
];

/** Lista recursiva de arquivos, relativa a `dir`. */
async function walk(dir, base = dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(path.relative(base, full));
  }
  return out;
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

// Fontes candidatas: o que já foi arquivado + o que ainda está em public/.
const rawPngs = (await walk(RAW_DIR)).filter((rel) => rel.endsWith(".png"));
const publicPngs = (await walk(PUBLIC_DIR)).filter((rel) => rel.endsWith(".png"));
const targets = [...new Set([...rawPngs, ...publicPngs])]
  .map((rel) => ({ rel, rule: RULES.find((r) => r.match(rel)) }))
  .filter((t) => t.rule)
  .sort((a, b) => a.rel.localeCompare(b.rel));

if (targets.length === 0) {
  console.log("Nenhum PNG correspondente às regras. Nada a fazer.");
  process.exit(0);
}

let totalBefore = 0;
let totalAfter = 0;
const stale = [];

for (const { rel, rule } of targets) {
  const rawPath = path.join(RAW_DIR, rel);
  const publicPng = path.join(PUBLIC_DIR, rel);
  const webpPath = path.join(PUBLIC_DIR, rel.replace(/\.png$/, ".webp"));

  if (CHECK_ONLY) {
    if (!(await exists(webpPath))) stale.push(rel);
    continue;
  }

  // 1. Arquiva o original uma única vez.
  if (!(await exists(rawPath))) {
    if (!(await exists(publicPng))) continue;
    await mkdir(path.dirname(rawPath), { recursive: true });
    await rename(publicPng, rawPath);
  }

  // 2. Gera o WebP sempre a partir do original arquivado.
  const source = sharp(rawPath);
  const { width = 0, height = 0 } = await source.metadata();
  // `metadata().size` não é preenchido para entrada por caminho — leia do disco.
  const { size } = await stat(rawPath);
  totalBefore += size;

  const info = await source
    .resize({ width: Math.min(rule.maxWidth, width), withoutEnlargement: true })
    .webp({ quality: rule.quality, effort: 6 })
    .toFile(webpPath);
  totalAfter += info.size;

  // 3. O PNG não é mais servido — o original vive em assets/raw/.
  await rm(publicPng, { force: true });

  console.log(
    `  ${rel.padEnd(34)} ${String(`${width}x${height}`).padEnd(10)} ` +
      `${kb(size).padStart(8)} → ${kb(info.size).padStart(8)} ` +
      `(${info.width}x${info.height}, -${Math.round((1 - info.size / size) * 100)}%)`,
  );
}

if (CHECK_ONLY) {
  if (stale.length > 0) {
    console.error(
      `WebP ausente para:\n  ${stale.join("\n  ")}\n` +
        "Rode `npm run images` e faça commit do resultado.",
    );
    process.exit(1);
  }
  console.log(`${targets.length} imagens em dia.`);
  process.exit(0);
}

console.log(
  `\nTotal: ${kb(totalBefore)} → ${kb(totalAfter)} ` +
    `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
);

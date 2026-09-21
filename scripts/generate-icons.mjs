#!/usr/bin/env node
/**
 * generate-icons.mjs — rasteriza assets/icon.svg nos tamanhos de ícone.
 *
 * O SVG é a fonte de verdade (editável, nítido em qualquer densidade); os PNG
 * existem só porque iOS e o manifest do Android não aceitam SVG.
 *
 * Saídas:
 *   src/app/icon.svg        favicon moderno (convenção de arquivo da Next)
 *   src/app/apple-icon.png  180x180, tela de início do iOS
 *   public/icons/*.png      192/512, ícones do web app manifest
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "assets", "icon.svg");

const PNG_TARGETS = [
  { out: "src/app/apple-icon.png", size: 180 },
  { out: "public/icons/icon-192.png", size: 192 },
  { out: "public/icons/icon-512.png", size: 512 },
];

// O favicon fica como SVG: um arquivo, nítido em qualquer zoom.
await copyFile(SOURCE, path.join(ROOT, "src", "app", "icon.svg"));
console.log("  src/app/icon.svg");

for (const { out, size } of PNG_TARGETS) {
  const dest = path.join(ROOT, out);
  await mkdir(path.dirname(dest), { recursive: true });
  const info = await sharp(SOURCE, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`  ${out.padEnd(28)} ${size}x${size}  ${(info.size / 1024).toFixed(1)} KB`);
}

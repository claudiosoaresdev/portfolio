#!/usr/bin/env node
/**
 * capture-demo.mjs — grava o passeio da demo do portfólio em frames PNG.
 *
 * Roteiro: home (scroll até os projetos) → clique no primeiro card → página do
 * projeto (scroll pelo showcase 3D) → volta para a home.
 *
 * Requer o site servido em BASE_URL (padrão http://localhost:3000 — use
 * `npm run build && npm start` para captar a versão de produção).
 *
 * Uso:
 *   node scripts/capture-demo.mjs [--out <dir>] [--width 1280] [--height 800]
 *
 * Os frames saem numerados (frame-0000.png…) no diretório de saída; a montagem
 * do GIF fica a cargo do ffmpeg (ver README).
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve(flag("out", "/tmp/portfolio-demo-frames"));
const WIDTH = Number(flag("width", 1280));
const HEIGHT = Number(flag("height", 800));

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-unsafe-swiftshader", "--force-device-scale-factor=1"],
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});

let frame = 0;
const shot = async () => {
  await page.screenshot({
    path: path.join(OUT, `frame-${String(frame++).padStart(4, "0")}.png`),
    animations: "allow",
  });
};
/** Segura a cena por `n` frames (ritmo ~20fps). */
const hold = async (n) => {
  for (let i = 0; i < n; i++) {
    await page.waitForTimeout(50);
    await shot();
  }
};
/** Rola de `from` até `to` em `steps` frames, capturando cada passo. */
const scrollTo = async (from, to, steps) => {
  for (let i = 1; i <= steps; i++) {
    const y = from + ((to - from) * i) / steps;
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(40);
    await shot();
  }
};
const docHeight = () =>
  page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

// 1. Home — hero, depois desce até os projetos.
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await hold(16);
await scrollTo(0, await docHeight(), 46);
await hold(10);

// 2. Abre o primeiro projeto (shared-element transition).
const firstCard = page.locator('a[href^="/projects/"]').first();
await firstCard.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await hold(6);
await firstCard.click();
await page.waitForURL("**/projects/**");
await hold(24); // morph + reveal do hero

// 3. Página do projeto — scroll pelo showcase 3D.
await page.waitForTimeout(1200);
await scrollTo(0, await docHeight(), 70);
await hold(12);

// 4. Volta para a home.
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(600);
await page.goBack();
await page.waitForURL((url) => !url.pathname.startsWith("/projects/"));
await page.waitForTimeout(800);
await hold(20);

await browser.close();
console.log(`${frame} frames em ${OUT}`);

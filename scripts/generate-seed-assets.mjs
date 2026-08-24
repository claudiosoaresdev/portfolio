#!/usr/bin/env node
/**
 * generate-seed-assets.mjs — placeholder art generator for seed projects (T-005)
 *
 * Produces, per project slug, two assets under public/projects/<slug>/:
 *   - cover.png   1080x1920  (9:16 carousel / hero art)
 *   - screen.png  1080x2340  (phone-screen UI mock)
 * plus the authored SVG sources (cover.svg / screen.svg) kept alongside as the
 * regenerable, human-readable source of truth.
 *
 * Art system: "HUD futurism" — near-black canvas, faint technical grid, a large
 * abstract geometric motif per project, a big vertical project name, corner meta
 * labels, an inset frame, one lime accent + an indigo radial glow. Palette is
 * locked to five tokens (see PALETTE). Each project stays visually distinct via
 * its motif and accent placement.
 *
 * Rasterization: macOS QuickLook (`qlmanage`) renders SVG thumbnails into a
 * SQUARE canvas (side = the -s value), fitting the SVG width and cropping any
 * overflowing height. A portrait SVG would therefore lose its bottom. To hit the
 * exact portrait dimensions we render each design on a SQUARE canvas whose side
 * equals the target HEIGHT, keeping all content inside the central 1080-wide
 * "safe column", then center-crop that square down to the target width with
 * `sips -c`. This yields undistorted, exactly-sized PNGs. If qlmanage/sips are
 * unavailable or produce wrong-sized output, the script falls back to shipping
 * the authored 9:16 SVGs as the final assets.
 *
 * Run:  node scripts/generate-seed-assets.mjs
 */

import {
  writeFileSync, mkdtempSync, existsSync, mkdirSync, rmSync,
  statSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const OUT_ROOT = join(ROOT, 'public', 'projects');

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const PALETTE = {
  bg: '#0A0A0A',        // background — near black
  fg: '#F2F2F0',        // foreground — off white
  muted: '#C9C7BB',     // muted — warm grey
  primary: '#A9FE00',   // primary — lime
  secondary: '#4E47E3', // secondary — indigo
};
const P = PALETTE;

// WebKit (QuickLook's SVG renderer) has no Orbitron; every stack ends in a
// generic family so the fallback stays sans/mono rather than defaulting to serif.
const FONT_DISPLAY = "Orbitron, 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
const FONT_UI = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_MONO = "'SFMono-Regular', Menlo, 'Courier New', monospace";

const COVER = { W: 1080, H: 1920, ratio: '9:16' };
const SCREEN = { W: 1080, H: 2340, ratio: '9:19.5' };

const PROJECTS = [
  { slug: 'nebula-wallet', platform: 'android', domain: 'fintech',      name: ['NEBULA', 'WALLET'], index: '01' },
  { slug: 'aurora-fit',    platform: 'ios',     domain: 'fitness',      name: ['AURORA', 'FIT'],    index: '02' },
  { slug: 'cipher-notes',  platform: 'android', domain: 'encryption',   name: ['CIPHER', 'NOTES'],  index: '03' },
  { slug: 'orbit-tasks',   platform: 'ios',     domain: 'productivity', name: ['ORBIT', 'TASKS'],   index: '04' },
];

// ---------------------------------------------------------------------------
// Small SVG helpers
// ---------------------------------------------------------------------------
const n = (v) => Number(v.toFixed(2));
const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};
function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${n(s.x)} ${n(s.y)} A ${r} ${r} 0 ${large} 1 ${n(e.x)} ${n(e.y)}`;
}
function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = ((60 * i - 90) * Math.PI) / 180;
    pts.push(`${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

function grid(W, H, spacing = 90) {
  let lines = '';
  for (let x = spacing; x < W; x += spacing) lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = spacing; y < H; y += spacing) lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  return `<g stroke="${P.fg}" stroke-opacity="0.06" stroke-width="1.5">${lines}</g>`;
}
function frame(W, H, inset = 24) {
  return `<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" fill="none" stroke="${P.fg}" stroke-opacity="0.35" stroke-width="1.5"/>`;
}
function coverMeta(W, H, pr) {
  const mono = `font-family="${FONT_MONO}"`;
  return [
    `<text x="48" y="74" ${mono} font-size="26" letter-spacing="4" fill="${P.muted}">${pr.slug}</text>`,
    `<text x="${W - 48}" y="74" ${mono} font-size="26" letter-spacing="4" fill="${P.muted}" text-anchor="end">2026</text>`,
    `<text x="48" y="${H - 44}" ${mono} font-size="26" letter-spacing="6" fill="${P.primary}">PROJECT ${pr.index}</text>`,
    `<text x="${W - 48}" y="${H - 44}" ${mono} font-size="26" letter-spacing="4" fill="${P.muted}" text-anchor="end">${pr.platform.toUpperCase()} / ${COVER.ratio}</text>`,
  ].join('');
}
function verticalName(H, words) {
  const baseX = 150;
  const baseY = H - 150;
  const lines = words
    .map(
      (w, i) =>
        `<text x="0" y="${i * 180}" font-family="${FONT_DISPLAY}" font-size="132" font-weight="700" letter-spacing="8" fill="${
          i === words.length - 1 ? P.fg : P.muted
        }">${w}</text>`,
    )
    .join('');
  return `<g transform="translate(${baseX} ${baseY}) rotate(-90)">${lines}</g>`;
}

// ---------------------------------------------------------------------------
// Cover motifs (one per project, lower two-thirds, central safe column)
// ---------------------------------------------------------------------------
function motifWallet(mx, my) {
  let s = '';
  for (const [r, op, col] of [[360, 0.12, P.fg], [300, 0.2, P.secondary], [240, 0.16, P.fg], [180, 0.32, P.secondary]]) {
    s += `<polygon points="${hexPoints(mx, my, r)}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="2"/>`;
  }
  s += `<circle cx="${mx}" cy="${my}" r="330" fill="none" stroke="${P.fg}" stroke-opacity="0.1" stroke-width="1.5"/>`;
  s += `<circle cx="${mx}" cy="${my}" r="120" fill="none" stroke="${P.muted}" stroke-opacity="0.25" stroke-width="1.5"/>`;
  s += `<path d="${arcPath(mx, my, 300, 25, 205)}" fill="none" stroke="${P.primary}" stroke-width="9" stroke-linecap="round"/>`;
  const node = polar(mx, my, 300, 205);
  s += `<circle cx="${n(node.x)}" cy="${n(node.y)}" r="15" fill="${P.primary}"/>`;
  s += `<circle cx="${mx}" cy="${my}" r="11" fill="${P.fg}"/>`;
  return s;
}
function motifFit(mx, my) {
  let s = '';
  for (const [r, op, col, w] of [[360, 0.1, P.fg, 1.5], [300, 0.35, P.secondary, 3], [240, 0.14, P.fg, 1.5], [170, 0.3, P.muted, 2]]) {
    s += `<circle cx="${mx}" cy="${my}" r="${r}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}"/>`;
  }
  s += `<path d="${arcPath(mx, my, 300, -35, 250)}" fill="none" stroke="${P.primary}" stroke-width="11" stroke-linecap="round"/>`;
  const end = polar(mx, my, 300, 250);
  s += `<circle cx="${n(end.x)}" cy="${n(end.y)}" r="15" fill="${P.primary}"/>`;
  let d = `M ${n(mx - 330)} ${my}`;
  for (let i = 0; i <= 66; i++) {
    const x = mx - 330 + i * 10;
    const amp = Math.sin(i / 3.2) * Math.exp(-Math.pow((i - 33) / 20, 2)) * 92;
    d += ` L ${n(x)} ${n(my + amp)}`;
  }
  s += `<path d="${d}" fill="none" stroke="${P.primary}" stroke-opacity="0.9" stroke-width="4"/>`;
  s += `<circle cx="${mx}" cy="${my}" r="9" fill="${P.fg}"/>`;
  return s;
}
function motifNotes(mx, my) {
  let s = '';
  const cell = 66, gap = 18, step = cell + gap;
  const cols = 5, rows = 6;
  const x0 = mx - (cols * step - gap) / 2;
  const y0 = my - (rows * step - gap) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * step + (c % 2 ? 8 : -6);
      const y = y0 + r * step + (r % 2 ? -6 : 4);
      const mode = (r * cols + c) % 5;
      const isLime = (r * cols + c * 3) % 11 === 2;
      let fill = 'none', stroke = P.fg, fop = 0, sop = 0.18;
      if (isLime) { fill = P.primary; fop = 0.92; stroke = 'none'; }
      else if (mode === 0) { fill = P.secondary; fop = 0.5; stroke = 'none'; }
      else if (mode === 1) { stroke = P.muted; sop = 0.35; }
      else if (mode === 2) { fill = P.fg; fop = 0.07; stroke = P.fg; sop = 0.14; }
      else if (mode === 3) { fill = P.secondary; fop = 0.2; stroke = 'none'; }
      s += `<rect x="${n(x)}" y="${n(y)}" width="${cell}" height="${cell}" rx="12" fill="${fill}" fill-opacity="${fop}" stroke="${stroke}" stroke-opacity="${stroke === 'none' ? 0 : sop}" stroke-width="1.5"/>`;
      // tiny lock glyph on a couple of blocks
      if (isLime) {
        s += `<rect x="${n(x + cell / 2 - 11)}" y="${n(y + cell / 2 - 4)}" width="22" height="18" rx="4" fill="${P.bg}"/>`;
        s += `<path d="M ${n(x + cell / 2 - 7)} ${n(y + cell / 2 - 4)} v -6 a 7 7 0 0 1 14 0 v 6" fill="none" stroke="${P.bg}" stroke-width="3"/>`;
      }
    }
  }
  return s;
}
function motifTasks(mx, my) {
  let s = '';
  const orbits = [[380, 150, -20], [320, 225, 25], [255, 300, -55]];
  for (const [rx, ry, rot] of orbits) {
    s += `<ellipse cx="${mx}" cy="${my}" rx="${rx}" ry="${ry}" fill="none" stroke="${P.fg}" stroke-opacity="0.16" stroke-width="1.5" transform="rotate(${rot} ${mx} ${my})"/>`;
  }
  s += `<ellipse cx="${mx}" cy="${my}" rx="345" ry="185" fill="none" stroke="${P.secondary}" stroke-opacity="0.6" stroke-width="3" transform="rotate(8 ${mx} ${my})"/>`;
  const nodes = [
    [380, 150, -20, 35, P.fg, 12],
    [320, 225, 25, 200, P.muted, 12],
    [255, 300, -55, 120, P.primary, 19],
    [345, 185, 8, 300, P.primary, 15],
  ];
  for (const [rx, ry, rot, deg, col, rad] of nodes) {
    const a = (deg * Math.PI) / 180;
    const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
    const rr = (rot * Math.PI) / 180;
    const x = mx + ex * Math.cos(rr) - ey * Math.sin(rr);
    const y = my + ex * Math.sin(rr) + ey * Math.cos(rr);
    s += `<circle cx="${n(x)}" cy="${n(y)}" r="${rad}" fill="${col}"/>`;
  }
  s += `<circle cx="${mx}" cy="${my}" r="28" fill="${P.bg}" stroke="${P.primary}" stroke-width="3"/>`;
  s += `<path d="M ${mx - 12} ${my} l 8 9 l 16 -18" fill="none" stroke="${P.primary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}
const MOTIFS = {
  'nebula-wallet': motifWallet,
  'aurora-fit': motifFit,
  'cipher-notes': motifNotes,
  'orbit-tasks': motifTasks,
};

function coverInner(pr) {
  const { W, H } = COVER;
  const mx = Math.round(W * 0.6);
  const my = Math.round(H * 0.63);
  const glowId = `glow-${pr.slug}`;
  return `
  <defs>
    <radialGradient id="${glowId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${P.secondary}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${P.secondary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${P.bg}"/>
  ${grid(W, H)}
  <circle cx="${mx}" cy="${my}" r="520" fill="url(#${glowId})"/>
  ${MOTIFS[pr.slug](mx, my)}
  ${verticalName(H, pr.name)}
  ${frame(W, H)}
  ${coverMeta(W, H, pr)}
  `;
}

// ---------------------------------------------------------------------------
// Phone-screen UI helpers + mocks
// ---------------------------------------------------------------------------
function card(x, y, w, h, o = {}) {
  const { fill = P.fg, op = 0.05, stroke = 'none', sop = 0, sw = 0, rx = 24 } = o;
  const strokeAttr = stroke !== 'none' ? ` stroke="${stroke}" stroke-opacity="${sop}" stroke-width="${sw}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" fill-opacity="${op}"${strokeAttr}/>`;
}
function txt(x, y, str, o = {}) {
  const { size = 32, fill = P.fg, op = 1, weight = 400, anchor = 'start', font = FONT_UI, ls = 0 } = o;
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${op}" text-anchor="${anchor}" letter-spacing="${ls}">${str}</text>`;
}
function statusBar(W) {
  return `
  ${txt(60, 74, '09:41', { size: 34, weight: 700, font: FONT_MONO })}
  <g fill="${P.fg}">
    <rect x="${W - 210}" y="54" width="8" height="14" rx="2"/>
    <rect x="${W - 196}" y="48" width="8" height="20" rx="2"/>
    <rect x="${W - 182}" y="42" width="8" height="26" rx="2"/>
    <rect x="${W - 168}" y="36" width="8" height="32" rx="2"/>
    <path d="M ${W - 138} 66 a 26 26 0 0 1 44 0" fill="none" stroke="${P.fg}" stroke-width="4"/>
    <circle cx="${W - 116}" cy="64" r="4"/>
    <rect x="${W - 96}" y="40" width="52" height="28" rx="7" fill="none" stroke="${P.fg}" stroke-width="3"/>
    <rect x="${W - 90}" y="46" width="34" height="16" rx="2" fill="${P.primary}"/>
    <rect x="${W - 40}" y="47" width="5" height="14" rx="2"/>
  </g>`;
}
function bottomNav(W, H, active) {
  const y = H - 160;
  const n4 = 4;
  const seg = W / n4;
  let s = `<rect x="0" y="${y}" width="${W}" height="160" fill="${P.fg}" fill-opacity="0.03"/>`;
  s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${P.fg}" stroke-opacity="0.1" stroke-width="1.5"/>`;
  for (let i = 0; i < n4; i++) {
    const cx = seg * i + seg / 2;
    const on = i === active;
    const col = on ? P.primary : P.muted;
    const op = on ? 1 : 0.5;
    if (on) s += `<rect x="${cx - 34}" y="${y + 20}" width="68" height="4" rx="2" fill="${P.primary}"/>`;
    s += `<circle cx="${cx}" cy="${y + 66}" r="11" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="4"/>`;
    s += `<rect x="${cx - 24}" y="${y + 92}" width="48" height="9" rx="4" fill="${col}" fill-opacity="${op * 0.55}"/>`;
  }
  return s;
}
function appHeader(W, title, sub) {
  let s = txt(60, 210, sub, { size: 30, fill: P.muted, ls: 2 });
  s += txt(60, 268, title, { size: 62, weight: 700 });
  s += `<circle cx="${W - 92}" cy="240" r="42" fill="${P.secondary}" fill-opacity="0.25" stroke="${P.secondary}" stroke-width="2"/>`;
  s += `<circle cx="${W - 92}" cy="224" r="15" fill="${P.muted}"/>`;
  s += `<path d="M ${W - 118} 268 a 26 26 0 0 1 52 0" fill="${P.muted}"/>`;
  return s;
}

function screenWallet() {
  const { W, H } = SCREEN;
  const M = 60, cw = W - 2 * M;
  let s = `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  s += `<defs><linearGradient id="wallet-card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${P.secondary}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${P.secondary}" stop-opacity="0.12"/>
    </linearGradient></defs>`;
  s += statusBar(W);
  s += appHeader(W, 'Wallet', 'GOOD MORNING');
  // balance card
  const by = 330, bh = 430;
  s += `<rect x="${M}" y="${by}" width="${cw}" height="${bh}" rx="32" fill="url(#wallet-card)" stroke="${P.secondary}" stroke-opacity="0.4" stroke-width="2"/>`;
  s += txt(M + 44, by + 74, 'Total balance', { size: 30, fill: P.muted, ls: 1 });
  s += txt(M + 44, by + 172, '$12,480', { size: 96, weight: 700 });
  s += txt(M + 44 + 372, by + 172, '.55', { size: 56, weight: 700, fill: P.muted });
  s += `<rect x="${M + 44}" y="${by + 210}" width="176" height="52" rx="26" fill="${P.primary}" fill-opacity="0.18"/>`;
  s += `<path d="M ${M + 70} ${by + 244} l 14 -18 l 14 18" fill="none" stroke="${P.primary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += txt(M + 108, by + 246, '+2.4%', { size: 30, weight: 700, fill: P.primary });
  // actions
  const ay = by + 300, bw = (cw - 88 - 24) / 2;
  s += `<rect x="${M + 44}" y="${ay}" width="${bw}" height="86" rx="24" fill="${P.primary}"/>`;
  s += txt(M + 44 + bw / 2, ay + 55, 'Send', { size: 34, weight: 700, fill: P.bg, anchor: 'middle' });
  s += `<rect x="${M + 44 + bw + 24}" y="${ay}" width="${bw}" height="86" rx="24" fill="none" stroke="${P.fg}" stroke-opacity="0.4" stroke-width="2"/>`;
  s += txt(M + 44 + bw + 24 + bw / 2, ay + 55, 'Receive', { size: 34, weight: 700, anchor: 'middle' });
  // transactions
  s += txt(M, 880, 'Transactions', { size: 38, weight: 700 });
  s += txt(W - M, 880, 'See all', { size: 30, fill: P.primary, anchor: 'end' });
  const rows = [
    ['Spotify', 'Subscription', '-$9.99', P.muted],
    ['Payroll', 'Acme Corp', '+$3,200', P.primary],
    ['Uber', 'Transport', '-$24.50', P.muted],
    ['Transfer', 'To Savings', '-$500.00', P.muted],
    ['Refund', 'Amazon', '+$42.10', P.primary],
  ];
  let ry = 940;
  for (const [name, subm, amt, col] of rows) {
    s += card(M, ry, cw, 132, { op: 0.04 });
    s += `<rect x="${M + 28}" y="${ry + 30}" width="72" height="72" rx="20" fill="${P.secondary}" fill-opacity="0.28"/>`;
    s += `<circle cx="${M + 64}" cy="${ry + 66}" r="16" fill="none" stroke="${P.fg}" stroke-opacity="0.6" stroke-width="3"/>`;
    s += txt(M + 128, ry + 60, name, { size: 34, weight: 700 });
    s += txt(M + 128, ry + 100, subm, { size: 28, fill: P.muted });
    s += txt(W - M - 28, ry + 82, amt, { size: 36, weight: 700, fill: col, anchor: 'end', font: FONT_MONO });
    ry += 156;
  }
  s += bottomNav(W, H, 0);
  return s;
}

function screenFit() {
  const { W, H } = SCREEN;
  const M = 60, cw = W - 2 * M;
  let s = `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  s += statusBar(W);
  s += appHeader(W, 'Today', 'MON 02 JUL');
  // activity rings
  const rx = W / 2, ry = 620;
  const ringDefs = [
    [200, P.primary, -40, 255],
    [158, P.secondary, -30, 200],
    [116, P.muted, 10, 320],
  ];
  s += `<circle cx="${rx}" cy="${ry}" r="240" fill="${P.secondary}" fill-opacity="0.06"/>`;
  for (const [r, col] of ringDefs) {
    s += `<circle cx="${rx}" cy="${ry}" r="${r}" fill="none" stroke="${col}" stroke-opacity="0.16" stroke-width="26"/>`;
  }
  for (const [r, col, a0, a1] of ringDefs) {
    s += `<path d="${arcPath(rx, ry, r, a0, a1)}" fill="none" stroke="${col}" stroke-width="26" stroke-linecap="round"/>`;
  }
  s += txt(rx, ry - 6, '78%', { size: 66, weight: 700, anchor: 'middle' });
  s += txt(rx, ry + 44, 'GOAL', { size: 26, fill: P.muted, anchor: 'middle', ls: 4 });
  // stat cards
  const stats = [['Steps', '8,420'], ['Kcal', '612'], ['Km', '6.1']];
  const sw2 = (cw - 48) / 3;
  let sx = M;
  for (const [label, val] of stats) {
    s += card(sx, 900, sw2, 150, { op: 0.05 });
    s += txt(sx + 30, 962, val, { size: 44, weight: 700, fill: P.primary, font: FONT_MONO });
    s += txt(sx + 30, 1012, label, { size: 28, fill: P.muted });
    sx += sw2 + 24;
  }
  // weekly bar chart
  s += txt(M, 1160, 'This week', { size: 38, weight: 700 });
  s += card(M, 1200, cw, 460, { op: 0.04 });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [0.5, 0.72, 0.44, 0.9, 0.62, 0.35, 0.8];
  const chartBase = 1560, chartTop = 1260, maxH = chartBase - chartTop;
  const barW = 70;
  const gap2 = (cw - 88 - days.length * barW) / (days.length - 1);
  let bx = M + 44;
  vals.forEach((v, i) => {
    const h = Math.round(maxH * v);
    const on = i === 3;
    s += `<rect x="${bx}" y="${chartBase - h}" width="${barW}" height="${h}" rx="16" fill="${on ? P.primary : P.secondary}" fill-opacity="${on ? 1 : 0.35}"/>`;
    s += txt(bx + barW / 2, chartBase + 54, days[i], { size: 30, fill: P.muted, anchor: 'middle' });
    bx += barW + gap2;
  });
  s += bottomNav(W, H, 1);
  return s;
}

function screenNotes() {
  const { W, H } = SCREEN;
  const M = 60, cw = W - 2 * M;
  let s = `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  s += statusBar(W);
  s += appHeader(W, 'Vault', 'ENCRYPTED');
  // search bar
  s += card(M, 320, cw, 96, { op: 0.05, stroke: P.fg, sop: 0.12, sw: 1.5, rx: 28 });
  s += `<circle cx="${M + 52}" cy="368" r="18" fill="none" stroke="${P.muted}" stroke-width="3"/>`;
  s += `<line x1="${M + 66}" y1="382" x2="${M + 82}" y2="398" stroke="${P.muted}" stroke-width="3" stroke-linecap="round"/>`;
  s += txt(M + 104, 380, 'Search notes', { size: 32, fill: P.muted });
  // note cards
  const notes = [
    ['Recovery seed', 'AES-256 · 24 words', true, P.primary],
    ['API credentials', '••••••••••••  staging', true, P.secondary],
    ['Passport scan', 'image · locked', true, P.primary],
    ['Meeting notes', 'Q3 roadmap draft', false, P.muted],
  ];
  let ny = 470;
  for (const [title, sub, locked, accent] of notes) {
    const ch = 220;
    s += card(M, ny, cw, ch, { op: 0.05, rx: 28 });
    s += `<rect x="${M}" y="${ny}" width="8" height="${ch}" rx="4" fill="${accent}" fill-opacity="0.9"/>`;
    s += txt(M + 44, ny + 66, title, { size: 38, weight: 700 });
    s += txt(M + 44, ny + 116, sub, { size: 28, fill: P.muted, font: FONT_MONO });
    // preview lines
    s += `<rect x="${M + 44}" y="${ny + 146}" width="${cw - 200}" height="12" rx="6" fill="${P.fg}" fill-opacity="0.08"/>`;
    s += `<rect x="${M + 44}" y="${ny + 172}" width="${cw - 320}" height="12" rx="6" fill="${P.fg}" fill-opacity="0.06"/>`;
    // lock badge
    const lx = W - M - 74, ly = ny + 44;
    if (locked) {
      s += `<rect x="${lx}" y="${ly}" width="52" height="52" rx="14" fill="${P.primary}" fill-opacity="0.16"/>`;
      s += `<rect x="${lx + 14}" y="${ly + 24}" width="24" height="18" rx="4" fill="${P.primary}"/>`;
      s += `<path d="M ${lx + 18} ${ly + 24} v -6 a 8 8 0 0 1 16 0 v 6" fill="none" stroke="${P.primary}" stroke-width="3"/>`;
    } else {
      s += `<rect x="${lx}" y="${ly}" width="52" height="52" rx="14" fill="${P.fg}" fill-opacity="0.08"/>`;
      s += `<rect x="${lx + 14}" y="${ly + 24}" width="24" height="18" rx="4" fill="none" stroke="${P.muted}" stroke-width="3"/>`;
      s += `<path d="M ${lx + 18} ${ly + 24} v -6 a 8 8 0 0 1 16 0" fill="none" stroke="${P.muted}" stroke-width="3"/>`;
    }
    ny += ch + 32;
  }
  // FAB
  s += `<circle cx="${W - 130}" cy="${H - 250}" r="72" fill="${P.primary}"/>`;
  s += `<path d="M ${W - 130} ${H - 288} v 76 M ${W - 168} ${H - 250} h 76" stroke="${P.bg}" stroke-width="8" stroke-linecap="round"/>`;
  s += bottomNav(W, H, 2);
  return s;
}

function screenTasks() {
  const { W, H } = SCREEN;
  const M = 60, cw = W - 2 * M;
  let s = `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  s += statusBar(W);
  s += appHeader(W, 'Tasks', 'IN ORBIT');
  // progress header
  s += card(M, 320, cw, 130, { op: 0.05, rx: 28 });
  s += txt(M + 40, 384, '5 of 8 done', { size: 38, weight: 700 });
  s += txt(M + 40, 426, 'Keep the momentum', { size: 28, fill: P.muted });
  const pbW = 300, pbX = W - M - 40 - pbW;
  s += `<rect x="${pbX}" y="${375}" width="${pbW}" height="20" rx="10" fill="${P.fg}" fill-opacity="0.1"/>`;
  s += `<rect x="${pbX}" y="${375}" width="${Math.round(pbW * 0.625)}" height="20" rx="10" fill="${P.primary}"/>`;
  // columns of tasks with checkboxes
  const sections = [
    ['TO DO', [['Wire up auth flow', 'App', false], ['Design empty states', 'UX', false]]],
    ['DOING', [['Sync engine v2', 'Core', false], ['Push notifications', 'App', false]]],
    ['DONE', [['Onboarding screens', 'UX', true], ['Dark theme tokens', 'UI', true], ['CI pipeline', 'Ops', true]]],
  ];
  let ty = 520;
  for (const [sec, items] of sections) {
    s += txt(M, ty, sec, { size: 28, fill: P.muted, ls: 4, font: FONT_MONO });
    s += `<circle cx="${M + 170}" cy="${ty - 10}" r="18" fill="${P.secondary}" fill-opacity="0.25"/>`;
    s += txt(M + 170, ty + 1, String(items.length), { size: 26, weight: 700, fill: P.muted, anchor: 'middle' });
    ty += 34;
    for (const [title, tag, done] of items) {
      s += card(M, ty, cw, 128, { op: 0.04, rx: 24 });
      const bx = M + 34, by = ty + 38, bs = 52;
      if (done) {
        s += `<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" rx="16" fill="${P.primary}"/>`;
        s += `<path d="M ${bx + 14} ${by + 27} l 12 13 l 22 -24" fill="none" stroke="${P.bg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else {
        s += `<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" rx="16" fill="none" stroke="${P.fg}" stroke-opacity="0.35" stroke-width="3"/>`;
      }
      s += txt(bx + 82, ty + 60, title, { size: 34, weight: done ? 400 : 700, fill: done ? P.muted : P.fg });
      if (done) s += `<line x1="${bx + 82}" y1="${ty + 52}" x2="${bx + 82 + title.length * 17}" y2="${ty + 52}" stroke="${P.muted}" stroke-opacity="0.7" stroke-width="2"/>`;
      s += `<rect x="${bx + 82}" y="${ty + 78}" width="${tag.length * 20 + 40}" height="42" rx="21" fill="${P.secondary}" fill-opacity="0.22"/>`;
      s += txt(bx + 82 + 20, ty + 106, tag, { size: 26, fill: P.muted, ls: 1 });
      ty += 148;
    }
    ty += 24;
  }
  s += bottomNav(W, H, 3);
  return s;
}
const SCREENS = {
  'nebula-wallet': screenWallet,
  'aurora-fit': screenFit,
  'cipher-notes': screenNotes,
  'orbit-tasks': screenTasks,
};

// ---------------------------------------------------------------------------
// SVG document wrappers
// ---------------------------------------------------------------------------
function svgDoc(W, H, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>\n`;
}
// Square render wrapper: side = target height, content translated into the
// central safe column so a center-crop reproduces the target exactly.
function svgSquareWrapper(W, H, inner) {
  const side = H;
  const offsetX = (side - W) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}"><rect width="${side}" height="${side}" fill="${P.bg}"/><g transform="translate(${offsetX} 0)">${inner}</g></svg>\n`;
}

// ---------------------------------------------------------------------------
// Rasterization
// ---------------------------------------------------------------------------
function have(bin) {
  try { execFileSync('which', [bin], { stdio: 'ignore' }); return true; } catch { return false; }
}
function pngDims(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const w = /pixelWidth:\s*(\d+)/.exec(out);
  const h = /pixelHeight:\s*(\d+)/.exec(out);
  return { w: w ? +w[1] : 0, h: h ? +h[1] : 0 };
}
/**
 * Render an inner-SVG design to an exactly-sized PNG via QuickLook + sips crop.
 * Returns { ok, w, h } or { ok:false, reason }.
 */
function renderPng(inner, W, H, outPng, tmp) {
  const side = H;
  const wrapSvg = join(tmp, 'wrap.svg');
  writeFileSync(wrapSvg, svgSquareWrapper(W, H, inner));
  const qlDir = join(tmp, 'ql');
  rmSync(qlDir, { recursive: true, force: true });
  mkdirSync(qlDir, { recursive: true });
  try {
    execFileSync('qlmanage', ['-t', '-s', String(side), '-o', qlDir, wrapSvg], { stdio: 'ignore' });
  } catch (e) {
    return { ok: false, reason: `qlmanage failed: ${e.message}` };
  }
  const squarePng = join(qlDir, 'wrap.svg.png');
  if (!existsSync(squarePng)) return { ok: false, reason: 'qlmanage produced no thumbnail' };
  try {
    // -c crops to <height> <width>, centered — trims the safe-column margins.
    execFileSync('sips', ['-c', String(H), String(W), squarePng, '-o', outPng], { stdio: 'ignore' });
  } catch (e) {
    return { ok: false, reason: `sips crop failed: ${e.message}` };
  }
  if (!existsSync(outPng) || statSync(outPng).size === 0) return { ok: false, reason: 'output png missing/empty' };
  const d = pngDims(outPng);
  if (d.w !== W || d.h !== H) return { ok: false, reason: `wrong dims ${d.w}x${d.h} (want ${W}x${H})` };
  return { ok: true, ...d };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const canRaster = have('qlmanage') && have('sips');
  const tmp = mkdtempSync(join(tmpdir(), 'seed-assets-'));
  const manifest = [];
  const report = [];

  for (const pr of PROJECTS) {
    const dir = join(OUT_ROOT, pr.slug);
    mkdirSync(dir, { recursive: true });

    const assets = [
      { name: 'cover', inner: coverInner(pr), W: COVER.W, H: COVER.H },
      { name: 'screen', inner: SCREENS[pr.slug](), W: SCREEN.W, H: SCREEN.H },
    ];

    for (const a of assets) {
      // Always write the authored, correctly-proportioned SVG source.
      const svgPath = join(dir, `${a.name}.svg`);
      writeFileSync(svgPath, svgDoc(a.W, a.H, a.inner));

      let finalExt = 'svg';
      let dims = `${a.W}x${a.H} (svg source)`;
      if (canRaster) {
        const pngPath = join(dir, `${a.name}.png`);
        const r = renderPng(a.inner, a.W, a.H, pngPath, tmp);
        if (r.ok) {
          finalExt = 'png';
          dims = `${r.w}x${r.h}`;
        } else {
          report.push(`  ! ${pr.slug}/${a.name}: raster fallback to SVG — ${r.reason}`);
          if (existsSync(pngPath)) rmSync(pngPath);
        }
      }
      const rel = `/projects/${pr.slug}/${a.name}.${finalExt}`;
      manifest.push(rel);
      report.push(`  ✓ ${rel.padEnd(40)} ${dims}`);
    }
  }

  writeFileSync(join(OUT_ROOT, 'MANIFEST.txt'), manifest.join('\n') + '\n');
  rmSync(tmp, { recursive: true, force: true });

  console.log('Seed assets generated:');
  console.log(report.join('\n'));
  console.log(`\nMANIFEST.txt written with ${manifest.length} entries.`);
}

main();

# Web/Fullstack project showcase — design

Date: 2026-11-13 · Branch: `feat/web-project-showcase` (from `develop`)

## Intent

The portfolio only shows mobile apps today (`android` / `ios`). Claudio wants to
start publishing **web projects** too, and projects that combine web + mobile
(**fullstack**). Their detail page must show a **3D MacBook** with the desktop
site on screen and a **3D phone beside it** with the mobile view. The home cards
stay portrait but gain a grayscale/dim resting state that comes to color on hover.

Work goes through the normal flow: feature branch → PR to `develop` → Claudio
tests → `develop` → `main` (merging to `main` publishes the site).

## Goals

1. New project types: `android`, `ios`, `web`, `fullstack`.
2. `web` / `fullstack` detail page: 3D MacBook + 3D phone, rotating together on
   scroll, in the existing device showcase section.
3. Home carousel cards: grayscale + dimmed at rest, full color on hover/focus.
4. Every place that labels the platform handles the 4 types.

## Non-goals

- No change to card shape (stays 9:16 portrait; web projects supply a portrait cover).
- No GLTF / photoreal models.
- No new page sections; layout changes limited to the device showcase (incl. its mobile layout for web/fullstack).
- No change to existing `android` / `ios` projects' data or rendering.

## Anti-goals (failure even if it "works")

- Detail page for web projects noticeably heavier or slower to become
  interactive than today's (no large assets, three.js chunk still deferred).
- MacBook and phone looking like they belong to different visual worlds.
- Existing 4 projects visually regress (phone pose, fallback, morph).

## Constraints

- Next 16.2.10 App Router, read bundled docs in `node_modules/next/dist/docs/` before code (AGENTS.md).
- Data source: `public/projects/projects.json`, loaded by `src/data/projects.ts`. SSG.
- three pinned at 0.182.0, fiber 9.6.1, drei 10.7.7 — no upgrades.
- Asset paths stored raw (no basePath); `assetPath()` applied at use site (incl. `useTexture`).
- Quality gate: `npm run lint && npx tsc --noEmit && npm run build` (no test runner).
- Lessons in `.sdd/memory/STATE.md` apply (scroll ranges span [0,1]; strict react-hooks lint rules).

## Approaches (for the MacBook)

| | Approach | Trade-off |
|---|---|---|
| **A — chosen** | Procedural MacBook in code (RoundedBox/planes: base, hinge, tilted lid, screen texture) in the same Canvas as the phone | Zero extra assets, matches stylized phone, reuses canvas/fallback/scroll pipeline. Not photoreal (keyboard only suggested). |
| B | GLTF MacBook model | Photoreal, but +1–5 MB, license check, clashes with procedural phone unless phone also becomes GLTF. |
| C | 2.5D CSS mockup | Lightest, but not real 3D — can't rotate with scroll; contradicts the request. |

Claudio picked **A**.

## Decisions (made with Claudio)

### Data model (`src/data/types.ts`)

```ts
export type ProjectType = "android" | "ios" | "web" | "fullstack";
export type PhoneKind = "android" | "ios";

interface Project {
  // ...existing fields
  device: ProjectType;          // existing field name kept; widened union
  phone?: PhoneKind;            // fullstack only; default "ios"
  screenshot: string;           // ALWAYS the phone screen (9:16, 1080x2340)
  desktopScreenshot?: string;   // web/fullstack: desktop screen, 16:10 (e.g. 2560x1600)
}
```

- `web`: phone screen = the site's mobile/responsive view. Phone style: `ios` (my call — see below).
- `fullstack`: phone screen = the mobile app. Phone style from `phone`, default `ios`.
- `desktopScreenshot` required when `device` is `web` or `fullstack`; the loader
  throws a clear build error if missing (my call — fail fast at build).
- Existing 4 projects need no JSON changes.

### Detail page scene (web / fullstack)

- Same `DeviceShowcase` section, same scroll phases, same sticky layout.
- MacBook open, centered-left; phone in front-right, slightly overlapping the
  MacBook's right edge. Both inside **one group** that rotates with the existing
  scroll pose (rotation Y/X/Z + Y drift), so they move together.
- Same lighting, materials palette (BODY/BEZEL colors, lime accent strip on the
  MacBook too) as the phone so they share a visual world.
- **Below `lg` (mobile/tablet), web/fullstack only — own layout (Claudio chose):**
  canvas occupies the **top ~55%** of the sticky viewport (pair large and
  legible), text phases sit **below** it with no overlap and no scrim over the
  devices. The static fallback and the reduced-motion layout follow the same
  box so the static → 3D fade doesn't jump. `android`/`ios` keep today's
  full-bleed mobile layout untouched. At `lg+` all types share today's
  two-column layout.

```
      ┌──────────────────┐
      │  desktop screen  │ ┌───┐
      │                  │ │mob│
      └──────────────────┘ │   │
     ╱════════════════════╲└───┘
```

### Home card

- All cards (every type): `grayscale` + reduced brightness/opacity at rest;
  full color on `:hover` and `:focus-visible`, transitioning ~400ms together with
  the existing zoom. Reduced motion → instant.
- Only on devices with hover (`@media (hover: hover)`); touch devices show cards
  always in color.
- Card meta line label: `year / Android|iOS|Web|Fullstack`.

### Platform labels everywhere

A single helper (e.g. `platformLabel(project)` in `src/data/` or `src/lib/`)
returns `Android | iOS | Web | Fullstack` and replaces the hard-coded
`=== "ios" ? "iOS" : "Android"` in:
`project-hero.tsx`, `device-showcase.tsx` (PlatformPhase), `project-carousel.tsx`,
`scripts/generate-og.mjs` (plain JS — duplicate the tiny mapping there),
`src/lib/structured-data.ts` (`operatingSystem`: `Web` for web,
`Web, iOS` / `Web, Android` for fullstack; `applicationCategory` stays as is).

## Left to the builder (my calls, open to change)

- **`web` phone style is `ios`** (dynamic island), as the neutral default.
- **Static fallback** (`StaticDeviceFallback`, used for SSR/loading, no-WebGL,
  reduced motion): for web/fullstack render a CSS MacBook (16:10 screen in a
  bezel + thin base) with the CSS phone overlapping bottom-right. Must occupy the
  same box as the 3D scene so the fade from static → 3D doesn't jump.
- **`onReady`** fires only after **both** textures (desktop + phone) loaded.
- **MacBook geometry** proportions (rough, scene units): lid ~5.6 × 3.6, screen
  inset ~5.3 × 3.3 (16:10), base slab ~5.9 × 0.12 × 3.8, lid tilted back ~100°
  from base. Phone kept at current size so it reads as a phone next to it.
  Tune visually.
- Scroll pose amplitude may be reduced for the pair (wider object) if the
  current extremes push the MacBook out of frame.
- **Desktop texture budget:** max 1600px wide (16:10 → 1600×1000), WebP
  quality 80, aim ≤ ~150 KB. Extend `scripts/optimize-images.mjs` with a rule
  for the desktop screenshot (it currently caps screen textures at 1080 wide).
  Spec example "2560×1600" above is the source size, not the shipped size.
- Alt text: `"<name> desktop and mobile screenshots"` for web/fullstack.
- A **demo `web` project and demo `fullstack` project** in `projects.json` with
  generated placeholder assets (like the existing seed projects) so Claudio can
  test locally (`npm run dev`) — only `main` deploys. Demos land in **their own
  commit** so they can be reverted before develop → `main` if Claudio doesn't
  want them live. No `draft` flag for projects.

## Verification

- Quality gate passes.
- `npm run dev`: check one `android`, one `ios`, the demo `web` and demo
  `fullstack` detail pages at 1440px and 375px; scroll through showcase; check
  reduced-motion and no-WebGL fallbacks; check home card hover/focus and touch
  (375px emulation) behavior; view-transition morph still works.
- Console has no new warnings.

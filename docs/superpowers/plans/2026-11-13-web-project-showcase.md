# Web/Fullstack Project Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `web` and `fullstack` project types whose detail page shows a procedural 3D MacBook + phone, and give all home cards a grayscale-until-hover treatment.

**Architecture:** Widen `Project.device` to 4 types plus `phone`/`desktopScreenshot`; derive a `DeviceSpec` once (`deviceSpec(project)`) and pass it to the static fallback, canvas and scene instead of `device`+`screenshot`. The scene renders either the existing phone or a `LaptopModel` + phone pair inside the same scroll-driven rig. Platform text comes from one `platformLabel()` helper.

**Tech Stack:** Next 16.2.10 App Router (SSG, `output: "export"`), React 19.2.4, Tailwind v4, three 0.182.0, @react-three/fiber 9.6.1, @react-three/drei 10.7.7, motion 12, sharp (scripts).

**Spec:** `docs/superpowers/specs/2026-11-13-web-project-showcase-design.md`

## Global Constraints

- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (AGENTS.md).
- No dependency changes; three stays 0.182.0, fiber 9.6.1, drei 10.7.7.
- Asset paths stored raw in JSON; apply `assetPath()` at every browser use site (incl. `useTexture`).
- Quality gate (no test runner): `npm run lint && npx tsc --noEmit && npm run build` must pass at the end of every task.
- Every `useTransform(scrollYProgress, …)` input range spans `[0 … 1]` with explicit endpoints.
- New react-hooks lint rules: no setState in effects; configure textures in `useTexture` onLoad.
- Existing `android`/`ios` projects: no JSON changes, no visual change (except the card grayscale effect).
- Labels: `Android`, `iOS`, `Web`, `Fullstack`.
- Desktop texture: `public/projects/<slug>/desktop.webp`, 1600×1000 max, WebP q80, aim ≤ ~150 KB.
- Commits: Conventional Commits in pt-BR, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work stays on `feat/web-project-showcase`.

## Review Focus

1. **Fullstack/web project with missing `desktopScreenshot`** → build must fail with a message naming the slug (Task 1, step 4).
2. **375px viewport on a web project** → MacBook + phone both fully visible in the top ~55%, text below, nothing overlapping (Task 6, step 4).
3. **Static → 3D fade** on web projects → no size/position jump of the pair when the canvas reveals (Task 5, step 5).
4. **Desktop texture fails to load / no WebGL** → static CSS pair stays (existing error-boundary path), page never blank (Task 5, step 6).
5. **Morph home → web detail and back** with grayscale card → cover morphs; no stuck gray on the detail hero (Task 3, step 3).

---

### Task 1: Data model, helpers, loader validation

**Files:**
- Modify: `src/data/types.ts`
- Create: `src/data/platform.ts`
- Modify: `src/data/projects.ts`

**Interfaces:**
- Produces:
  - `type ProjectType = "android" | "ios" | "web" | "fullstack"` (replaces `DeviceKind`; keep `export type DeviceKind = ProjectType` alias only if something still needs it — prefer removing).
  - `type PhoneKind = "android" | "ios"`
  - `Project.device: ProjectType`, `Project.phone?: PhoneKind`, `Project.desktopScreenshot?: string`
  - `interface DeviceSpec { kind: ProjectType; phone: PhoneKind; screenshot: string; desktopScreenshot?: string }` (in `types.ts`)
  - `platform.ts`: `platformLabel(type: ProjectType): "Android" | "iOS" | "Web" | "Fullstack"`; `hasDesktop(type: ProjectType): boolean` (true for web/fullstack); `deviceSpec(project: Project): DeviceSpec` — `phone` = `device` when android/ios, else `project.phone ?? "ios"` (web always `"ios"`).

- [ ] **Step 1:** Update `types.ts` as above; update the asset-path doc comment to mention `desktopScreenshot` (`"/projects/<slug>/desktop.webp"`, 16:10).
- [ ] **Step 2:** Create `platform.ts` with the three functions.
- [ ] **Step 3:** In `getProjects()`, after parsing, throw `Error(\`Invalid ${JSON_PATH}: project "${slug}" (${device}) requires "desktopScreenshot"\`)` for any `hasDesktop` project without it; also throw for an unknown `device` value.
- [ ] **Step 4: Verify validation.** Temporarily add to `projects.json` a copy of one project with `"slug":"tmp-web","device":"web"` and no `desktopScreenshot`; run `npm run build`. Expected: build fails with the message naming `tmp-web`. Remove the entry.
- [ ] **Step 5:** Run `npx tsc --noEmit`; the only errors must be in call sites Task 2 fixes (`project-hero`, `device-showcase`, `structured-data`, and the `device` prop passed to fallback/canvas). No commit here — Tasks 1 and 2 share one commit so the tree stays green.

### Task 2: Platform labels everywhere

**Files:**
- Modify: `src/components/project/project-hero.tsx:106`, `src/components/project/device-showcase.tsx:48` (PlatformPhase), `src/components/home/project-carousel.tsx:73`, `src/lib/structured-data.ts:57-70`, `scripts/generate-og.mjs:80`

**Interfaces:**
- Consumes: `platformLabel`, `ProjectType` from Task 1.

- [ ] **Step 1:** Replace each `device === "ios" ? "iOS" : "Android"` and the carousel's raw `{project.device}` with `platformLabel(project.device)`.
- [ ] **Step 2:** `structured-data.ts`: `operatingSystem` = `iOS` | `Android` | `Web` | `Web, iOS`/`Web, Android` (fullstack uses `deviceSpec(project).phone`). For web/fullstack use `project.links.website ?? playStore ?? appStore` as `downloadUrl` order; add `desktopScreenshot` to `screenshot` as an array when present.
- [ ] **Step 3:** `generate-og.mjs` (plain JS): inline a 4-entry map `{android:"Android", ios:"iOS", web:"Web", fullstack:"Fullstack"}`.
- [ ] **Step 4:** Static fallback / canvas / scene still take `device`: in `device-showcase.tsx` temporarily pass `deviceSpec(project).phone` as `device` so it compiles (Task 4/5 replaces this).
- [ ] **Step 5:** Quality gate passes; `npm run og:check` passes (or regenerate with `npm run og` if it reports stale — the label text for existing projects is unchanged so it should not).
- [ ] **Step 6: Commit** `feat(projects): tipos web e fullstack no modelo e rótulos de plataforma`.

### Task 3: Home card grayscale → color

**Files:**
- Modify: `src/components/home/project-carousel.tsx` (the cover `<Image>` and/or its wrapper inside `CarouselCard`)

- [ ] **Step 1:** Apply to the cover wrapper, gated by a hover-capable media query: at rest `grayscale` + `brightness-[0.6]`; on `group-hover` / `group-focus-visible` → `grayscale-0 brightness-100`; `motion-safe:transition-[filter,transform] motion-safe:duration-[400ms]`. Use a Tailwind v4 custom variant for `@media (hover: hover)` (define `@custom-variant hover-capable (@media (hover: hover));` in `src/app/globals.css` if no equivalent exists) so touch devices render full color.
- [ ] **Step 2:** Put the filter on an element **inside** `<ViewTransition>` but on the image only (not the scrim), so the morph snapshot is whatever the card shows at click time (hovered = color).
- [ ] **Step 3: Verify** (`npm run dev`, browser pane): 1440px — cards gray at rest, color on hover, color on Tab focus; 375px (mobile preset, reload) — always color; click a card → morph to hero shows the colored cover, back nav → card returns to gray. Reduced motion emulation → instant change.
- [ ] **Step 4:** Quality gate. **Commit** `feat(home): cards em escala de cinza que ganham cor no hover`.

### Task 4: Demo assets + demo projects (own commit)

**Files:**
- Modify: `scripts/optimize-images.mjs` (RULES)
- Modify: `scripts/generate-seed-assets.mjs`
- Modify: `public/projects/projects.json`
- Create: `public/projects/<demo-web>/{cover,screen,desktop}.{svg,webp}`, same for `<demo-fullstack>`

- [ ] **Step 1:** Add RULE `match: rel => rel.endsWith("/desktop.png"), maxWidth: 1600, quality: 80` with a comment (desktop WebGL texture on the MacBook).
- [ ] **Step 2:** Extend the seed generator with a `desktop` design (1600×1000, same HUD art system, browser-chrome bar + landing-page layout) and support for generating only selected slugs (e.g. `node scripts/generate-seed-assets.mjs <slug>...`) so existing assets aren't rewritten. Landscape output on qlmanage: render square side = width (1600), then `sips -c 1000 1600`.
- [ ] **Step 3:** Add two seed projects to `projects.json` (all existing fields filled with plausible copy, same tone as the existing seeds): `"slug": "lumen-commerce", "device": "web"` and `"slug": "pulse-health", "device": "fullstack", "phone": "android"`, each with `cover`, `screenshot`, `desktopScreenshot`, `links.website`.
- [ ] **Step 4:** Generate assets, then `npm run images`; check `ls -la public/projects/lumen-commerce` shows `desktop.webp` ≤ ~150 KB and 1600 wide (`sips -g pixelWidth`). `npm run images:check` passes. `npm run og` to create their OG images.
- [ ] **Step 5:** Quality gate. **Commit** (separate, revertible) `chore(projects): projetos demo web e fullstack para teste`.

### Task 5: Static fallback + 3D MacBook pair

**Files:**
- Modify: `src/components/project/static-device-fallback.tsx`
- Modify: `src/components/project/device-canvas.tsx`
- Modify: `src/components/project/device-scene.tsx`
- Create: `src/components/project/laptop-model.tsx` (3D laptop, client)

**Interfaces:**
- Consumes: `DeviceSpec`, `hasDesktop` (Task 1).
- Produces (props change, all three):
  - `StaticDeviceFallback({ spec: DeviceSpec; alt: string })`
  - `DeviceCanvas({ spec: DeviceSpec; progress: MotionValue<number>; alt: string })`
  - `DeviceScene({ spec: DeviceSpec; progress; alt; onReady? })`
  - `LaptopModel({ screenshot: string; onReady?: () => void })` — a `<group>` whose origin is the hinge center.

- [ ] **Step 1: Static fallback.** When `hasDesktop(spec.kind)`: CSS MacBook (16:10 screen `aspect-[16/10]` inside a bezel, thin trapezoid base below) occupying ~85% of the box width, with the existing CSS phone (using `spec.phone` for the camera cutout, `spec.screenshot`) absolutely positioned bottom-right overlapping the laptop's right edge at ~28% of laptop width. `next/image` for both screens with `sizes` (`"40rem"` desktop, `"10rem"` phone). Otherwise unchanged phone render using `spec.phone`.
- [ ] **Step 2: LaptopModel.** Procedural, colors reused from `device-scene.tsx` constants (move them to a shared `device-materials.ts` if both files need them). Scene units: lid 5.6×3.6×0.08 RoundedBox, screen plane 5.3×3.3 unlit (`meshBasicMaterial`, `toneMapped={false}`) with the desktop texture, base slab 5.9×0.12×3.8 RoundedBox, lid rotated back ~100° from base, lime accent strip on the base front edge, faint key-grid plane on the base top. Texture via `useTexture(assetPath(screenshot), onLoad)` with sRGB setup, same as `PhoneModel`.
- [ ] **Step 3: Scene composition.** In `DeviceScene`, when `hasDesktop`: rig group contains `LaptopModel` (offset left, ~x −0.6) and `PhoneModel device={spec.phone}` (front-right, ~x +2.6, z +1.2, scaled ~0.75). `onReady` fires once **both** textures loaded (count in a ref; call after the second). Camera/fov tuned so the pair fits at the lg canvas aspect; if extremes push the laptop out of frame, use reduced pose constants for the pair (e.g. `ROT_Y = [-0.35, 0.35]`). Phone-only path unchanged. `ContactShadows` scale widened for the pair.
- [ ] **Step 4:** `DeviceCanvas` forwards `spec`; `device-showcase.tsx` computes `const spec = deviceSpec(project)` and passes it to every `StaticDeviceFallback` / `DeviceCanvas`; alt = `"<name> desktop and mobile screenshots"` when `hasDesktop`, else current alt.
- [ ] **Step 5: Verify fade alignment.** `npm run dev`, `/projects/lumen-commerce` at 1440px: scroll into the showcase, watch the static → 3D fade — pair is in the same place/size (screenshot just before and after reveal; compare). Scroll full range: both devices stay in frame at both extremes.
- [ ] **Step 6: Verify fallbacks.** With a temporarily wrong `desktopScreenshot` path → static pair remains, no blank area, no uncaught error overlay. Reduced-motion emulation → static pair shown. Revert path. `nebula-wallet` and `aurora-fit` look unchanged.
- [ ] **Step 7:** Quality gate; console has no new warnings. **Commit** `feat(project): MacBook 3D com celular para projetos web e fullstack`.

### Task 6: Mobile layout for web/fullstack showcase

**Files:**
- Modify: `src/components/project/device-showcase.tsx`

- [ ] **Step 1:** When `hasDesktop(project.device)`, below `lg`: canvas container `absolute inset-x-0 top-0 h-[55%]` (instead of `inset-0`), no bottom scrim, phases container anchored in the bottom 45% (`top-[55%]`), phases `justify-start`. At `lg+` keep today's classes (`lg:inset-0 lg:left-[45%] lg:h-auto` etc.). Phone-only projects keep today's classes exactly.
- [ ] **Step 2:** Reduced-motion branch: for web/fullstack the static box becomes `aspect-[16/11] w-full` (fits the pair) instead of `h-[28rem]`.
- [ ] **Step 3:** Camera framing at the mobile canvas aspect (~375×~460): pair fills ≥ 80% of canvas width. If the scene needs aspect-aware framing, set camera z from `size.width/size.height` via `useThree` in the rig (no state).
- [ ] **Step 4: Verify** at 375×812 (mobile preset, reload) on `lumen-commerce` and `pulse-health`: pair fully visible in top area at scroll start, middle and end; text phases readable below with no overlap; progress rail fine. `nebula-wallet` at 375 unchanged. Reset viewport to desktop.
- [ ] **Step 5:** Quality gate. **Commit** `feat(project): layout mobile da vitrine para projetos web e fullstack`.

### Task 7: Final verification + docs

**Files:**
- Modify: `CHANGELOG.md` (Unreleased — use the `changelog` skill), `README.md` (project JSON schema section, if it documents fields), `.sdd/memory/STATE.md` (technical decision line for this feature)

- [ ] **Step 1:** `npm run lint && npx tsc --noEmit && npm run build && npm run images:check && npm run og:check` — all pass.
- [ ] **Step 2:** Walk the spec's Verification list (android, ios, web, fullstack at 1440 and 375; reduced motion; no-WebGL; card hover/focus/touch; morph). Note anything off.
- [ ] **Step 3:** Update CHANGELOG, README schema docs (`device` values, `phone`, `desktopScreenshot`, asset sizes), STATE.md decision.
- [ ] **Step 4: Commit** `docs: changelog e schema dos projetos web/fullstack`. Push branch and open PR → `develop` only when Claudio asks.

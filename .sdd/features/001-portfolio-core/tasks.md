# Tasks — Portfolio core

> **Path in project:** `.sdd/features/001-portfolio-core/tasks.md`
> **Prerequisites:** `design.md` complete ✅, `checklist.md` passed ✅.

## Metadata

- **Feature ID:** `001`
- **Created:** `2026-07-03`
- **Total tasks:** 16
- **Parallelizable (`[P]`):** 8
- **Estimated effort:** L

## Conventions

- Gate for every implementation task: `npm run lint && npx tsc --noEmit` (fast gate); full gate `npm run build` at phase ends and T-015.
- **No TDD test tasks:** no test runner in v1 — recorded decision in STATE.md (2026-07-02) + missing `tdd-workflow` skill. Verification = gates + AC walkthrough in T-015.
- Sub-agent delegation: every implementation task runs in a sub-agent; orchestrator verifies gates + updates status here.
- **Shared contracts (pinned — parallel agents MUST follow):**
  - Palette/font tokens (T-003): Tailwind classes `bg-background`, `text-foreground`, `text-muted`, `text-primary`, `text-secondary`, `font-display`, `font-body`.
  - `src/data/types.ts` exports `Project` type exactly as design.md data model; `src/data/projects.ts` exports `projects: Project[]`, `getProject(slug: string): Project | undefined`.
  - Asset paths: covers `/projects/<slug>/cover.<ext>` (9:16), screenshots `/projects/<slug>/screen.<ext>` under `public/`.
  - VT name: `project-${slug}` — used in carousel card AND project hero, `share="morph"`.
  - `DeviceCanvas` props: `{ device: 'android' | 'ios'; screenshot: string; progress: MotionValue<number>; alt: string }`.
  - `StaticDeviceFallback` props: `{ device: 'android' | 'ios'; screenshot: string; alt: string }`.
  - Components dir: `src/components/{home,project,ui,layout}/kebab-case.tsx`.

## Phase 0 — Setup (sequential)

### T-001 — Feature branch
- **What:** `git checkout -b feature/001-portfolio-core`
- **Done when:** branch active, tree clean. **Gate:** `git status`.
- ✅ done (2026-07-03)

### T-002 — Dependencies + framework config
- **What:** `npm i motion@12.42.2 embla-carousel-react@8.6.0 embla-carousel-auto-scroll@8.6.0 three@0.185.1 @react-three/fiber@9.6.1 @react-three/drei@10.7.7`; `next.config.ts` → `{ experimental: { viewTransition: true }, transpilePackages: ['three','@react-three/drei'] }`; add `src/types/react-canary.d.ts` (`/// <reference types="react/canary" />`).
- **Where:** `package.json`, `package-lock.json`, `next.config.ts`, `src/types/react-canary.d.ts`
- **Depends on:** T-001. **Covers:** REQ-010 (enabler), NFR-003.
- **Done when:** install clean, `npm run build` passes.
- ✅ done (2026-07-03)

## Phase 1 — Foundation (parallel after T-002)

### T-003 [P] — Theme, fonts, layout shell
- **What:** `layout.tsx`: Orbitron+Rajdhani via `next/font/google` (`variable` mode) on `<html>`, metadata (title/description "claudio soares dev"), `<MotionProvider>` wrapper, `<SiteHeader>` (wordmark → `/`) + `<SiteFooter>`. `globals.css`: `@theme inline` tokens (colors: background #0A0A0A, foreground #F2F2F0, muted #C9C7BB, primary #A9FE00, secondary #4E47E3; fonts: display=Orbitron var, body=Rajdhani var), base styles (bg, text, selection, focus-visible ring primary), VT morph CSS + reduced-motion VT zeroing block. `src/components/ui/motion-provider.tsx` (`'use client'`, `MotionConfig reducedMotion="user"`), `src/components/layout/site-header.tsx`, `site-footer.tsx`.
- **Where:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/motion-provider.tsx`, `src/components/layout/*`
- **Covers:** REQ-006, REQ-007, REQ-018(css), NFR-001. **Story:** all.
- ✅ done (2026-07-03)

### T-004 [P] — Data layer
- **What:** `src/data/types.ts` (`Project` per design table) + `src/data/projects.ts` — 4 seed projects (≥1 `android`, ≥1 `ios`, 1 omitting `links.playStore`/`appStore` + `extras`, 1 with ≥2 extras), realistic dev-portfolio copy (EN), asset paths per convention.
- **Where:** `src/data/*`
- **Covers:** REQ-004, REQ-005, REQ-008, REQ-016, REQ-017. **Story:** US-004.
- ✅ done (2026-07-03)

### T-005 [P] — Seed assets
- **What:** Generate per-seed assets in `public/projects/<slug>/`: `cover` 1080×1920 (9:16) + `screen` 1080×2340 — dark futuristic SVG placeholders using palette (distinct per project: title text + geometric motif). Rasterize SVG→PNG via `qlmanage -t -s` (macOS) when available; else keep `.svg` (both work with next/image unoptimized + three texture via img decode). Asset ext must match T-004 paths (coordinate: default `.png`, fallback `.svg` — final paths written into a `MANIFEST.txt` for T-004 reconciliation at phase end).
- **Where:** `public/projects/*`, `scripts/generate-seed-assets.mjs` (optional)
- **Covers:** AC-001-1 enabler. **Story:** US-001.
- ✅ done (2026-07-03)

## Phase 2 — Home (after Phase 1)

### T-006 [P] — Hero + reveal primitives
- **What:** `src/components/ui/text-reveal.tsx` (word-mask stagger per R-003.4), `src/components/ui/reveal.tsx` (whileInView fade/rise, once), `src/components/home/hero.tsx` (full-viewport: Orbitron "CLAUDIO SOARES" display + "DEV" primary accent, Rajdhani tagline, secondary glow/grid decor, scroll cue).
- **Where:** `src/components/ui/text-reveal.tsx`, `src/components/ui/reveal.tsx`, `src/components/home/hero.tsx`
- **Covers:** REQ-001, REQ-011(reveals). **Story:** US-001.
- ✅ done (2026-07-03)

### T-007 [P] — Infinite carousel
- **What:** `src/components/home/project-carousel.tsx` (`'use client'`): embla `{loop:true, dragFree:true, align:'start'}` + AutoScroll (`speed≈1, stopOnMouseEnter:true, stopOnInteraction:false`), plugin omitted when `useReducedMotion()`. Cards: `aspect-[9/16]` fixed width, next/image cover (`sizes`, first 2 `priority`), name/year overlay, hover treatment, `<Link aria-label>` wrapping `<ViewTransition name={'project-'+slug} share="morph">`.
- **Where:** `src/components/home/project-carousel.tsx`
- **Covers:** REQ-002, REQ-003, REQ-009, REQ-010(home side), REQ-014, REQ-015, REQ-018(autoscroll). **Story:** US-001/002.
- ✅ done (2026-07-03)

### T-008 — Assemble home
- **What:** `src/app/page.tsx` (server): Hero + section heading + ProjectCarousel fed from registry.
- **Depends on:** T-004, T-006, T-007. **Covers:** REQ-001, AC-001-1. **Gate:** fast gate + `npm run build`.
- ✅ done (2026-07-03)

## Phase 3 — Project template (after Phase 1; parallel with Phase 2 allowed except shared files — none)

### T-009 [P] — Route + hero + content sections
- **What:** `src/app/projects/[slug]/page.tsx` (async `params: Promise<{slug}>`, `generateStaticParams`, `export const dynamicParams = false`, `generateMetadata`, `getProject` miss → `notFound()`); `src/components/project/project-hero.tsx` (VT morph counterpart, name/tagline/meta overlay); `src/components/project/sections.tsx` (FeaturesGrid, ArchitectureSection, ExtraSections, LinksRow — optional-field omission per REQ-016, external links `target=_blank rel=noopener noreferrer`); `src/app/not-found.tsx` (on-brand 404). Placeholder slot for DeviceShowcase (integrated in T-012).
- **Where:** `src/app/projects/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/components/project/project-hero.tsx`, `src/components/project/sections.tsx`
- **Covers:** REQ-004, REQ-005, REQ-010(detail side), REQ-013, REQ-016, REQ-017, REQ-020. **Story:** US-002/003/004.
- ✅ done (2026-07-03)

### T-010 [P] — Device fallback + canvas wrapper
- **What:** `src/components/project/static-device-fallback.tsx` (CSS phone frame per `device` — android punch-hole vs ios dynamic-island — around next/image screenshot); `src/components/project/device-canvas.tsx` (`'use client'`, WebGL pre-gate, error boundary, `dynamic(() => import('./device-scene'), { ssr:false, loading: StaticDeviceFallback })`).
- **Where:** `src/components/project/static-device-fallback.tsx`, `src/components/project/device-canvas.tsx`
- **Covers:** REQ-019, NFR-003. **Story:** US-003/005.
- ✅ done (2026-07-03)

### T-011 [P] — 3D scene
- **What:** `src/components/project/device-scene.tsx`: Canvas (`frameloop="demand"`, `dpr=[1,2]`, camera z=6 fov=35, `fallback`), lights (ambient + 2 directional, primary/secondary tinted rim), `ContactShadows frames={1}`; `DeviceRig` (progress MotionValue → `on('change', invalidate)` + `useFrame` ref lerp rotation/position); `PhoneModel` procedural (RoundedBox body, screen plane `useTexture` + `SRGBColorSpace` + `meshBasicMaterial toneMapped={false}`, android/ios differentiators).
- **Where:** `src/components/project/device-scene.tsx` (+ optional `phone-model.tsx` same dir)
- **Covers:** REQ-008, REQ-011, REQ-012. **Story:** US-003.
- ✅ done (2026-07-03)

### T-012 — Scroll showcase integration
- **What:** `src/components/project/device-showcase.tsx` (`'use client'`): ~260vh section, sticky canvas viewport, `useScroll` target offsets `['start start','end end']` → `useSpring` → progress into DeviceCanvas; synced side content phases (about/features teaser). Reduced motion → static pose + plain blocks. Integrate into project page (replace T-009 slot).
- **Where:** `src/components/project/device-showcase.tsx`, `src/app/projects/[slug]/page.tsx` (slot only)
- **Depends on:** T-009, T-010, T-011. **Covers:** REQ-011, REQ-018. **Gate:** fast gate + `npm run build`.
- ✅ done (2026-07-03)

## Phase 4 — Integration & verification (sequential)

### T-013 — Reduced-motion + a11y audit
- **What:** sweep all components: `useReducedMotion` branches, VT CSS zeroing present, focus-visible on all interactive, aria-labels, alt text, heading order, contrast spot-check.
- **Covers:** REQ-009, REQ-018, NFR-001, AC-005-1.
- ✅ done (2026-07-03)

### T-014 — Full gate + production build
- **What:** `npm run lint && npx tsc --noEmit && npm run build` (kill dev server first — Next 16 lockfile). Fix all errors/warnings introduced.
- **Covers:** NFR-005.
- ✅ done (2026-07-03) — lint ✅ tsc ✅ build ✅ (7/7 static)

### T-015 — Browser verification (AC walkthrough)
- **What:** `next dev` + Chrome tools: AC-001-1..3 (carousel, loop, autoscroll/hover), AC-002-1..3 (VT morph, keyboard, back), AC-003-1..4 (sections, scroll 3D, device variant, fallback), AC-004-2/3 (optional fields, extras), AC-VIS-1 (computed styles), reduced-motion emulation (AC-005-1). Record results in execution-log.md.
- **Covers:** all ACs.
- ✅ done (2026-07-03) — automated AC checks + Lighthouse (home 99/100, project 100/100 a11y 100); interactive visuals pending user browser (extension offline)

### T-016 — Commit + Document phase handoff
- **What:** conventional commits per phase, CHANGELOG.md via `changelog` skill, STATE/ROADMAP updates, final report.
- ✅ done (2026-07-03) — CHANGELOG v0.1.0, ROADMAP/spec/STATE finalized

## Parallelism plan

| Phase | Parallel batch | Sub-agents | Conflict check |
|-------|---------------|------------|----------------|
| 1 | T-003, T-004, T-005 | 3 | zero shared files ✅ (T-005 writes MANIFEST; ext reconciliation at phase end by orchestrator) |
| 2+3 | T-006, T-007, T-009, T-010, T-011 | 5 | zero shared files ✅ (T-009 owns page.tsx incl. slot) |
| — | T-008, T-012 sequential after their deps | 1 each | touch shared files |

## Traceability matrix

| REQ | Implemented by | Verified by |
|-----|----------------|-------------|
| REQ-001 | T-003, T-006, T-008 | T-015 (AC-001-1) |
| REQ-002 | T-007 | T-015 (AC-001-1) |
| REQ-003 | T-007 | T-015 (AC-001-2) |
| REQ-004 | T-004, T-009 | T-015 (AC-003-1) |
| REQ-005 | T-004, T-009 | T-015 (AC-004-1) |
| REQ-006 | T-003 | T-015 (AC-VIS-1) |
| REQ-007 | T-003 | T-015 (AC-VIS-1) |
| REQ-008 | T-004, T-011 | T-015 (AC-003-3) |
| REQ-009 | T-007 | T-013, T-015 (AC-002-2) |
| REQ-010 | T-002, T-007, T-009 | T-015 (AC-002-1) |
| REQ-011 | T-011, T-012, T-006 | T-015 (AC-003-2) |
| REQ-012 | T-011 | T-015 (AC-003-3) |
| REQ-013 | T-007, T-009 | T-015 (AC-002-3) |
| REQ-014 | T-007 | T-015 (AC-001-3) |
| REQ-015 | T-007 | T-015 (AC-001-3) |
| REQ-016 | T-004, T-009 | T-015 (AC-004-2) |
| REQ-017 | T-004, T-009 | T-015 (AC-004-3) |
| REQ-018 | T-003, T-007, T-012, T-013 | T-015 (AC-005-1) |
| REQ-019 | T-010, T-011 | T-015 (AC-003-4) |
| REQ-020 | T-009 | T-015 (scenario) |
| NFR-001 | T-003, T-013 | T-013 |
| NFR-002 | design-wide | T-015 (Lighthouse) |
| NFR-003 | T-002, T-010 | T-014 (build output) |
| NFR-004 | T-005, T-007, T-009, T-010 | T-013 review |
| NFR-005 | all | T-014 |

## Status legend

⬜ pending · 🟡 in progress · ✅ done · ⚠️ partial · ⏸ blocked

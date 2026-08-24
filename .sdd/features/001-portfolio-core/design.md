# Design — Portfolio core: home carousel, shared-element transition, 3D project template

> **Path in project:** `.sdd/features/001-portfolio-core/design.md`
> **Prerequisites:** `spec.md` status `clarified` ✅. `constitution.md` v1.0.0 loaded ✅.

## Metadata

- **Feature ID:** `001`
- **Spec version:** `clarified` (2026-07-02)
- **Created:** `2026-07-02`
- **Last updated:** `2026-07-03`

## Constitutional compliance

| Principle | Verified? | Notes |
|-----------|-----------|-------|
| P-001 — bundled docs source of truth | ✅ | research.md R-001 read docs exhaustively; all framework APIs cited from `node_modules/next/dist/docs/` |
| P-002 — RSC default, client leaves | ✅ | pages/layout server; client only: carousel, reveals, device scene, motion provider |
| P-003 — centralized tokens | ✅ | all palette/fonts in `globals.css` `@theme inline`; components use utility classes |
| P-004 — data-driven template | ✅ | `src/data/projects.ts` registry + single `/projects/[slug]` route |
| P-005 — motion respects visitor | ✅ | `MotionConfig reducedMotion="user"` + VT reduced-motion CSS + AutoScroll gating + static 3D fallback |
| P-006 — performance budget | ✅ | SSG all routes, demand frameloop, ssr:false split 3D chunk, next/image |
| P-007 — WCAG AA | ✅ | text colors #F2F2F0/#C9C7BB on #0A0A0A (AA+); primary #A9FE00 only for headings/accents (contrast 15.1:1 on bg — passes); focus-visible styles |
| P-008 — minimal pinned deps | ✅ | 6 runtime deps, exact versions, each with unique job (research.md consolidated set) |

### Constitutional violations

None.

## Design recommendations

The site is fully static (SSG) with three interactivity islands: the carousel (embla), scroll-driven reveals (motion) and the 3D device (R3F, lazy). The shared-element morph uses the platform (View Transitions API via React's `ViewTransition`) rather than a JS animation library, because App Router route changes cannot carry framer-motion `layoutId` state — the platform primitive is both lighter and correct. All motion is progressive enhancement over a readable static document.

### Guiding principles for this design

- **Platform over library** — VT API for route morphs; libraries only where the platform has no primitive (drag physics, spring scroll).
- **One template, many projects** — the `Project` type is the contract; template renders whatever the registry provides.
- **Islands stay leaves** — server pages compose client islands; no client component wraps server content except pass-through providers.

## Architecture overview

```
src/app/layout.tsx [MOD]  fonts(Orbitron+Rajdhani) · MotionProvider · Header/Footer
│
├── src/app/page.tsx [MOD] (server, SSG)
│     ├── Hero [NEW, server] ── TextReveal [NEW, client]
│     └── ProjectCarousel [NEW, client: embla+AutoScroll]
│           └── card → Link → ViewTransition name=project-{slug} → next/image (cover 9:16)
│
├── src/app/projects/[slug]/page.tsx [NEW] (server, generateStaticParams, dynamicParams=false)
│     ├── ProjectHero [NEW] ── ViewTransition name=project-{slug} (morph target)
│     ├── DeviceShowcase [NEW, client]  sticky viewport + useScroll progress
│     │     └── DeviceCanvas [client] ─ dynamic(ssr:false) → DeviceScene
│     │           └── Canvas frameloop=demand → PhoneModel(device) + Screen(useTexture)
│     │           └── fallback/error → StaticDeviceFallback (plain screenshot frame)
│     ├── content sections [server + Reveal client wrapper]:
│     │     Description · Features · Architecture · ExtraSections · LinksRow
│     └── back-to-home Link
│
├── src/app/not-found.tsx [NEW]
├── src/data/types.ts [NEW]  +  src/data/projects.ts [NEW] (registry + seeds)
└── src/app/globals.css [MOD]  @theme tokens · VT CSS · reduced-motion CSS
```

## Components

### `next.config.ts` `[MOD]`
- `experimental: { viewTransition: true }`, `transpilePackages: ['three', '@react-three/drei']`.
- **Covers:** REQ-010, REQ-011 (enables VT + three build).

### `src/types/react-canary.d.ts` `[NEW]`
- `/// <reference types="react/canary" />` — makes `import { ViewTransition } from 'react'` typecheck (R-003 finding 3).

### `RootLayout` `[MOD]` — `src/app/layout.tsx`
- **Responsibility:** fonts (Orbitron `--font-orbitron`, Rajdhani `--font-rajdhani`, via `next/font/google`, `variable` mode), metadata, `<MotionProvider>` (client pass-through with `MotionConfig reducedMotion="user"`), site header (wordmark link home) + minimal footer.
- **Invariants:** stays a Server Component; provider children pass through.
- **Covers:** REQ-006, REQ-007, REQ-018.

### `globals.css` `[MOD]`
- `@theme inline`: `--color-background #0A0A0A`, `--color-foreground #F2F2F0`, `--color-muted #C9C7BB`, `--color-primary #A9FE00`, `--color-secondary #4E47E3`, `--font-display: var(--font-orbitron)`, `--font-body: var(--font-rajdhani)`.
- VT morph class CSS (`::view-transition-group(.morph)` timing) + reduced-motion block zeroing `::view-transition-*` durations. Base body styles, focus-visible ring (primary), selection color.
- **Covers:** REQ-007, REQ-018, NFR-001.

### `Project` data model `[NEW]` — `src/data/types.ts`, `src/data/projects.ts`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| slug | string | unique, url-safe | route id + VT name |
| name | string | required | Orbitron display |
| tagline | string | required | short hero line |
| description | string | required | paragraph(s) |
| cover | string | required, public/ path, 9:16 | carousel card + hero morph element |
| screenshot | string | required, public/ path | phone-screen texture |
| device | 'android' \| 'ios' | required | selects PhoneModel variant |
| year | string | required | card/hero meta |
| role | string | required | e.g. "Solo developer" |
| features | { title: string; description: string }[] | ≥1 | features grid |
| architecture | { summary: string; stack: string[] } | required | architecture section |
| links | { github?: string; playStore?: string; appStore?: string; website?: string } | all optional | REQ-016 |
| extras | { title: string; body: string }[] \| undefined | optional | REQ-017, rendered after architecture |

- Registry exports `projects: Project[]`, `getProject(slug)`, ordered array feeds carousel. 4 seeds (≥1 android, ≥1 ios, 1 omitting store link + extras).
- **Covers:** REQ-004, REQ-005, REQ-008, REQ-016, REQ-017.

### `Hero` `[NEW]` — `src/components/home/hero.tsx` (server) + `TextReveal` client
- Big Orbitron headline ("CLAUDIO SOARES" + "DEV" accent), Rajdhani sub-line, staggered word mask-reveal (R-003 topic 4), decorative secondary-color glow/grid.
- **Covers:** REQ-001 (identity), US-001.

### `ProjectCarousel` `[NEW, client]` — `src/components/home/project-carousel.tsx`
- embla `{ loop: true, dragFree: true, align: 'start' }` + `AutoScroll({ speed: ~1, stopOnMouseEnter: true, stopOnInteraction: false })`; plugin omitted entirely when `useReducedMotion()` is true.
- Cards: `aspect-[9/16]`, fixed width (~w-64), `next/image` cover with `sizes`, name/year overlay, hover scale/glow (motion), `<Link href prefetch>` wrapping `<ViewTransition name={'project-'+slug} share="morph">`. Embla `loop` does not clone slides → VT names stay unique per page.
- Keyboard: cards are links (focusable, descriptive aria-label).
- **Covers:** REQ-002, REQ-003, REQ-009, REQ-010, REQ-013 (back → carousel intact), REQ-014, REQ-015, AC-001-*, AC-002-2.

### `ProjectPage` `[NEW]` — `src/app/projects/[slug]/page.tsx`
- Server. `params: Promise<{slug}>` awaited (R-001.2); `generateStaticParams` from registry; `export const dynamicParams = false`; unknown slug → framework 404 (belt: `getProject` miss → `notFound()`).
- `generateMetadata` per project.
- Composes: ProjectHero → DeviceShowcase → Description/Features/Architecture/Extras/Links (server sections inside `Reveal` client wrappers) → back link.
- **Covers:** REQ-004, REQ-005, REQ-020, AC-003-1, AC-004-*.

### `ProjectHero` `[NEW]` — `src/components/project/project-hero.tsx`
- Full-viewport hero: cover image (`fill`, positioned parent) wrapped in `<ViewTransition name={'project-'+slug} share="morph">` (morph counterpart), name in Orbitron, tagline, meta (year/role/device), scroll cue.
- **Covers:** REQ-010, AC-002-1.

### `DeviceShowcase` `[NEW, client]` — `src/components/project/device-showcase.tsx`
- Tall section (~250–300vh). Sticky inner viewport holds the canvas; `useScroll({ target, offset: ['start start','end end'] })` → `useSpring` smoothed progress MotionValue → passed to DeviceCanvas AND to side content reveals (description/feature highlights synced with phone rotation phases).
- Under `useReducedMotion()`: renders phone static at rest pose, sections as plain blocks.
- **Covers:** REQ-011, AC-003-2, REQ-018.

### `DeviceCanvas` `[NEW, client]` — `src/components/project/device-canvas.tsx`
- `'use client'`; `dynamic(() => import('./device-scene'), { ssr: false, loading: () => <StaticDeviceFallback/> })` (R-002.3). Pre-gates WebGL via capability check; error boundary swaps to StaticDeviceFallback.
- **Covers:** REQ-019, NFR-003, AC-003-4.

### `DeviceScene` `[NEW, client]` — `src/components/project/device-scene.tsx`
- `<Canvas frameloop="demand" dpr={[1,2]} camera={{ position:[0,0,6], fov:35 }} fallback={<StaticDeviceFallback/>}>`; ambient + 2 directional lights (NO drei Environment presets — remote CDN, R-002.8); `ContactShadows frames={1}`.
- `DeviceRig`: `useEffect(() => progress.on('change', invalidate))`; `useFrame` reads `progress.get()`, lerps group rotation.y (-0.6→0.6 rad), rotation.x subtle, position.y — ref mutation only.
- `PhoneModel`: procedural — drei `RoundedBox` body (android: taller radius, centered punch-hole camera dot; ios: notch/dynamic-island bar + squarer camera block), screen plane `+z` with `useTexture(screenshot)` → `SRGBColorSpace`, `meshBasicMaterial toneMapped={false}` (R-002.5); primary-color edge glow ring accent.
- **Covers:** REQ-008, REQ-011, REQ-012, AC-003-3.

### `StaticDeviceFallback` `[NEW]` — `src/components/project/static-device-fallback.tsx`
- CSS device frame (rounded border, notch/punch-hole per device prop) + `next/image` screenshot. Used as: dynamic-import loading state, Canvas fallback, error-boundary fallback, reduced-motion-only variant.
- **Covers:** REQ-019, AC-003-4.

### `Reveal` / `TextReveal` `[NEW, client]` — `src/components/ui/`
- `Reveal`: `motion.div` `whileInView` fade/rise, `viewport={{ once: true, amount: 0.3 }}`. `TextReveal`: word-split mask stagger. Both no-op offsets under reduced motion (MotionConfig handles transforms).
- **Covers:** REQ-011 (section reveals), REQ-018.

### Content sections `[NEW, server]` — `src/components/project/sections.tsx`
- `FeaturesGrid` (cards, Rajdhani body/Orbitron titles), `ArchitectureSection` (summary + stack chips in secondary color), `ExtraSections` (data order), `LinksRow` (GitHub / Play Store / App Store / website buttons — only present links; `rel="noopener noreferrer"`, `target="_blank"`).
- **Covers:** REQ-004, REQ-016, REQ-017, AC-004-2.

## Sequence diagram — click card → project page

```
Visitor      Carousel(card Link)   Next Router        VT API             ProjectPage
  │ click/Enter │                      │                 │                    │
  │────────────▶│ navigate(/projects/x)│                 │                    │
  │             │─────────────────────▶│ startTransition │                    │
  │             │                      │────────────────▶│ snapshot old (name=project-x)
  │             │                      │ mount new route  │                    │
  │             │                      │─────────────────────────────────────▶│ hero renders (name=project-x)
  │             │                      │                 │ morph old→new card→hero
  │             │                      │                 │ (unsupported browser: instant swap)
```

## Failure modes

### F-001 — WebGL unavailable / context crash
- **Trigger:** old GPU, headless, driver crash. **Detection:** capability pre-gate + Canvas `fallback` + error boundary. **Response:** StaticDeviceFallback, sections intact. **Covers:** REQ-019.

### F-002 — View Transitions unsupported
- **Trigger:** older Firefox/browsers. **Detection:** none needed. **Response:** native graceful degradation → instant swap (doc-confirmed). **Covers:** REQ-010 fallback path.

### F-003 — Reduced motion preference
- **Trigger:** OS setting. **Detection:** `useReducedMotion` + CSS media query. **Response:** no autoscroll, VT durations 0, static device pose, plain sections. **Covers:** REQ-018, AC-005-1.

### F-004 — Unknown slug
- **Trigger:** bad URL. **Detection:** registry miss / `dynamicParams=false`. **Response:** 404 page. **Covers:** REQ-020.

### F-005 — Screenshot texture load failure
- **Trigger:** missing asset. **Detection:** useTexture suspense/error → error boundary. **Response:** StaticDeviceFallback. **Covers:** REQ-019.

## Observability

Static site — none in v1 (no analytics per PROJECT.md non-goals). Build-time gates are the signal.

## Security considerations

- No auth/inputs/backend. Outbound links `rel="noopener noreferrer"`. No secrets. SVG assets self-authored (no untrusted SVG).

## Performance & scalability

- **Hot path:** home LCP (hero text + first carousel images — `priority` on first ~2 covers), project hero image (`priority`).
- **3D:** separate chunk (ssr:false dynamic), demand frameloop, dpr clamp, baked shadows.
- **All routes SSG** (registry is static data; `dynamicParams=false`).
- **Budget check:** Lighthouse ≥ 90 on `next build`+`next start` (NFR-002); dev-server lockfile — kill dev before build (R-001.6).

## Technology choices

| Decision | Options considered | Chosen | Rationale |
|----------|--------------------|--------|-----------|
| Shared element | motion layoutId · VT API | **VT API** (React `ViewTransition` + `experimental.viewTransition`) | layoutId cannot cross App Router routes (R-003.2); platform-native, auto-fallback |
| Carousel | embla+AutoScroll · hand-rolled marquee | **embla-carousel-react@8.6.0 + auto-scroll@8.6.0** | true infinite loop + drag momentum + hover pause; no slide cloning (VT-safe); ~6kb |
| Animation | motion · GSAP | **motion@12.42.2** (`motion/react`) | React-native API, MotionValue bridge to R3F, reduced-motion built-in; GSAP redundant |
| 3D | R3F stack · vanilla three | **three@0.185.1 + fiber@9.6.1 + drei@10.7.7** | peer-verified React 19.2 compat; declarative; drei RoundedBox/useTexture |
| Device model | GLTF asset · procedural | **procedural** | no licensing, tiny, screen = live texture of project screenshot (resolves spec Q4) |
| Seed assets | none | self-generated SVG covers/screenshots (rasterize to PNG via macOS `qlmanage` when available; SVG fallback) | zero external assets; replaced by real art in M2 |

All verified via Knowledge Verification Chain — see `research.md` R-001…R-003.

## Open design questions

None blocking. Deferred: real content art direction (M2).

## See also

- `research.md` — R-001 (Next 16), R-002 (3D), R-003 (animation).
- `spec.md` — requirements. `tasks.md` — next.

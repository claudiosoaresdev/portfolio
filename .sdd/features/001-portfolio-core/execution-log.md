# Execution log — Portfolio core

> Sub-agent returns archived per execution-plan.md. Newest last.

## S1 — Setup (orchestrator, 2026-07-03)

- T-001: branch `feature/001-portfolio-core` created. ✅
- T-002: deps installed (motion 12.42.2, embla 8.6.0 + auto-scroll, three 0.185.1, fiber 9.6.1, drei 10.7.7); `next.config.ts` viewTransition + transpilePackages; `src/types/react-canary.d.ts`. `npm run build` ✅. Committed. ✅

## S2 — Foundation batch

### Task T-004 — return (agent impl-t004)
**Status:** Complete
**Files changed:** src/data/types.ts (created), src/data/projects.ts (created)
**Gate check:** lint → PASS · tsc → PASS
**SPEC_DEVIATION markers:** none
**Technical decisions:** contract verbatim; 4 seeds (nebula-wallet android/full links/2 extras, aurora-fit ios/github+appStore/1 extra, cipher-notes android/github only/no extras — exercises REQ-016, orbit-tasks ios/full links/2 extras); paths `/projects/<slug>/{cover,screen}.png`.
**Issues:** none. Note: PNGs land in T-005.

### Task T-003 — return (agent impl-t003)
**Status:** Complete
**Files changed:** src/app/layout.tsx (mod), src/app/globals.css (mod), src/components/ui/motion-provider.tsx, src/components/layout/site-header.tsx, src/components/layout/site-footer.tsx (created)
**Gate check:** lint → PASS · tsc → PASS
**SPEC_DEVIATION markers:** none
**Technical decisions:** Orbitron variable / Rajdhani explicit weights; MotionConfig reducedMotion="user" verified; header VT anchoring hardened (`::view-transition-old(site-header){display:none}` + `new{animation:none}` + z-index — official guide pattern, prevents double-header flash); fixed header with pointer-events split; tokens via `@theme inline`, hex confined to globals.css.
**Issues:** none.

### Task T-005 — return (agent impl-t005)
**Status:** Complete
**Files changed:** scripts/generate-seed-assets.mjs, public/projects/MANIFEST.txt, 4×{cover.png 1080×1920, screen.png 1080×2340} + SVG sources
**Gate check:** sips dimension check → PASS all 8
**SPEC_DEVIATION markers:** qlmanage renders SVG on square canvas (not aspect-preserving as briefed) — worked around via square safe-column render + `sips -c` center-crop; SVG sources kept as regenerable fallback. Deviation accepted (method-level; outputs exactly to spec).
**Issues:** none.

**Phase 1 reconciliation (orchestrator):** MANIFEST ↔ projects.ts paths match 8/8 (.png). Phase 1 committed.

## S3 — Home + Template batch

### Task T-007 — return (agent impl-t007)
**Status:** Complete
**Files changed:** src/components/home/project-carousel.tsx
**Gate check:** lint → PASS · tsc → PASS
**SPEC_DEVIATION markers:** `preload={index<2}` instead of `priority` — Next 16 docs mark `priority` DEPRECATED; AGENTS.md mandates heeding deprecations. Accepted.
**Technical decisions:** embla+AutoScroll gated on useReducedMotion; focus ring inset (overflow-clip safe); VT wraps single positioned node; hover zoom `motion-safe:` gated.
**Issues:** ⚠️ open item → with 4 slides (~1200px track) embla `loop:true` can't loop on viewports wider than the track. Fix planned in T-012/T-013: render slide list twice, ViewTransition name only on first copy (VT names must be unique per page); duplicates navigate without morph.

### Task T-006 — return (agent impl-t006)
**Status:** Complete
**Files changed:** src/components/ui/text-reveal.tsx, src/components/ui/reveal.tsx, src/components/home/hero.tsx
**Gate check:** lint → PASS · tsc → PASS (own files; sibling device-canvas errors expected mid-flight)
**SPEC_DEVIATION markers:** none
**Technical decisions:** currentColor-driven gradients (token purity); polymorphic TextReveal via motion tag map; single h1 wraps three reveals (a11y reads "CLAUDIO SOARES DEV", uppercase via CSS); hero server component; relies on app MotionConfig for reduced motion.
**Issues:** none.

### Task T-012 — return (agent impl-t012)
**Status:** Complete
**Files changed:** src/components/project/device-showcase.tsx (new), src/app/projects/[slug]/page.tsx (slot), src/components/home/project-carousel.tsx (loop fix)
**Gate check:** lint → PASS · tsc → PASS · build → PASS (4 project pages SSG)
**SPEC_DEVIATION markers:** none
**Technical decisions:** hooks unconditional before reduce-branch; phase cross-fade on raw scrollYProgress (0→0.32 / 0.3→0.68 / 0.66→1), spring only feeds canvas; shared phase markup between animated/reduced renders; carousel dup copy aria-hidden + tabIndex -1, VT only on first copy.
**Issues:** none.

### Task T-013 — return (agent impl-t013)
**Status:** Complete
**Fixes:** hero scroll-cue → `motion-safe:animate-bounce`; arch chips text-secondary (3.14:1, AA fail) → text-muted keeping indigo border; 404 div→h1 (layers aria-hidden); LinksRow sr-only "(opens in new tab)"; showcase h3→p (heading skip + duplicate).
**Accepted:** TextReveal reduced-motion safe (snaps to y:0 via type:false — verified); AutoScroll/VT-CSS/static-branch coverage confirmed; no console.*, landmarks/alt/lang ok.
**Needs-owner (flagged, not AA failures):** R3F canvas has no text alt (equivalent text adjacent); no-JS hero text clipped (JS permitted by AA).
**Gate check:** lint → PASS · tsc → PASS · build → PASS (7/7 static)
**Issues:** none.

## S4 — Integration & verification (orchestrator)

- T-014: full gate — lint ✅ tsc ✅ build ✅ (7/7 static pages).
- T-015: prod server checks — routes 200/200/404 ✅; HTML asserts (8 cards incl. dup copy, fonts, images 200, cipher-notes zero store links, orbit-tasks 2 extras in order, tokens exact in served CSS, VT CSS present) ✅; hydrated-DOM asserts (embla track, static fallback pre-scroll, ZERO canvas pre-scroll → defer works, correct device chip) ✅; Lighthouse: home perf 99 / a11y 100, project perf 100 / a11y 100 (after inView-defer patch: TBT 920ms→0, score 72→100); reduced-motion capture attempted (headless artifacts). Screenshots: hero + project hero verified visually (HUD aesthetic solid). Interactive checks (VT morph visual, drag/loop feel, 3D rotation) not automatable headless — Chrome extension offline; code-verified, flagged for user's eyes.
- Ops note: `pkill "next start"` doesn't kill `next-server` process — kill by port (`lsof -ti :3000`).

## S5 — Document

- T-016: CHANGELOG.md created (release 0.1.0, 2026-07-03); ROADMAP feature 001 → done; spec status → done; STATE frontmatter idle. Wiki note deferred (personal vault write needs user go-ahead).

### Task T-009 — return (agent impl-t009)
**Status:** Complete
**Files changed:** src/app/projects/[slug]/page.tsx, src/app/not-found.tsx, src/components/project/project-hero.tsx, src/components/project/sections.tsx
**Gate check:** lint (scoped) → PASS · tsc → PASS
**SPEC_DEVIATION markers:** +AboutSection export (centralizes description section); sections take `index` prop, page owns sequential numbering (no gaps when extras absent); FeaturesGrid gap-4 not gap-px. All accepted.
**Technical decisions:** VT wraps only the image container (scrim/copy outside); notFound() belt + dynamicParams=false; LinksRow order GitHub→Play→App→Web, null when empty; pure-CSS token-only 404 glitch.
**Issues:** flagged sibling lint errors in device-scene/device-canvas (owned by T-010/011, in flight).

### Task T-010/T-011 — return (agent impl-t010-011)
**Status:** Complete
**Files changed:** src/components/project/static-device-fallback.tsx, device-canvas.tsx, device-scene.tsx
**Gate check:** lint → PASS (no suppressions) · tsc → PASS (project-wide)
**SPEC_DEVIATION markers:** none (contracts honored; DeviceKind alias reused)
**Technical decisions (load-bearing):** Next 16 strict react-hooks rules — WebGL probe via `useSyncExternalStore` (not setState-in-effect); texture colorSpace set in `useTexture` onLoad + `invalidate()` (not render-body mutation). `dynamic({ssr:false})` loading component can't receive props → prop-aware fallback via React Context. iOS island = capsuleGeometry (RoundedBox pill geometrically impossible at 0.02 depth); layered degradation pre-gate → error boundary → Canvas fallback.
**Issues:** none.

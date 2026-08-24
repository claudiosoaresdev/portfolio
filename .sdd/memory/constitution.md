# Constitution — `claudiosoaresdev-portfolio`

> **Path in project:** `.sdd/memory/constitution.md`
> **Mutability:** IMMUTABLE during an active feature. Changes require explicit user approval and a new version bump.

## Metadata

- **Project:** `claudiosoaresdev-portfolio`
- **Version:** `1.0.0`
- **Created:** `2026-07-02`
- **Last amendment:** `2026-07-02`
- **Amendment history:** see bottom of file

## Purpose

This document defines the immutable architectural DNA of the project. Every plan, design and implementation must comply with it. Violations are not silent — they require explicit justification in the corresponding `design.md` under a "Constitutional violations" section, with rationale and trade-off analysis.

## Principles

### P-001: Bundled Next.js docs are the framework source of truth

This project runs Next.js 16.2.10, which has breaking changes relative to prior knowledge (per `AGENTS.md`). Any framework API usage (routing, fonts, images, transitions, config) must be verified against `node_modules/next/dist/docs/` before code is written. Prevents fabricated APIs; accepts slower design phase.

**Concrete implications:**
- Read the relevant guide in `node_modules/next/dist/docs/01-app/` before using any Next.js API.
- Never rely on memory of Next.js ≤15 conventions without confirming they still hold.

### P-002: Server Components by default; `'use client'` only at interactivity leaves

Animations, 3D scenes and carousel interactivity live in leaf client components. Pages, layout and data plumbing stay on the server. Keeps bundle small and LCP fast despite heavy animation/3D libraries.

**Concrete implications:**
- No `'use client'` in `page.tsx`/`layout.tsx` files.
- 3D scene loaded lazily (dynamic import) and never blocks initial paint.

### P-003: Design tokens centralized — never hard-code visual values in components

All colors, fonts and spacing derive from the Tailwind v4 theme (`@theme` in `globals.css`). Fixed palette: primary `#A9FE00`, secondary `#4E47E3`, background `#0A0A0A`, foreground `#F2F2F0`, muted `#C9C7BB`. Fonts: Orbitron (display), Rajdhani (body/auxiliary). Dark mode is the only mode.

**Concrete implications:**
- Components reference tokens (`text-primary`, `font-display`), never raw hex or font names.
- Adding/altering a token happens in exactly one file.

### P-004: Project pages are a data-driven template

Adding a portfolio project = adding one typed data entry + assets. Zero component/route edits. The template renders name, description, features, architecture, links, device model choice (Android/iOS) and extra sections from data.

**Concrete implications:**
- Single dynamic route (`/projects/[slug]`) fed by a typed registry in `src/data/`.
- The data type is the contract; template renders all fields generically, optional fields degrade gracefully.
- Never create a per-project page component.

### P-005: Motion respects the visitor

Every animation honors `prefers-reduced-motion`. 3D and scroll effects are progressive enhancement — content remains readable and navigable without them (JS disabled, WebGL unavailable, reduced motion).

**Concrete implications:**
- Gate continuous/large animations behind reduced-motion checks.
- Provide non-animated fallback rendering for the 3D device (static image or plain section).

### P-006: Performance budget is a feature

Portfolio must feel instant: it is itself the proof of competence. Heavy assets (3D, images) are lazy, optimized and never block first paint.

**Concrete implications:**
- Use `next/image` for all raster images; vertical carousel images sized/cropped at build.
- 3D bundle split from main chunk; loaded on the project page only.
- Lighthouse performance ≥ 90 on home and project template (local check).

### P-007: Accessibility floor — WCAG 2.2 AA

Neon-on-dark palette must keep AA contrast for text. All interactive elements keyboard-reachable with visible focus.

**Concrete implications:**
- Body text uses `#F2F2F0`/`#C9C7BB` on `#0A0A0A`; `#A9FE00` for accents/headings (AA-checked per use).
- Carousel items are links, focusable, with descriptive labels.

### P-008: Minimal, pinned dependency set

Every new dependency needs a job no existing dependency does. Versions pinned via lockfile; no experimental packages without a recorded decision in `STATE.md`.

**Concrete implications:**
- One animation library, one 3D stack — no overlapping libs.
- Record each added dependency and its justification in `STATE.md`.

## Technology constraints

- **Languages:** TypeScript (strict)
- **Runtimes:** Node.js (LTS), browser evergreen
- **Frameworks:** Next.js 16.2.10 (App Router), React 19.2
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Fonts:** Orbitron (display), Rajdhani (body) via `next/font`
- **Animation:** to be selected in Design phase via Knowledge Verification (candidates: `motion`/framer-motion + View Transitions)
- **3D:** to be selected in Design phase (candidates: `three` + `@react-three/fiber` + `@react-three/drei`)
- **Package manager:** npm (lockfile committed)
- **Test runner:** none for v1 — quality gate is lint + typecheck + build (see Quality bar)
- **Linter / formatter:** ESLint 9 (`eslint-config-next`)

## Security & compliance baseline

- **Secrets management:** no secrets in repo; static portfolio has none in v1.
- **Authentication:** none (public site).
- **Logging:** no analytics/PII collection in v1.
- **External links:** `rel="noopener noreferrer"` on all outbound links.

## Quality bar

- **Gate commands:** `npm run lint && npx tsc --noEmit && npm run build`
- **Performance budget:** Lighthouse ≥ 90 (performance) on home and project template.
- **Accessibility:** WCAG 2.2 AA on all user-facing screens.
- **Motion:** all animations disabled/simplified under `prefers-reduced-motion`.

## Forbidden practices

- ❌ Hard-coded hex colors or font-family names inside components (tokens only).
- ❌ `'use client'` on pages/layouts or above the interactivity leaf that needs it.
- ❌ Per-project bespoke page components (template + data only).
- ❌ Using a Next.js API without checking `node_modules/next/dist/docs/` first.
- ❌ `console.log` in committed code.
- ❌ New dependency without justification recorded in `STATE.md`.
- ❌ Comments that describe "what" instead of "why".

## Enforcement

- Every `design.md` MUST have a "Constitutional compliance" section verifying each principle.
- Every `tasks.md` MUST include lint, typecheck and build as gate commands.
- Any deviation MUST be documented under "Constitutional violations" in `design.md` with justification.

## Amendment history

| Version | Date | Change | Rationale |
|---------|------|--------|-----------|
| 1.0.0 | 2026-07-02 | Initial version | — |

# Roadmap

> **Path in project:** `.sdd/project/ROADMAP.md`
> **Mutability:** Editable. Updated when features are added, reprioritized or shipped.

## Current focus

- **Now:** `[001-portfolio-core](../features/001-portfolio-core/spec.md)` — Home with infinite carousel, shared-element transition, 3D project template.

## Milestones

### M1 — v1 launchable portfolio
- **Target date:** current cycle
- **Definition of done:**
  - Home renders hero + infinite carousel of vertical project images.
  - Clicking a carousel item runs a shared-element transition into `/projects/[slug]`.
  - Project page scroll-animates a 3D phone (Android/iOS per project) + all template sections.
  - Adding a project = one data entry + assets.
  - Gates pass: lint, typecheck, build; reduced-motion fallbacks in place.
- **Features included:** 001
- **Status:** in progress

### M2 — content & polish
- **Target date:** future
- **Definition of done:** real projects added; SEO/OG images per project; deploy.
- **Features included:** 002+
- **Status:** not started

## Feature pipeline

| ID | Slug | Title | Status | Milestone | Depends on |
|----|------|-------|--------|-----------|------------|
| 001 | portfolio-core | Home, carousel, transition, 3D project template | `done` (2026-07-03, v0.1.0) | M1 | — |
| 002 | seo-og | Per-project metadata + OG images | `draft` | M2 | 001 |
| 003 | deploy | Production deploy (Vercel) | `draft` | M2 | 001 |

## Deferred features

| Original ID | Title | Reason deferred | Revisit when |
|-------------|-------|-----------------|--------------|
| — | Blog / contact form | Out of v1 scope | After M2 |
| — | i18n (pt/en) | Single language for v1 | Owner request |

## Dependency graph

```
001-portfolio-core
      │
  ┌───┴───┐
  ▼       ▼
002-seo  003-deploy
```

## Out of scope (project-wide)

- ❌ CMS/admin panel
- ❌ Backend services
- ❌ Light mode

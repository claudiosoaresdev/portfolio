# Project

> **Path in project:** `.sdd/project/PROJECT.md`
> **Mutability:** Editable but versioned. Major changes to vision should be discussed before edit.

## Metadata

- **Name:** `claudiosoaresdev-portfolio`
- **Owner:** Claudio Soares (claudio.soares.dev@gmail.com)
- **Created:** `2026-07-02`
- **Last updated:** `2026-07-02`
- **Status:** `building`

## Problem statement

Claudio Soares ("claudio soares dev") needs a programming portfolio that proves front-end/mobile craft by *being* the proof: a dark, futuristic site where visitors browse projects in an infinite carousel of vertical images, click through a shared-element page transition, and scroll a project page where a 3D smartphone (Android or iOS, per project) presents the app alongside name, description, features, architecture and store/GitHub links. Recruiters and clients must grasp his skill within seconds of landing.

## Goals

1. `G-001`: Visitor reaches any project's detail page in ≤ 2 interactions from landing.
2. `G-002`: Adding a new project requires only one data entry + assets — zero component/route changes.
3. `G-003`: The site itself demonstrates animation/3D competence with Lighthouse performance ≥ 90.
4. `G-004`: Every project page exposes name, description, features, architecture, GitHub and/or store links.

## Non-goals

- ❌ CMS or admin panel (data lives in the repo).
- ❌ Blog, contact form or backend services in v1.
- ❌ Light mode (dark-only by design).
- ❌ i18n infrastructure in v1 (single language).

## Success metrics

| Metric | Target | Source | Linked to |
|--------|--------|--------|-----------|
| Clicks landing → project detail | ≤ 2 | manual walkthrough | G-001 |
| Files touched to add a project | 1 data file + assets | code review | G-002 |
| Lighthouse performance (home + project) | ≥ 90 | Lighthouse local | G-003 |
| Template fields rendered | 100% of typed fields | manual walkthrough | G-004 |

## Personas

### Persona 1 — Recruiter / potential client
- **Context:** skims many portfolios; desktop and mobile; ~30s attention.
- **Pain:** generic portfolios don't demonstrate real skill.
- **Goal:** judge competence fast; reach GitHub/store links.
- **Technical literacy:** medium.

### Persona 2 — Claudio (maintainer)
- **Context:** adds projects incrementally over time.
- **Pain:** bespoke pages rot; friction kills updates.
- **Goal:** add a project by writing one data file.
- **Technical literacy:** high.

## Constraints

- **Timeline:** working v1 in this development cycle.
- **Technical:** Next.js 16.2.10 (breaking changes — bundled docs are source of truth), Tailwind v4, npm.
- **Brand:** Orbitron (display) + Rajdhani (body); primary `#A9FE00`, secondary `#4E47E3`, bg `#0A0A0A`, contrast `#F2F2F0`/`#C9C7BB`; dark-only.
- **Regulatory:** WCAG 2.2 AA.

## Stakeholders

| Name / role | Involvement | Cadence |
|-------------|-------------|---------|
| Claudio Soares (owner) | Decides scope, adds content | Continuous |

## Background context

Repo starts from a fresh `create-next-app` scaffold (Next 16.2.10, Tailwind v4, TS). Everything else is greenfield.

## Related projects

- Future individual apps showcased *by* this portfolio — each becomes a data entry here.

# Spec — Portfolio core: home carousel, shared-element transition, 3D project template

> **Path in project:** `.sdd/features/001-portfolio-core/spec.md`
> **Mutability:** Editable until `status: tasked`. Changes after `tasked` require a feature reset or an amendment block at the bottom.

## Metadata

- **Feature ID:** `001`
- **Slug:** `portfolio-core`
- **Status:** `done`
- **Created:** `2026-07-02`
- **Last updated:** `2026-07-02`
- **Owner:** Claudio Soares
- **Linked milestone:** M1

## Problem statement

Claudio Soares needs a launchable programming portfolio whose own construction proves his skill. Visitors land on a dark, futuristic home page, browse projects through an infinite horizontal carousel of vertical (portrait) images, and click one to enter its detail page through a shared-element transition (the clicked image morphs into the project page's hero). The project page is a reusable template: as the visitor scrolls, a 3D smartphone (Android or iOS, chosen per project) animates while the template renders the project's name, description, features, architecture, links and extra sections from data. Claudio will add projects incrementally, so adding one must require only a data entry plus assets.

## Goals

1. `G-001`: Visitor reaches any project detail page in ≤ 2 interactions from landing.
2. `G-002`: Adding a project = 1 data entry + assets; zero component/route edits.
3. `G-003`: Transition and 3D scroll animation feel fluid (no visible jank) while Lighthouse performance stays ≥ 90.

## Out of scope

- ❌ Real project content beyond seed/sample entries (M2).
- ❌ SEO/OG image generation per project (feature 002).
- ❌ Deploy pipeline (feature 003).
- ❌ Blog, contact form, CMS, i18n, light mode (project non-goals).
- ❌ Photorealistic licensed 3D phone models — stylized procedural device is acceptable.

## Personas affected

- **Recruiter / client** — judges competence in seconds; must navigate without friction on desktop and mobile.
- **Claudio (maintainer)** — adds projects over time; needs a stable typed template contract.

## User stories

- **US-001:** As a visitor, I want to browse project images in an infinite carousel on the home page, so that I can quickly scan the portfolio.
- **US-002:** As a visitor, I want the clicked project image to morph into the project page (shared-element transition), so that navigation feels continuous and polished.
- **US-003:** As a visitor, I want to scroll a project page where a 3D smartphone and the project's information animate into view, so that I understand the project and can reach its GitHub/store links.
- **US-004:** As the maintainer, I want to add a project by creating one data entry plus assets, so that the portfolio grows without code changes.
- **US-005:** As a visitor with reduced-motion preference or limited hardware, I want a readable, navigable experience without heavy animation, so that content remains accessible.

## Functional requirements (EARS)

### Always-active behavior (Ubiquitous)

- **REQ-001:** THE home page SHALL render the developer identity "claudio soares dev" and a carousel of project cover images.
- **REQ-002:** THE carousel SHALL display project cover images with a vertical (portrait) aspect ratio (9:16).
- **REQ-003:** THE carousel SHALL loop infinitely in both scroll directions with no visible seam at the loop boundary.
- **REQ-004:** THE project detail page SHALL render, from the project's data entry: name, description, features list, architecture section, and available links (GitHub and/or store).
- **REQ-005:** THE project detail page SHALL be a single dynamic route template driven by a typed project registry; THE System SHALL derive all project routes from that registry.
- **REQ-006:** THE site SHALL use Orbitron for display/headings and Rajdhani for body/auxiliary text, loaded via the framework font system.
- **REQ-007:** THE site SHALL apply the dark theme exclusively: background `#0A0A0A`, foreground `#F2F2F0`, muted `#C9C7BB`, primary `#A9FE00`, secondary `#4E47E3`, defined once as design tokens.
- **REQ-008:** THE project data type SHALL include a device field with values `android | ios` selecting the 3D smartphone model rendered on that project's page.
- **REQ-009:** THE carousel items SHALL be keyboard-focusable links with descriptive accessible names.

### Triggered behavior (Event-driven — WHEN)

- **REQ-010:** WHEN a visitor activates a carousel item (click, tap or Enter), THE System SHALL navigate to `/projects/[slug]` using a shared-element transition in which the activated cover image visually morphs into the project page hero image.
- **REQ-011:** WHEN the visitor scrolls the project detail page, THE System SHALL drive an animation timeline that presents the 3D smartphone (rotation/position tied to scroll progress) and reveals the content sections in sequence.
- **REQ-012:** WHEN the project page loads, THE System SHALL display the project's screen media (screenshot) on the 3D smartphone's display surface.
- **REQ-013:** WHEN a visitor navigates back from a project page to home, THE System SHALL return to the carousel with the previously activated item present in view.

### Conditional behavior (State-driven — WHILE)

- **REQ-014:** WHILE the visitor is not interacting with the carousel, THE carousel SHALL auto-scroll slowly and continuously.
- **REQ-015:** WHILE the visitor hovers or drags the carousel, THE carousel SHALL pause auto-scroll and follow the drag input.

### Optional features (WHERE)

- **REQ-016:** WHERE a project data entry omits an optional field (store link, GitHub link, extra sections), THE template SHALL omit the corresponding section without layout breakage.
- **REQ-017:** WHERE a project defines extra info sections (title + rich content), THE template SHALL render them after the architecture section in data order.

### Error handling (Unwanted — IF/THEN)

- **REQ-018:** IF the visitor prefers reduced motion (`prefers-reduced-motion: reduce`), THEN THE System SHALL disable auto-scroll, replace the shared-element morph with a plain crossfade or instant navigation, and replace scroll-driven 3D animation with static presentation.
- **REQ-019:** IF WebGL is unavailable or the 3D scene fails to initialize, THEN THE System SHALL render a static fallback (project screenshot in a device frame) with all content sections intact.
- **REQ-020:** IF a requested project slug does not exist in the registry, THEN THE System SHALL respond with the framework's 404 page.

## Non-functional requirements

- **NFR-001:** THE System SHALL meet WCAG 2.2 AA contrast for all body text (`#F2F2F0`/`#C9C7BB` on `#0A0A0A`).
- **NFR-002:** THE System SHALL achieve Lighthouse performance ≥ 90 on home and one project page (local production build).
- **NFR-003:** THE System SHALL load the 3D rendering code only on project pages, split from the main bundle, without blocking first paint.
- **NFR-004:** THE System SHALL serve all raster images through the framework image component with explicit dimensions.
- **NFR-005:** THE System SHALL pass `npm run lint && npx tsc --noEmit && npm run build` with zero errors.

## Acceptance criteria

### US-001
- [ ] **AC-001-1:** Home shows "claudio soares dev" identity and ≥ 3 seed projects as 9:16 portrait cards in a carousel.
- [ ] **AC-001-2:** Scrolling/dragging the carousel past the last item continues seamlessly into the first (no jump, no blank space).
- [ ] **AC-001-3:** Carousel auto-scrolls when idle; pauses on hover/drag; never auto-scrolls under reduced motion.

### US-002
- [ ] **AC-002-1:** Clicking a card animates the cover image continuously from its card position/size to the project page hero position/size (shared-element morph).
- [ ] **AC-002-2:** Keyboard activation (Enter on focused card) triggers the same navigation.
- [ ] **AC-002-3:** Browser Back returns to home with the clicked card visible in the carousel.

### US-003
- [ ] **AC-003-1:** Project page renders name, description, features, architecture and links from the data entry.
- [ ] **AC-003-2:** Scrolling drives the 3D phone animation (visible rotation/position change bound to scroll progress) and sequential section reveals.
- [ ] **AC-003-3:** Phone model matches the entry's `device` field (Android vs iOS silhouette) and shows the project screenshot on its screen.
- [ ] **AC-003-4:** With WebGL unavailable, the page still shows all sections plus a static device image.

### US-004
- [ ] **AC-004-1:** Adding a new registry entry + images makes the project appear in the carousel and at `/projects/<slug>` with no other code edits.
- [ ] **AC-004-2:** An entry omitting store link and extra sections renders without empty/broken sections.
- [ ] **AC-004-3:** An entry defining ≥ 2 extra sections renders them after the architecture section, in data order.

### Cross-cutting (visual identity)
- [ ] **AC-VIS-1:** Computed styles show Orbitron on h1/display elements and Rajdhani on body text; page background is `#0A0A0A`; primary/secondary tokens resolve to `#A9FE00`/`#4E47E3` (covers REQ-006, REQ-007).

### US-005
- [ ] **AC-005-1:** With `prefers-reduced-motion: reduce`, no auto-scroll, no morph animation, no scroll-driven 3D motion; all content readable.

## Test scenarios

### Scenario: Happy path — browse and enter a project
- **Given** the home page with seed projects
- **When** the visitor clicks the second carousel card
- **Then** the cover image morphs into the project hero and `/projects/<slug>` renders name, description, features, architecture and links
- **Covers:** REQ-001, REQ-002, REQ-010, REQ-004, AC-001-1, AC-002-1, AC-003-1

### Scenario: Infinite loop seam
- **Given** the carousel at its last item
- **When** the visitor keeps dragging forward
- **Then** the first items reappear with no visual jump
- **Covers:** REQ-003, AC-001-2

### Scenario: Scroll-driven 3D
- **Given** a project page for an entry with `device: "android"`
- **When** the visitor scrolls from top to bottom
- **Then** the Android-style phone rotates/moves with scroll progress, screenshot on screen, sections revealing in order
- **Covers:** REQ-011, REQ-012, REQ-008, AC-003-2, AC-003-3

### Scenario: Reduced motion
- **Given** `prefers-reduced-motion: reduce`
- **When** the visitor browses home and enters a project
- **Then** no auto-scroll, plain navigation (no morph), static 3D presentation, all content accessible
- **Covers:** REQ-018, AC-005-1

### Scenario: Missing optional fields
- **Given** a registry entry without store link and without extra sections
- **When** its project page renders
- **Then** those sections are absent and layout is intact
- **Covers:** REQ-016, AC-004-2

### Scenario: Unknown slug
- **Given** no entry with slug `nope`
- **When** the visitor opens `/projects/nope`
- **Then** the 404 page renders
- **Covers:** REQ-020

## Dependencies

- **Depends on:** — (greenfield; scaffold already present)
- **Blocks:** 002-seo-og, 003-deploy
- **External:** Google Fonts availability for Orbitron/Rajdhani via `next/font`.

## Risks and assumptions

| Type | Description | Likelihood | Impact | Mitigation |
|------|-------------|------------|--------|------------|
| Risk | Next 16 shared-element/View Transition API differs from prior knowledge | High | High | P-001: read bundled docs before design; research task R-1 |
| Risk | R3F/three compat with React 19.2 + Next 16 | Medium | High | Verify via Context7/docs in Design; pin known-good versions |
| Risk | Scroll-driven 3D + morph transition hurts performance budget | Medium | Medium | Lazy load, demand rendering, measure with Lighthouse |
| Assumption | Site copy in English (dev-portfolio norm); brand name stays lowercase "claudio soares dev" | — | — | Recorded in clarifications.md; trivial to change copy later |
| Assumption | `device` choice is made by the maintainer per project entry | — | — | clarifications.md Q2 |

## Glossary

- **Cover image** — portrait 9:16 image representing a project in the carousel; same asset morphs into the project hero.
- **Project registry** — typed collection in `src/data/` that is the single source of truth for projects.
- **Shared-element transition** — navigation animation where one element (cover image) persists and morphs between pages.
- **Extra section** — optional data-defined block (title + content) rendered after architecture.

## Open questions

- ❓ Q1: Site copy language? → clarifications.md
- ❓ Q2: Who chooses Android vs iOS? → clarifications.md
- ❓ Q3: Shared-element mechanism (View Transitions vs animation lib)? → Design phase (research)
- ❓ Q4: 3D model source (procedural vs GLTF asset)? → Design phase (research)

## Amendment history

| Date | Section changed | Reason | Reviewed by |
|------|-----------------|--------|-------------|
| 2026-07-03 | REQ-005 (registry TS → `public/projects/projects.json` via fs loader), REQ-014 (auto-scroll condicionado a overflow real dos cards; sem overflow o track fica estático) | Pedido do usuário pós-release: conteúdo editável por JSON + carousel correto com poucos projetos | Claudio (solicitante) |

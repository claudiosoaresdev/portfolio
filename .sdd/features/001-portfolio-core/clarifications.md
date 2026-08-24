# Clarifications — Portfolio core

> **Path in project:** `.sdd/features/001-portfolio-core/clarifications.md`
> **Gate:** Clarify. Session run 2026-07-02 in autonomous mode — user unavailable for live Q&A; recommended answers adopted as recorded assumptions. Any answer below is trivially reversible; user may override later and spec will be amended.

## Q&A log

### Q-001 — Site copy language

- **Dimension:** UX flow
- **Asked:** 2026-07-02
- **Question:** Site copy in English or Portuguese (pt-BR)?
- **Recommended answer:** English — international dev-portfolio norm, widest recruiter reach; user's request was in Portuguese but brand ("claudio soares dev") is language-neutral.
- **User answer:** _assumed (autonomous)_ → English.
- **Spec impact:**
  - Section affected: Risks and assumptions
  - Change applied: assumption recorded; copy strings centralized so switch to pt-BR is a content-only change.

### Q-002 — Who chooses Android vs iOS phone model?

- **Dimension:** Domain model
- **Asked:** 2026-07-02
- **Question:** "smartphone android ou ios a escolha do usuário" — visitor toggle at runtime, or maintainer choice per project entry?
- **Recommended answer:** Maintainer choice per project entry (`device: 'android' | 'ios'` in registry). Projects target specific platforms; per-entry choice matches the template-driven design (REQ-008). A runtime visitor toggle adds state with no informational value.
- **User answer:** _assumed (autonomous)_ → per-project data field.
- **Spec impact:**
  - Section affected: REQ-008
  - Change applied: already written as data field in spec.

### Q-003 — Project data source format

- **Dimension:** Domain model
- **Asked:** 2026-07-02
- **Question:** Typed TS registry, MDX files, or JSON?
- **Recommended answer:** Typed TS registry (`src/data/projects/*.ts` + index). Full type safety for the template contract, no parser dependency, IDE autocomplete when adding projects.
- **User answer:** _assumed (autonomous)_ → TS registry.
- **Spec impact:**
  - Section affected: REQ-005, Glossary ("Project registry")
  - Change applied: consistent with spec as written.

### Q-004 — Seed content

- **Dimension:** Functional scope
- **Asked:** 2026-07-02
- **Question:** Real projects now or placeholder seeds?
- **Recommended answer:** 3–4 placeholder seed projects with generated cover/screenshot assets, demonstrating both `android` and `ios` devices and optional-field omission. Real content is M2.
- **User answer:** _assumed (autonomous)_ → placeholder seeds.
- **Spec impact:**
  - Section affected: AC-001-1, AC-004-2
  - Change applied: consistent with spec as written.

### Q-005 — Carousel orientation

- **Dimension:** UX flow
- **Asked:** 2026-07-02
- **Question:** "carousel infinito com imagens com aspect ratio vertical" — the *images* are vertical; carousel scroll axis?
- **Recommended answer:** Horizontal scroll axis with portrait 9:16 cards (standard showcase pattern; vertical refers to the image aspect, not the scroll direction).
- **User answer:** _assumed (autonomous)_ → horizontal carousel, portrait cards.
- **Spec impact:**
  - Section affected: REQ-002, REQ-003
  - Change applied: consistent with spec as written.

## Resolved placeholders

| Placeholder location | Original | Resolved value |
|----------------------|----------|----------------|
| Q3 (spec open questions) | shared-element mechanism TBD | deferred to Design research R-1 (technical, not product, decision) |
| Q4 (spec open questions) | 3D model source TBD | deferred to Design research R-2 (technical, not product, decision) |

## Gate result

- **Status:** passed (with recorded autonomous assumptions Q-001…Q-005)
- **Spec status after gate:** `clarified`
- **Outstanding questions:** none blocking — Q3/Q4 are design-phase technical decisions, not spec ambiguities.
- **Recorded in STATE.md:** yes — Technical decisions 2026-07-02.

# Checklist — Portfolio core

> **Path in project:** `.sdd/features/001-portfolio-core/checklist.md`
> **Gate:** Checklist. Run 2026-07-03, after Design, before Tasks.

## Requirement quality checklist

| ID | EARS pattern correct? | SHALL? | System named? | Verifiable? | No vague words? | Has AC? | Result |
|----|----|----|----|----|----|----|----|
| REQ-001 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-001-1 | Pass |
| REQ-002 | ✅ Ubiquitous | ✅ | ✅ | ✅ (9:16) | ✅ | ✅ AC-001-1 | Pass |
| REQ-003 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ⚠️ "no visible seam" → operationalized by AC-001-2 (no jump/blank) | ✅ AC-001-2 | Pass |
| REQ-004 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-003-1 | Pass |
| REQ-005 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-004-1 | Pass |
| REQ-006 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-VIS-1 (added at gate) | Pass |
| REQ-007 | ✅ Ubiquitous | ✅ | ✅ | ✅ (hex values) | ✅ | ✅ AC-VIS-1 (added at gate) | Pass |
| REQ-008 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-003-3 | Pass |
| REQ-009 | ✅ Ubiquitous | ✅ | ✅ | ✅ | ✅ | ✅ AC-002-2 | Pass |
| REQ-010 | ✅ Event-driven | ✅ | ✅ | ✅ | ✅ | ✅ AC-002-1/2 | Pass |
| REQ-011 | ✅ Event-driven | ✅ | ✅ | ✅ | ✅ | ✅ AC-003-2 | Pass |
| REQ-012 | ✅ Event-driven | ✅ | ✅ | ✅ | ✅ | ✅ AC-003-3 | Pass |
| REQ-013 | ✅ Event-driven | ✅ | ✅ | ✅ | ✅ | ✅ AC-002-3 | Pass |
| REQ-014 | ✅ State-driven | ✅ | ✅ | ⚠️ "slowly" → quantified in design (AutoScroll speed ≈ 1px/frame) | ⚠️ accepted | ✅ AC-001-3 | Pass (design quantifies) |
| REQ-015 | ✅ State-driven | ✅ | ✅ | ✅ | ✅ | ✅ AC-001-3 | Pass |
| REQ-016 | ✅ WHERE | ✅ | ✅ | ✅ | ✅ | ✅ AC-004-2 | Pass |
| REQ-017 | ✅ WHERE | ✅ | ✅ | ✅ | ✅ | ✅ AC-004-3 (added at gate) | Pass |
| REQ-018 | ✅ IF/THEN | ✅ | ✅ | ✅ | ✅ | ✅ AC-005-1 | Pass |
| REQ-019 | ✅ IF/THEN | ✅ | ✅ | ✅ | ✅ | ✅ AC-003-4 | Pass |
| REQ-020 | ✅ IF/THEN | ✅ | ✅ | ✅ | ✅ | ✅ scenario "Unknown slug" | Pass |

## Completeness checklist

- [x] Every user story has ≥ 2 acceptance criteria (US-005 has 1 broad AC — accepted: single-behavior story)
- [x] Every AC verifiable as written
- [x] Every requirement covered by ≥ 1 AC (fixed at gate: AC-004-3, AC-VIS-1 added)
- [x] Every AC references its requirement (via US grouping + covers notes)
- [x] Out of scope non-empty
- [x] Glossary defines domain terms (cover image, registry, shared-element, extra section)
- [x] No `<…>` placeholders left
- [x] No `[NEEDS CLARIFICATION]` markers (Q3/Q4 resolved in Design)
- [x] Risks/assumptions declared
- [x] Dependencies mapped

## Consistency checklist

- [x] No contradictions between requirements
- [x] No requirement contradicts Constitution (checked P-001…P-008)
- [x] No requirement contradicts PROJECT.md out-of-scope
- [x] Glossary terms used consistently
- [x] Status `clarified` matches (Clarify ran 2026-07-02)

## Design quality checklist

- [x] Every design component covers ≥ 1 REQ (each has "Covers" line)
- [x] Every REQ covered by ≥ 1 component
- [x] API endpoints: N/A (no API surface)
- [x] Every failure mode maps to IF/THEN REQ (F-001→019, F-002→010-fallback, F-003→018, F-004→020, F-005→019)
- [x] Constitutional compliance table filled, zero violations
- [x] KV Chain results in research.md for all decisions (R-001…R-003)
- [x] Security section non-empty
- [x] Observability: explicitly none-with-rationale (static site, no analytics per PROJECT.md)

## NFR concreteness checklist

- [x] NFR-001: WCAG 2.2 AA — measurable (contrast ratios); source: axe/manual; window: per page
- [x] NFR-002: Lighthouse ≥ 90 — numeric; source: Lighthouse on `next build`+`start`; window: home + 1 project page
- [x] NFR-003: 3D chunk split — verifiable via network panel / build output
- [x] NFR-004: next/image usage — verifiable by code review
- [x] NFR-005: gate command — binary pass/fail

## Test scenario coverage

- [x] Happy path per US: US-001/002/003 (scenario 1, 3), US-004 (missing-fields scenario), US-005 (reduced motion)
- [x] Error scenario per IF/THEN: REQ-018 ✓, REQ-019 (AC-003-4) ✓, REQ-020 ✓
- [x] Edge cases: loop seam, missing optional fields

## Gate result

- **Status:** `passed`
- **Items fixed at gate:** AC-004-3 and AC-VIS-1 added to spec.md (REQ-017, REQ-006/007 coverage)
- **Decision:** advance to Tasks
- **Recorded in STATE.md:** yes — 2026-07-03

# Analyze — Portfolio core

> **Path in project:** `.sdd/features/001-portfolio-core/analyze.md`
> **Gate:** Analyze. Run 2026-07-03, after Tasks, before Execute. Read-only cross-artifact analysis by orchestrator (constitution + spec + design + tasks in context simultaneously).

## Inputs read

constitution.md v1.0.0 · spec.md (tasked) · design.md · tasks.md · clarifications.md · research.md · checklist.md

## Analysis dimensions

### 1. REQ → implementation tasks
Full matrix lives in tasks.md ("Traceability matrix"). Verified row-by-row: all 20 REQs + 5 NFRs have ≥1 implementing task. **No gaps.**

### 2. REQ → test tasks
No automated test tasks — **accepted deviation**, recorded in STATE.md (2026-07-02: no test runner in v1) and tasks.md Conventions. Verification path per REQ = T-014 (gates) + T-015 (browser AC walkthrough). All REQs appear in the "Verified by" column.

### 3. Design components → tasks
| Component | Task | Status |
|---|---|---|
| next.config / canary types | T-002 | ✅ |
| RootLayout, globals, MotionProvider, header/footer | T-003 | ✅ |
| Project model + registry | T-004 | ✅ |
| Seed assets | T-005 | ✅ |
| Hero, TextReveal, Reveal | T-006 | ✅ |
| ProjectCarousel | T-007 | ✅ |
| Home page | T-008 | ✅ |
| ProjectPage, ProjectHero, sections, not-found | T-009 | ✅ |
| StaticDeviceFallback, DeviceCanvas | T-010 | ✅ |
| DeviceScene, PhoneModel | T-011 | ✅ |
| DeviceShowcase | T-012 | ✅ |
**No orphan components; no orphan tasks.**

### 4. AC → tasks
All ACs route through T-015 walkthrough; implementing tasks per AC via matrix. AC-VIS-1 (added at Checklist) → T-003 + T-015. **No gaps.**

### 5. Constitutional compliance
| Principle | Design | Task risk |
|---|---|---|
| P-001 docs-first | ✅ | T-011/T-012 use researched-but-unbuilt patterns — mitigated: exact snippets in research.md |
| P-002 RSC leaves | ✅ | T-012 must not lift `'use client'` into page.tsx — task Where constrains to slot only |
| P-003 tokens | ✅ | pinned contract in tasks.md Conventions |
| P-004 template | ✅ | T-004/T-009 |
| P-005/P-006/P-007 | ✅ | T-013 audit + T-015 |
| P-008 pinned deps | ✅ | T-002 exact versions |

### 6. Duplications
None material. (REQ-014/015 pair intentionally split state-driven behaviors.)

### 7. Ambiguities still alive
None blocking. "slowly" (REQ-014) quantified in design/T-007 (`speed≈1`).

### 8. Under-specification
- T-013 "contrast spot-check" is manual — acceptable (AA values pre-computed in design; axe optional).
- T-005↔T-004 asset extension coupling — specified mitigation (MANIFEST + orchestrator reconciliation at Phase 1 end). Watch item, not a gap.

### 9. Inconsistencies
- ~~tasks.md Conventions said AC walkthrough = T-016 (actual: T-015)~~ — **fixed during this gate**.
- spec.md status bumped `clarified` → `tasked` to match reality.
- None remaining between spec/design/tasks.

### 10. Risk hotspots
- **T-011/T-012 integration** (MotionValue → invalidate bridge in demand mode): highest technical risk. Mitigation: exact pattern from R-002.4/6; fallback = `frameloop="always"` temporarily (perf cost, recorded if used).
- **VT experimental flag** behavior in dev vs prod: verify in both during T-015.
- **Parallel batch Phase 2+3** (5 agents): file-overlap check re-run at dispatch — declared Where sets are disjoint ✅.
- **qlmanage rasterization** may fail silently → T-005 explicitly allows SVG fallback path.

## Findings summary

| Severity | Count | Examples |
|----------|-------|----------|
| 🔴 Critical | 0 | — |
| 🟠 High | 0 | — |
| 🟡 Medium | 2 | asset-ext coupling (mitigated), manual contrast check |
| 🟢 Low | 1 | T-016 naming fixed in-gate |

## Recommendations

1. At Phase 1 end, orchestrator reconciles asset extensions between MANIFEST.txt and `projects.ts` before dispatching Phase 2+3.
2. T-015 must test VT morph in a production build too (`next build && next start`), not only dev.

## Gate result

- **Status:** `passed`
- **Critical issues:** 0
- **Decision:** advance to Execute
- **Recorded in STATE.md:** yes — 2026-07-03

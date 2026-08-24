# Execution Plan — Portfolio core

> **Path in project:** `.sdd/features/001-portfolio-core/execution-plan.md`
> **Prerequisites:** tasks.md complete ✅, Analyze passed ✅ (0 critical).

## Phase timeline

| Session | Phase | Tasks | Type |
|---------|-------|-------|------|
| S1 | Setup | T-001, T-002 | orchestrator, sequential |
| S2 | Foundation | T-003, T-004, T-005 | 3 parallel sub-agents → asset-ext reconciliation |
| S3 | Home + Template | T-006, T-007, T-009, T-010, T-011 | 5 parallel sub-agents → T-008, T-012 sequential |
| S4 | Integration | T-013 → T-014 → T-015 | sequential (audit, gate, browser walkthrough) |
| S5 | Document | T-016 | changelog skill + final report |

Executed in one continuous run (autonomous session); phase boundaries = verification checkpoints (fast gate per batch, full build at S2/S3/S4 ends) + STATE.md updates.

## Sub-agent delegation map

| Task | Sub-agent | Context passed | Expected output |
|------|-----------|----------------|-----------------|
| T-001/T-002 | No (orchestrator) | — | branch + deps + config |
| T-003..T-012 | Yes, one per task | task def verbatim + pinned contracts + relevant research.md snippets + constitution excerpts + design-quality brief | files + structured return (template below) |
| T-013..T-015 | orchestrator (+browser tools) | — | audit fixes, gate log, AC results |
| T-016 | orchestrator + changelog skill | — | CHANGELOG.md, commits |

## Execution risk register

| Risk | Mitigation |
|------|------------|
| Sub-agent adds unpinned dep | prompts forbid new deps; orchestrator diffs package.json after each batch |
| Parallel file conflict | disjoint Where sets verified (Analyze §10); re-checked at dispatch |
| MotionValue→invalidate bridge fails | fallback `frameloop="always"` + record in STATE |
| Dev-server lockfile blocks build | kill dev server before `npm run build` |
| qlmanage raster fails | SVG fallback path (T-005) |

## Sub-agent return template

```
## Task T-NNN — return
**Status:** Complete | Blocked | Partial
**Files changed:** <list (created/modified)>
**Gate check:** lint → ? · tsc → ?
**SPEC_DEVIATION markers:** none | <list>
**Technical decisions:** <list>
**Issues:** none | <list>
```

## Session completion checklist (per phase)

- tasks.md statuses updated · gate green · sub-agent returns archived in execution-log.md · STATE.md updated

## End-of-feature checklist

- all tasks ✅ · full gate green · traceability 100% · Document phase run · ROADMAP/spec status → done · lessons promoted to STATE.md

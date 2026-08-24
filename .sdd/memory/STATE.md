# STATE — `claudiosoaresdev-portfolio`

> **Path in project:** `.sdd/memory/STATE.md`
> **Read:** at session start. **Updated:** at every phase boundary and on demand.

---
projeto: claudiosoaresdev-portfolio
ultima_sessao: 2026-07-03
fase_atual: idle (feature 001 done)
feature_atual: none
---

## Technical decisions

- **2026-07-03** — `[feature 001]` Dados dos projetos movidos para `public/projects/projects.json` (pedido do usuário); loader fs em `src/data/projects.ts` (cache só em produção — dev relê a cada chamada). Páginas continuam SSG → editar JSON em produção requer `npm run build`. Spec REQ-005 amendado (registry TS → JSON).
- **2026-07-03** — `[feature 001]` Carousel: duplicação de slides removida; `active`/`loop`/AutoScroll condicionados a overflow real (soma das larguras dos cards vs viewport, ResizeObserver + rAF). N=1 → 1 card estático centrado. Verificado via CDP: 1440px parado/centrado, 768px rolando, 1 projeto → 1 card parado.

- **2026-07-03** — `[feature 001]` three 0.185.1 → 0.182.0: fiber 9.6.1 instancia `THREE.Clock` internamente e r183+ emite deprecation warning no console ("use THREE.Timer"); fix upstream só em fiber v10 canary (instável, proibido pela constituição). 0.182 = última sem warning; peers ok (fiber ≥0.156, drei ≥0.159). Trade-off: 3 minors atrás. Revisitar quando fiber 10 estável sair.

- **2026-07-03** — `[feature 001]` Shared-element = View Transitions API (`experimental.viewTransition` + React `ViewTransition`); motion layoutId rejected (can't cross App Router routes). Source: KV step 2 (bundled docs) + step 3/4. Trade-off: experimental flag; graceful native fallback.
- **2026-07-03** — `[feature 001]` Deps pinned: motion@12.42.2, embla-carousel-react@8.6.0, embla-carousel-auto-scroll@8.6.0, three@0.185.1, @react-three/fiber@9.6.1, @react-three/drei@10.7.7. Peer-verified vs React 19.2.4. Trade-off: fiber caps react <19.3 — don't bump React without re-check.
- **2026-07-03** — `[feature 001]` Phone model procedural (drei RoundedBox + screenshot texture), no GLTF assets. Trade-off: stylized not photoreal — accepted per spec out-of-scope.
- **2026-07-03** — `[feature 001]` Next 16 breaking changes absorbed: async `params` everywhere, `transpilePackages: ['three','@react-three/drei']`, `ssr:false` only inside client wrapper, react/canary types reference for ViewTransition.
- **2026-07-02** — `[feature 001]` Constitution v1.0.0 ratified: Next 16.2.10 App Router + Tailwind v4 + npm; bundled docs are framework source of truth (P-001); dark-only token palette (P-003); data-driven project template (P-004).
- **2026-07-02** — `[feature 001]` No test runner in v1; quality gate = `npm run lint && npx tsc --noEmit && npm run build`. Trade-off: no automated regression net; acceptable for visual portfolio v1.

## Active blockers

- (none)

## Resolved blockers

- (none)

## Lessons learned

- **2026-07-03** — motion 12 acelera `useTransform(scrollYProgress, ...)` via ScrollTimeline/WAAPI: se o input range não terminar em 1, a spec WAAPI insere keyframe final implícito com o VALOR BASE do elemento (inline style) → valor "volta" perto do fim da seção. Regra: ranges de scroll sempre cobrem [0, 1] com endpoints explícitos. Diagnóstico via CDP `getAnimations()` (inline style dizia opacity:1 enquanto computed era 0.64).

- **2026-07-03** — Next 16 ships stricter react-hooks lint rules (`set-state-in-effect`, `immutability`): browser-capability probes → `useSyncExternalStore`; loader-return mutations (e.g. texture.colorSpace) → loader onLoad callbacks.
- **2026-07-03** — Next 16 `next/image` deprecates `priority` in favor of `preload`.
- **2026-07-03** — `dynamic({ssr:false})` loading component receives no instance props → pass display props via React Context when the loading state must mirror the real component.
- **2026-07-03** — embla `loop:true` silently fails when track ≤ viewport width; with few slides render the list twice (View Transition names must stay unique — only first copy gets `<ViewTransition>`).
- **2026-07-03** — qlmanage renders SVG on a square canvas (crops); rasterize via square safe-column + `sips -c` center-crop.

## Pending todos

- [ ] Offer caveman statusline setup (plugin suggests `statusLine` entry in `~/.claude/settings.json`).

## Deferred ideas

- **2026-07-02** — Blog/contact/i18n/CMS. Deferred from feature 001 because v1 is showcase-only. Revisit when M1 ships.

## Pending uncertainties

- (none)

## Missing skills

- ⚠️ `tdd-workflow` / `aaa-testing` — referenced for Execute phase; not installed. Notified user on 2026-07-02. Impact: v1 has no test runner anyway (see Technical decisions).
- ⚠️ `codenavi` — referenced for Map phase; not installed. Not needed (greenfield).

## User preferences

- Communication: caveman mode (terse), pt-BR user.
- Autonomous execution preferred; decisions recorded here + clarifications.md.

## Session history

- **2026-07-03** — Session 1 (cont.): full pipeline executed — Specify→Clarify→Design (3 research agents)→Checklist→Tasks→Analyze→Execute (7 impl agents, T-001..T-015)→Document. Feature 001 DONE, release 0.1.0. Gates: lint/tsc/build ✅; Lighthouse home 99/100 a11y 100, project 100/100 a11y 100. Document phase: CHANGELOG ✅; wiki-obsidian note deferred (writing to personal vault autonomously not assumed — user may request).
- **2026-07-02** — Session 1: Constitution + PROJECT + ROADMAP created; feature 001 spec started.

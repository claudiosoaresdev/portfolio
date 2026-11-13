# Device Models Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 3D phone and MacBook read as real objects: code-built environment lighting with a pointer-reactive reflection, glass on screens, and more physical detail.

**Architecture:** A `StudioLighting` component renders a drei `Environment` (frames=1, Lightformers only) and, in `useFrame`, eases `scene.environmentRotation` toward the pointer — the baked env map rotates without re-rendering it. Models switch body materials to `meshPhysicalMaterial` and gain detail meshes; keys become one `instancedMesh`.

**Tech Stack:** three 0.182.0, @react-three/fiber 9.6.1, @react-three/drei 10.7.7 (`Environment`, `Lightformer`), motion 12.

**Spec:** `docs/superpowers/specs/2026-11-13-device-models-polish-design.md`

## Global Constraints

- No new deps or assets; versions unchanged. Scene stays `frameloop="demand"`.
- Screenshots stay true-color and readable (unlit `meshBasicMaterial`, `toneMapped={false}`); glass layer opacity ≤ 0.15.
- Pointer reaction only on `(hover: hover)` and not under reduced motion; ±0.4 rad max, damped.
- Quality gate per task: `npm run lint && npx tsc --noEmit && npm run build`. Commits pt-BR Conventional + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Pointer idle** → scene stops invalidating once eased (no perpetual render loop) — Task 1 step 3.
2. **Touch / reduced motion** → no pointer listener effect; env rotation fixed — Task 1 step 3.
3. **Screens washed out** by reflections/glass → screenshot contrast unchanged vs before — Task 2 step 4.
4. **android/ios pages** regress (phone shape/camera z) — Task 2 step 4.
5. **Static → 3D fade** still matches (models' bounding size unchanged ±5%) — Task 3 step 3.

---

### Task 1: Studio lighting + pointer reaction

**Files:** Create `src/components/project/studio-lighting.tsx`; modify `src/components/project/device-scene.tsx` (replace the directional/ambient lights block).

**Interfaces:** Produces `StudioLighting({ reactive: boolean })` — rendered inside `<Canvas>`.

- [ ] **Step 1:** `StudioLighting`: `<Environment frames={1} resolution={256}>` with Lightformers: large soft white rect key (top-front-right, intensity ~2), white strip rim (left), lime strip rim (right-back, `LIME`, intensity ~1.5), dim indigo fill (`INDIGO`). Keep one weak `ambientLight` (0.15) and the existing key `directionalLight` at reduced intensity for screen-independent shading.
- [ ] **Step 2:** Pointer: `reactive` = `(hover: hover)` && !reduced motion (read via `useSyncExternalStore` or motion `useReducedMotion`, passed from `DeviceScene`). Track `pointermove` on `window` into a ref (normalized −1..1). In `useFrame`, damp `scene.environmentRotation.y/x` toward `pointer * 0.4` (`THREE.MathUtils.damp`, λ≈4); call `invalidate()` only while |delta| > 1e-3; on pointermove call `invalidate()`.
- [ ] **Step 3: Verify** (dev, 1024, lumen-commerce): edges/bodies visibly lit; moving the mouse slides highlights. Idle check: in the page, wrap `window.requestAnimationFrame` with a counter, wait 1s after the last pointer move, then count over 2s. Expected: ~0 calls (no perpetual loop). 375 mobile preset: highlights don't react to pointer.
- [ ] **Step 4:** Gate; commit `feat(project): estúdio de luz com reflexo que segue o mouse`.

### Task 2: Phone + glass + materials

**Files:** Modify `src/components/project/device-scene.tsx` (`PhoneModel`); create `src/components/project/screen-glass.tsx`.

**Interfaces:** Produces `ScreenGlass({ width: number; height: number; position: [number,number,number]; radius?: number })` — physical transparent plane (opacity 0.08–0.15, clearcoat 1, roughness 0.05, metalness 0, `depthWrite={false}`).

- [ ] **Step 1:** Body `meshPhysicalMaterial` (metalness 0.85, roughness 0.3, clearcoat 0.4, envMapIntensity ~1.2). Keep `RoundedBox` 2.2×4.6×0.28.
- [ ] **Step 2:** Details: frame band (slightly larger, thinner RoundedBox, lighter metal) behind body edges; side buttons (volume ×2 + power, small RoundedBoxes on ±x edges); rear camera module (iOS: square 2–3 lenses top-left; Android: horizontal bar) on −z face with dark glass lenses + metal rings; keep lime edge strip and front-camera differentiator.
- [ ] **Step 3:** `ScreenGlass` over the screen plane (+0.002 z).
- [ ] **Step 4: Verify:** nebula-wallet (android) + aurora-fit (ios) + pulse-health: phone silhouette same size; buttons/camera visible when rotated; screenshot contrast equal to before (side-by-side zoom screenshots). Gate; commit `feat(project): celular 3D com botões, câmera traseira e vidro`.

### Task 3: MacBook details

**Files:** Modify `src/components/project/laptop-model.tsx`.

- [ ] **Step 1:** Keys → one `instancedMesh` of `RoundedBox`-like boxes (`boxGeometry` keyW×0.03×keyD) in a recessed keyboard well (darker plane 0.005 below deck); single material (dark, roughness 0.6).
- [ ] **Step 2:** Hinge cylinder along back edge; lid-open notch (small dark box) at base front center; speaker grilles (two dotted strips via a small instancedMesh of tiny circles, or two dark perforated-looking planes) either side of keyboard; notch at top of screen bezel; physical body material matching the phone; `ScreenGlass` on the lid screen.
- [ ] **Step 3: Verify:** lumen-commerce at 1024/1440/375: deck and keys readable, hinge visible at rotation extremes; static vs 3D size still within ~5% (re-measure as in last fix). Gate; commit `feat(project): MacBook 3D com teclado em relevo, dobradiça e detalhes`.

### Task 4: Docs + review

- [ ] **Step 1:** CHANGELOG `[Unreleased]` → `Changed` item on top; STATE.md decision line.
- [ ] **Step 2:** Final review subagent on `bad97dc..HEAD`; fix Critical/Important; report rulings + deferred minors.

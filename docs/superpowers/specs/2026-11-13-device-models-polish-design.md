# Device models polish — short design

Date: 2026-11-13 · Branch: `feat/web-project-showcase` (continuation)

**Intent.** The 3D phone and MacBook read as black silhouettes: metallic
materials with nothing to reflect. Claudio wants richer, more "sensitive"
lighting (A: realistic reflections, B: reacting to the visitor) and more
detailed shapes, keeping the dark HUD + lime look.

**Approaches.** (1, chosen) evolve the procedural models + code-built light
studio; (2) GLTF models — +2–6 MB, licensing, two phone models, harder to
recolor; (3) 1 + PBR texture maps — little visible gain at display size, adds
assets.

**Goals**
- Bodies visible: edges/chamfers catch highlights from an environment built in
  code (drei `Environment` + `Lightformer`, no HDR download), one lime
  lightformer for the brand rim.
- Glass: thin glossy layer over each screen (subtle reflection; screenshot stays
  true-color and readable).
- Reactive light: light rig follows the pointer (smoothed) on hover devices;
  scroll keeps rotating devices; touch = scroll only. Reduced motion: no pointer
  reaction.
- Phone details: side buttons, rear camera module, chamfered frame band.
- MacBook details: keys with relief as one `instancedMesh`, hinge cylinder,
  notch, lid-open notch on the base front, speaker grilles.
- Applies to all types (android/ios phones too).

**Non-goals / anti-goals**
- No new assets or dependencies; three/fiber/drei versions unchanged.
- Screenshot must not be washed out by reflections (anti-goal).
- No noticeable cost to interactivity: scene stays `frameloop="demand"`;
  pointer only invalidates while moving/easing.

**Builder's calls (mine, open to change)**
- Environment rendered once (`frames={1}`), `resolution` 256, background off.
- Screen glass = `meshPhysicalMaterial` transparent, low opacity, high
  clearcoat, placed 1–2 mm above the screen plane.
- Pointer tracked on `window` (canvas sits under text overlays), mapped to a
  small rotation of the lightformer group (±~0.4 rad), damped.
- Body materials: `meshPhysicalMaterial` metalness ~0.85, roughness ~0.3,
  `envMapIntensity` tuned so bodies read but stay darker than the screens.

**Verification.** Quality gate; browser at 1024 and 375: bodies/edges visible,
screens readable, highlights move with pointer, phone-only pages still fine;
console clean.

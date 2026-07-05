---
title: latere-ui v1.10 — Liquid Glass material system (shared design foundation)
status: draft
depends_on:
  - specs/console-shell-v1.9.md
affects:
  - src/styles/glass.css (new — material primitives, tiers, specular edge, reduce-transparency fallback)
  - src/styles/tokens.css (glass material tokens + dark variants)
  - src/styles/console.css (ConsoleSidebar renders as a glass chrome layer)
  - src/styles/footer.css (footer adopts glass surface)
  - src/styles/brand.css (vibrancy-aware wordmark gradients)
  - src/index.ts (no code export; docs pointer only)
  - package.json (bump to 1.10.0; add "./glass": "./src/styles/glass.css" export)
  - README.md (Liquid Glass section — tokens, tiers, usage, fallback contract)
  - tests/glass.test.ts (new — token presence, tier vars, fallback selector)
effort: large
trigger: platform-wide UI refresh to Apple Liquid Glass; the shared chrome (ConsoleSidebar, footer, wordmarks) must render as glass so every product console is coherent, not glass panes wrapped around flat shared chrome
created: 2026-07-05
updated: 2026-07-05
author: changkun
dispatched_task_id: null
---

# latere-ui v1.10 — Liquid Glass Material System

## Overview

Apple's Liquid Glass is a **material**, not a color scheme: translucent
layers that refract and blur what sits behind them, carry a specular edge,
and shift saturation (vibrancy) so foreground text stays legible over live
content. A platform-wide refresh cannot be delivered per-product in isolation
— the console sidebar, footer, and product wordmarks all ship from `latere-ui`
and are consumed by every product (cella, lux, wallfacer, auth, ...). If only a
product's local panes turn to glass, the shared chrome stays flat and the
result is incoherent.

This spec establishes the **shared material foundation** in `latere-ui`: a
tokenised glass system plus reusable primitives, and it converts the shared
chrome (ConsoleSidebar, footer) to consume it. Products adopt the material by
redefining a small set of canvas/base tokens; the shared components then render
as glass automatically because they already style via `var(--…)` with
fallbacks (established in v1.9).

Non-goal: this spec does **not** repalette any product. Each product owns its
own accent/canvas (cella spec covers cella's neutral-glass palette). This spec
owns the *material* — the translucency, blur, edge, and vibrancy contract — and
the shared chrome that must speak it.

## Design principles (the material contract)

1. **Glass needs a canvas to refract.** A frosted layer over a flat fill reads
   as dead gray. The material assumes the product provides a subtly
   gradient/colored base canvas behind glass layers. This spec defines the
   *tokens* for that canvas; products set the values.
2. **Glass is chrome, never content.** `backdrop-filter: blur()` over live
   xterm / noVNC / video streams tanks performance and legibility. The material
   is for chrome: sidebars, top strips, dialogs, popovers, command palettes,
   footers. Content surfaces stay opaque. This is a documented constraint, not
   just guidance.
3. **Tiers, not one blur.** Three material tiers so depth reads correctly:
   `--glass-thin` (inline controls, chips), `--glass-regular` (chrome panels,
   sidebar, footer), `--glass-thick` (modal/overlay scrims, command palette).
   Each tier is a bundle of blur radius, background tint, saturation, and edge.
4. **Specular edge.** Glass has a bright top/left inner edge and a soft outer
   shadow — a single `--glass-edge` inset shadow token layers hairline highlight
   over drop shadow so panels read as lifted glass, not flat cards.
5. **Vibrancy.** `backdrop-filter: saturate()` boosts color behind the layer so
   tinted content shows through; text uses the existing `--text*` ramp
   unchanged so contrast is preserved.
6. **Adaptive.** Every token has a `[data-theme="dark"]` variant — dark glass is
   a darker tint with lower blur and a subtler edge.
7. **Accessible fallback is part of the material.** Under
   `prefers-reduced-transparency: reduce` (and as a `@supports not
   (backdrop-filter: blur())` fallback) glass tokens collapse to **opaque**
   surfaces built from `--bg-surface`/`--bg-raised`. Legibility and a11y win
   over aesthetics; mirror the existing `prefers-reduced-motion` handling.

## Deliverables

### 1. `src/styles/glass.css` (new) — primitives + fallback

Opt-in entrypoint `import 'latere-ui/glass'`. Defines:

- Utility classes `.lu-glass`, `.lu-glass-thin`, `.lu-glass-thick` that apply a
  tier's `background`, `backdrop-filter` (`blur() saturate()`), `border`, and
  `box-shadow` (`--glass-edge`). `-webkit-backdrop-filter` paired for Safari.
- The specular-edge inset-shadow recipe as `--glass-edge` (highlight + shadow).
- The **fallback block**: one `@media (prefers-reduced-transparency: reduce)`
  and one `@supports not (backdrop-filter: blur(1px))` that both redefine the
  glass tokens to opaque `--bg-surface`/`--bg-raised` with `backdrop-filter:
  none`. Everything downstream (shared + product) inherits the fallback for free
  because it consumes the tokens.

### 2. `src/styles/tokens.css` — glass material tokens

Add to `:root` (light) and `[data-theme="dark"]`, all with safe literal
fallbacks so token-less apps degrade to opaque:

```
--glass-blur, --glass-blur-thin, --glass-blur-thick
--glass-saturate
--glass-bg, --glass-bg-thin, --glass-bg-thick      (translucent rgba tints)
--glass-border                                      (hairline, brighter than --border)
--glass-highlight                                   (specular top-edge color)
--glass-edge                                        (composed inset+drop shadow)
--canvas, --canvas-gradient                         (base the product fills behind glass)
```

### 3. `src/styles/console.css` — glass ConsoleSidebar

The `.lu-cs` rail becomes a `--glass-regular` layer: translucent `--glass-bg`,
`backdrop-filter`, `--glass-border` right edge, `--glass-edge` shadow. Active
row and account dropdown adopt `--glass-thin`. No structural change; purely the
surface. Falls back to opaque via the token contract.

### 4. `src/styles/footer.css` — glass footer

Footer surface adopts `--glass-regular` when it sits over content; keep the
opaque path for the marketing page where it's the page base.

### 5. `src/styles/brand.css` — vibrancy-aware wordmarks

Wordmark gradients are unchanged in hue but documented to sit on glass; no
token change required (they're `-webkit-text-fill: transparent` over gradient).
Verify they remain legible over `--glass-regular` in both themes.

### 6. `package.json` / `README.md` / tests

- Bump to `1.10.0`; add `"./glass": "./src/styles/glass.css"` export.
- README: Liquid Glass section — the tier table, the three principles a
  consumer must honor (canvas behind glass, chrome-not-content, fallback is
  automatic), and a copy-paste "adopt in your product" snippet.
- `tests/glass.test.ts`: assert glass tokens are declared for both themes, the
  three tier classes exist, and the reduced-transparency fallback selector is
  present in `glass.css` (guards the a11y contract from silent regression).

## Acceptance criteria

- [ ] `import 'latere-ui/glass'` + setting `--canvas`/`--glass-bg` yields a
      frosted, blurred sidebar & footer over a gradient canvas in a demo, in
      both light and dark.
- [ ] With `prefers-reduced-transparency: reduce` forced, every glass surface is
      fully opaque and text contrast is unchanged (no `backdrop-filter` active).
- [ ] Token-less consumer (no glass tokens defined) degrades to opaque chrome,
      not a broken transparent one (literal fallbacks hold).
- [ ] `vitest` green (existing 125 + new glass tests); `vue-tsc` clean.
- [ ] No product repo referenced from this package (shared-package hygiene).

## Rollout

1. Build + release `latere-ui@1.10.0` (this spec).
2. cella adopts (sandbox `liquid-glass-refresh` spec) — bumps the pinned
   `latere-ui#v1.10.0` and sets its canvas/glass tokens + neutral palette.
3. lux / wallfacer / auth adopt on their own cadence by defining canvas tokens;
   until they do, they render opaque (fallback), so the release is non-breaking.

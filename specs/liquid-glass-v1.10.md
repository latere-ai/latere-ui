---
title: latere-ui v1.10 — Liquid Glass design system (material tokens + component library)
status: complete
depends_on:
  - specs/console-shell-v1.9.md
affects:
  - src/styles/glass.css (new — material tokens usage, tier utility classes, specular edge, reduce-transparency fallback)
  - src/styles/tokens.css (glass material tokens + canvas tokens; dark variants)
  - src/glass/useGlass.ts (new — headless composable: resolve tier + reduced-transparency state)
  - src/glass/overlay.ts (new — shared focus trap + ESC/scrim + teleport/stacking for overlays)
  - src/glass/message.ts (new — imperative toast/message service backing GlassToast)
  - src/components/glass/*.vue (new — the component library: surfaces, controls, inputs, feedback, overlays; see Layer 2 catalog)
  - src/components/ConsoleSidebar.vue (adopt GlassSurface material; no API change)
  - src/components/SiteFooter.vue (adopt glass surface when over content)
  - src/styles/console.css (sidebar glass surface via tokens)
  - src/styles/footer.css (footer glass surface via tokens)
  - src/index.ts (export all Glass* components + useGlass)
  - package.json (bump to 1.10.0; add "./glass" style + component subpath exports)
  - README.md (Liquid Glass design-system section — tokens, tiers, component API, adopt guide)
  - tests/glass.test.ts (new — tokens/tiers/fallback)
  - tests/glass-components.test.ts (new — render, props, a11y roles, fallback, focus trap)
effort: xlarge
trigger: platform-wide UI refresh to Apple Liquid Glass; every product re-implements the same glass chrome and controls, so the material AND a reusable component library must live in latere-ui for products to adopt by import rather than re-styling
created: 2026-07-05
updated: 2026-07-05
author: changkun
dispatched_task_id: null
---

# latere-ui v1.10 — Liquid Glass Design System

## Overview

Apple's Liquid Glass is a **material**: translucent layers that refract and
blur what sits behind them, carry a specular edge, and shift saturation
(vibrancy) so foreground text stays legible over live content. Making every
Latere product speak it consistently requires two layers in the shared library,
not one:

1. **A material foundation** — tokens + tier utilities + the a11y fallback, so
   the glass "look" has a single source of truth.
2. **A component library** — ready-made Vue components (surfaces, bars, buttons,
   fields, dialogs, popovers, badges) built on that material, so a product
   adopts glass by **importing a component**, not by re-implementing
   `backdrop-filter` recipes in every app. This is what makes the system
   genuinely reusable across cella, lux, wallfacer, auth, and the rest.

`latere-ui` already ships shared *components* (ConsoleSidebar, SiteFooter,
AccountMenu, DocsLayout) — this spec extends that architecture with a glass
component set and retrofits the existing shared chrome onto the same material.

Non-goal: this spec does not repalette any product. Each product owns its
accent/canvas; the system owns the *material* and the *components*.

## Design principles (the material contract)

Grounded in Apple's Liquid Glass (macOS Tahoe / HIG "Materials"): glass is a
distinct functional layer floating above content, built from three optical
layers Apple names — **illumination** (tint + real-time backdrop blur),
**highlight** (specular top-edge rim), and **shadow** (separation from content).

1. **Glass needs a canvas to refract.** Frosted layers over a flat fill read as
   dead gray. Components assume the product sets a subtly gradient `--canvas`
   behind them; the tokens define it, products set the values.
2. **Glass is chrome, never content.** `backdrop-filter: blur()` over live
   xterm / noVNC / video tanks performance and legibility. Regular glass is for
   chrome (bars, sidebars, dialogs, popovers, fields); content surfaces stay
   opaque. Documented per component.
3. **Two variants, three Regular tiers.** Apple's *Regular* variant (adaptive,
   always legible) ships as `thin` (controls, chips, fields), `regular` (panels,
   sidebar, bars), `thick` (modal/overlay scrims, popovers, palette). Apple's
   *Clear* variant (`clear`) is permanently transparent for over-media chrome
   and requires a dimming layer (`.lu-glass-dim`) for legibility.
4. **Specular edge + vibrancy.** `--glass-edge` composes the highlight (top
   rim), shadow (bottom rim), and drop shadow (separation); `saturate()` +
   `brightness()` provide vibrancy. Text uses the existing `--text*` ramp so
   contrast is preserved.
5. **Concentric corners.** Nested controls' radius = parent radius − padding
   (Apple concentricity); exposed via `--glass-radius` + `concentricRadius()`.
6. **Adaptive.** Every token and component has a `[data-theme="dark"]` variant.
7. **Accessible fallback is built in.** `prefers-reduced-transparency: reduce`,
   `prefers-contrast: more` (Apple Increase Contrast → near-opaque fills at a
   4.5:1 ratio, thicker borders), and `@supports not (backdrop-filter)` all
   collapse the glass tokens to opaque/high-contrast. Because every component
   styles via those tokens, the fallback is automatic — no per-component or
   per-product work. `useGlass()` also exposes the reactive reduced-transparency
   flag for components that need to branch behavior (e.g. drop a parallax).

## Layer 1 — Material foundation

### `src/styles/tokens.css` — glass + canvas tokens

Add to `:root` and `[data-theme="dark"]`, all with safe literal fallbacks:

```
--glass-blur / --glass-blur-thin / --glass-blur-thick
--glass-saturate
--glass-bg / --glass-bg-thin / --glass-bg-thick     (translucent rgba tints)
--glass-border                                       (hairline, brighter than --border)
--glass-highlight                                    (specular top-edge color)
--glass-edge                                         (composed inset highlight + drop shadow)
--canvas / --canvas-gradient                         (base the product fills behind glass)
```

### `src/styles/glass.css` — tier utilities + fallback

Opt-in `import 'latere-ui/glass'`. Utility classes `.lu-glass`,
`.lu-glass-thin`, `.lu-glass-thick` (background + `backdrop-filter: blur()
saturate()` with `-webkit-` pair + `--glass-border` + `--glass-edge`), and the
two fallback blocks (`prefers-reduced-transparency: reduce` and `@supports not
(backdrop-filter: blur(1px))`) that redefine glass tokens to opaque. Components
lean on these classes so the fallback lives in exactly one place.

### `src/glass/useGlass.ts` + `src/glass/focusTrap.ts`

- `useGlass()` — resolve a tier's class + the reactive `reducedTransparency`
  flag (matchMedia, SSR-safe no-op without `window`).
- `focusTrap.ts` — shared overlay behavior (focus trap, ESC, scrim click) so
  `GlassDialog` and `GlassPopover` don't each reinvent it.

## Layer 2 — Component library

A comprehensive set of reusable glass elements — the full common vocabulary
(surfaces, sidebar, buttons, inputs, modal, alert, message, and the rest) — so
a product builds its UI from imports, not bespoke glass CSS. All are thin,
token-styled Vue SFCs that compose the tier utility classes, so each renders
opaque under the reduce-transparency fallback for free. Each ships with a README
API block and tests (render, props, a11y role, keyboard).

To stay tightly scoped and buildable, the catalog ships in two phases within
this spec — **Core** (the primitives + the elements cella needs to adopt on day
one) and **Extended** (the long tail) — but all live in the same `1.10.x` line.

### Core

**Surfaces & layout**
| Component | Tier | Purpose |
|---|---|---|
| `GlassSurface` | prop | Base primitive — tiered glass container (`as`, `tier`, `interactive`); everything composes it |
| `GlassPanel` | regular | Content card / grouped section (padding + radius; opaque inner regions via slot) |
| `GlassBar` | regular | Sticky chrome bar / toolbar / top strip (`sticky`; safe over content) |
| `GlassSidebar` | regular | Rail shell — `ConsoleSidebar` retrofit onto the material (no API change) |

**Controls & inputs**
| Component | Tier | Purpose |
|---|---|---|
| `GlassButton` | thin | Action — `variant` primary/ghost/danger, `size`, loading, `icon` slot |
| `GlassIconButton` | thin | Square icon-only button (toolbar affordances) |
| `GlassField` | thin | Input / textarea / select shell — focus ring via `--accent`, `label`/`error` slots |
| `GlassSegmented` | thin | Segmented control — theme/density/view switches, roving-tabindex |
| `GlassSwitch` | thin | On/off toggle |

**Feedback & overlays**
| Component | Tier | Purpose |
|---|---|---|
| `GlassBadge` | thin | Status pill — maps `--state-*`, `tone` prop |
| `GlassAlert` | regular | Inline banner — info/success/warning/error, dismissible |
| `GlassToast` + `message()` | thick | Transient notifications via imperative `message.success/error/…` service (`glass/message.ts`) |
| `GlassModal` (`GlassDialog`) | thick | Modal + scrim — focus trap, ESC/overlay close, `v-model:open`, teleport |
| `GlassPopover` | thick | Floating menu / command-palette surface — anchored, dismiss-on-outside, ESC |

### Extended

| Component | Tier | Purpose |
|---|---|---|
| `GlassCheckbox` / `GlassRadio` | thin | Boolean / single-choice inputs |
| `GlassSelect` | thin+thick | Custom dropdown select (field + popover) |
| `GlassTabs` | thin | Tab strip with glass indicator |
| `GlassTooltip` | thick | Hover/focus tooltip |
| `GlassDrawer` | thick | Edge-anchored sliding panel |
| `GlassMenu` | thick | Context/dropdown menu list (built on `GlassPopover`) |
| `GlassProgress` / `GlassSpinner` | — | Determinate bar + indeterminate spinner |
| `GlassSkeleton` | — | Loading placeholder shimmer |
| `GlassTable` | regular | Data table with glass header/rows |
| `GlassConfirm` | thick | Imperative confirm/alert dialog (`confirm()`), built on `GlassModal` |

`GlassConfirm` + `message()` give products the imperative **modal / alert /
message** trio directly, mirroring the ad-hoc dialogs each app hand-rolls today.
`ConsoleSidebar` and `SiteFooter` retrofit onto the material — no public API
change, purely the surface.

## package.json / README / tests

- Bump `1.10.0`. Add exports: `"./glass": "./src/styles/glass.css"` and keep
  components on the existing `.` barrel via `src/index.ts`.
- README: a **Liquid Glass** design-system section — tier table, the three
  adopter obligations (set `--canvas`, chrome-not-content, fallback is
  automatic), a per-component API table, and a copy-paste "adopt in your
  product" snippet (import glass.css, set canvas tokens, drop in `GlassBar`).
- Tests: `glass.test.ts` (tokens for both themes, three tier classes, both
  fallback selectors present) + `glass-components.test.ts` (each component
  renders, honors props, exposes correct role, and `GlassDialog`/`GlassPopover`
  trap focus + close on ESC; a jsdom pass asserts opaque fallback when
  `backdrop-filter` is unsupported).

## Acceptance criteria

- [ ] The Core catalog (surfaces, sidebar, buttons, inputs, badge, alert,
      toast/`message()`, modal, popover) ships in `1.10.0`; a demo composing
      them over a gradient `--canvas` renders as frosted, blurred,
      specular-edged glass in both light and dark. Extended catalog follows in
      the same `1.10.x` line.
- [ ] Imperative `message()` and `confirm()` services mount, stack, and dismiss
      correctly (and no-op SSR-safe without `window`).
- [ ] Forcing `prefers-reduced-transparency: reduce` makes every component and
      the shared chrome fully opaque with unchanged text contrast — zero active
      `backdrop-filter` — with no per-component code path.
- [ ] `GlassDialog`/`GlassPopover` trap focus, restore it on close, and close on
      ESC and scrim/outside click.
- [ ] Token-less consumer degrades to opaque components (literal fallbacks).
- [ ] SSR-safe: `useGlass`/components no-op without `window`.
- [ ] `vitest` green (existing 125 + glass + component tests); `vue-tsc` clean.
- [ ] No product repo referenced from this package (shared-package hygiene).

## Rollout

1. Build + release `latere-ui@1.10.0` (this spec) — material + components.
2. cella adopts (sandbox `liquid-glass-refresh`): bump the pin, set canvas +
   neutral-glass palette, and **replace local ad-hoc chrome/controls with the
   Glass* components** (dialogs, command palette, top strip, buttons, fields).
   This is the reference adoption other products copy.
3. lux / wallfacer / auth adopt on their cadence by setting canvas tokens and
   swapping in Glass* components; until they do they render opaque (fallback),
   so the release is non-breaking.

## Outcome (2026-07-05)

Built in latere-ui v1.10.0 on main (committed, not yet pushed/tagged).

- **Material** (`src/styles/glass.css`): Regular tiers (thin/regular/thick) + Clear variant (`.lu-glass-clear` + `.lu-glass-dim`), three optical layers in `--glass-edge`, vibrancy (saturate + brightness), concentric radius token + `concentricRadius()`. A11y baked into the token contract: `prefers-reduced-transparency`, `prefers-contrast: more` (Increase Contrast → near-opaque 4.5:1), `@supports not (backdrop-filter)`.
- **Composables/services** (`src/glass/`): `useGlass`, `useFocusTrap`, `message()`, `confirm()`, shared value types.
- **Components** (25): Surface, Panel, Bar, Button, IconButton, Field, Badge, Alert, Switch, Segmented, Checkbox, Radio, Tabs, Modal, Popover, Toaster, ConfirmHost, Spinner, Progress, Skeleton, Tooltip, Menu, Select, Drawer, Table — all keyboard/ARIA-complete.
- **Shared chrome**: `console.css` `.lu-cs` sidebar retrofit to glass. `footer.css` deferred (marketing base).
- **Tests**: 213 passing; typecheck clean. `./glass` CSS entrypoint added; `1.10.0`.

Diverged from plan: glass tokens live canonically in `glass.css` (not `tokens.css`) so apps with their own token system (which skip `tokens.css`) still get them. Extended `GlassMenu`/`GlassSelect`/`GlassDrawer`/`GlassTable` shipped in the same pass rather than a follow-up.

Remaining: push + tag `v1.10.0` (release gate); per-product adoption (cella is the reference, in progress).

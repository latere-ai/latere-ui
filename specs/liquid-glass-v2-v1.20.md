---
title: latere-ui v1.20 — Liquid Glass v2 (five-tier material ladder, ink accent, capsule geometry)
status: draft
depends_on:
  - specs/liquid-glass-v1.10.md
affects:
  - src/styles/glass.css (v2 material ladder: rename tier set, drop Clear tier, layered --shadow-glass, --glass-pill-fill / --glass-smoke-* / --glass-edge-top, keep --glass-dim scrim)
  - src/styles/tokens.css (v2 fallback tokens: ink accent, fg ramp, bg ladder, radii ladder, --border-strong)
  - src/glass/useGlass.ts (GlassTier union → ultrathin|thin|regular|thick|smoke; concentricRadius outer default → radii ladder)
  - src/components/GlassSurface.vue (tier prop accepts new set; default tiers unchanged where sensible)
  - src/components/GlassButton.vue (primary variant → smoke ink glass; capsule radius)
  - src/components/*.vue (capsule geometry for controls/badges; ink focus rings; mono eyebrows where labels exist)
  - src/components/ConsoleSidebar.vue (1d floating capsule rail; pill-fill active row replaces 3px accent bar)
  - src/styles/console.css (floating rail slab, capsule nav rows, ultrathin search/account, mono section labels)
  - src/styles/docs.css (ink accent, capsule chrome, radii ladder, mono eyebrows)
  - src/styles/footer.css (SiteFooter + AccountMenu + ConsolePalette to v2 recipe)
  - src/index.ts (GlassTier type re-export unchanged; no new named exports)
  - package.json (bump to 1.20.0)
  - README.md (v2 tier table, migration notes: tier renames, Clear removed, ink accent)
  - tests/glass.test.ts (new tier set + tokens both themes + fallbacks)
  - tests/glass-*.test.ts (per-component tier/class + smoke-primary + capsule assertions)
  - tests/console-shell.test.ts (pill-fill active row, no accent-bar pseudo)
effort: xlarge
trigger: platform-wide refresh from the v1.10 Liquid Glass dialect to the Latere Design System v2 recipe — a firmer five-step material ladder, capsule geometry, ink-only accent, and layered floating-glass shadows. Delivered as a design handoff (Console Shell 1a–1f, Components 2a–2d, Docs 3a–3d, Footer/Account 4a–4h). Shell adopts the recommended 1d floating-capsule variant.
created: 2026-07-05
updated: 2026-07-05
author: changkun
dispatched_task_id: null
---

# latere-ui v1.20 — Liquid Glass v2

## Overview

v1.10 shipped a Liquid Glass *dialect*: three Regular tiers + a Clear variant, a
single `--glass-radius: 14px`, per-product `--accent`, and an accent-bar active
nav row. The Latere Design System **v2** is the same material idea with a firmer
recipe:

- a **five-step material ladder** — `ultrathin / thin / regular / thick / smoke`
  — where `ultrathin` (hover targets, chips, badges) and `smoke` (ink glass for
  primary buttons / inverse emphasis) are new, and the Clear variant retires;
- **capsule geometry** — a radii ladder (8 / 12 / 16 / 22 / 28 / 36 + pill) with
  every control, nav row, and badge on the pill radius; the concentric rule
  stays;
- **ink as the only accent** — `--accent` becomes ink (`#0a0a0a` light,
  `#e4e4e7` dark); product colors survive only as gradient wordmarks. This
  resolves the v1.10 fallback drift (`#5b6cf0` in console.css vs `#171717` in
  Glass\*);
- **layered floating-glass shadows** — `--shadow-glass` = drop + inset top
  specular + inset bottom shade, deepening on hover.

This is a **token-layer re-skin mapped onto the library's own contracts**, not a
rewrite. The design prototypes are HTML mockups; we recreate their *visual
output* on the existing `.lu-glass-*` class names and `glass.css` / `tokens.css`
file layout — we do **not** adopt the prototype's `.glass-*` names or its 7-file
token split. Component **APIs are unchanged** (props, events, slots); the churn
is (1) the tier *set* and (2) two geometry changes (active nav bar → pill fill,
radii → ladder).

Non-goal: no new components, no behavior changes, no per-product repalette in
this spec (products adopt on upgrade). Runtime edge-refraction JS from the
prototype (`liquid-glass.js`) is **out of scope** — the material stays pure CSS,
matching v1.10.

## Release & migration (clean hard-swap, v1.20.0)

Confirmed with the owner: **clean hard-swap**, released as **v1.20.0** (minor
line, not a 2.x). No deprecation aliases.

### Tier mapping (v1.10 → v2)

| v1.10 class | v2 class | Note |
|---|---|---|
| — | `.lu-glass-ultrathin` | **new** — lightest tier (chips, badges, search, hover) |
| `.lu-glass-thin` | `.lu-glass-thin` | kept; new v2 fill/blur values |
| `.lu-glass` (regular) | `.lu-glass` | kept; new values |
| `.lu-glass-thick` | `.lu-glass-thick` | kept; new values |
| `.lu-glass-clear` | **removed** | no v2 home; the one internal consumer moves to `ultrathin` |
| `.lu-glass-dim` (utility) | **removed** | Clear-only dimming utility |
| — | `.lu-glass-smoke` | **new** — ink glass (primary buttons, inverse) |

`GlassTier` union: `'thin' | 'regular' | 'thick' | 'clear'` →
`'ultrathin' | 'thin' | 'regular' | 'thick' | 'smoke'` (breaking type change;
acceptable under the hard-swap).

**Keep** `--glass-dim` (the *scrim* token consumed by `GlassModal.vue` /
`GlassDrawer.vue`) — it is the modal backdrop, not the Clear tier. Only the Clear
*tier* (`.lu-glass-clear`, `--glass-bg-clear`, `--glass-blur-clear`) and the
`.lu-glass-dim` *utility class* retire.

## Layer 1 — Material foundation (`glass.css`, `tokens.css`, `useGlass.ts`)

### Material ladder (`glass.css`)

Five tier classes share the base recipe (`backdrop-filter: blur() saturate()` +
`border: 1px var(--glass-border)` + `box-shadow: var(--shadow-glass)`), differing
by fill + blur:

```
--glass-ultrathin  white .28 / blur 14px      (dark: ink .42)
--glass-thin       white .38 / blur 24px      (dark: ink .58)
--glass-regular    white .42 / blur 24px      (dark: ink .66)
--glass-thick      white .65 / blur 36px      (dark: ink .85)
--glass-smoke        rgba(10,10,10,.68)        (dark: rgba(250,250,250,.10))
--glass-smoke-strong rgba(10,10,10,.82)        (dark: rgba(250,250,250,.88))
```

Supporting tokens (from the v2 materials recipe):

- `--glass-border` (light `rgba(255,255,255,.85)`, dark `rgba(255,255,255,.20)`)
- `--glass-smoke-ink` (`#fafafa` light / `#0a0a0a` dark) — label color on
  smoke-strong capsules, **never hardcoded white**
- `--glass-pill-fill` (light `rgba(255,255,255,.70)`, dark `rgba(255,255,255,.16)`)
  — the active nav-row / hover capsule fill
- `--glass-edge-top` — `inset 0 1.5px 0 …` specular top edge for pill/active rows
- `--shadow-glass` / `--shadow-glass-hover` — the layered floating-glass shadow
  (replaces `--glass-edge` / `--glass-edge-thick`; keep those two as aliases →
  `--shadow-glass` so any consumer referencing them keeps working)

Radii ladder lives in `tokens.css` (see below); `--glass-radius` keeps a
literal fallback and now resolves to `--radius-lg` (22px) so existing
`concentricRadius()` callers land on the ladder.

### `tokens.css` — v2 fallback tokens

Extend the fallback set to what the reskinned stylesheets consume, all with
literal values and dark variants:

```
--bg / --bg-deep / --bg-surface / --bg-raised / --bg-code
--accent / --accent-hover / --accent-subtle / --accent-glow / --accent-glow-strong   (ink)
--fg-1 / --fg-2 / --fg-3 + --text / --text-secondary / --text-muted aliases
--border / --border-strong
--radius-xs..2xl + --radius-pill
```

Products with their own token system still get the glass tokens from `glass.css`
(v1.10 divergence preserved).

### `useGlass.ts`

- `GlassTier` union → the v2 set; `TIER_CLASS` map updated (`ultrathin →
  lu-glass-ultrathin`, `smoke → lu-glass-smoke`, drop `clear`).
- `concentricRadius()` default outer → `var(--glass-radius, 22px)`.
- reduced-transparency reactive flag unchanged.

### A11y fallbacks

The three fallback paths (`prefers-reduced-transparency`, `prefers-contrast:
more`, `@supports not (backdrop-filter)`) extend to the five-tier set: all fills
collapse to `--bg-surface` (smoke → ink `#0a0a0a` / paper), blur → 0, saturate →
100%. The contract — every component styles through the tokens, so the fallback
is automatic — is preserved.

## Layer 2 — Shell (1d floating capsule rail)

`console.css` + `ConsoleSidebar.vue` re-materialize as design frame **1d**:

- rail is a **floating** `.lu-glass` slab: `--radius-xl` (28px), detached from
  the window edge with a gap, not a flush 240px rail;
- nav rows become **capsules** (`--radius-pill`); the **active row** is
  `--glass-pill-fill` + `--glass-edge-top` specular — the 3px accent-bar
  pseudo-element is **removed**;
- search + account controls are `.lu-glass-ultrathin` capsules;
- section labels (`Workspace` / `Infrastructure` / `Settings`) become **mono,
  uppercase, tracking 0.15em**;
- topbar is a `.lu-glass-thin` capsule (56px, pill); the requests table is a
  `.lu-glass` card at `--radius-xl`;
- primary "New request" button is smoke ink glass.

No `ConsoleSidebar` prop/slot/event change; nav model (`src/console/nav.ts`)
untouched.

## Layer 3 — Component library (frames 2a–2d)

Every Glass\* control restyled onto the ladder, APIs unchanged:

- **GlassButton** — `primary` variant = `.lu-glass-smoke` (smoke-strong fill,
  label `--glass-smoke-ink`); `ghost` = ultrathin; capsule radius; `danger`
  keeps a red tone but on the smoke recipe.
- **GlassBadge / GlassField / GlassSegmented / GlassSwitch / GlassCheckbox /
  GlassRadio / GlassTabs** — capsule/ladder radii; ultrathin chips; ink focus
  ring (`--accent`).
- **GlassPanel / GlassBar / GlassTable / GlassAlert** — `--radius-lg`/`-xl`
  cards; mono uppercase eyebrows in table headers.
- **GlassModal / GlassPopover / GlassMenu / GlassSelect / GlassDrawer /
  GlassTooltip / GlassToaster** — thick tier + ladder radii; scrim keeps
  `--glass-dim`.
- **GlassSpinner / GlassProgress / GlassSkeleton** — ink tones.

Tier-class churn is limited to components whose tier changes (e.g. a chip moving
`thin → ultrathin`, a primary button moving to `smoke`); tests that assert the
old class update to the new one.

## Layer 4 — Docs, footer, account, palette (frames 3a–3d, 4a–4h)

`docs.css` (DocsLayout: grouped index, article, TOC, pager) and `footer.css`
(SiteFooter full + compact, AccountMenu, ConsolePalette ⌘K) move to the v2
recipe: ink accent (kills the `#5b6cf0` fallback drift), capsule chrome, radii
ladder, mono eyebrows, glass tiers for floating surfaces.

## Acceptance criteria

- [ ] `glass.css` ships the five-tier ladder (`.lu-glass-ultrathin/-thin/-glass
      (regular)/-thick/-smoke`); Clear tier + `.lu-glass-dim` utility removed;
      `--glass-dim` scrim token retained.
- [ ] `--accent` resolves to ink in both themes; no `#5b6cf0` remains in
      `console.css` / `docs.css`.
- [ ] `GlassButton` `primary` renders `.lu-glass-smoke` with label color
      `--glass-smoke-ink` (no hardcoded `#fff`).
- [ ] ConsoleSidebar active row uses `--glass-pill-fill` (pill), and the
      3px accent-bar pseudo-element is gone.
- [ ] `GlassTier` union is the v2 set; `glassClass('ultrathin')` →
      `lu-glass-ultrathin`, `glassClass('smoke')` → `lu-glass-smoke`.
- [ ] All three a11y fallbacks collapse the five-tier set to opaque, unchanged
      text contrast, zero active `backdrop-filter`.
- [ ] `concentricRadius()` resolves against the radii ladder.
- [ ] `vitest` green (215 existing, adjusted + new); `vue-tsc` clean.
- [ ] No product repo referenced from this package.

## Rollout

1. Build + release `latere-ui@1.20.0` (this spec) — token layer, shell,
   components, docs, footer; push + tag.
2. `latere-ai` adopts: bump the pin to `1.20`, adopt the v2 Latere Design System
   (second handoff), consume the Glass\* material/components. (Tracked
   separately.)
3. cella / wallfacer / lux adopt on their cadence; until they upgrade they stay
   on `1.10.x`.

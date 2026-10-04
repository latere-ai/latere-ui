---
title: One control shape, the flat capsule
status: complete
depends_on: []
affects:
  - src/styles/components/glass-button.css
  - src/styles/components/glass-icon-button.css
  - src/styles/components/preference-menu.css (the ThemeMenu and LocaleMenu button)
  - src/styles/components/glass-bar.css (bar buttons keep the capsule)
  - src/styles/glass.css, src/styles/presets.css (comments, the preset filter list)
  - src/components/GlassButton.vue, src/components/GlassIconButton.vue
  - src/react/GlassButton.tsx, src/react/GlassIconButton.tsx
  - tests/control-scale.test.ts, tests/glass-controls.test.ts, tests/glass-forms.test.ts
  - src/react/__tests__/glass-button.test.tsx, src/react/__tests__/glass-basic-controls.test.tsx
  - tests/visual/footer-geometry.spec.ts, tests/visual/design-presets.spec.ts, tests/visual/goldens
  - docs/api-guide.md, docs/design-system.md, CHANGELOG.md
effort: small
trigger: the company site settled on one control shape (a capsule at 36px or 32px, as a dark fill, a hairline outline or a bare label, with no glass, blur or shadow), and the owner moved it into latere-ui so the console and the other sites match
created: 2026-10-04
---

# One control shape, the flat capsule

## Shape and treatments

- Every button is a capsule: `GlassButton`, `GlassIconButton` (a circle, being
  square) and the `ThemeMenu` and `LocaleMenu` buttons.
- Three flat treatments, by variant. `primary`: a dark ink fill, `--text`,
  with a `--bg` label, so both flip with the theme. `glass`, the default and
  the secondary action: a 1px hairline (`--lu-button-border`) around an ink
  label. `ghost`: a bare label in `--text-secondary`. `danger` fills with the
  error tone and `danger-ghost` sets it as a bare label, as before.
  `GlassIconButton` takes the hairline treatment.
- No control carries glass, blur or a shadow. The components no longer write
  `lu-glass-thin` or `lu-glass-ultrathin` on the button, and the button rules
  set `box-shadow` and `backdrop-filter` to `none` under a doubled class, so a
  tier class a host still writes on a button cannot bring the material back,
  whatever order the stylesheets load in.
- Overlays keep their elevation: menus, popovers, selects' lists, dialogs and
  drawers are unchanged.
- Focus rings stay the library's outline at a 2px offset. An outline follows
  the border radius, so the ring is a capsule around the capsule.
- Heights stay on the shared control scale, `--lu-control-height` (32px) and
  `--lu-control-height-sm` (28px), and labels at 13px and 12px. The site's 36px
  and 32px are a host setting of those two tokens; changing the defaults would
  also move every field, select and the footer's buttons.

## Two corner tokens

`--lu-button-radius` rounds buttons and nothing else; its default is
`--radius-pill`, a capsule. `--lu-control-radius` keeps rounding fields,
selects, menu rows and menu and popover panels, which add their padding to it.

The split exists because the panels read `--lu-control-radius`: setting a
capsule there once turned the footer's theme menu panel into a pill. The
button token deliberately does not fall back through `--lu-control-radius`,
so a host that set that token for its fields (the console sets 6px) gets
capsule buttons and square fields at once.

A capsule has no corner to nest, so the concentric rule for boxes inside a
`GlassBar` (outer radius minus inset) no longer applies to its buttons; the
bar's button override is gone. Product presets keep their own action corner
and bar rule.

## The glass look

No consumer depends on glass buttons. The platform console draws its buttons
through its own rules over `.lu-btn`; eval uses only `primary` and `ghost`;
no product sets a preset appearance. The flat look replaces glass with no
option to restore it.

## Tests

- `tests/control-scale.test.ts` holds the split: the button stylesheets read
  `--lu-button-radius` and never `--lu-control-radius`, no other stylesheet
  reads `--lu-button-radius`, and the popover panel and menu rows still read
  `--lu-control-radius`. A mutation that rounds the popover panel from the
  button token fails it.
- `tests/visual/footer-geometry.spec.ts` checks the same in the browser: with
  `--lu-control-radius: 6px` the theme button stays round while the panel is
  12px and the rows 6px, and `--lu-button-radius` alone squares the buttons.
- Unit tests assert that no variant renders a `lu-glass*` class.

## Outcome

Built as specified: unit tests, typecheck and the browser checks pass, and
the macOS 26 renders before and after were reviewed image by image (178
references change, all buttons). The macOS 15 references come from the
hosted runner's recording [run 37220008860](https://github.com/latere-ai/latere-ui/actions/runs/37220008860):
the same 178 images changed, and the buttons render as capsules there.

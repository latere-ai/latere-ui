---
title: Component and glass effect reference coverage
status: complete
depends_on:
  - specs/visual-regression-harness.md
affects:
  - tests/visual/
  - tests/visual-coverage.test.ts
  - docs/visual-review.md
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Component and glass effect reference coverage

## Overview

Provide inspectable reference sheets for every Vue and React UI component and every glass material/effect. Use real rendered components and representative public variants, rather than mockups.

## Coverage

- Five glass tiers, surface/panel/bar geometry, refraction and pointer sheen over a patterned background; light/dark, reduced motion, reduced transparency and increased contrast.
- Buttons and icon buttons: variants, sizes, loading, disabled, hover, keyboard focus.
- Fields, selects, checkboxes, radio, switch, segmented controls and tabs: default, selected, invalid, disabled, open and keyboard selection as applicable.
- Badges/alerts in every tone; spinner, skeleton and progress states.
- Table, menu, popover, tooltip, modal, drawer, toast and confirm: open states, positioning, overflow and keyboard dismissal.
- Console sidebar expanded/collapsed, command palette, docs, account menu/preferences, organization/product switchers, footer variants and logo.
- All public React counterparts rendered independently. Mobile sheets cover responsive shells and overlay containment.

## Review and regression fixes

Record audit findings and their verification in docs/visual-review.md. Fix confirmed defects in separate small commits, each with tests that fail before the fix. Inspect generated reference images before accepting them, and rerun comparisons after fixes. Coverage means all exported UI components and the listed effect/state families, not every possible prop combination or all browser engines.

## Acceptance

- Every exported Vue/React UI component appears in the coverage manifest and renders visibly in its fixture.
- Committed images cover both themes and representative narrow screens.
- Behavior tests verify keyboard interaction, focus, scrolling and reduced-motion rules that a still image cannot prove.
- An image index lists scenarios, covered components and expected baseline paths.

## Outcome

The checked-in manifest and 150 reviewed PNGs per platform cover all 34 Vue and 16 React visual exports, five glass tiers, refraction, sheen, both themes, and representative mobile, interaction, and accessibility states. All 182 browser tests passed without updating expected images. Thirteen defect categories were corrected with failing-before/passing-after regression tests and recorded in docs/visual-review.md. The README and design guide embed actual figures plus a design skeleton SVG; docs/visual-reference.md indexes every baseline. All 192 local documentation links and figures resolve. Coverage intentionally excludes exhaustive prop combinations and cross-browser pixel parity.

Hosted validation exposed inherited media preferences, incomplete fixture canvas painting, and OS-version raster differences. The harness now pins the complete media set and paints the full viewport, with two failing-before/passing-after browser regressions. Reviewed macOS 15 and local macOS 27 references occupy separate Darwin-version directories (150 cases per platform); strict comparisons remain at zero differing pixels. Explicit hosted recording produces review artifacts only.

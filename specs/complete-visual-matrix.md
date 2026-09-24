---
title: Complete component visual matrix
status: complete
depends_on:
  - specs/react-basic-parity.md
  - specs/react-overlay-parity.md
  - specs/react-shell-parity.md
affects:
  - tests/visual/
  - playwright.config.ts
  - docs/
  - README.md
effort: medium
created: 2026-09-12
updated: 2026-09-13
author: changkun
dispatched_task_id: null
---

# Complete component visual matrix

## Scope and verification

Every public visual component must exist in Vue and React and have light/dark desktop/mobile renders for default glass, Replichai, Wallfacer and Origo. Fixed identities and headless components are included; optical effects retain their intended appearance but receive both adapter and viewport coverage. Enforce exported-component parity and complete combinations rather than maintaining selective mobile allowlists.

Introduce canonical fixture content/layout/state shared across adapters. Compare independently rendered Vue and React output from real components, including overlays, with identical fonts, viewport, DPR and animation state. Compare decoded RGBA pixels exactly: zero changed pixels, zero color tolerance, no ignored antialiasing pixels or masking. Baseline verification must enforce the same exact comparator. Add a deliberately one-channel/one-pixel mismatch regression proving rejection. Resolve deterministic-rendering and actual markup/style differences instead of accepting tolerance.

Preserve behavioral regression scenarios. Expand or replace their visual matrix with canonical complete sheets, retain human-readable images at 300 DPI and explicit native-platform baselines, and remove superseded artifacts only when coverage is proven. Review every new/changed figure individually, fixing flaws with reproductions. Validate matrix inventory, all pixel/density checks, type checking, unit coverage above 90% lines, e2e behavior, exact local rerun and strict native CI. Update README, integration docs and generated index to accurately describe full adapter and responsive coverage. Push verified small commits to main and check CI.

## Outcome

The matrix covers all 34 components in Vue and React across 25 sheets, four appearances and light/dark desktop/mobile states. Each platform contains 800 adapter figures plus 52 supplemental figures; all 1,704 PNGs were reviewed individually or through an exact paired composition and carry 300 DPI metadata from 3.125× rendering. Inventory tests enforce exported component coverage. Comparator regressions reject a one-channel, one-pixel change, including transparent RGB and antialiased edges.

The strict local run with isolated golden browsers passed all 831 browser tests; the initial native macOS 15 recording passed 827 tests in [run 34723912848](https://github.com/latere-ai/latere-ui/actions/runs/34723912848). Type checking and 540 unit tests pass with 94.37% source line coverage. Main CI compares against the reviewed native references. [Review findings](../docs/reviews/complete-visual-review.md), the [visual index](../docs/visual-reference.md), README examples and integration guides document the resulting behavior and reproducible checks. No pixel tolerance, masks or automatic baseline approval were introduced.

---
title: Product style figures
status: complete
depends_on:
  - specs/product-style-presets.md
affects:
  - tests/visual/
  - docs/visual-reference.md
  - README.md
  - docs/design-system.md
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Product style figures

## Overview

Render the actual shared components under every product preset and commit dedicated visual baselines so future changes cannot silently erase their differences.

## Architecture

Extend the existing gallery with a design query parameter and explicit style links. Reuse real Vue/React fixtures and the pinned browser/font pipeline. A typed style manifest defines the preset matrix and generates a readable reference index.

## Coverage

For each of the three styles, cover all styled fixture sheets in both themes and both available adapters, including open overlays and preferences. Exclude fixed logos, headless organizations, standalone optical effects and redundant collapsed-sidebar sheets; existing default references retain those. Add mobile forms, modals, sidebars, compact footers and the Vue workspace. Preserve 300 DPI resolution and separate native macOS baselines. Include keyboard focus/hover and open-select assertions in dedicated interaction checks.

## Acceptance

Every covered fixture component is visible before capture. Verify no horizontal page overflow in responsive sheets. Record and compare locally, review figures individually, repeat recording/review on the CI platform and run strict comparison on main. Publish a style comparison in the README/design guide using rendered figures and document exact imports, root attributes, font ownership, scope and update commands. Do not describe token changes or documentation alone as rendered style support.

## Outcome

Added 82 figures per appearance per platform, alongside 160 default figures: 406 per platform and 812 total. All new and changed figures were inspected individually; fixes and final native recording differences received another review. Both inventories and every PNG checksum/density chunk were validated. Local strict comparison passes 623 tests; the final native recording passes the same 623 tests. README, integration guide, contribution instructions and generated visual index cover usage and review. See [the review record](../docs/product-style-review.md) for findings, coverage and verification. Main CI compares the committed references without update mode.

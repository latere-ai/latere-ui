---
title: Group footer navigation by Applications, Research, and Platform
status: complete
depends_on:
  - specs/react-site-footer-v1.28.md
affects:
  - src/components/SiteFooter.vue
  - src/react/SiteFooter.tsx
  - src/components/footerNavigation.ts
  - src/i18n/footer.ts
  - src/styles/footer.css
  - tests/footer.test.ts
  - src/react/__tests__/site-footer.test.tsx
  - tests/visual
effort: medium
created: 2026-09-20
updated: 2026-09-20
author: changkun
dispatched_task_id: null
---

# Footer navigation groups

## Overview

Readers should find applications, research, and the unified platform in distinct groups. Replace the footer's mixed Products list with Applications (Wallfacer, Lectio), Research (ReplicHAI), and Platform (Latere Platform).

## Current state

Both footer adapters derive a flat list from `LATERE_PRODUCTS`, mixing capabilities with applications and omitting ReplicHAI. Full footers place that list in one of four columns. Compact footers show the same list inline. The company site additionally overrides footer geometry in its own stylesheet.

## Implementation

- Add a framework-independent footer group model. Reuse existing application URLs and wordmarks. Keep the product switcher API unchanged.
- Render the same three ordered groups in both adapters and both layouts. Full footers retain Latere, Legal, and Community columns. Compact footers keep utility links and visibly label the three groups.
- Link Latere Platform to `https://platform.latere.ai/console` and ReplicHAI to `https://replichai.latere.ai/`. Remove individual capability links from footer navigation. Preserve Identity, account preferences, social links, router integration, and host translation overrides.
- Translate new labels into English, German, and Chinese. Use text-color hover feedback without background bars or underlines.
- Keep brand, four navigation columns, and preferences on one desktop row. Stack Applications, Research, and Platform in the first navigation column; reduce navigation to two columns on narrow screens. Compact groups wrap as complete groups where space permits. Preserve each preset's typography, colors, and control geometry.
- Update the website dependency and remove its obsolete capability URL rewrite. Align its footer layout overrides with the shared geometry.

## Acceptance and verification

- Both adapters expose identical ordered group names and destinations in full and compact footers.
- Existing internal links, locale/theme events, custom messages, and base URL handling still work.
- Browser checks cover default, Replichai, Wallfacer, and Origo designs, light/dark, desktop/mobile, full/compact, and both adapters. Group headings and links remain visible without horizontal overflow.
- Update and review affected native visual references with exact Vue/React parity. Do not regenerate unrelated references or other operating systems' images.
- Run footer unit tests, type checking, and coverage. Verify the consuming website's footer and the separately requested global hover changes.

## Outcome

Implemented one shared navigation model for Vue and React, full and compact footers, with translations for English, German, and Chinese. All four designs retain their typography and colors. Full footers stack destination groups in one of four desktop navigation columns, with two mobile columns; compact footers label and wrap the three groups.

Verification: 65 unit tests, type checking, 98.78% footer line coverage, 33 browser checks, and 32 exact Vue/React visual comparisons passed. Updated 64 affected macOS visual references and reviewed representative images for every design.

The website consumes revision `2b72012`, loads the shared footer stylesheet, and removes obsolete capability URL rewriting. Its build and 15 browser checks passed. A new layout regression assertion failed without the shared stylesheet and passed with it; desktop and mobile screenshots were reviewed.

## Design refinement

User review requested a denser single-row desktop layout, established research blue, a distinct violet platform wordmark, and no full-width hover bars. Theme controls now use centered SVG icons and language selects use zero vertical padding to avoid clipped or offset text. Browser assertions cover stacked geometry, colors, hover backgrounds, focus outlines, and icon centers in both adapters and every design.

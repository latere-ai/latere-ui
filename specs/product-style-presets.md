---
title: Product style presets
status: complete
depends_on: []
affects:
  - src/styles/presets.css
  - package.json
  - docs/design-system.md
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Product style presets

## Overview

Offer three usable appearances for existing Vue and React components: Replichai's reading UI, Wallfacer's dense operator UI and Origo's repository UI. Their typography, geometry, opaque materials and interaction states must be visible in the components themselves.

## Current state

The package exports one glass material and token-based component styles. Documentation discusses consumer styles, but no importable presets or rendered style variations exist. Hardcoded primary-button filters, shadows and several capsule geometries prevent token-only adoption.

## Design and API

Export `latere-ui/presets` as an opt-in stylesheet. Set `data-design="replichai|wallfacer|origo"` on the document root alongside the existing `data-theme="light|dark"`. The root scope includes teleported dialogs, palettes and notifications. Removing the attribute restores the default appearance. Nested mixed presets are outside this contract.

Derive recipes from the current local consumer styles, documenting intentional accessibility adaptations. Replichai uses Inter 14px, warm matte surfaces, 18px cards, 8px fields, 30px pill actions with ink at rest and blue hover. Wallfacer uses Inter 13px, warm matte surfaces, compact 14px cards, 10px fields, 30px actions and clay hover. Origo uses IBM Plex Sans/Mono 13px, flat surfaces without shadows, 4px panels/fields, 3px actions, 28px table rows and iris primary actions. Fonts remain host-owned; the reference gallery supplies licensed local font assets.

Map the existing material tiers to opaque surfaces and inverse emphasis. Remove backdrop filters and optical rims throughout styled controls and overlays. Preserve semantic error/success colors, keyboard focus, disabled/loading states and 44px coarse-pointer targets. Keep brand wordmarks and headless organization UI unchanged. Glass optical effects remain a default-material feature.

## Verification

Add browser assertions for exact palette, fonts, spacing, geometry, opacity, focus, primary hover, selected controls, teleported overlays, theme switching and restoring the default. Reproduce missing presets before implementation. Verify both adapters, both themes and touch targets. Run type checking, unit coverage and the complete visual suite.

## Outcome

Implemented the root-scoped optional stylesheet and package export for all three appearances. Both adapters cover palette, typography, geometry, material removal, keyboard and hover states, selected controls, overlays, theme changes, default restoration and touch targets. Visual review findings were reproduced in browser regressions and corrected. Type checking and 449 unit tests pass with 92.74% source line coverage; the final local strict browser suite passes all 623 tests.

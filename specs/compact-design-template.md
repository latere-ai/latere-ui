---
title: Compact desktop design template
status: complete
depends_on:
  - specs/visual-reference-resolution.md
affects:
  - src/styles/
  - src/components/
  - tests/visual/
  - docs/design-system.md
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Compact desktop design template

## Overview

Give laptop users more usable space with restrained corners, smaller insets and quieter glass. Preserve readable text, existing component APIs, keyboard access and accessible control boundaries.

## Design

The [Apple macOS reference](https://www.apple.com/os/macos/) uses glass for functional chrome, capsule toolbar groups, and tighter content rows. These principles inform our CSS approximation; this library does not implement Apple's native optical renderer.

- Use a 4/6/8/14/18/24px radius ladder. Fields and navigation use rounded rectangles; buttons, badges, switches and icon actions retain capsules/circles.
- Panels use 16px padding; toolbars use 6px/12px; table cells use 8px/12px. Medium buttons remain at least 32px tall and small buttons at least 28px. Touch inputs receive at least 44px control targets under coarse-pointer media.
- Reduce broad drop shadows and 1.5px highlight rims to restrained 1px edges. Preserve opaque reading overlays and accessibility fallbacks.
- Provide an optional system UI font token. Library shells use it; generic controls continue to inherit host typography. Brand wordmarks retain their separate identity.
- Keep the expanded console rail at 224px, with 32px minimum navigation rows and smaller horizontal insets.
- Add a containment wrapper to DocsLayout so its grid responds to available width: two columns below 1080px and one below 720px. Remove the unused TOC track when showToc is false. Keep article text at readable size and cap line length on wide screens.
- Tighten footer and gallery spacing. Demonstrate a realistic workspace with toolbar, panel, table and navigation at 1280×720, 1470×900 and 2560×1440 CSS pixels, plus mobile. Physical monitor pixels do not determine CSS layout size.

## Acceptance and verification

Add browser regressions before implementation, record failures, then prove corrected geometry, compact controls, softer effects, container-based docs reflow and hidden-TOC track removal. Include Vue/React and light/dark where supported, plus coarse-pointer targets. Add 300 DPI workspace goldens across the three desktop sizes. Inspect updated component figures and run the full visual suite, type checking and unit coverage (>90% lines). Refresh both native macOS reference sets; commit reviewed figures only.

## Outcome

Implemented compact tokens, shared component geometry, system shell typography, responsive docs and populated workspace examples. Individual visual review additionally corrected weak button/selection boundaries, a clipped select row and redundant toolbar blur. Each correction has a reproducible browser regression; geometry and affordance checks were verified failing before their fixes.

All 304 local browser checks passed in comparison mode; the native macOS recording passed 304 checks. Type checking and 446 unit tests passed with 92.74% line coverage. Reviewed and committed 160 figures per platform, including ten workspace figures per platform, with verified 300 DPI metadata. See the [review record](../docs/compact-design-review.md) and [design guide](../docs/design-system.md).

## Design evolution

Kept capsules for actions and switches while making content containers rectangular with smaller corners. Preserved coarse-pointer targets instead of applying desktop density to touch. Used available CSS width for layouts, including container queries for embedded documentation. Figma access returned HTTP 403, so the supplied frame could not be compared directly; the Apple macOS reference informed the web approximation.

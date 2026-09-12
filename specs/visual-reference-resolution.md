---
title: High-resolution visual references at 300 DPI
status: complete
depends_on:
  - specs/visual-regression-harness.md
affects:
  - playwright.config.ts
  - tests/visual/
  - tests/visual-image.test.ts
  - CONTRIBUTING.md
  - docs/visual-reference.md
effort: small
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# High-resolution visual references at 300 DPI

## Overview

Make committed component figures sharp when enlarged or printed. Render real browser pixels at 300 DPI equivalent instead of enlarging existing images or changing only a density label.

## Design

- Preserve CSS viewport sizes and component geometry; set the browser device scale to 300/96 and capture device pixels.
- Stamp PNG physical resolution at 300 DPI (nearest integer pixels per metre) after explicit reference updates. Preserve every image-data byte; do not resample or sharpen rendered pixels.
- Keep separate macOS reference sets and strict visual comparisons. Normal verification checks PNG density metadata and never modifies expected files.
- Integrate density stamping into Playwright teardown so local and explicit hosted recording use the same path, including filtered updates.
- Document the difference between CSS layout size, image pixel dimensions and physical DPI. The design skeleton remains scalable SVG.

## Verification

- Browser regression proves the device scale and actual screenshot pixel dimensions exceed the CSS viewport by 300/96.
- Unit tests verify PNG density, idempotency, replacement of an existing density chunk, unchanged image-data chunks, and malformed input rejection.
- Regenerate and visually inspect all reference images on both supported OS versions; run the full browser suite without update mode, unit coverage and type checking.

## Outcome

All 150 named states have native 300 DPI references on macOS 27 and macOS 15,
with every PNG individually reinspected after the design fixes. The
[per-figure review](../docs/visual-audit-300dpi.md) records findings and final checks.
All 300 files have verified density metadata and native pixel dimensions.

Validation passed: type checking, 446 unit tests with 92.73% line coverage,
269 local browser tests in normal comparison mode, and native hosted recording.
A deliberate table-heading spacing change failed the screenshot comparison;
restoring the source passed against the unchanged reference.

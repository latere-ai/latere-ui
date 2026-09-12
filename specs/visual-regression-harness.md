---
title: Repeatable browser visual regression tests
status: complete
depends_on: []
affects:
  - package.json
  - bun.lock
  - playwright.config.ts
  - tests/visual/
  - .github/workflows/visual.yml
  - CONTRIBUTING.md
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Repeatable browser visual regression tests

## Overview

Contributors need reviewed images of the real components and a failing test when their appearance changes. Add a local Vite gallery and Playwright screenshot comparisons against committed PNGs. Keep unit tests separate from browser tests.

## Current state

Vitest uses happy-dom and checks markup and CSS source, but cannot detect layout, clipping, contrast or rendering regressions. There are no browser fixtures or reference images. Vue and React share component CSS while several Vue components retain scoped styles.

## Design

- Serve deterministic Vue and React fixtures directly from source under tests/visual. No backend or external requests.
- Pin Playwright and its Chromium build. Record platform and macOS major in golden paths; maintain reviewed references for macOS 15 CI and macOS 27 local captures. Other platforms require separately reviewed baselines, never silently approve new images during verification.
- Fix viewport, device scale, locale, timezone and fonts. Wait for fonts and stable screenshots; freeze animations only for image comparisons. Test motion behavior separately.
- Store expected PNGs under tests/visual/goldens and actual/diff/trace artifacts in ignored output/playwright. A manifest drives cases and a coverage test rejects exported UI components without fixtures.
- Provide preview, verification and explicit baseline-update commands. Normal tests fail on missing or changed images. CI uploads comparison reports on failure and never updates expected images.

## Acceptance

- A clean checkout can install the pinned browser, inspect the gallery, and compare all baselines.
- An intentional visible CSS mutation fails a screenshot assertion; restoration passes.
- Browser tests fail on runtime errors and accidental external requests.
- Golden updates are explicit, documented, and reviewable in git.

## Outcome

The local Vue/React gallery, pinned Chromium comparison runner, explicit update commands, macOS CI job, and contributor workflow are implemented. Normal verification passed all 180 browser tests, including 150 golden comparisons. An intentional magenta button CSS mutation failed comparison; restoring the stylesheet passed. Fonts are loaded before mounting fixtures. Type checking passed, and 413 unit tests passed with 92.73% source line coverage; CI enforces a 90% line floor. The initial reference platform is macOS/Chromium; other engines and operating systems require separately reviewed images.

---
title: One footer on every Latere site
status: testing
depends_on:
  - specs/footer-columns.md
affects:
  - src/react/SiteFooter.tsx
  - src/components/footerNavigation.ts
  - src/i18n/footer.ts
  - src/styles/footer.css
  - tests
effort: medium
created: 2026-10-08
updated: 2026-10-08
author: changkun
dispatched_task_id: null
---

# One footer on every Latere site

## Overview

The family's sites ended in footers of different shapes: the company site and
the platform drew the full footer with small spacing differences, the
identity pages drew the compact one-line strip, ReplicHAI an older layout,
and the gallery at latere.site added a band of its own above the shared one.
Each difference came from the site: a `compact` flag, copy overrides through
`messages`, and site CSS that narrowed the container, removed its edge or hid
its language menu by class. The footer's classes were generic (`site-footer`,
`footer-links`, `logo-text`), so a site's own rules for those names reached
into it without anyone meaning them to.

## Design

- The footer has one shape, the full footer as latere.ai shows it: the
  site's lockup, the social row, a hairline and the theme and language menus
  in the lead, then Applications with Research below it, Platform, Company
  and Legal, then the copyright. The compact strip is removed.
- A site passes only its lockup (`brand`) and its preference wiring (`theme`,
  `onThemeChange`, `locale`, `onLocaleChange`, `locales`), with `baseUrl`
  and `routerLink` for where the company site's links go. `messages` is
  removed from the footer: its copy is the package's.
- A menu is shown only when the site wires it: no theme menu without
  `onThemeChange`, no language menu without `onLocaleChange` or with fewer
  than two `locales`. A site in one language no longer hides the menu with
  CSS.
- Every class the footer draws starts with `lu-footer`, the default lockup's
  included (`lu-footer-home`, `lu-footer-mark`, `lu-footer-word`). A site's
  own `.footer-*` and `.logo-*` rules no longer reach it, and a site rule
  that names `.lu-footer` is a restyle a site test can find.
- Applications lists the Gallery at `https://latere.site/` after the chat,
  so the gallery is reachable from every site: Gallery, 作品广场, Galerie.

## Acceptance criteria

- The footer renders the same columns, links and lead on every site, from
  `FOOTER_COLUMNS` alone. Test: `src/react/__tests__/site-footer.test.tsx`.
- No class the footer draws outside the site's lockup and the shared menus
  lacks the `lu-footer` prefix. Test: the same file.
- The language menu is absent with one locale or no handler, and the theme
  menu absent with no handler. Test: the same file.
- The browser checks of the footer's columns, menus, touch targets and link
  decoration pass in every design. Test: `tests/visual/footer-*.spec.ts`,
  `link-decoration.spec.ts`, `preference-geometry.spec.ts`.

## Outcome

Built for v2.0.0. Status `testing` until the footer's reference images are
recorded by the UI verification workflow on its macOS 15 runner.

---
title: React shell and account parity
status: complete
depends_on:
  - specs/react-basic-parity.md
affects:
  - src/react/
  - src/components/
  - src/docs/
  - src/session/
effort: medium
created: 2026-09-12
updated: 2026-09-13
author: changkun
dispatched_task_id: null
---

# React shell and account parity

## Scope and verification

Add React ConsolePalette, DocsLayout, AccountPrefs, ProductSwitcher and OrgSwitcher with equivalent Vue DOM and shared styles. Preserve controlled inputs, render slots/callbacks, router integrations, placement, filtering, keyboard selection and responsive behavior. Restore optional product switcher integration in React ConsoleSidebar.

Reuse framework-free navigation, docs model, product registry and account labels. Extract pure/shared logic where existing TOC or organization state modules import Vue, retaining public Vue wrappers. React must not acquire a Vue runtime dependency. Match organization ordering, owner/current state, loading/errors, eager refresh and switch behavior. Tests cover lifecycle cleanup, prop updates, accessibility and interaction; complete-matrix supplies cross-adapter browser verification.

## Implementation notes

Adapters and shared logic are implemented in b46a540, b8612a0, a718f3e and 0cb22e0. Vue retains its existing APIs; shared styles cover the palette, preferences and product switcher. `tocCore.ts` and `orgSwitcherModel.ts` avoid Vue runtime imports in React, and markdown uses the same framework-free heading slug functions.

`src/react/shell.ts` exports the adapters and their types for the public entrypoint. React organization state uses `useOrgSwitcher` with plain values; latest-refresh results win and unmounted requests are ignored. DocsLayout memoizes its rendered HTML so outline updates preserve enhanced markup and generated IDs. Builder usage and slot mappings are in `docs/react-shell.md`.

Focused unit tests cover keyboard/focus behavior, slot and prop updates, TOC observers, request races/errors, product collision placement and sidebar integration. Typecheck passes. Public entrypoint integration and cross-adapter browser/pixel verification are complete under the complete-matrix spec.

## Outcome

ConsolePalette, DocsLayout, AccountPrefs, ProductSwitcher and OrgSwitcher are available from the public React entrypoint, including sidebar product switching. [Browser shell tests](../tests/visual/parity-shell.spec.ts) verify navigation, selection and responsive interactions in both adapters. Every shell sheet has exact light/dark desktop/mobile figures under all four appearances. The [complete visual review](../docs/complete-visual-review.md) records both native platforms and source coverage.

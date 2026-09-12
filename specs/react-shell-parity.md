---
title: React shell and account parity
status: drafted
depends_on:
  - specs/react-basic-parity.md
affects:
  - src/react/
  - src/components/
  - src/docs/
  - src/session/
effort: medium
created: 2026-09-12
updated: 2026-09-12
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

Focused unit tests cover keyboard/focus behavior, slot and prop updates, TOC observers, request races/errors, product collision placement and sidebar integration. Typecheck passes. Complete-matrix owns the remaining public entrypoint integration and cross-adapter browser/pixel verification; this spec remains open until that verification is complete.

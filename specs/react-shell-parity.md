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

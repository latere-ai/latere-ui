---
title: React overlay and service parity
status: drafted
depends_on:
  - specs/react-basic-parity.md
affects:
  - src/react/
  - src/glass/
  - src/styles/components/
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# React overlay and service parity

## Scope and verification

Add React GlassPopover, GlassTooltip, GlassMenu, GlassDrawer, GlassToaster and GlassConfirmHost using the existing focus trap and equivalent Vue DOM. Share extracted CSS. Mirror controlled open/close APIs and preserve placement, viewport constraints, disabled states and focus restoration.

Move toast/confirm queue logic into framework-free immutable external stores with subscribe/getSnapshot. Keep Vue reactive exports as compatibility facades; React uses useSyncExternalStore and exports the same imperative services without importing Vue. Preserve timer dismissal, sticky messages, clear, FIFO confirm promises and exactly-once resolution. Unit tests cover service lifecycle and both adapters; browser interactions and exact captures are integrated by complete-matrix. Any discovered behavior fix needs a failing-before regression.

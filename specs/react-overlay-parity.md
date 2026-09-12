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

## Implementation notes

The six React overlays share the extracted Vue component stylesheets. `src/react/overlays.ts` exports them and the framework-free `message`, `dismissToast`, `confirm`, and `resolveConfirm` services. Vue retains its existing reactive `toasts` array and `currentConfirm.current` object facade over the same queues; React subscribes through `useSyncExternalStore` with empty server snapshots.

`GlassPopover` supports internal trigger toggling or optional controlled `open` with `onOpenChange`/`onClose`; its trigger render function receives `{ open, toggle }` and its children render function receives `{ close }`. `GlassDrawer` uses controlled `open`/`onClose` and `header`/children in place of Vue slots. Tooltip, Menu, Toaster, and ConfirmHost preserve Vue markup and behavior.

Verification: 61 unit/integration tests across nine focused files cover service snapshots, timers, FIFO promises, Vue/React interoperability, SSR, placements, menu states, drawer dismissal and focus restoration. The changed TypeScript adapters and cores reached 100% line coverage. Complete-matrix owns browser interactions, all-style captures, exact pixel comparison, and final spec completion.

### Modal transition parity regression

The exact paired confirm capture exposed the existing React modal's missing enter animation: Vue's scale transition and React's immediate mount produced different text rasterization despite identical final DOM, computed styles, and text bounds. React now uses the same CSS enter/leave lifecycle, retaining its portal during exit and cancelling interrupted transitions. Focus trapping still follows the controlled `open` value. The transition hook honors computed zero durations for reduced motion and cleans up frames, listeners, and timers. No comparison tolerance or visual masking was introduced.

The modal transition regression fails with the hook disconnected and passes with it connected. Scoped browser comparisons for modal, confirm, and both drawer sides are exact. Canonical drawer paragraphs also use a single text node, matching Vue interpolation so browser text shaping receives the same input.

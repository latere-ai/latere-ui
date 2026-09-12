---
title: Integrated console sidebar
status: complete
depends_on:
  - specs/compact-design-template.md
affects:
  - src/styles/console.css
  - tests/visual/gallery.css
  - tests/visual/sidebar-integrated.spec.ts
effort: small
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# Integrated console sidebar

## Purpose

The default console sidebar belongs to the window. Its detached rounded rim,
shadow and outlined selected row currently make navigation look like nested
floating controls. The supplied macOS 27 Mail reference instead places a
translucent rail against the window edge and uses a flat selected-row fill.

## Scope

- Remove the sidebar's own outer radius, border and drop shadow. Retain its
  material, 224px expanded width, 64px collapsed width and compact navigation.
- Give the selected row one flat ink tint without an outline or inset highlight.
- Let the workspace shell own its outer corner clipping. Place the rail flush
  against the shell edges; keep padding inside the content column.
- Preserve keyboard focus, collapse/expand and mobile navigation behavior.
- Leave product presets and component APIs unchanged.

## Verification

Add reproducible Vue/React light/dark regressions for integrated rail styling,
flat selection and keyboard focus. Check flush rail placement and shell clipping
at 390px and 1280px, and exercise mobile collapse/expand. Run these regressions
before and after the CSS changes; run existing sidebar, workspace and compact
geometry checks. The parent task records and reviews changed goldens.

## Outcome

The sidebar now shares the window edge with a flat selected-row fill. All eight
new regressions failed against the previous CSS; all 31 sidebar, workspace and
compact-layout checks passed after the change. Light, dark and expanded mobile
workspace screenshots were inspected individually. The existing shell regression
that requires a selected-row inset border must be updated to the new flat
selection contract by the parent task, alongside refreshed goldens.

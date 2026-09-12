---
title: React basic component parity
status: drafted
depends_on: []
affects:
  - src/react/
  - src/components/GlassSurface.vue
  - src/styles/components/
effort: medium
created: 2026-09-12
updated: 2026-09-12
author: changkun
dispatched_task_id: null
---

# React basic component parity

## Scope and verification

Export GlassSurface and add GlassIconButton, GlassSwitch, GlassRadio, GlassTabs, GlassProgress and GlassSkeleton to the React entrypoint. Match Vue markup and behavior while following controlled React value/onChange conventions. Radio uses value for selection and optionValue for the option identity. Forward native surface attributes so optical effects work in React. Extract scoped component styles into shared sheets without changing rendering. React runtime imports must not pull in Vue.

Each component receives behavior and edge-case unit tests. Preserve native keyboard behavior, labels, disabled states, focus and prop updates. The complete-matrix spec provides paired real-browser captures and interactions for every adapter, appearance, theme and viewport. Keep existing Vue APIs and rendering stable during extraction.

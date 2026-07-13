---
title: latere-ui v1.27 — dual framework support (React bindings alongside Vue)
status: validated
depends_on:
  - specs/auth-client-v1.8.md
  - specs/console-shell-v1.9.md
  - specs/liquid-glass-v1.10.md
affects:
  - src/styles/components/* (new — de-scoped single-source component CSS)
  - src/react/* (new — React components + session bindings)
  - src/components/*.vue (scoped styles moved to shared CSS, markup unchanged)
  - package.json (./react export, optional react peer dep, bump to 1.27.0)
  - tsconfig.json (jsx for src/react)
  - vitest.config.ts (@testing-library/react)
  - README.md (React consumer section)
effort: large
trigger: the eval console (latere-ai/eval) is React + Bun; latere-ui components are Vue-only, so a React consumer today gets only the vanilla session core and raw CSS
created: 2026-07-13
updated: 2026-07-13
author: changkun
dispatched_task_id: null
---

# latere-ui v1.27 — dual framework support

## Overview

Make latere-ui consumable from React apps with the same visual system
and session semantics the Vue consoles get. The package stays
source-shipped; a React host compiles `src/react/**` (tsx) exactly as
Vue hosts compile SFCs. Nothing changes for the six existing Vue
consumers: same exports, same markup, same rendered CSS.

## Architecture — one source of truth per layer

| Layer | Single source | Vue adapter | React adapter |
|---|---|---|---|
| tokens/material | `styles/tokens.css`, `styles/glass.css` | import | import |
| component CSS | `styles/components/<name>.css` (new) | SFC imports it; scoped block removed | tsx imports it |
| behavior | headless `.ts` cores (existing pattern: `accountMenu.ts`, `console/nav.ts`, `session/*`) | `.vue` shell | `.tsx` shell |
| session state | vanilla core (`session/client.ts`, `me.ts`, …) | pinia store + `useSession` | `SessionProvider` + `useSession` hook (React context, no pinia) |

**Style de-scoping rule.** For each ported component, move the SFC's
`<style scoped>` block verbatim into `src/styles/components/<kebab>.css`,
un-scoped. All selectors are `lu-`-prefixed classes, so global scope
cannot collide; where a scoped block relied on element selectors or
`:deep()`, rewrite onto explicit `lu-` classes as part of the move.
The SFC then does `import '../styles/components/<kebab>.css';` in its
script block and drops the style block. Rendered output is identical
by construction; existing Vue component tests are the parity gate.
Components NOT ported keep their scoped styles untouched.

## Ported set (v1.27)

React components in `src/react/`, named as the Vue ones:
`GlassButton, GlassPanel, GlassBar, GlassField, GlassBadge,
GlassAlert, GlassSpinner, GlassSelect, GlassCheckbox, GlassTable,
GlassModal, GlassSegmented` — plus the two console-shell pieces
`ConsoleSidebar` and `AccountMenu` (reusing their headless cores), and
session bindings `SessionProvider` / `useSession` /
`useSessionGate` over the vanilla core. Props/slots map 1:1 (slots
become `children` / render props; `v-model` becomes
`value`/`onChange`).

Everything else (Drawer, Toaster, Popover, DocsLayout, SiteFooter,
ProductSwitcher, ConsolePalette, …) is deliberately deferred until a
React consumer needs it; the de-scoping rule makes each later port
incremental.

## Packaging

- `package.json`: `"./react": "./src/react/index.ts"` export;
  `react`/`react-dom` optional peer deps (`peerDependenciesMeta`);
  version 1.27.0. Vue peers unchanged.
- `tsconfig.json`: `"jsx": "react-jsx"` (Vue SFC type-checking is
  unaffected; `vue-tsc` handles tsx).
- Tests: `@testing-library/react` under the existing happy-dom vitest
  environment; every React component gets a render + interaction
  test; existing Vue tests must stay green (parity gate for the CSS
  moves).

## Acceptance

- A React app can `import { GlassButton, SessionProvider, useSession,
  ConsoleSidebar, AccountMenu } from 'latere-ui/react'` plus the CSS
  entrypoints and render the house console shell.
- `bun run test` green (Vue + React); `vue-tsc --noEmit` green.
- No Vue consumer changes required; rendered CSS identical for ported
  components (verified by unchanged Vue tests + manual spot diff).

---
title: latere-ui v1.9 — shared console shell (ConsoleSidebar) + docs renderer (DocsLayout)
status: complete
depends_on:
  - specs/auth-client-v1.8.md
affects:
  - src/console/nav.ts (new — headless nav model + collapse primitive)
  - src/components/ConsoleSidebar.vue (new — Vue adapter, phase 1)
  - src/styles/console.css (new — token-based sidebar styles, phase 1)
  - src/docs/markdown.ts (new — base markdown-it config + helpers, phase 2)
  - src/docs/toc.ts (new — headless TOC / scroll-spy primitive, phase 2)
  - src/components/DocsLayout.vue (new — Vue adapter, phase 2)
  - src/styles/docs.css (new — token-based docs styles, phase 2)
  - src/index.ts (re-exports)
  - package.json (bump to 1.9.0; add markdown-it as a peer/optional dep)
  - README.md (ConsoleSidebar + DocsLayout API sections)
effort: large
trigger: five product consoles (lux, sandbox, agents, wallfacer, lectio) each reimplement a near-identical sidebar shell and 2–3 reimplement a docs renderer; visual + structural drift across consoles
created: 2026-06-14
updated: 2026-06-14
author: changkun
dispatched_task_id: null
---

> **Status: built in latere-ui v1.9.0.** Both phases shipped in-library with
> tests (125 passing) and typecheck clean; the per-product migrations (rollout
> steps 2–5) remain. See the Outcome section for what diverged from this plan.

# latere-ui v1.9 — Shared Console Shell + Docs Renderer

## Overview

Every Latere product console renders the same chrome from scratch: a
foldable sidebar with a product headline, grouped navigation tabs, and an
account control pinned at the bottom; plus, in several products, a docs
section that lists grouped documents and renders Markdown with diagrams and a
table of contents.

The **account layer is already shared** — `AccountMenu`, `AccountPrefs`,
`OrgSwitcher`, and the whole `session/` client ship from `latere-ui` today, and
each console consumes them through a thin local `AccountControl.vue` wrapper.
What is *not* shared is the **sidebar shell around** that account control, and
the **docs renderer**. This spec extracts both, so the consoles align visually
and structurally instead of drifting.

It follows the house pattern established by `createOrgSwitcher` (headless
reactive core) + `OrgSwitcher.vue` (thin Vue adapter): a framework-agnostic
primitive holds the model and behavior; a styled Vue SFC renders it; consumers
override visuals through slots and documented data attributes.

## Goals

- One **`ConsoleSidebar`** that all five consoles can adopt: brand headline +
  grouped nav tabs + collapse/fold + a `#foot` slot for the existing
  `AccountControl`.
- Ship **token-based CSS** with the sidebar (and docs), not just headless
  logic. The stated objective is *visual* alignment; a CSS-unopinionated
  primitive would leave each app styling its own shell and the consoles would
  still look different. This mirrors `SiteFooter`, which already ships
  `footer.css` built on `tokens.css`.
- One **`DocsLayout`** for the 2–3 docs-bearing consoles: grouped doc index +
  article column + TOC/scroll-spy + a base `markdown-it` config, with the
  app-specific diagram layer left as a hook.
- Preserve every current behavior: collapse persistence, per-item badges
  (live/numeric), active-route detection, brand-as-home link, command-palette
  and workspace-switcher affordances.

## Non-goals

- **Not** unifying the diagram pipelines. lux's `[[diagram:name]]` Vue mounts,
  sandbox's mermaid + zoom/pan modal, and wallfacer's light/dark image
  rewriting are genuinely different and stay in each app behind a hook.
- **Not** a router. `ConsoleSidebar` renders links via an injected
  `router-link` component (or `<a>` fallback); it never imports `vue-router`.
- **Not** a state store. Collapse state can be controlled by the host
  (`v-model:collapsed`) or left uncontrolled; persistence stays in the app's
  prefs store.
- React/Svelte adapters remain out of scope until a consumer appears.

## Current state

Scoped to the five flagship consoles (marketing sites and headless harnesses
excluded). Per-component consumer counts set the realistic payoff.

| Project   | Sidebar today                                   | Docs today                                          |
| --------- | ----------------------------------------------- | --------------------------------------------------- |
| lux       | `Sidebar.vue` — collapsible, `pin:'bottom'` groups, badges | `Docs.vue` — `[[diagram:name]]` Vue mounts          |
| sandbox   | `Rail.vue` — **fixed** (no collapse), command palette | `Docs.vue` — mermaid + zoom/pan modal               |
| agents    | `ConsoleShell.vue` — collapsible, internal `open` ref | — none                                              |
| wallfacer | `Sidebar.vue` — collapsible, workspace switcher | `DocPage.vue` / `LocalDocsPage.vue` — TOC, light/dark images |
| lectio    | `AppShell.vue` + `Nav.vue`                       | — (not deep-dived)                                  |

**Sidebar: ~5 consumers. Docs: ~3 consumers.** Sidebar is the clean win and
ships first (phase 1). All three consoles inspected share the same underlying
shape:

```ts
groups: { group: string; items: NavItem[] }[]   // lux, agents, wallfacer all use this
```

The divergences collapse cleanly:

| Divergence                          | Resolution                                                       |
| ----------------------------------- | --------------------------------------------------------------- |
| lux `pin:'bottom'` vs section divs  | one model: `NavGroup { pin?: 'top' \| 'bottom' }`               |
| wallfacer parent-controlled collapse vs lux/agents internal `ref` | `v-model:collapsed` with an uncontrolled default |
| sandbox command palette, wallfacer workspace switcher | slots: `#brand`, `#brand-extra`, `#extra`, `#foot`     |
| active state by `route.name` vs `activeKey` prop | `activeKey` prop, matched against `NavItem.id`         |
| sandbox fixed rail (no fold)        | `collapsible={false}` hides the fold button                     |

---

## Phase 1 — `ConsoleSidebar`

### Headless core — `src/console/nav.ts`

Pure types + a tiny collapse primitive. No DOM, no router.

```ts
export interface NavItem {
  /** Stable id; also the active-state key. */
  id: string;
  /** Visible label (already localized by the host). */
  label: string;
  /** Route target. Omit to render the item disabled ("not yet wired"). */
  to?: string;
  /** Icon name passed through to the host's icon slot. */
  icon?: string;
  /** Badge: a number, the string 'live', or undefined for none. */
  badge?: number | 'live';
  /** Open `to` in a new tab (external links). */
  external?: boolean;
  disabled?: boolean;
}

export interface NavGroup {
  /** Section heading; omit for an unlabeled group. */
  label?: string;
  /** Pin the group to the top (default) or bottom of the rail. */
  pin?: 'top' | 'bottom';
  items: NavItem[];
}

export interface ConsoleNavModel {
  groups: NavGroup[];
}

/** Controlled/uncontrolled collapse helper (mirrors createOrgSwitcher style). */
export interface CollapseOptions {
  initial?: boolean;
  /** Called on every change so the host can persist (e.g. localStorage). */
  onChange?: (collapsed: boolean) => void;
}
export interface CollapseState {
  collapsed: Ref<boolean>;
  toggle: () => void;
  set: (v: boolean) => void;
}
export function createCollapse(opts?: CollapseOptions): CollapseState;

/** Split groups into top/bottom-pinned, preserving order. */
export function partitionGroups(groups: NavGroup[]): { top: NavGroup[]; bottom: NavGroup[] };
```

### Vue adapter — `src/components/ConsoleSidebar.vue`

```
Props
  model: ConsoleNavModel        // grouped nav (required)
  activeKey: string             // matches NavItem.id for active styling
  collapsed?: boolean           // v-model:collapsed (uncontrolled if omitted)
  collapsible?: boolean = true  // false → no fold button (sandbox rail)
  routerLink?: Component        // injected RouterLink; <a> fallback off-router
  brandTheme?: 'lux'|'cella'|'topos'|'wallfacer'|'lectio'|'agon'  // gradient wordmark

Emits
  update:collapsed
  navigate(item: NavItem)       // host performs router.push (keeps router out)

Slots
  #brand            // logo mark + wordmark + "Console" subtitle (default uses brandTheme)
  #brand-extra      // e.g. sandbox command-palette trigger, collapse-aware
  #item="{ item, active, collapsed }"   // override a row entirely
  #extra            // app-specific block above the foot (wallfacer workspace switcher)
  #foot             // <AccountControl/> goes here
```

Behavior reproduced from the three consoles:
- Brand is a `routerLink to="/"`; when `collapsed`, only the mark shows (lux/agents).
- When `collapsed` and `collapsible`, clicking the brand expands (wallfacer affordance) — opt-in via `expandOnBrandClick`.
- Collapsed rows show `title={label}` tooltips and the icon only.
- Badges: numeric pill, or a pulsing dot + "live" text when `badge === 'live'`
  (lux pattern), rendered from `tokens.css` colors.
- Disabled items (no `to`) render non-interactive with a "not yet wired" title.
- Bottom-pinned groups sit below a flex spacer; `#foot` is last.

### Styling — `src/styles/console.css`

Token-based, imported as `latere-ui/console`. Reuses the existing brand-wordmark
gradients already defined in `footer.css` (`.lux-brand`, `.cella-brand`, …) by
moving the shared `*-brand` rules into a brand partial both stylesheets import,
or by documenting `footer.css` as a prerequisite. Consumes the same token set
as the footer (`--text`, `--bg-surface`, `--bg-raised`, `--text-secondary`,
`--text-muted`, `--border`) plus optional `--accent`, `--ok`, `--ok-bg` for the
active state and live badge, with safe fallbacks.

### Example

```vue
<script setup lang="ts">
import { ConsoleSidebar, type ConsoleNavModel } from 'latere-ui';
import 'latere-ui/console';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AccountControl from '@/components/AccountControl.vue';
import { storeToRefs } from 'pinia';
import { usePrefsStore } from '@/stores/prefs';

const prefs = usePrefsStore();
const { sidebarCollapsed } = storeToRefs(prefs);
const route = useRoute();
const router = useRouter();

const model: ConsoleNavModel = {
  groups: [
    { label: 'Workspace', items: [
      { id: 'requests', label: 'Requests', to: '/requests', badge: 'live' },
      { id: 'keys', label: 'Keys', to: '/keys', badge: 3 },
    ] },
    { label: 'Settings', pin: 'bottom', items: [
      { id: 'org', label: 'Organization', to: '/org' },
    ] },
  ],
};
</script>

<template>
  <ConsoleSidebar
    :model="model"
    :active-key="String(route.name)"
    v-model:collapsed="sidebarCollapsed"
    brand-theme="lux"
    :router-link="RouterLink"
    @navigate="(it) => router.push(it.to!)"
  >
    <template #foot><AccountControl placement="bottom-start" /></template>
  </ConsoleSidebar>
</template>
```

---

## Phase 2 — `DocsLayout`

Lower priority, ~3 consumers, partial extraction.

### Shareable

- **`src/docs/markdown.ts`** — base `markdown-it` config (anchor slugs, `.md →
  /docs/:slug` link rewriting, fenced-code passthrough) factored from
  wallfacer's `markdown.ts`. Exports `createMarkdown(opts)` and
  `stripFirstHeading(src)`. `markdown-it` becomes an optional peer dependency so
  apps that don't render docs don't pay for it.
- **`src/docs/toc.ts`** — headless TOC + scroll-spy primitive (h2/h3 extraction
  + `IntersectionObserver`), factored from wallfacer's `useToc`. SSR-safe
  (no-op without `window`).
- **`src/components/DocsLayout.vue`** — two-column layout: grouped doc-index
  sidebar (collapsible) + article column + floating TOC + prev/next nav.
  - Props: `index: DocGroup[]` (`{ label, entries: { slug, title, badge? }[] }`),
    `activeSlug`, `articleHtml`, `routerLink`.
  - Slots: `#article` (override the rendered body), `#toc`, `#sidebar-head`.
- **`src/styles/docs.css`** — token-based docs styling (`latere-ui/docs`).

### Not shareable (left to each app, exposed as a hook)

- The **diagram layer**. `DocsLayout` exposes `enhanceArticle(el: HTMLElement)`
  called after the body mounts/updates; each app plugs in its own pipeline:
  lux mounts `[[diagram:name]]` Vue components, sandbox renders mermaid + the
  zoom/pan modal, wallfacer rewrites light/dark images. No attempt to unify.

### Doc index sourcing

Stays app-side. Some apps glob local `.md` (wallfacer public docs), some fetch
`/api/docs` (lux, sandbox, wallfacer local docs). `DocsLayout` is presentational
over a normalized `DocGroup[]`; fetching/grouping is the host's job.

---

## CSS / token strategy

The library convention to date (per `specs/README.md`) is "CSS-unopinionated:
components ship without styles." This spec deliberately evolves it for the
**flagship shell components**, exactly as `SiteFooter` already does:

- **Headless primitives** (`createCollapse`, `partitionGroups`, `createMarkdown`,
  `toc`) ship no CSS.
- **Adapter SFCs** (`ConsoleSidebar`, `DocsLayout`) ship token-based CSS as
  separate, opt-in entrypoints (`latere-ui/console`, `latere-ui/docs`) so a
  consumer can still go fully headless via slots if it wants.

This is the only way to deliver the *visual* alignment the consoles need; the
README convention note will be updated to distinguish primitives from styled
adapters.

## Testing strategy

Per the repo rule, every behavior ships with a test that fails without it.

- `tests/console-nav.test.ts` — `createCollapse` controlled/uncontrolled +
  `onChange`; `partitionGroups` ordering and pin handling.
- `tests/console-sidebar.test.ts` (`@vue/test-utils` + `happy-dom`) — renders
  groups; active row by `activeKey`; collapse toggle emits `update:collapsed`;
  disabled item is non-interactive; `navigate` emitted with the right item;
  `collapsible=false` hides the fold; badge variants render; slots override.
- `tests/docs-toc.test.ts` — heading extraction; scroll-spy active id; SSR no-op
  without `window`.
- `tests/docs-markdown.test.ts` — anchor slugs; `.md` link rewriting;
  `stripFirstHeading`.
- `tests/docs-layout.test.ts` — index renders grouped; active slug; prev/next;
  `enhanceArticle` invoked after mount/update.

## Rollout

1. Land phase 1 (headless `nav.ts` + `ConsoleSidebar.vue` + `console.css` +
   tests), bump to `1.9.0-beta`.
2. **Pilot migrate one console** — lux (richest: collapse persistence + live
   badges + pinned groups) — to validate the API before the others. Keep its
   local CSS overrides minimal.
3. Migrate agents, wallfacer, lectio; adopt sandbox last with `collapsible=false`
   (proves the fixed-rail path).
4. Land phase 2 (`DocsLayout`) the same way: build → pilot on wallfacer (source
   of the markdown/TOC code) → migrate lux + sandbox.
5. Tag `1.9.0`; per-product bumps reference this spec.

## Open questions

- **Brand gradients** (`*-brand`) currently live in `footer.css`. Extract to a
  shared `brand.css` partial both `footer.css` and `console.css` import, or keep
  `footer.css` a prerequisite of `console.css`? (Leaning: extract.)
- **Icon rendering** — each app has its own `Icon.vue` with a private name set.
  `ConsoleSidebar` should take icons via an `#item`/icon slot rather than
  bundling an icon font. Confirm no app needs a built-in icon set.
- **lectio** was not deep-dived; confirm its `AppShell`/`Nav` matches the model
  before counting it as a clean consumer.
- Does `markdown-it` as an optional peer dep cause friction for the
  docs-free consoles (agents)? Alternative: ship `markdown.ts` as a separate
  subpath so it's only pulled when imported.

## Outcome (built in v1.9.0)

Both phases shipped in-library. 125 tests pass; `vue-tsc` clean. What landed:

| Artifact | File |
| --- | --- |
| Headless nav model + collapse | `src/console/nav.ts` |
| Console sidebar adapter | `src/components/ConsoleSidebar.vue` |
| Console styles | `src/styles/console.css` (`latere-ui/console`) |
| Shared brand wordmarks | `src/styles/brand.css` (`latere-ui/brand`) |
| Headless grouped-docs model | `src/docs/model.ts` |
| Headless TOC / scroll-spy | `src/docs/toc.ts` |
| Markdown config helper | `src/docs/markdown.ts` (`latere-ui/markdown`) |
| Docs layout adapter | `src/components/DocsLayout.vue` |
| Docs styles | `src/styles/docs.css` (`latere-ui/docs`) |

Decisions that diverged from the plan:

- **Brand gradients extracted.** The `*-brand` wordmark rules moved from
  `footer.css` into a shared `src/styles/brand.css`, `@import`-ed by both
  `footer.css` and `console.css` (single source of truth). The footer test was
  repointed to `brand.css`.
- **markdown-it is injected, not a peer dependency.** `createMarkdown(MarkdownIt,
  opts)` takes the host's constructor (the routerLink-injection pattern), so
  latere-ui has zero markdown runtime dependency and docs-free consoles pay
  nothing. It is exported only from the `latere-ui/markdown` subpath, never the
  main barrel, so importing latere-ui never pulls markdown-it types. (Resolves
  the open question — chose injection over an optional peer dep.) markdown-it is
  a devDependency for tests only.
- **Heading ids align with the TOC.** `createMarkdown` assigns heading ids using
  the exact `slugify` the TOC primitive uses, so anchors and the on-this-page
  list always agree across apps.
- **Grouped docs model matches the production example.** The document-intelligence
  console's `CATEGORIES` shape (`{ id, label, icon?, advanced?, pages: [{ slug,
  title }] }` + flattened list + search index) is the model `DocsLayout` consumes,
  so it fits both markdown docs (`articleHtml`) and component-driven docs
  (`#article` slot).
- **Collapse control uses a `null` sentinel.** Vue casts an absent Boolean prop to
  `false`, which masked uncontrolled mode; `collapsed?: boolean | null` defaulting
  to `null` distinguishes "unset" from "controlled false".
- **Icons via slot, no bundled set** (resolves that open question): rows take an
  `icon` name surfaced through the `#icon` slot.

Still open / deferred:

- Per-product migrations (rollout steps 2–5) are not done — this is library-only.
- **lectio** still not deep-dived; confirm `AppShell`/`Nav` fits before migrating.

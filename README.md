# latere-ui

Shared Latere platform UI components used across the marketing site and every
product console: the site footer and logo mark, the session/auth client +
account menu, the **console sidebar** (brand · grouped tabs · foldable rail),
and the **docs renderer** (grouped doc index · article · TOC).

## Install

Consumed directly from GitHub (no registry). Pin a tag:

```sh
bun add github:latere-ai/latere-ui#v1.3.2
```

Every consumer is a Vite + Vue 3 app, so this package ships **source** (`.vue` /
`.ts` / `.css`) and is compiled by the host app's `@vitejs/plugin-vue`. Under
`vite-ssg` (SSR), add the package to `ssr.noExternal` so its SFCs are compiled
for the server build:

```ts
// vite.config.ts
export default defineConfig({
  // ...
  ssr: { noExternal: ['latere-ui'] },
});
```

## Usage

The footer is presentational: it takes `theme` / `locale` and emits
`update:theme` / `update:locale`. Wire it to your app's own prefs store with
`v-model`:

```vue
<script setup lang="ts">
import { SiteFooter } from 'latere-ui';
import 'latere-ui/styles';
// import 'latere-ui/tokens'; // only if your app has no --text/--bg-* tokens
import { storeToRefs } from 'pinia';
import { usePrefsStore } from '@/stores/prefs';

const prefs = usePrefsStore();
const { theme, locale } = storeToRefs(prefs);
</script>

<template>
  <SiteFooter v-model:theme="theme" v-model:locale="locale" />
</template>
```

### Props

| Prop         | Type                          | Default               | Notes                                                                 |
| ------------ | ----------------------------- | --------------------- | --------------------------------------------------------------------- |
| `theme`      | `'light' \| 'dark' \| 'auto'` | —                     | Drives the active state of the theme toggle.                          |
| `locale`     | `'en' \| 'zh'`                | —                     | Selects footer copy and the active language toggle.                   |
| `locales`    | `LocaleOption[]`              | `[en, zh]`            | Languages in the locale dropdown (`{ code, label, name? }`).          |
| `messages`   | `Record<string, Dict>`        | `undefined`           | Per-locale string overrides, merged over the bundled footer copy.     |
| `baseUrl`    | `string`                      | `'https://latere.ai'` | Origin for the site's own links (Team, Blog, Legal, home).            |
| `routerLink` | `Component`                   | `undefined`           | Pass `RouterLink` to keep SPA navigation for internal links on-site.  |

The language switcher is a dropdown built from `locales`. To support a locale the
package does not bundle (currently en + zh), pass it in `locales` and supply its
footer strings via `messages`, e.g. `:messages="{ de: { 'footer.tagline': '…' } }"`.

Cross-product links (Wallfacer, Topos, …) are always absolute. Internal links
resolve against `baseUrl` as plain `<a>` unless `routerLink` is supplied, in
which case they render through it with a relative `to`.

## Console sidebar

`ConsoleSidebar` is the shared product-console rail: a brand headline, grouped
nav tabs, a fold/collapse toggle, and a `#foot` slot for your `AccountControl`.
The nav model and collapse logic are headless (`createCollapse`,
`partitionGroups`); the SFC is a thin adapter. Styles ship as the opt-in
`latere-ui/console` entrypoint (built on `tokens.css`), so the consoles align
visually instead of each restyling their own rail.

```vue
<script setup lang="ts">
import { ConsoleSidebar, type ConsoleNavModel } from 'latere-ui';
import 'latere-ui/console';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AccountControl from '@/components/AccountControl.vue';

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
    brand-name="Lux" brand-sub="Console" brand-theme="lux"
    :router-link="RouterLink"
    @navigate="(it) => router.push(it.to!)"
  >
    <template #foot><AccountControl placement="bottom-start" /></template>
  </ConsoleSidebar>
</template>
```

Collapse is `v-model:collapsed` (controlled) or uncontrolled if you omit it.
Set `:collapsible="false"` for a fixed rail. A nav item without `to` renders
disabled. Override any row via the `#item` slot, the logo via `#brand`, and
insert app-specific affordances (command palette, workspace switcher) via
`#brand-extra` / `#extra`. Items take an `icon` name surfaced through the
`#icon` slot — the library bundles no icon set.

## Docs renderer

`DocsLayout` renders **multiple grouped docs**: a categorized index (left), the
article (center), an auto table of contents with scroll-spy (right), and
prev/next across the flattened reading order. It drives both markdown docs
(pass `articleHtml`) and component-driven docs (use the `#article` slot). The
grouped model and TOC are headless (`flattenDocs`, `adjacentDocs`,
`buildDocSearchIndex`, `createToc`); styles ship as `latere-ui/docs`.

```vue
<script setup lang="ts">
import { DocsLayout, type DocGroup } from 'latere-ui';
import 'latere-ui/docs';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const groups: DocGroup[] = [
  { id: 'getting-started', label: 'Getting started', icon: 'rocket', pages: [
    { slug: 'overview', title: 'Overview' },
    { slug: 'quick-start', title: 'Quick start' },
  ] },
  { id: 'internals', label: 'Internals', advanced: true, pages: [
    { slug: 'architecture', title: 'Architecture' },
  ] },
];
const route = useRoute();
const router = useRouter();
</script>

<template>
  <DocsLayout
    :groups="groups"
    :active-slug="route.params.slug as string"
    :active-group-id="route.params.group as string"
    :article-html="renderedMarkdown"
    base="/docs"
    :router-link="RouterLink"
    :enhance="mountDiagrams"
    @navigate="(d) => router.push(`/docs/${d.groupId}/${d.slug}`)"
  />
</template>
```

App-specific post-processing — mermaid, light/dark images, `[[diagram:name]]`
mounts — plugs into the `enhance(el)` hook; the layout never owns a diagram
pipeline. For markdown, `latere-ui/markdown` exports `createMarkdown(MarkdownIt,
opts)` (you inject your own `markdown-it`) which assigns heading ids with the
**same** slugify as the TOC, so anchors and the on-this-page list always agree:

```ts
import MarkdownIt from 'markdown-it';
import { createMarkdown, stripFirstHeading } from 'latere-ui/markdown';

const md = createMarkdown(MarkdownIt, {
  rewriteLink: (href) => (href.endsWith('.md') ? `/docs/${href.replace(/\.md$/, '')}` : undefined),
});
const html = md.render(stripFirstHeading(source));
```

## Develop

```sh
bun install
bun run test       # vitest
bun run typecheck  # vue-tsc
```

# latere-ui

Shared Latere platform UI components. Currently exports the site footer and the
Latere logo mark, used across the marketing site and every product landing page.

## Install

Consumed directly from GitHub (no registry). Pin a tag:

```sh
bun add github:latere-ai/latere-ui#v1.0.2
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
| `baseUrl`    | `string`                      | `'https://latere.ai'` | Origin for the site's own links (Team, Blog, Legal, home).            |
| `routerLink` | `Component`                   | `undefined`           | Pass `RouterLink` to keep SPA navigation for internal links on-site.  |

Cross-product links (Wallfacer, Topos, …) are always absolute. Internal links
resolve against `baseUrl` as plain `<a>` unless `routerLink` is supplied, in
which case they render through it with a relative `to`.

## Develop

```sh
bun install
bun run test       # vitest
bun run typecheck  # vue-tsc
```

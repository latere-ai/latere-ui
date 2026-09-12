# latere-ui

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest tag](https://img.shields.io/github/v/tag/latere-ai/latere-ui?label=version)](https://github.com/latere-ai/latere-ui/tags)
[![Vue 3.5+](https://img.shields.io/badge/vue-3.5%2B-42b883.svg)](https://vuejs.org/)
[![React 18 or 19](https://img.shields.io/badge/react-18%20%7C%2019-61dafb.svg)](https://react.dev/)

Shared glass materials, interface components, and application chrome for Latere products. Build forms, navigation, dialogs, and documentation with one visual language in Vue, with a supported subset for React.

![Glass surfaces, panels, a toolbar, and a data table in the light theme](tests/visual/goldens/darwin-27/vue-containers-light-desktop.png)

[Design guide](docs/design-system.md) · [Integration guide](docs/api-guide.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## What you can build

| Surface | Included | Framework |
|---|---|---|
| Controls and forms | Buttons, fields, choices, tabs, status, and tables | Vue; [React subset](docs/api-guide.md#glass-primitives) |
| Overlays | Dialogs, drawers, popovers, menus, tooltips, toasts, and confirms | Vue; modal in React |
| Console | Grouped navigation, collapsible sidebar, account menu, command palette | Vue; sidebar and account menu in React |
| Documentation | Grouped index, article, table of contents, previous/next navigation | Vue |
| Site chrome | Full and compact footer, theme and language controls, logo | Vue and React |
| Session | API client, account resolution, organization switching, session bindings | Vue and React |

The package ships `.vue`, `.tsx`, `.ts`, and `.css` source. Your application compiles it with its own toolchain. Vue has the complete component set; React exports are listed in [src/react/index.ts](src/react/index.ts).

## Install

Pin a GitHub release tag:

```sh
bun add github:latere-ai/latere-ui#v1.28.1
```

Use Vue 3.5+ with your Vue compiler, or React 18/19 with your React toolchain. React applications import `latere-ui/react`. For server rendering with Vite, include `ssr: { noExternal: ['latere-ui'] }` so the package source is compiled for the server too.

## Start with a panel

Import the palette and material before mounting components:

```vue
<script setup lang="ts">
import { GlassPanel, GlassButton } from 'latere-ui';
import 'latere-ui/tokens';
import 'latere-ui/glass';
</script>

<template>
  <GlassPanel>
    <h2>Your workspace</h2>
    <p>Keep projects, people, and activity together.</p>
    <GlassButton variant="primary">Create project</GlassButton>
  </GlassPanel>
</template>
```

The React equivalent uses the same material:

```tsx
import { GlassPanel, GlassButton } from 'latere-ui/react';
import 'latere-ui/tokens';
import 'latere-ui/glass';

export function Workspace() {
  return (
    <GlassPanel>
      <h2>Your workspace</h2>
      <p>Keep projects, people, and activity together.</p>
      <GlassButton variant="primary">Create project</GlassButton>
    </GlassPanel>
  );
}
```

Apply a canvas background so translucent surfaces have something to blur:

```css
body {
  margin: 0;
  color: var(--text);
  background: radial-gradient(ellipse at top left, #dce6df, transparent 65%), var(--bg);
}
```

`latere-ui/tokens` supplies a default palette. If your app already defines the expected CSS variables, keep its palette instead. Set `data-theme="dark"` on the document root to select the dark tokens. Footer theme controls report the reader's choice; your app applies it and resolves `auto` from the system preference.

## Compose the interface

![The design system flows from tokens through glass materials and components into an application shell](docs/figures/design-skeleton.svg)

Use regular glass for panels and navigation, thick glass for readable overlays, and smoke for inverse emphasis. Keep document bodies, terminals, and video on content surfaces. The [design guide](docs/design-system.md) shows the material ladder and how it fits into a shell.

| Import | Purpose |
|---|---|
| `latere-ui` | Vue components and shared helpers |
| `latere-ui/react` | React components and session bindings |
| `latere-ui/tokens` | Optional default palette and geometry |
| `latere-ui/glass` | Glass material, tiers, and preference fallbacks |
| `latere-ui/console` | Console sidebar styles |
| `latere-ui/docs` | Documentation layout and article styles |
| `latere-ui/styles` | Footer styles for Vue; React footer imports them |
| `latere-ui/brand` | Product wordmark gradients |
| `latere-ui/markdown` | Markdown helpers with TOC-compatible heading IDs |

For exact props, events, router integration, footer locales, and session setup, see the [integration guide](docs/api-guide.md). English, Chinese, and German footer dictionaries are bundled; the default language dropdown offers English and Chinese.

## Review the visuals

![Button variants, sizes, disabled states, and loading states](tests/visual/goldens/darwin-27/vue-buttons-light-desktop.png)

The repository keeps golden PNGs of real components in light and dark themes. Desktop figures cover each visual export; selected mobile figures cover responsive layouts. Vue and React have separate baselines against the shared styles.

Use the [visual reference index](docs/visual-reference.md) to find a component and browse its golden figures, and follow [Contributing](CONTRIBUTING.md) to run comparisons or review an intentional update. The figures show fixed test content and rendering conditions; they complement interaction tests.

## Develop

```sh
bun install
bun run test
bun run typecheck
```

The unit suite covers Vue and React. Browser fixtures exercise actual layout and generate the visual references shown here. See [Contributing](CONTRIBUTING.md) for browser setup, screenshot comparison, and baseline review.

MIT licensed. See [LICENSE](LICENSE).

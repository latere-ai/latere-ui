# latere-ui

[![UI verification](https://github.com/latere-ai/latere-ui/actions/workflows/visual.yml/badge.svg)](https://github.com/latere-ai/latere-ui/actions/workflows/visual.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest tag](https://img.shields.io/github/v/tag/latere-ai/latere-ui?label=version)](https://github.com/latere-ai/latere-ui/tags)
[![React 18 or 19](https://img.shields.io/badge/react-18%20%7C%2019-61dafb.svg)](https://react.dev/)

Shared glass materials, interface components, and application chrome for React. Build forms, navigation, dialogs, consoles, and documentation pages, in default glass, the ink palette, or the matte Replichai, Wallfacer and Origo appearances.

The materials, controls, overlays, console shell, and documentation layout are product-neutral. A few parts are Latere's own and are published for Latere's products: the site footer carries Latere's product lineup and links, the logo marks and the favicon helper are Latere's, and the session helpers expect a backend that serves the [session contract](docs/api-guide.md#session) Latere's backends serve, under paths you can rename.

![Compact workspace with navigation, toolbar, summary panels and projects](tests/visual/goldens/darwin-24/workspace-light-laptop.png)

[Design guide](docs/design-system.md) · [Integration guide](docs/api-guide.md) · [Console components](docs/react-shell.md) · [Visual reference](docs/visual-reference.md) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

Every component has light and dark figures in all four appearances, and mobile figures in the default appearance; the [visual reference](docs/visual-reference.md) indexes them.

## Choose an appearance

| Replichai · reading | Wallfacer · operations | Origo · repositories |
|---|---|---|
| [![Replichai component appearance](tests/visual/goldens/darwin-24/replichai-workspace-light-desktop.png)](tests/visual/goldens/darwin-24/replichai-workspace-light-desktop.png) | [![Wallfacer component appearance](tests/visual/goldens/darwin-24/wallfacer-workspace-light-desktop.png)](tests/visual/goldens/darwin-24/wallfacer-workspace-light-desktop.png) | [![Origo component appearance](tests/visual/goldens/darwin-24/origo-workspace-light-desktop.png)](tests/visual/goldens/darwin-24/origo-workspace-light-desktop.png) |

Import `latere-ui/presets` after the shared styles and set `data-design="replichai"`, `"wallfacer"`, or `"origo"` on `<html>`. Each has its own fonts, density, corners, surface treatment and interaction states. See [setup and font requirements](docs/design-system.md#keep-product-styling-explicit) and [per-style golden figures](docs/visual-reference.md#product-style-variations).

### Ink

The platform console, its documentation and the identity pages read the ink palette: neutral grays with no hue, ink as the accent, and the primary action inverted between the themes. Import `latere-ui/ink` after the shared styles and set `data-design="ink"` on `<html>`:

```tsx
import 'latere-ui/tokens';
import 'latere-ui/glass';
import 'latere-ui/ink';

document.documentElement.dataset.design = 'ink';
```

`data-theme="dark"` selects the dark ladder. Every text tone reaches 4.5:1 on every surface it is set on, and control edges reach 3:1. Besides surfaces, text, borders and the primary action, the stylesheet defines the status tones (`--ok`, `--info`, `--warn`, `--danger`, and the `--state-*` tones the badges and alerts read), the admin-audience tone, code syntax and terminal colors, a radius ladder from `--radius-chip` (4px) to `--radius-card` (16px), the control heights, the console type scale, and the page gutter. It maps the package's own radius and control-scale tokens onto that ladder, so the components follow it. The [design guide](docs/design-system.md#use-the-ink-palette) lists the tokens.

## What you can build

| Surface | Included |
|---|---|
| Controls and forms | Buttons, fields, choices, tabs, status, and tables |
| Overlays | Dialogs, drawers, popovers, menus, tooltips, toasts, and confirms |
| Console | Grouped navigation, collapsible sidebar, account menu, command palette |
| Documentation | Grouped index, article, table of contents, previous/next navigation |
| Site chrome | The family's footer, theme and language menus, logo, favicon |
| Session | API client, account resolution, organization switching, session bindings |
| Telemetry | Page load, request and Core Web Vitals traces sent to your backend's telemetry relay, from any framework or none |
| Structured data | schema.org descriptions of organizations, sites, books, chapters, articles and blog posts for search engines and AI agents, from any framework or none |

The package ships `.tsx`, `.ts`, and `.css` source. Your application compiles it with its own toolchain. Components import from [latere-ui](src/react/index.ts) (also published as `latere-ui/react`); the [API guide](docs/api-guide.md) explains controlled values and callbacks.

## Install

The package is not on a registry. Pin a release tag from the [releases page](https://github.com/latere-ai/latere-ui/releases), for example:

```sh
bun add github:latere-ai/latere-ui#v1.35.0
```

These docs and figures track `main`. Changes that are not yet in a release are listed under Unreleased in the [changelog](CHANGELOG.md).

Install React 18 or 19 and React DOM; both are required peers. For server rendering with Vite, include `ssr: { noExternal: ['latere-ui'] }` so the package source is compiled for the server too.

Version 2 is React only. A Vue application stays on a v1.x tag, such as `github:latere-ai/latere-ui#v1.32.2`; the [changelog](CHANGELOG.md) lists what v2 removed and how a React application moves to it.

## Start with a panel

Import the palette and material before mounting components:

```tsx
import { GlassPanel, GlassButton } from 'latere-ui';
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
| `latere-ui` | Components, session bindings and shared helpers |
| `latere-ui/react` | The same module as `latere-ui` |
| `latere-ui/tokens` | Optional default palette and geometry |
| `latere-ui/ink` | Optional ink palette, selected with `data-design="ink"` |
| `latere-ui/glass` | Glass material, tiers, and preference fallbacks |
| `latere-ui/console` | Console sidebar styles |
| `latere-ui/docs` | Documentation layout and article styles |
| `latere-ui/styles` | Footer styles; `SiteFooter` imports them |
| `latere-ui/presets` | Optional Replichai, Wallfacer and Origo component appearances |
| `latere-ui/brand` | Product wordmark gradients |
| `latere-ui/markdown` | Markdown helpers with TOC-compatible heading IDs |
| `latere-ui/telemetry` | Browser telemetry through your backend's relay, loaded after the page |
| `latere-ui/structured-data` | schema.org JSON-LD builders and the escaped script element for a page's head |
| `latere-ui/favicon` | The platform's browser tab icon as an SVG document, for a build script or a server |

For exact props, callbacks, router integration, footer locales, session setup, [browser telemetry](docs/api-guide.md#browser-telemetry) and [structured data](docs/api-guide.md#structured-data), see the [integration guide](docs/api-guide.md) and the [console and account component examples](docs/react-shell.md). English, Chinese, and German footer dictionaries are bundled; the default language menu offers English and Chinese.

`SiteFooter` is the one footer every Latere site ends in. It leads with the site's lockup, the social profiles and the theme and language menus, and sets four link columns beside them: Applications (Latere, the chat, and the Gallery) with Research (ReplicHAI) below it, Platform (Latere Platform and Identity), Company, and Legal. A site passes its lockup and wires the theme and the language; it does not restyle the footer. `ThemeMenu` and `LocaleMenu` are the footer's menus, exported for a header.

`latere-ui/favicon` writes the platform's tab icon from the same mark the console navigation draws: `platformFaviconSvg()` returns the SVG document, ink in a light tab and light ink in a dark one. It renders with `react-dom/server`, so call it from a build script or a server, not from client code:

```ts
import { platformFaviconSvg } from 'latere-ui/favicon';

await Bun.write('public/favicon.svg', platformFaviconSvg());
```

## Review the visuals

![Button variants, sizes, disabled states, and loading states](tests/visual/goldens/darwin-24/buttons-light-desktop.png)

The repository keeps golden PNGs of real components in light and dark themes, rendered at 2× resolution, as on a high-density display. The matrix includes every visual component in desktop/light, desktop/dark, mobile/light and mobile/dark for default glass, and desktop/light and desktop/dark for Replichai, Wallfacer and Origo. Comparisons require identical decoded RGBA pixels, with no channel or antialiasing tolerance.

| Workspace references | Light | Dark |
|---|---|---|
| Desktop | [View](tests/visual/goldens/darwin-24/workspace-light-desktop.png) | [View](tests/visual/goldens/darwin-24/workspace-dark-desktop.png) |
| Mobile | [View](tests/visual/goldens/darwin-24/workspace-light-mobile.png) | [View](tests/visual/goldens/darwin-24/workspace-dark-mobile.png) |

Use the [visual reference index](docs/visual-reference.md) to find a component and browse its golden figures. The figures show fixed content and rendering conditions; separate interaction tests cover focus, keyboard, and scrolling behavior.

## Contributing

```sh
bun install
bun run test
bun run typecheck
```

The unit suite covers the components, the framework-free modules and the stylesheets' contrast. Browser fixtures exercise actual layout and generate the visual references shown here. [Contributing](CONTRIBUTING.md) covers the browser setup, screenshot comparison, and how an intended visual change is reviewed; the [review records](docs/reviews/README.md) document each past regeneration. Design specs are in [`specs/`](specs/README.md).

## License

MIT. See [LICENSE](LICENSE).

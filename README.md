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

## Liquid Glass

The shared Apple-style glass design system: a **material** (translucent, blurred,
specular-edged layers) plus a component library built on it, so every product
console reads as one coherent surface. This section covers the material
foundation; the `Glass*` component library is layered on top.

**v1.20 (Liquid Glass v2)** firms the recipe: a **five-step material ladder**,
capsule geometry on a radii ladder, **ink as the only accent** (product colors
survive only as gradient wordmarks), and a layered floating-glass shadow. See
`specs/liquid-glass-v2-v1.20.md`. Migrating from v1.10.x: the `.lu-glass-clear`
Clear tier and the `.lu-glass-dim` utility are removed (the `--glass-dim` modal
scrim token stays); `.lu-glass-ultrathin` and `.lu-glass-smoke` are new; the
`GlassTier` union is now `ultrathin | thin | regular | thick | smoke`; and
`--accent` resolves to ink — drop any per-product chromatic accent.

Import the material once, then set a canvas for glass to refract against:

```ts
import 'latere-ui/glass';           // material tokens + tier utilities + fallback
```

```css
/* Your product theme — give glass something to blur behind it. */
:root {
  --canvas: #f4f6f5;
  --canvas-gradient: radial-gradient(60% 50% at 30% 0%, #eef2f0 0%, transparent 70%);
  /* Optionally tune the tint; sensible neutral defaults ship in glass.css. */
  --glass-bg: rgba(255, 255, 255, 0.62);
}
```

Modeled on Apple's Liquid Glass (macOS Tahoe / HIG). Glass is a distinct layer
that floats above content, built from three optical layers — **illumination**
(tint + backdrop blur + a `--glass-brightness` luminance lift so content reads
_through_ the glass as frost rather than under it as a scrim), **highlight**
(specular top-edge rim), and **shadow** (separation from content).

The **five-step material ladder** — pick a tier by prominence, never decoration:

| Tier | Class | Use for |
|------|-------|---------|
| ultrathin | `.lu-glass-ultrathin` | hover targets, chips, badges, search, inputs |
| thin | `.lu-glass-thin` | nav rows, pills, ghost buttons, bars |
| regular | `.lu-glass` | cards, panels, the sidebar slab |
| thick | `.lu-glass-thick` | modals, popovers, palettes — anything over busy content |
| smoke | `.lu-glass-smoke` | primary buttons, inverse emphasis (ink glass) |

`smoke` is near-solid ink glass; its label color is `--glass-smoke-ink` (flips
per theme) — never hardcode white on it.

```ts
import { useGlass, concentricRadius } from 'latere-ui';
const { glassClass, reducedTransparency } = useGlass();
// :class="glassClass('regular')"  — reducedTransparency is a reactive ref
// concentricRadius('8px') → calc(var(--glass-radius,22px) - 8px)
```

Obligations when adopting:

1. **Set a `--canvas`.** Frosted glass over a flat fill reads as dead gray.
2. **Glass is chrome, never content.** Never put glass over live
   terminal / VNC / video — `backdrop-filter` there tanks performance and
   legibility. Keep content surfaces opaque.
3. **Concentric corners.** A nested control's radius = parent radius − padding;
   use `concentricRadius()` / `--glass-radius`.
4. **Accessibility is automatic.** `prefers-reduced-transparency: reduce`,
   `prefers-contrast: more` (Apple Increase Contrast → near-opaque, 4.5:1), and
   browsers without `backdrop-filter` all redefine the glass tokens, so every
   surface degrades with no per-component work.
5. **Hand-rolled chains must carry the full recipe.** The `.lu-glass*` classes
   bake `brightness(var(--glass-brightness))` into their `backdrop-filter`. A
   surface that writes its own chain instead — `blur(var(--glass-blur))
   saturate(var(--glass-saturate))` — must append `brightness(var(--glass-
   brightness, 1))` too, on both the standard and `-webkit-` property; otherwise
   dark-mode glass darkens content into a scrim instead of lifting it to frost.
   Prefer the class over a hand-rolled chain wherever possible.

### Native v2 runtime — refraction + sheen

The CSS material gives you tint, blur, saturation, rim light, and shadow. The
_distortion_ — the background visibly bending at the rounded edge, the way real
Apple Liquid Glass lenses what sits behind it — is a progressive enhancement in
JS, because no CSS primitive can displace the backdrop (it needs an SVG
`feDisplacementMap`). Call it once near the app root:

```ts
import { useLiquidGlass } from 'latere-ui';   // Vue
useLiquidGlass({ watchSource: () => route.fullPath }); // re-scan on navigation
// …or framework-free: import { initLiquidGlass } from 'latere-ui';
//                     initLiquidGlass();  // call again after the DOM changes
```

What it does, per surface:

- **Refraction** — appends an edge-inward SVG displacement to the
  `backdrop-filter` chain so the background bends at the corners. Auto-applies to
  any glass surface with radius ≥ 16px. **Chromium only** (feature-detected via
  `CSS.supports('backdrop-filter','url(#f)')`); every other engine keeps the
  flat frosted blur. Force it on a tighter radius with `data-lg-refract`, or
  suppress with `data-lg-refract="off"`.
- **Sheen** — a soft specular highlight that follows the cursor. **Opt-in**: a
  surface must carry `data-lg-sheen`, otherwise the highlight reads as a stray
  blob smeared across a footer or menu. Use it on deliberate hero panels only.

Both honor `prefers-reduced-motion` (no sheen) and
`prefers-reduced-transparency` (no refraction), and are SSR-safe no-ops.

### Overlay glass — and why a dropdown sometimes shows no blur

Dropdowns, mega-menus, popovers, and palettes float over arbitrary busy content,
so they take the **thick** tier — a near-opaque fill (`--glass-bg-thick`, 0.90)
_plus_ blur, so sharp headings underneath are occluded rather than bleeding
through. Reach for `GlassPopover` (its panel is already `.lu-glass-thick`) or
apply the class directly; never hand-roll a translucent panel with a light fill,
which is the usual cause of "the text behind is unreadable".

```html
<!-- Bespoke overlay markup: thick tier + no backdrop-filter killer above it. -->
<div class="lu-glass-thick" role="menu"> … </div>
```

If an overlay still shows **no blur at all**, the backdrop-filter is being
neutralized, not missing. `backdrop-filter` samples the backdrop only up to the
nearest ancestor that establishes an isolated compositing context — so **any
ancestor with `transform`, `filter`, `perspective`, `will-change`, `contain`, or
a non-`normal` `mix-blend-mode` silently kills the blur** on everything beneath
it. Keep the glass surface out of such a subtree (portal it to `<body>`), or drop
the offending property. This is the single most common Liquid Glass regression.

### Component library

| Group | Components |
|-------|-----------|
| Surfaces | `GlassSurface`, `GlassPanel`, `GlassBar` |
| Controls | `GlassButton`, `GlassIconButton`, `GlassSwitch`, `GlassSegmented`, `GlassCheckbox`, `GlassRadio`, `GlassTabs` |
| Inputs | `GlassField`, `GlassSelect` |
| Feedback | `GlassBadge`, `GlassAlert`, `GlassSpinner`, `GlassProgress`, `GlassSkeleton`, `GlassTooltip` |
| Overlays | `GlassModal`, `GlassDrawer`, `GlassPopover`, `GlassMenu` |
| Data | `GlassTable` |

Imperative services (mount the host once, call anywhere):

```ts
import { GlassToaster, GlassConfirmHost, message, confirm } from 'latere-ui';
// <GlassToaster /> and <GlassConfirmHost /> near the app root, then:
message.success('Saved');
if (await confirm({ message: 'Delete this sandbox?', danger: true })) { /* … */ }
```

## Develop

```sh
bun install
bun run test       # vitest
bun run typecheck  # vue-tsc
```

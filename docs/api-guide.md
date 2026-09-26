# Integration guide

Precise examples for footer preferences, console navigation, documentation, glass materials, session bindings, browser telemetry, and structured data. This guide tracks `main`; changes not yet in a release are listed under Unreleased in the [changelog](../CHANGELOG.md#unreleased). Start with the [README](../README.md) for installation or the [design guide](design-system.md) for visual composition.

![Tokens, materials, components, and composed surfaces](figures/design-skeleton.svg)

## Component appearance

Import optional presets after the shared styles and any console/docs styles:

```ts
import 'latere-ui/tokens';
import 'latere-ui/styles';
import 'latere-ui/console';
import 'latere-ui/presets';

document.documentElement.dataset.design = 'origo';
document.documentElement.dataset.theme = 'dark';
```

`data-design` accepts `replichai`, `wallfacer`, or `origo` on `<html>`. Remove the attribute to restore default glass. Root scope also styles teleported overlays; nested mixed appearances are unsupported. Supply Inter for Replichai/Wallfacer or IBM Plex Sans/Mono for Origo through the host font pipeline. See the [design guide](design-system.md#keep-product-styling-explicit) for geometry, palette and font details, and the [component figures](visual-reference.md#product-style-variations) for both themes and adapters.

## Footer preferences

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
| `theme`      | `'light' \| 'dark' \| 'auto'` | required              | The theme menu's icon and checked item; `auto` follows the system.    |
| `locale`     | `string` (bundled: `en`, `zh`, `de`) | required       | Selects footer copy and the checked language.                         |
| `locales`    | `LocaleOption[]`              | `[en, zh]`            | Languages in the language menu (`{ code, label, name? }`), named by `name`. |
| `compact`    | `boolean`                     | `false`               | One wrapped row of links with the two menu buttons below.             |
| `messages`   | `Record<string, Dict>`        | `undefined`           | Per-locale string overrides, merged over the bundled footer copy.     |
| `baseUrl`    | `string`                      | `'https://latere.ai'` | Origin for the site's own links (About, Blog, Legal, home).           |
| `routerLink` | `Component`                   | `undefined`           | Pass `RouterLink` to keep SPA navigation for internal links on-site.  |

The full footer's lead starts with the Latere AI lockup. A site with its own
lockup passes it through the `#brand` slot (React: the `brand` prop):

```vue
<SiteFooter v-model:theme="theme" v-model:locale="locale">
  <template #brand><a href="/" class="my-lockup">…</a></template>
</SiteFooter>
```

The language menu lists `locales`. To support a locale the package does not
bundle (bundled: en, zh, de), pass it in `locales` and supply its footer
strings via `messages`, e.g. `:messages="{ fr: { 'footer.company': '…' } }"`.
The theme menu's labels are `footer.theme`, `footer.theme.light`,
`footer.theme.dark` and `footer.theme.system`.

The footer reports theme choices; the host applies them to `data-theme` and resolves `auto` with `matchMedia('(prefers-color-scheme: dark)')`. It also persists preferences if needed. German copy is bundled, but the default menu lists English and Chinese; include `de` in `locales` to offer German.

The shared stylesheet scopes link decoration to `.site-footer a` in both layouts, including router links that render anchors. Navigation links carry no underline, at rest or under the pointer; keyboard focus draws an outline. No global anchor reset is required.

The footer carries Latere's own navigation in four columns: Applications
(Wallfacer, Lectio) with Research (ReplicHAI) below it, Platform (the
platform console and Identity), Company (About, Why Latere, Blog, Open Source,
Contact) and Legal (Privacy, Terms, Impressum). Product and Identity links
are always absolute. Latere's own site links (About, Blog, Legal, home)
resolve against `baseUrl` as plain `<a>` unless `routerLink` is supplied, in
which case they render through it with a relative `to`.

### Theme and language menus

`ThemeMenu` and `LocaleMenu` are the footer's two controls, exported for a
header or a toolbar. Each is an icon button that opens a menu of choices with
the current one checked; it shows the value it is given and reports a choice,
so the host's single preference drives every copy.

```vue
<ThemeMenu v-model:theme="theme" placement="bottom-end" />
<LocaleMenu v-model:locale="locale" :locales="locales" label="Language" />
```

```tsx
<ThemeMenu theme={theme} onThemeChange={setTheme} labels={{ system: 'Follow system' }} />
<LocaleMenu locale={locale} locales={locales} onLocaleChange={setLocale} />
```

| Prop | Menu | Default | Notes |
| --- | --- | --- | --- |
| `theme` | theme | required | `'light' \| 'dark' \| 'auto'`; the button shows a sun, a moon or a monitor. |
| `labels` | theme | English | `{ theme, light, dark, system }`, merged over the defaults. |
| `locale`, `locales` | language | required, `[en, zh]` | Rows are named by each option's `name`, else its `label`. |
| `label` | language | `'Language'` | Names the menu and prefixes the button's accessible name. |
| `placement` | both | `'bottom-end'` | `bottom-start`, `bottom-end`, `top-start` or `top-end`. |
| `className` | both, React | none | Extra class on the root; a Vue host's `class` falls through. |

The button's accessible name states the menu and the value, "Theme: System".
Enter, Space, ArrowDown or ArrowUp open the menu on the checked row; the
arrows, Home and End move; Escape and a choice return focus to the button.
The menu surface reads `--lu-menu-bg`, `--lu-menu-border` and
`--lu-menu-shadow`, falling back to `--bg-surface`, `--border-strong` and
`--shadow-menu`; the button and rows take `--lu-control-height` and
`--lu-control-radius`.

The same building blocks are public. `GlassMenu` takes items with `checked`
for a choice menu, `label` for its name and `autofocus` to focus the checked
row when it mounts; `GlassPopover` takes `surface="solid"` for an opaque menu
surface and passes the panel `id` to its trigger for `aria-controls`.

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
    brand-name="Workspace" brand-sub="Console"
    :router-link="RouterLink"
    @navigate="(it) => router.push(it.to!)"
  >
    <template #foot><AccountControl placement="bottom-start" /></template>
  </ConsoleSidebar>
</template>
```

Collapse is `v-model:collapsed` (controlled) or uncontrolled if you omit it.
Set `:collapsible="false"` for a fixed rail. A nav item without `to` renders
disabled unless `action: true` makes it an action button. Override any row via the `#item` slot, the logo via `#brand`, and
insert app-specific affordances (command palette, workspace switcher) via
`#brand-extra` / `#extra`.

**Icons.** An item's `icon` that names a built-in stroke icon renders at 16px
in the text color: `home`, `key`, `card`, `folder`, `cube`, `globe`,
`sparkles`, `bot`, `branch`, `repo`, `org`, `shield`, `book`, `coins`,
`terminal`, `plus`, `search`, `chevron`, `external` (Lucide shapes, ISC
license). The `#icon` slot still replaces them. A row with no icon has no
icon slot, so its label starts at the row's padding.

**Sections with sub-pages.** Give an item `children` and it becomes an
expandable row with a chevron. Its children stay folded until the viewer
opens the row or the current page is one of them, and the rail remembers
which rows the viewer opened (in localStorage under `open-key`; pass `null`
to keep that to the page's lifetime). Enter or Space opens and closes a row,
the arrow keys move between rows. In the collapsed rail a parent is a link
to its own `to`, or its first child's, and stays highlighted while any of its
pages is open.

```ts
{ id: 'storage', label: 'Storage', icon: 'folder', to: '/storage', children: [
  { id: 'storage:files', label: 'Files', to: '/storage/files' },
  { id: 'storage:trash', label: 'Trash', to: '/storage/trash' },
] }
```

**Compact head and foot rows.** `compact` sets the brand, name and fold
button in one row as tall as a nav row, and folds the head into one button
that shows the logo. `:foot-items` adds rows above the `#foot` slot, each a
link or action with an icon and an optional right-aligned `value`, such as
`{ id: 'credits', label: 'Credits', icon: 'coins', to: '/billing', value: '$8.16' }`.
With `compact`, the rail keeps `--lu-cs-inset` (12px) from the window's left
and bottom edges and rounds the account card by `--radius-window` (26px, the
corner macOS 26 draws around Safari) minus that inset, so the card's corner
follows the window's. Pass `subline="text"` to `AccountMenu` for one quiet
line under the name, "Platform admin · Personal", in place of the badge, or
`subline="role"` for the role as a small sentence-case badge, "Platform
admin", followed by the account in quiet text. With either, the dropdown's
header states the role and the account in the same case.

**Bottom groups in the foot.** Groups with `pin: 'bottom'` end the nav by
default. Pass `bottom-groups="foot"` (`bottomGroups="foot"` in React) to set
them in the foot with the foot rows, above the `#foot` slot. They then stay
in view while the nav scrolls, share the foot's divider, and take the arrow
keys like the nav. A parent there opens in place; on a short window the group
area scrolls and the account control keeps its height.

**Rows only admins see.** Give an item `audience: 'admin'` when only people
with an admin role are shown it. The row's icon takes `--lu-audience-admin`
and, in the expanded rail, a small chip after the label names the audience:
`audience-label` (`audienceLabel`), "Admin" by default. A row whose label is
the audience label carries no chip, so a row named Admin reads once. The
collapsed rail's tooltip adds the audience ("Organization · Admin"). The
marker only describes the row; the host still decides who gets it.

```ts
{ groups: [
  { items: [/* sections */] },
  { pin: 'bottom', items: [
    { id: 'org', label: 'Organization', icon: 'org', to: '/org', audience: 'admin' },
    { id: 'admin', label: 'Admin', icon: 'shield', to: '/admin', audience: 'admin' },
  ] },
] }
```

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

App-specific post-processing: mermaid, light/dark images, `[[diagram:name]]`
mounts: plugs into the `enhance(el)` hook; the layout never owns a diagram
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

Since v1.20 the recipe is a **five-step material ladder**, compact rounded
geometry on a radii ladder, **ink as the only accent** (product colors survive
only as gradient wordmarks), and a layered floating-glass shadow. Migrating
from v1.10.x: the `.lu-glass-clear`
Clear tier and the `.lu-glass-dim` utility are removed (the `--glass-dim` modal
scrim token stays); `.lu-glass-ultrathin` and `.lu-glass-smoke` are new; the
`GlassTier` union is now `ultrathin | thin | regular | thick | smoke`; and
`--accent` resolves to ink for the default glass appearance. The optional presets
provide their own action palettes; import them after the material styles.

Import the material once, then set a canvas for glass to refract against:

```ts
import 'latere-ui/glass';           // material tokens + tier utilities + fallback
```

```css
/* Your product theme: give glass something to blur behind it. */
:root {
  --canvas: #f4f6f5;
  --canvas-gradient: radial-gradient(60% 50% at 30% 0%, #eef2f0 0%, transparent 70%);
  /* Optionally tune the tint; sensible neutral defaults ship in glass.css. */
  --glass-bg: rgba(255, 255, 255, 0.62);
}
body { background: var(--canvas-gradient), var(--canvas); }
```

Modeled on Apple's Liquid Glass (macOS Tahoe / HIG). Glass is a distinct layer
that floats above content, built from three optical layers: **illumination**
(tint + backdrop blur + a `--glass-brightness` luminance lift so content reads
_through_ the glass as frost rather than under it as a scrim), **highlight**
(specular top-edge rim), and **shadow** (separation from content).

The **five-step material ladder**: pick a tier by prominence, never decoration:

| Tier | Class | Use for |
|------|-------|---------|
| ultrathin | `.lu-glass-ultrathin` | hover targets, chips, badges, search, inputs |
| thin | `.lu-glass-thin` | nav rows, pills, ghost buttons, bars |
| regular | `.lu-glass` | cards, panels, the sidebar slab |
| thick | `.lu-glass-thick` | modals, popovers, palettes: anything over busy content |
| smoke | `.lu-glass-smoke` | primary buttons, inverse emphasis (ink glass) |

`smoke` is near-solid ink glass; its label color is `--glass-smoke-ink` (flips
per theme): never hardcode white on it.

The thick tier composites its tint over `--glass-overlay-base` (default:
`--bg-surface`) so background text cannot show through reading overlays.
Reduced transparency makes every tier opaque, including smoke.

Control colors can be customized without replacing component rules:

| Custom property | Purpose |
|---|---|
| `--lu-control-border` | Resting control boundaries and selected-state inset edges. |
| `--state-error-text` | Error messages and destructive menu text, separate from solid danger fills. |
| `--state-neutral` | Neutral solid badge fill, independent of muted text colors. |
| `--lu-switch-thumb` | Switch thumb fill. |
| `--lu-switch-thumb-border` | Switch thumb inset edge. |

Defaults are checked for readable text and distinct controls in both gallery
themes. Verify overrides against the background where your app uses them.

```ts
import { useGlass, concentricRadius } from 'latere-ui';
const { glassClass, reducedTransparency } = useGlass();
// :class="glassClass('regular')" : reducedTransparency is a reactive ref
// concentricRadius('8px') → calc(var(--glass-radius,14px) - 8px)
```

Adoption requirements:

1. **Set a `--canvas`.** Frosted glass over a flat fill reads as dead gray.
2. **Glass is chrome, never content.** Never put glass over live
   terminal / VNC / video: `backdrop-filter` there tanks performance and
   legibility. Keep content surfaces opaque.
3. **Concentric corners.** A nested control's radius = parent radius − padding;
   use `concentricRadius()` / `--glass-radius`.
4. **Check accessibility in context.** The material adjusts its tokens for
   reduced transparency, increased contrast, and missing backdrop-filter support.
   Verify text contrast against your actual background and any token overrides.
5. **Hand-rolled chains must carry the full recipe.** The `.lu-glass*` classes
   bake `brightness(var(--glass-brightness))` into their `backdrop-filter`. A
   surface that writes its own chain instead: `blur(var(--glass-blur))
   saturate(var(--glass-saturate))`: must append `brightness(var(--glass-
   brightness, 1))` too, on both the standard and `-webkit-` property; otherwise
   dark-mode glass darkens content into a scrim instead of lifting it to frost.
   Prefer the class over a hand-rolled chain wherever possible.

### Native v2 runtime: refraction + sheen

The CSS material gives you tint, blur, saturation, rim light, and shadow. The
_distortion_: the background visibly bending at the rounded edge, the way real
Apple Liquid Glass lenses what sits behind it: is a progressive enhancement in
JS, because no CSS primitive can displace the backdrop (it needs an SVG
`feDisplacementMap`). Call it once near the app root:

```ts
import { useLiquidGlass } from 'latere-ui';   // Vue
useLiquidGlass({ watchSource: () => route.fullPath }); // re-scan on navigation
// …or framework-free: import { initLiquidGlass } from 'latere-ui/react';
//                     initLiquidGlass();  // call again after the DOM changes
```

What it does, per surface:

- **Refraction**: appends an edge-inward SVG displacement to the
  `backdrop-filter` chain so the background bends at the corners. Auto-applies to
  any glass surface with radius ≥ 16px. **Chromium only** (feature-detected via
  `CSS.supports('backdrop-filter','url(#f)')`); every other engine keeps the
  flat frosted blur. Force it on a tighter radius with `data-lg-refract`, or
  suppress with `data-lg-refract="off"`.
- **Sheen**: a soft specular highlight that follows the cursor. **Opt-in**: a
  surface must carry `data-lg-sheen`, otherwise the highlight reads as a stray
  blob smeared across a footer or menu. Use it on deliberate hero panels only.

Both honor `prefers-reduced-motion` (no sheen) and
`prefers-reduced-transparency` (no refraction), and are SSR-safe no-ops.

### Overlay glass: and why a dropdown sometimes shows no blur

Dropdowns, mega-menus, popovers, and palettes float over arbitrary busy content,
so they take the **thick** tier: a near-opaque fill (`--glass-bg-thick`, 0.90)
_plus_ blur, so sharp headings underneath are occluded rather than bleeding
through. Reach for `GlassPopover` (its panel is already `.lu-glass-thick`) or
apply the class directly; never hand-roll a translucent panel with a light fill,
which is the usual cause of "the text behind is unreadable".

```html
<!-- Bespoke overlay markup: thick tier + no backdrop-filter killer above it. -->
<div class="lu-glass-thick" role="menu"> … </div>
```

If an overlay shows no blur, inspect its ancestor backdrop filters and
compositing boundaries in the browser. A nested glass surface may sample a
different backdrop from the page. Test over actual content; use a near-opaque
reading surface when legibility must not depend on blur.

### Component library

Every component below is available from `latere-ui` for Vue and `latere-ui/react` for React. Both adapters use the shared material and component styles.

| Group | Components |
|-------|-----------|
| Surfaces | `GlassSurface`, `GlassPanel`, `GlassBar` |
| Controls | `GlassButton`, `GlassIconButton`, `GlassSwitch`, `GlassSegmented`, `GlassCheckbox`, `GlassRadio`, `GlassTabs` |
| Inputs | `GlassField`, `GlassSelect` |
| Feedback | `GlassBadge`, `GlassAlert`, `GlassSpinner`, `GlassProgress`, `GlassSkeleton`, `GlassTooltip` |
| Overlays | `GlassModal`, `GlassDrawer`, `GlassPopover`, `GlassMenu` |
| Data | `GlassTable` |
| Service hosts | `GlassToaster`, `GlassConfirmHost` |
| Shell and docs | `ConsoleSidebar`, `ConsolePalette`, `DocsLayout` |
| Account | `AccountMenu`, `AccountPrefs`, `OrgSwitcher`, `ProductSwitcher` |
| Site chrome | `SiteFooter`, `LatereLogoMark`, `PlatformLogoMark` |

`PlatformLogoMark` identifies the platform with the Latere symbol above stacked layers. It inherits `currentColor`, accepts native SVG attributes and merges caller classes. It is decorative by default (`aria-hidden="true"`, `focusable="false"`); place it beside a visible product name, or override the accessibility attributes when it needs its own label. `LatereLogoMark` remains the corporate identity.

`GlassAlert` sets a notice as one grid: a leading 16px icon in the tone's color, then the title and the body sharing one left edge, then an optional dismiss. The frame is a full hairline mixed toward the tone, the fill a faint wash of it; no edge is heavier than another. `tone` picks the color and the icon (`info`, `success`, `warning`, `error`), so a notice never rests on color alone.

Controls share one scale. Set `--lu-control-height` and `--lu-control-height-sm` (32px and 28px by default for buttons, fields and selects) and `--lu-control-radius` once, and every button, icon button, field and select takes them, so a field and the button beside it share a baseline and a corner. A destructive action among other actions is `variant="danger-ghost"`, set as text; the filled `danger` belongs to the confirming button of a dialog.

`GlassBadge` keeps glass labels in the text color and uses the dot for tone. Solid badges pair each default fill with contrasting ink. If you override a semantic fill, set its matching `--state-<tone>-ink` when needed and verify contrast in both themes.

Imperative services (mount the host once, call anywhere):

```ts
import { GlassToaster, GlassConfirmHost, message, confirm } from 'latere-ui';
// <GlassToaster /> and <GlassConfirmHost /> near the app root, then:
message.success('Saved');
if (await confirm({ message: 'Delete this sandbox?', danger: true })) { /* … */ }
```

## Session

The session helpers talk to your application's own backend, which holds the
session cookie and runs the sign-in redirect. The browser never calls an
identity provider directly. Every path below is a default and can be renamed
through options:

| Default path | Request | Expected answer |
|---|---|---|
| `/api/me` | `GET` | The signed-in principal as JSON; 401 or 404 when signed out |
| `/api/me/switch-org` | `POST {"org_id"}` | `{"redirect"}` to follow; an empty `org_id` selects the personal context |
| `/login?return_to=…` | Browser navigation | Starts sign-in; `prompt=none` in the query asks for a silent check |
| `/logout` | Browser navigation | Ends the session |

A principal carries `principal_id`, `email`, `org_id` (empty for the personal
context), and `orgs`, and optionally `name`, `display_name`, `avatar_url`,
`initials`, `org_name`, `role`, and `auth_url`. A backend with another shape
passes `mapMe` to translate it. `createApiClient({ csrfCookie })` echoes the
named cookie in `X-CSRF-Token` on every state-changing request; omit
`csrfCookie` when your backend does not use double-submit CSRF protection.

In Vue, create the client and the Pinia store once:

```ts
// session.ts
import { createApiClient, createSessionStore } from 'latere-ui';

export const client = createApiClient({ csrfCookie: 'csrf_token' });
export const useSessionStore = createSessionStore({ client, defaultReturnTo: '/dashboard' });
```

Then call `useSession` once in the root component:

```vue
<script setup lang="ts">
import { useSession } from 'latere-ui';
import { useRoute, useRouter } from 'vue-router';
import { client, useSessionStore } from '@/session';

const store = useSessionStore();
const { ready, showAuthGate, loginURL } = useSession({
  me: () => store.me,
  loaded: () => store.loaded,
  fetch: store.fetchMe,
  route: useRoute(),
  router: useRouter(),
  shouldProbe: (path) => path.startsWith('/dashboard'),
  onUnauthorized: (handler) => { client.onUnauthorized = handler; },
  onExpired: store.handleExpired,
});
</script>
```

On mount it resolves the principal. When nobody is signed in on a path where
`shouldProbe` is true, it navigates once to `/login?prompt=none` so a session
the person already has with the identity provider carries over without a
prompt. A `sessionStorage` flag keeps the check from looping. When the check
comes back signed out, `showAuthGate` becomes true and the page renders its
own sign-in prompt linking to `loginURL`. A request that answers 401 in the
middle of a session runs `onExpired`.

The store's `expiredSessionMode` decides what an expired session does:
`'silent-recheck'`, the default, tries the silent check once and then an
interactive sign-in; `'graceful'` never redirects, so a public page stays
usable while signed out. `useSessionGate(store, route, router)` exposes the
same `ready`, `showAuthGate`, and `loginURL` for a single protected view that
renders its own prompt. `runFrontChannelLogout({ client })` signs out from
the browser side: it reads `GET /api/logout`, loads each entry of the
answer's `front_channel_uris` in a hidden frame so other applications clear
their own sessions, waits at most 2 seconds per frame, and then navigates to
`post_logout_redirect`.

## Browser telemetry

`latere-ui/telemetry` records how pages load and how fast they respond, and
sends it to your application's own backend as OpenTelemetry traces. It works
with any framework, or none. Enabling it takes one route on the server and one
call in the browser.

On the server, mount the telemetry relay from `latere.ai/x/pkg/otel` on the
application's origin:

```go
mux.Handle("POST /v1/telemetry/", otel.TelemetryProxy("/v1/telemetry"))
```

The relay forwards `POST /v1/telemetry/v1/traces` to the OTLP collector named
by `OTEL_EXPORTER_OTLP_ENDPOINT` and adds `OTEL_EXPORTER_OTLP_HEADERS` on the
way, so the collector's credentials never reach the browser. It needs no
sign-in, which is why it is bounded by a byte budget instead: over budget it
answers `429` with `Retry-After`, the browser retries a few times within the
export timeout and then drops that batch. Without a collector configured it
answers `503` and the browser drops batches quietly.

In the browser, call `startTelemetry` once at startup:

```ts
import { startTelemetry } from 'latere-ui/telemetry';

if (import.meta.env.PROD) {
  startTelemetry({ service: 'example-web', version: '1.4.0', environment: 'production' });
}
```

| Option | Default | Meaning |
|---|---|---|
| `service` | required | `service.name` of the browser spans. Name it `<product>-web`, so the browser half of a product sits beside its backend service in queries. |
| `endpoint` | `'/v1/telemetry'` | The prefix the relay is mounted on. Must be on the page's origin; another origin disables telemetry. |
| `version` | none | `service.version` |
| `environment` | none | `deployment.environment.name` |
| `sampleRatio` | `1` | Share of page loads that record, from 0 to 1. The draw happens before anything is downloaded, so an unsampled page costs nothing and a sampled page records all of its spans. |

Only call it where the relay is mounted: a development server without one
turns every export into a failed request in the network log. Guard the call
the way the example does, or on whatever tells your application it is
deployed.

`startTelemetry` returns nothing and never throws. A second call is ignored,
and on the server (server rendering, Node tests) the call does nothing. The
OpenTelemetry SDK is not part of your entry bundle: the call waits for the
page's `load` event and an idle moment, then imports the SDK as its own chunk
(about 28 KB gzipped). Any bundler with code splitting emits that chunk, for
example Vite, or `Bun.build` with `splitting: true`. Loading late loses
nothing the page already did: page load timing and the Web Vitals are read
from the browser's buffered performance entries. Requests made before the
chunk arrives are not traced.

What gets recorded:

| Span | Recorded for |
|---|---|
| `documentLoad`, `documentFetch`, `resourceFetch` | The page load and each resource it fetched, from the browser's navigation and resource timing |
| `HTTP GET`, `HTTP POST`, … | Each `fetch()` and `XMLHttpRequest`, with method, URL and status |
| `browser.web_vital` | Each Core Web Vitals report: LCP, INP, CLS, FCP and TTFB |

A `browser.web_vital` span carries `browser.web_vital.name` (`lcp`, `inp`,
`cls`, `fcp` or `ttfb`), `.value`, `.delta`, `.id`, `.rating` (`good`,
`needs-improvement` or `poor`) and `.navigation_type`, the attribute names of
the OpenTelemetry `browser.web_vital` convention, plus `url.path`. CLS is
unitless; the others are milliseconds. Requests to your own origin carry a
`traceparent` header, so a browser request and the backend spans it caused
share one trace; requests to other origins never get the header. The relay's
own requests are not traced.

Queued spans are sent when the page is hidden or unloaded, including the
final LCP, CLS and INP values, which are only known at that moment. The
upload uses `fetch` with `keepalive`, so it completes after the page is gone.

Privacy: the module sets no cookies, reads no storage, and adds no user,
account or session identifier. URLs are the only page data it records, and
the query string and fragment are removed from every recorded URL, so tokens
and search terms in links are not sent. The browser's user agent string is
recorded with page loads and requests.

## Structured data

`latere-ui/structured-data` describes a page to search engines and AI agents
in the schema.org vocabulary. Typed builders turn the page's data into
schema.org nodes, and `jsonLdScript` writes them as the
`<script type="application/ld+json">` element that goes into the page's
`<head>`. It has no dependencies and works with any framework or none: a
static build, a server-rendered page and a browser-only app use the same
calls.

| Builder | Describes | Required |
|---|---|---|
| `organization` | A company or group (`Organization`) | `name`, `url` |
| `person` | An author or other individual (`Person`) | `name` |
| `webSite` | A whole site (`WebSite`) | `name`, `url` |
| `book` | A book in one language (`Book`) | `name`, `url` |
| `chapter` | One chapter page (`Chapter`) | `name`, `url`, `isPartOf` |
| `article` | An article page (`Article`) | `headline`, `url` |
| `blogPosting` | A blog post (`BlogPosting`) | `headline`, `url` |
| `breadcrumbList` | The trail from the site's top to the page (`BreadcrumbList`) | one or more `{ name, url }`; the last may omit `url` |

Input keys are schema.org property names, and every builder but
`breadcrumbList` takes `'@id'`. `book`, `chapter`, `article` and `blogPosting` also take `description`,
`inLanguage` (a BCP 47 tag such as `en` or `zh-CN`), `author`, `publisher`,
`translator`, `datePublished` and `dateModified` (ISO 8601 strings or `Date`
values), `image`, `license` (the license's URL, such as a Creative Commons
deed), `keywords`, `workTranslation` and `translationOfWork`. `book` adds
`isbn`, `bookEdition`, `numberOfPages` and `hasPart`; `chapter` adds
`position`; `article` and `blogPosting` add `articleSection` and `wordCount`.
`webSite` takes `alternateName`, `description`, `inLanguage` and
`publisher`. `organization` takes `alternateName`, `description`, `logo` and
`image`, `person` takes `url`, `description` and `image`, and both take
`sameAs`, the profiles that identify them.

Each builder returns a plain object that starts with
`"@context": "https://schema.org"` and `"@type"`. Fields you leave out are
omitted, never written as `null`. To add a property the builders do not take,
spread the node: `{ ...book(input), abridged: false }`.

### A book chapter at build time

A static build calls the builders with each page's data and writes the result
into the page's `<head>`. For the English page of a chapter that also exists
in Chinese, under CC BY-NC-ND 4.0:

```ts
import { breadcrumbList, chapter, jsonLdScript, person } from 'latere-ui/structured-data';

const license = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';
const author = person({ name: 'Ada Example', url: 'https://example.com/about' });

const head = jsonLdScript([
  chapter({
    '@id': 'https://book.example.com/en/scheduling/',
    name: 'Scheduling',
    url: 'https://book.example.com/en/scheduling/',
    position: 3,
    inLanguage: 'en',
    isPartOf: { '@id': 'https://book.example.com/en/', name: 'An Example Book', url: 'https://book.example.com/en/' },
    author,
    license,
    datePublished: '2026-06-01',
    dateModified: '2026-09-20',
    // English is the source language, so the English page lists its translation.
    workTranslation: {
      '@id': 'https://book.example.com/zh/scheduling/',
      name: '调度',
      url: 'https://book.example.com/zh/scheduling/',
      inLanguage: 'zh-CN',
    },
  }),
  breadcrumbList([
    { name: 'An Example Book', url: 'https://book.example.com/en/' },
    { name: 'Scheduling' },
  ]),
]);

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">${head}</head>...`;
```

The script element holds this graph:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Chapter",
      "@id": "https://book.example.com/en/scheduling/",
      "name": "Scheduling",
      "url": "https://book.example.com/en/scheduling/",
      "inLanguage": "en",
      "author": { "@type": "Person", "name": "Ada Example", "url": "https://example.com/about" },
      "datePublished": "2026-06-01",
      "dateModified": "2026-09-20",
      "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      "workTranslation": {
        "@type": "Chapter",
        "@id": "https://book.example.com/zh/scheduling/",
        "name": "调度",
        "url": "https://book.example.com/zh/scheduling/",
        "inLanguage": "zh-CN"
      },
      "isPartOf": {
        "@type": "Book",
        "@id": "https://book.example.com/en/",
        "name": "An Example Book",
        "url": "https://book.example.com/en/"
      },
      "position": 3
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "An Example Book", "item": "https://book.example.com/en/" },
        { "@type": "ListItem", "position": 2, "name": "Scheduling" }
      ]
    }
  ]
}
```

The Chinese page describes the same relation from its side: its own `url` and
`inLanguage`, `isPartOf` the Chinese edition of the book, and
`translationOfWork` pointing back to the English page.

```ts
chapter({
  '@id': 'https://book.example.com/zh/scheduling/',
  name: '调度',
  url: 'https://book.example.com/zh/scheduling/',
  position: 3,
  inLanguage: 'zh-CN',
  isPartOf: { '@id': 'https://book.example.com/zh/', name: '示例之书', url: 'https://book.example.com/zh/' },
  author,
  license,
  translationOfWork: { '@id': 'https://book.example.com/en/scheduling/', url: 'https://book.example.com/en/scheduling/', inLanguage: 'en' },
});
```

The book's own page uses `book` in the same way, one node per language, with
`hasPart` listing the chapters and `workTranslation` or `translationOfWork`
linking the two editions.

### Translations

Schema.org treats a translation as a separate work in its own language, linked
to the work it was translated from. Describe each language version as its own
node with its own `url` and `inLanguage`; on the source-language page, list
the translations in `workTranslation`; on each translated page, name the
source in `translationOfWork`, and the `translator` if you credit one. A
chapter's `isPartOf` names the book of its own language. Do not use `sameAs`
for translations: it states that two things are the same, and a translation is
a different work.

The JSON-LD describes the relation for parsers and agents. Search engines pair
language versions from `<link rel="alternate" hreflang="...">` elements, so
keep those in the head as well.

`Chapter`, `workTranslation` and `translationOfWork` come from schema.org's
bibliographic extension. They are part of the vocabulary under the same
context and general-purpose parsers and agents read them, but search engines
do not build rich results from chapters. Articles, blog posts and breadcrumbs
are types they do use.

### A blog post on a server-rendered page

A server that renders HTML builds the nodes per request. Describe the
publisher once, give it an `@id`, and reuse it:

```ts
import { blogPosting, breadcrumbList, jsonLdScript, organization, person, ref, webSite } from 'latere-ui/structured-data';

const publisher = organization({
  '@id': 'https://example.com/#organization',
  name: 'Example',
  url: 'https://example.com/',
  logo: 'https://example.com/logo.png',
  sameAs: ['https://social.example.com/example'],
});

export function postHead(post: Post): string {
  return jsonLdScript([
    blogPosting({
      headline: post.title,
      url: `https://example.com/blog/${post.slug}/`,
      description: post.summary,
      inLanguage: 'en',
      author: person({ name: post.authorName, url: post.authorUrl }),
      publisher,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      image: post.coverUrl,
    }),
    breadcrumbList([
      { name: 'Example', url: 'https://example.com/' },
      { name: 'Blog', url: 'https://example.com/blog/' },
      { name: post.title },
    ]),
  ]);
}

// The home page describes the organization and the site, linked by @id.
export const homeHead = jsonLdScript([
  publisher,
  webSite({ '@id': 'https://example.com/#website', name: 'Example', url: 'https://example.com/', publisher: ref(publisher) }),
]);
```

### Parties and references

- `author`, `publisher` and `translator` take a node from `person` or
  `organization`, embedded in full, or `ref(node)`, which writes only
  `{ "@id": ... }` for a node described elsewhere on the page. `author` and
  `translator` take one or several.
- `isPartOf`, `hasPart`, `workTranslation` and `translationOfWork` take an
  object with `url` or `'@id'`, and optionally `name` and `inLanguage`. A node
  from a builder works too; it is reduced to those fields so the page does not
  describe the same work twice. The builder sets the reference's `@type`:
  `Book` for a chapter's `isPartOf`, `Chapter` for a book's `hasPart`, and the
  node's own type for translations.
- Use the page's canonical URL as its `@id`, adding a fragment such as
  `#organization` when one page describes several things.

### Writing the script element

`jsonLdScript(node)` returns the script element for one node;
`jsonLdScript([a, b])` returns one `@graph` holding both under a single
`@context`. An array always produces a `@graph`, even with one node. `jsonLd`
returns the same JSON text without the element. Hand-written nodes are
accepted as long as they have a `@type`.

The text is ready to write into HTML as it is; do not HTML-escape it again.
`<`, `>`, `&`, U+2028 and U+2029 are written as JSON escapes (`\u003c`,
`\u003e`, `\u0026`, `\u2028`, `\u2029`), so no string in
your data can end the script element, open an HTML comment or inject markup,
and `JSON.parse` of the element's text returns your data unchanged.

### Browser-only pages

An app that renders only in the browser places its data with `mountJsonLd`:

```ts
import { onUnmounted } from 'vue';
import { blogPosting, mountJsonLd } from 'latere-ui/structured-data';

const remove = mountJsonLd(blogPosting({ headline: post.title, url: post.url }));
onUnmounted(remove);
```

It keeps one script element per key (`'page'` unless you pass a second
argument) in `document.head`, replaces its text on every call, and returns a
function that removes it. When the next view has already placed its data
under the same key, the previous view's removal does nothing. On the server it
does nothing.

Only crawlers that run JavaScript see data placed this way. Many agents and
some crawlers read the HTML as it was served, so a page that can be built or
rendered on the server should write `jsonLdScript` there instead.

### Errors

Structured data is generated when a page is built or rendered, so the
builders throw a `StructuredDataError` for data that is missing or malformed,
and a bad page fails the build instead of publishing a wrong description. Its
`code` says why, and `type` and `field` name the node and the input, such as
`Chapter` and `isPartOf.url`:

| `code` | Cause |
|---|---|
| `missing` | `name`, `headline`, `url`, `isPartOf` or the breadcrumb items are absent or empty |
| `invalid_url` | A URL is relative or not `http:` or `https:` |
| `invalid_id` | An `@id` is not an absolute IRI |
| `invalid_date` | A date is not ISO 8601 (`2026-09-26`, `2026-09-26T09:00:00Z`) or names a day that does not exist |
| `invalid_language` | `inLanguage` is not a BCP 47 language tag |
| `invalid_value` | Any other value of the wrong shape, such as a `position` of 0 or an `author` given as a string |

Every URL must be absolute: a crawler or an agent may read a copy of the page
without knowing where it came from.

## React

Every visual component ships from `latere-ui/react`, including controls, overlays, service hosts, console/account components and DocsLayout. The host compiles the source `.tsx`; React and Vue share component styles and framework-free logic. The visual suite compares matching examples by decoded RGBA pixels, with no channel or antialiasing tolerance, then compares each adapter to its platform baseline.

Install React 18 or 19 and React DOM in your application. They are optional peers of this package. The React entrypoint does not import Vue or Pinia at runtime. The complete adapters shipped in v1.29.0; `PlatformLogoMark` is the one React export not yet in a release.

### Session

`SessionProvider` owns the same state machine the Vue store + `useSession`
composable do: resolve `/me` on mount, the global 401 seam, org switching,
front-channel logout: built on the identical framework-agnostic core
(`session/client.ts`, `me.ts`, `reauth.ts`). `useSession()` reads it;
`useSessionGate()` is the router-agnostic port of the Vue route gate.

```tsx
import { SessionProvider, useSession, AccountMenu } from 'latere-ui/react';

function App() {
  return (
    <SessionProvider csrfCookie="csrf_token" defaultReturnTo="/dashboard">
      <Shell />
    </SessionProvider>
  );
}

function Shell() {
  const { principal, loading, login, logout, switchOrg } = useSession();
  if (loading) return <Spinner />;
  return (
    <>
      {/* AccountMenu reads principal/login/logout/switchOrg from the
          ambient SessionProvider automatically when no matching prop is
          passed: pass `principal` explicitly to override. */}
      <AccountMenu dashboardPath="/dashboard" />
      {principal ? <Dashboard /> : <button onClick={() => login()}>Sign in</button>}
    </>
  );
}
```

### Console shell

```tsx
import { ConsoleSidebar, AccountMenu, type ConsoleNavModel } from 'latere-ui/react';
import 'latere-ui/console';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const model: ConsoleNavModel = {
  groups: [
    { label: 'Workspace', items: [
      { id: 'requests', label: 'Requests', to: '/requests', badge: 'live' },
    ] },
  ],
};

function Rail() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <ConsoleSidebar
      model={model}
      activeKey={location.pathname.split('/')[1]}
      brandName="Workspace" brandSub="Console"
      routerLink={Link}
      onNavigate={(item) => item.to && navigate(item.to)}
      foot={<AccountMenu placement="bottom-start" />}
    />
  );
}
```

`routerLink` must forward `className`/`title`/`onClick`/`children` itself;
React has no Vue-style attrs fallthrough onto a child component's root
element; real router `Link` components already do this. Collapse is
`collapsed`/`onCollapsedChange` (controlled) or uncontrolled if omitted.
`product` and `productLabels` add the built-in ProductSwitcher to the expanded head. `brandExtra` accepts custom head content. See [React shell APIs](react-shell.md) for the palette, docs layout, preferences and organization state hook.

### Glass primitives

All Glass components listed above are exported. Import `latere-ui/glass` for the material; components import their own shared styles. Controlled React components report proposed values through callbacks; the host must pass the new value back to update the control:

| Component | Controlled props and callback |
|---|---|
| `GlassField` | `value` and `onChange(text)` |
| `GlassCheckbox`, `GlassSwitch` | Boolean `value` and `onChange(checked)` |
| `GlassSelect`, `GlassSegmented` | `value`, `options`, `onChange(value)`; `ariaLabel` names the group/control |
| `GlassTabs` | `value`, `tabs`, `onChange(value)`; the host renders the active panel |
| `GlassRadio` | Selected group `value`, option identity `optionValue`, shared `name`, `onChange(value)` |
| `GlassModal`, `GlassDrawer`, `ConsolePalette` | `open` and `onClose()`; the host updates `open` |
| `GlassPopover` | Optional `open` / `onOpenChange(open)`; omit `open` for internal state |
| `GlassMenu` | `items` and `onSelect(value)`; disabled items cannot select |

For radio groups, Vue's `modelValue` becomes React's `value`, while Vue's option `value` becomes React's `optionValue`:

```tsx
import { useState } from 'react';
import { GlassRadio } from 'latere-ui/react';

function Schedule() {
  const [frequency, setFrequency] = useState('daily');
  return <>
    <GlassRadio name="frequency" value={frequency} optionValue="daily"
      label="Daily" onChange={setFrequency} />
    <GlassRadio name="frequency" value={frequency} optionValue="weekly"
      label="Weekly" onChange={setFrequency} />
  </>;
}
```

### Overlays and services

`GlassModal` and `GlassDrawer` portal to the document body, trap focus while open, and request closure through `onClose`. Their `header` prop replaces the default title; modal `footer` accepts a React node or `(close) => ReactNode`. Drawer `side` is `left` or `right` and `width` defaults to `20rem`.

`GlassPopover` accepts a `trigger` node or `({ open, toggle }) => ReactNode`; its wrapper already toggles on click. Its content is `children` or `({ close }) => ReactNode`. Use `close` after handling a menu choice. `placement` accepts `bottom-start`, `bottom-end`, `top-start`, or `top-end`; `matchWidth` follows the trigger width. `GlassTooltip` wraps its trigger in `children` and takes `text` plus optional `placement="top" | "bottom"`.

Mount one `GlassToaster` and one `GlassConfirmHost` near the application root:

```tsx
import { GlassToaster, GlassConfirmHost, message, confirm } from 'latere-ui/react';

function FeedbackHosts() {
  return <><GlassToaster /><GlassConfirmHost /></>;
}

const dismiss = message.success('Saved', { duration: 4000 });
// dismiss() closes this toast; duration: 0 keeps it until dismissed.
const approved = await confirm({ message: 'Delete this workspace?', danger: true });
```

Vue and React use the same framework-free message and confirmation stores. `message.info/success/warning/error` return a closer; `message.clear()` removes all toasts. `confirm()` queues requests and resolves `true` on confirmation or `false` on cancellation. Mount a single host for each service per application, using its framework adapter.

### Footer

Same footer the Vue sites render, same `footer.css`. `v-model` splits into
value + handler; the component imports its own stylesheet, so there is no
`latere-ui/styles` import to remember.

```tsx
import { SiteFooter } from 'latere-ui/react';

<SiteFooter
  theme={theme} onThemeChange={setTheme}
  locale={locale} onLocaleChange={setLocale}
/>
```

`compact` swaps the product columns for wrapping navigation followed by compact preferences. Every label remains visible without horizontal scrolling. `routerLink` keeps internal links inside your SPA
(relative `to`); without it they are absolute under `baseUrl`. An app that
ships one language should pass `locales` with just that one, so the dropdown
tells the truth.

`footer.css` reads `--text`, `--text-secondary`, `--text-muted`, `--accent`,
`--border`, `--bg-surface`, `--bg-raised`, `--shadow`, `--focus-outline` and
the `--glass-*` set. If your app already has its own palette, alias them on
`.site-footer` rather than importing `latere-ui/tokens`, which would redefine
`--bg-*` for the whole page.

## Status and stability

The package ships source and is pinned by tag, so a consumer upgrades only when
it changes its pin. Minor versions add components and props; the `.lu-glass-*`
class names, the CSS custom-property contract, and the exported function
signatures are the compatibility surface. A breaking change to any of them
comes with a note in this guide's migration paragraphs, as the v1.10 to v1.20
Liquid Glass change did.

Vue and React expose the same visual component set. Framework state bindings remain idiomatic: Vue refs and events, React values, hooks and callbacks. The full appearance matrix includes both frameworks at desktop and mobile sizes in light and dark themes; see the [visual reference](visual-reference.md).

### Compact layout defaults

Import `latere-ui/tokens` for the 4/6/8/14/18/24px radius ladder and `--font-ui` system font. Component CSS includes matching radius fallbacks when the token entrypoint is omitted. Existing host token overrides take precedence. Panels now consume `--space-4` (16px fallback), and toolbars use `--space-1-5`/`--space-3` (6px/12px fallbacks).

Glass buttons and icon buttons use `--lu-button-border` when provided; the default mixes 20% text color into transparent to keep the control boundary visible. Check custom borders in both themes and against the intended backdrop.

`DocsLayout` has a `.lu-docs-frame` containment wrapper around `.lu-docs`. Size the component normally through its parent; the inner grid uses container queries at 1080px and 720px. Consumers with direct-child selectors should account for the new wrapper. The optional TOC contributes no column when `showToc=false`.

### Product-neutral shell styling

Omit `brandTheme` for neutral UI typography, set `brandName` to the host application name, and use the brand/logo slots for a custom identity. Named brand themes remain opt-in. See the [product styling guidance](design-system.md#keep-product-styling-explicit) for Replichai, Wallfacer and Origo integration choices.

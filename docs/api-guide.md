# Integration guide

Precise examples for footer preferences, console navigation, documentation, glass materials, and session bindings. This guide tracks `main`; changes not yet in a release are listed under Unreleased in the [changelog](../CHANGELOG.md#unreleased). Start with the [README](../README.md) for installation or the [design guide](design-system.md) for visual composition.

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
| `theme`      | `'light' \| 'dark' \| 'auto'` | required              | Drives the active state of the theme toggle.                          |
| `locale`     | `string` (bundled: `en`, `zh`, `de`)                | required              | Selects footer copy and the active language toggle.                   |
| `locales`    | `LocaleOption[]`              | `[en, zh]`            | Languages in the locale dropdown (`{ code, label, name? }`).          |
| `compact`    | `boolean`                     | `false`               | Compact footer with wrapping links and aligned preferences below.                    |
| `messages`   | `Record<string, Dict>`        | `undefined`           | Per-locale string overrides, merged over the bundled footer copy.     |
| `baseUrl`    | `string`                      | `'https://latere.ai'` | Origin for the site's own links (Team, Blog, Legal, home).            |
| `routerLink` | `Component`                   | `undefined`           | Pass `RouterLink` to keep SPA navigation for internal links on-site.  |

The language switcher is a dropdown built from `locales`. To support a locale the
package does not bundle (bundled: en, zh, de), pass it in `locales` and supply its
footer strings via `messages`, e.g. `:messages="{ fr: { 'footer.tagline': '…' } }"`.

The footer reports theme choices; the host applies them to `data-theme` and resolves `auto` with `matchMedia('(prefers-color-scheme: dark)')`. It also persists preferences if needed. German copy is bundled, but the default dropdown lists English and Chinese; include `de` in `locales` to offer German.

The shared stylesheet scopes link decoration to `.site-footer a` in both layouts, including router links that render anchors. Navigation links underline on hover; keyboard focus retains its outline. No global anchor reset is required.

Both footer layouts use 28px outer heights for the theme selector and language dropdown. On coarse-pointer devices, both become 50px high so each inset theme button has a 44px touch target. The selected segment keeps the same geometry as the other segments.

The footer carries Latere's own navigation: Wallfacer and Lectio under
Applications, ReplicHAI under Research, and the platform console under
Platform, followed by Latere, Legal, and Community links. These destination
links are always absolute. Latere's own site links (Team, Blog, Legal, home)
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
`#brand-extra` / `#extra`. Items take an `icon` name surfaced through the
`#icon` slot: the library bundles no icon set.

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

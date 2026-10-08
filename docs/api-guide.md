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

`data-design` accepts `replichai`, `wallfacer`, or `origo` on `<html>`. Remove the attribute to restore default glass. Root scope also styles portaled overlays; nested mixed appearances are unsupported. Supply Inter for Replichai/Wallfacer or IBM Plex Sans/Mono for Origo through the host font pipeline. See the [design guide](design-system.md#keep-product-styling-explicit) for geometry, palette and font details, and the [component figures](visual-reference.md#product-style-variations) for both themes.

The ink palette is a separate stylesheet: import `latere-ui/ink` after the shared styles and set `data-design="ink"`. It recolors the default glass components with the platform's neutral ladder; see [the ink palette](design-system.md#use-the-ink-palette).

## Footer preferences

`SiteFooter` is the one footer every Latere site ends in. Its lineup, its
company and legal links, the social profiles, the menus and the copyright are
the same everywhere; a site passes its own lockup and wires the theme and the
language to its own preference state, and nothing else. The footer takes
`theme` and `locale` and reports the reader's choices through `onThemeChange`
and `onLocaleChange`. It imports its own stylesheet, so `latere-ui/styles` is
needed only by a page that sets the product wordmark classes without the
component.

```tsx
import { SiteFooter } from 'latere-ui';
// import 'latere-ui/tokens'; // only if your app has no --text/--bg-* tokens

<SiteFooter
  theme={theme} onThemeChange={setTheme}
  locale={locale} onLocaleChange={setLocale}
  brand={<a href="/" className="my-lockup">…</a>}
/>
```

### Props

| Prop             | Type                          | Default               | Notes                                                                 |
| ---------------- | ----------------------------- | --------------------- | --------------------------------------------------------------------- |
| `theme`          | `'light' \| 'dark' \| 'auto'` | required              | The theme menu's icon and checked item; `auto` follows the system.    |
| `onThemeChange`  | `(theme) => void`             | `undefined`           | Called with the theme the reader picked. Without it there is no theme menu. |
| `locale`         | `string` (bundled: `en`, `zh`, `de`) | required       | Selects footer copy and the checked language; any other locale reads English. |
| `onLocaleChange` | `(locale) => void`            | `undefined`           | Called with the locale the reader picked. Without it there is no language menu. |
| `locales`        | `LocaleOption[]`              | `[en, zh]`            | Languages in the language menu (`{ code, label, name? }`), named by `name`. With fewer than two there is no language menu. |
| `baseUrl`        | `string`                      | `'https://latere.ai'` | Origin of the company site's links (About, Blog, Legal).              |
| `routerLink`     | `ComponentType`               | `undefined`           | Your router's `Link`, for the company site itself, to keep its links in the app. |
| `brand`          | `ReactNode`                   | Latere AI lockup      | The site's lockup at the head of the footer, linked to its home.      |

The lead starts with the site's lockup: its mark and its name as its header
sets them, linked to its home, such as "Latere | Platform". Without `brand`
the footer shows the Latere AI lockup linked to `baseUrl`. The lockup is the
site's own markup and the site's own styles; everything else in the footer
is the package's.

A site in one language passes nothing for the language, or `locales` with
just that one, and the footer shows no language menu: it never offers a
language the site does not have. German copy is bundled, but the default
menu lists English and Chinese; include `de` in `locales` to offer German.
The theme menu's labels are `footer.theme`, `footer.theme.light`,
`footer.theme.dark` and `footer.theme.system`.

The footer reports theme choices; the host applies them to `data-theme` and resolves `auto` with `matchMedia('(prefers-color-scheme: dark)')`. It also persists preferences if needed.

Every class the footer draws starts with `lu-footer`, and its stylesheet owns
its link decoration, including router links that render anchors. Navigation
links carry no underline, at rest or under the pointer; keyboard focus draws
an outline. No global anchor reset is required, and a site's own rules for
classes such as `.footer-links` or `.logo-text` do not reach the footer. A
site does not restyle `.lu-footer*`: a footer that looks different on one
site is a change to this package, made for every site.

The footer carries Latere's own navigation in four columns: Applications
(the chat, under its public name Latere, then the Gallery at latere.site)
with Research (ReplicHAI) below it, Platform (the platform console and
Identity), Company (About, Why Latere, Blog, Open Source, Contact) and Legal
(Trust Center, Privacy, Terms, Impressum). Product and Identity links are
always absolute. The company site's links (About, Blog, Legal) resolve
against `baseUrl` as plain `<a>` unless `routerLink` is supplied, in which
case they render through it with a relative `to`.

`footer.css` reads `--text`, `--text-muted`, `--accent`, `--border`,
`--border-strong` and `--focus-outline`, and the menus read the
`--glass-*` set. If your app already has its own palette, alias them on
`.lu-footer` rather than importing `latere-ui/tokens`, which would redefine
`--bg-*` for the whole page.

### Theme and language menus

`ThemeMenu` and `LocaleMenu` are the footer's two controls, exported for a
header or a toolbar. Each is an icon button that opens a menu of choices with
the current one checked; it shows the value it is given and reports a choice,
so the host's single preference drives every copy.

```tsx
<ThemeMenu theme={theme} onThemeChange={setTheme} labels={{ system: 'Follow system' }} />
<LocaleMenu locale={locale} locales={locales} onLocaleChange={setLocale} label="Language" />
```

| Prop | Menu | Default | Notes |
| --- | --- | --- | --- |
| `theme`, `onThemeChange` | theme | required | `'light' \| 'dark' \| 'auto'`; the button shows a sun, a moon or a monitor. |
| `labels` | theme | English | `{ theme, light, dark, system }`, merged over the defaults. |
| `locale`, `locales`, `onLocaleChange` | language | required, `[en, zh]` | Rows are named by each option's `name`, else its `label`. |
| `label` | language | `'Language'` | Names the menu and prefixes the button's accessible name. |
| `placement` | both | `'bottom-end'` | `bottom-start`, `bottom-end`, `top-start` or `top-end`. |
| `className` | both | none | Extra class on the root, for host placement. |

The button's accessible name states the menu and the value, "Theme: System".
Enter, Space, ArrowDown or ArrowUp open the menu on the checked row; the
arrows, Home and End move; Escape and a choice return focus to the button.
The menu surface reads `--lu-menu-bg`, `--lu-menu-border` and
`--lu-menu-shadow`, falling back to `--bg-surface`, `--border-strong` and
`--shadow-menu`. The button is sized by `--lu-control-height` and rounded by
the button corner, `--lu-button-radius` (a circle by default); the rows and
the panel round from `--lu-control-radius`.

The same building blocks are public. `GlassMenu` takes items with `checked`
for a choice menu, `label` for its name and `autofocus` to focus the checked
row when it mounts; `GlassPopover` takes `surface="solid"` for an opaque menu
surface and passes the panel `id` to its trigger for `aria-controls`.

### Favicon

`latere-ui/favicon` writes the platform's browser tab icon from the mark the
console navigation draws, `PlatformLogoMark`. A tab icon sits outside the
page's palette, so its colors are fixed: `FAVICON_INK` (`#0d0d0d`) in a light
tab and `FAVICON_INK_DARK` (`#ececec`) in a dark one, switched by a
`prefers-color-scheme` rule inside the SVG.

```ts
// scripts/favicon.ts, run before the build
import { platformFaviconSvg } from 'latere-ui/favicon';

await Bun.write('public/favicon.svg', platformFaviconSvg());
```

`platformFaviconSvg()` returns the complete SVG document. `favicon(markup)`
inserts the same style first inside other rendered `<svg>` markup; the style
colors the element that carries the `platform-logo-mark` class, and
`favicon` throws when the markup is not an `<svg>` element. The entry renders with `react-dom/server`, so call it
from a build script or a server. It is a separate entry so that no client
bundle carries the server renderer; the main `latere-ui` entry never imports
it.

## Console sidebar

`ConsoleSidebar` is the shared product-console rail: a brand headline, grouped
nav tabs, a fold/collapse toggle, and a `foot` prop for your account control.
The nav model is headless (`partitionGroups`, `flattenNavItems`); the
component is a thin shell over it. Styles ship as the opt-in
`latere-ui/console` entrypoint (built on `tokens.css`), so the consoles align
visually instead of each restyling their own rail.

```tsx
import { ConsoleSidebar, AccountMenu, type ConsoleNavModel } from 'latere-ui';
import 'latere-ui/console';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

`routerLink` must accept and render `className`, `title`, `onClick` and
`children`; real router `Link` components (react-router, TanStack Router)
already do. Collapse is `collapsed` with `onCollapsedChange` (controlled) or
uncontrolled if `collapsed` is omitted. Set `collapsible={false}` for a fixed
rail. A nav item without `to` renders disabled unless `action: true` makes it
an action button. Override any row with `renderItem`, the brand block with
`brand`, and insert app-specific affordances (command palette, workspace
switcher) with `brandExtra`, `top` or `extra`. `brand`, `brandExtra`, `top`,
`extra` and `foot` accept a node or a function of the collapsed state. Connect
`search` and `onSearch` to a [`ConsolePalette`](react-shell.md#navigation).

**Icons.** An item's `icon` that names a built-in stroke icon renders at 16px
in the text color: `home`, `key`, `card`, `folder`, `cube`, `globe`,
`sparkles`, `bot`, `branch`, `repo`, `org`, `shield`, `book`, `coins`,
`terminal`, `plus`, `search`, `chevron`, `external` (Lucide shapes, ISC
license). `renderIcon` replaces a row's icon fallback. A row with no icon has
no icon slot, so its label starts at the row's padding.

**Sections with sub-pages.** Give an item `children` and it becomes an
expandable row with a chevron. Its children stay folded until the viewer
opens the row or the current page is one of them, and the rail remembers
which rows the viewer opened (in localStorage under `openKey`; pass `null`
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
that shows the logo. `footItems` adds rows above `foot`, each a link or
action with an icon and an optional right-aligned `value`, such as
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
default. Pass `bottomGroups="foot"` to set them in the foot with the foot
rows, above `foot`. They then stay in view while the nav scrolls, share the
foot's divider, and take the arrow keys like the nav. A parent there opens in
place; on a short window the group area scrolls and the account control keeps
its height.

**Rows only admins see.** Give an item `audience: 'admin'` when only people
with an admin role are shown it. The row's icon takes `--lu-audience-admin`
and, in the expanded rail, a small chip after the label names the audience:
`audienceLabel`, "Admin" by default. A row whose label is the audience label
carries no chip, so a row named Admin reads once. The collapsed rail's
tooltip adds the audience ("Organization · Admin"). The marker only describes
the row; the host still decides who gets it.

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
(pass `articleHtml`) and component-driven docs (pass a node in `article`). The
grouped model and TOC are headless (`flattenDocs`, `adjacentDocs`,
`buildDocSearchIndex`, `createTocCore`); styles ship as `latere-ui/docs`.

```tsx
import { DocsLayout, type DocGroup } from 'latere-ui';
import 'latere-ui/docs';
import { Link, useNavigate, useParams } from 'react-router-dom';

const groups: DocGroup[] = [
  { id: 'getting-started', label: 'Getting started', icon: 'rocket', pages: [
    { slug: 'overview', title: 'Overview' },
    { slug: 'quick-start', title: 'Quick start' },
  ] },
  { id: 'internals', label: 'Internals', advanced: true, pages: [
    { slug: 'architecture', title: 'Architecture' },
  ] },
];

function Docs({ renderedMarkdown }: { renderedMarkdown: string }) {
  const { group, slug } = useParams();
  const navigate = useNavigate();
  return (
    <DocsLayout
      groups={groups}
      activeSlug={slug ?? ''}
      activeGroupId={group}
      articleHtml={renderedMarkdown}
      base="/docs"
      routerLink={Link}
      enhance={mountDiagrams}
      onNavigate={(d) => navigate(`/docs/${d.groupId}/${d.slug}`)}
    />
  );
}
```

App-specific post-processing: mermaid, light/dark images, `[[diagram:name]]`
mounts: plugs into the `enhance(el)` hook; the layout never owns a diagram
pipeline. [Console and account components](react-shell.md#documentation-layout) lists the
render props and the `DocsLayoutHandle` ref. For markdown,
`latere-ui/markdown` exports `createMarkdown(MarkdownIt, opts)` (you inject
your own `markdown-it`) which assigns heading ids with the **same** slugify as
the TOC, so anchors and the on-this-page list always agree:

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
| thin | `.lu-glass-thin` | nav rows, pills, segmented tracks, bars |
| regular | `.lu-glass` | cards, panels, the sidebar slab |
| thick | `.lu-glass-thick` | modals, popovers, palettes: anything over busy content |
| smoke | `.lu-glass-smoke` | inverse emphasis (ink glass) |

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

Adoption requirements:

1. **Set a `--canvas`.** Frosted glass over a flat fill reads as dead gray.
2. **Glass is chrome, never content.** Never put glass over live
   terminal / VNC / video: `backdrop-filter` there tanks performance and
   legibility. Keep content surfaces opaque.
3. **Concentric corners.** A nested control's radius = parent radius − padding,
   written `calc(var(--glass-radius, 14px) - 8px)` for an 8px inset.
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

```tsx
import { useEffect } from 'react';
import { initLiquidGlass } from 'latere-ui';

function GlassRuntime({ path }: { path: string }) {
  // Scan again after each navigation, since new surfaces mount with the page.
  useEffect(() => { initLiquidGlass(); }, [path]);
  return null;
}
```

`initLiquidGlass(root?)` scans the document, or one subtree, and is safe to
call again after the DOM changes. `refract(el)` and `sheen(el)` enhance one
element.

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

Every component below is exported from `latere-ui`. Each imports its own shared stylesheet; import `latere-ui/glass` once for the material.

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
| Account | `AccountMenu`, `AccountPrefs`, `OrgSwitcher` |
| Site chrome | `SiteFooter`, `ThemeMenu`, `LocaleMenu`, `LatereLogoMark`, `PlatformLogoMark` |

Controlled components report proposed values through callbacks; the host passes the new value back to update the control:

| Component | Controlled props and callback |
|---|---|
| `GlassField` | `value` and `onChange(text)` |
| `GlassCheckbox`, `GlassSwitch` | Boolean `value` and `onChange(checked)` |
| `GlassSelect`, `GlassSegmented` | `value`, `options`, `onChange(value)`; `ariaLabel` names the group/control. `GlassSelect` also takes `searchable`, `searchPlaceholder` and `noMatchLabel` |
| `GlassTabs` | `value`, `tabs`, `onChange(value)`; the host renders the active panel |
| `GlassRadio` | Selected group `value`, option identity `optionValue`, shared `name`, `onChange(value)` |
| `GlassModal`, `GlassDrawer`, `ConsolePalette` | `open` and `onClose()`; the host updates `open` |
| `GlassPopover` | Optional `open` / `onOpenChange(open)`; omit `open` for internal state |
| `GlassMenu` | `items` and `onSelect(value)`; disabled items cannot select |

A radio group shares one `value` and `name`; each radio's `optionValue` is the value it selects:

```tsx
import { useState } from 'react';
import { GlassRadio } from 'latere-ui';

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

`PlatformLogoMark` identifies the platform with the Latere symbol above stacked layers. It inherits `currentColor`, accepts native SVG attributes and merges caller classes. It is decorative by default (`aria-hidden="true"`, `focusable="false"`); place it beside a visible product name, or override the accessibility attributes when it needs its own label. `LatereLogoMark` remains the corporate identity.

`GlassAlert` sets a notice as one grid: a leading 16px icon in the tone's color, then the title and the body sharing one left edge, then an optional dismiss. The frame is a full hairline mixed toward the tone, the fill a faint wash of it; no edge is heavier than another. `tone` picks the color and the icon (`info`, `success`, `warning`, `error`), so a notice never rests on color alone.

Controls share one height scale. Set `--lu-control-height` and `--lu-control-height-sm` (32px and 28px by default for buttons, fields and selects) once, and every button, icon button, field and select takes them, so a field and the button beside it share a baseline.

Buttons have one shape, a capsule, in flat treatments with no glass, blur or shadow: `variant="primary"` is a dark ink fill, the default `variant="glass"` a 1px hairline outline around an ink label, and `variant="ghost"` a bare label in the secondary tone. A destructive action among other actions is `variant="danger-ghost"`, set as text; the filled `danger` belongs to the confirming button of a dialog. `GlassIconButton` is round, with the hairline outline. Focus rings follow the capsule.

Two corner tokens keep buttons and panels apart:

| Custom property | Default | Rounds |
|---|---|---|
| `--lu-button-radius` | `--radius-pill` (999px), a capsule | `GlassButton`, `GlassIconButton`, and the `ThemeMenu` and `LocaleMenu` buttons |
| `--lu-control-radius` | each component's own: 8px fields and selects, 6px menu rows | Fields, selects, menu rows, and menu and popover panels, which add their padding to it |

Set `--lu-button-radius` to give buttons a squarer corner. Never set a capsule through `--lu-control-radius`: menu and popover panels round from it, and a capsule there turns a menu into a pill.

Migrating from v1.34 and earlier: `--lu-control-radius` no longer rounds buttons, so a host that set it to square its buttons sets `--lu-button-radius` to the same value. The button element no longer carries `lu-glass-thin` (default variant) or `lu-glass-ultrathin` (`GlassIconButton`); a host rule that targeted those classes on a button no longer matches. The primary fill reads `--text` and its label `--bg`, where it used to read `--glass-smoke-strong` and `--glass-smoke-ink`; the default variant's label is `--text`, where it was `--text-secondary`. A button inside `GlassBar` keeps the capsule; it no longer takes the bar's corner minus its inset.

`GlassSelect` can be searched by typing. A select with more than `SELECT_SEARCH_THRESHOLD` options (8) opens with a search field at the top of its menu and the focus in it; typing keeps the options whose label or value contains the text, in any case, and marks the matched part. The arrow keys move through what is left, Enter chooses, and Escape clears the field and then closes the menu. Typing a letter on the closed select opens it with that letter in the field. `searchable` shows the field below the threshold or hides it above; `searchPlaceholder` (default "Search") is the field's placeholder and accessible name, and `noMatchLabel` (default "No matches") the line shown when nothing matches. Each option is one line, cut with an ellipsis and with its full label in a tooltip; the menu grows wider than the select to fit its longest label, up to `--lu-select-menu-max-width` (400px) and never past the viewport's 16px edges. Inside a modal or a drawer, Escape in an open select closes only the select.

`GlassBadge` keeps glass labels in the text color and uses the dot for tone. Solid badges pair each default fill with contrasting ink. If you override a semantic fill, set its matching `--state-<tone>-ink` when needed and verify contrast in both themes.

`GlassModal` and `GlassDrawer` portal to the document body, trap focus while open, and request closure through `onClose`. Their `header` prop replaces the default title; modal `footer` accepts a React node or `(close) => ReactNode`. Drawer `side` is `left` or `right` and `width` defaults to `20rem`.

`GlassPopover` accepts a `trigger` node or `({ open, toggle }) => ReactNode`; its wrapper already toggles on click. Its content is `children` or `({ close }) => ReactNode`. Use `close` after handling a menu choice. `placement` accepts `bottom-start`, `bottom-end`, `top-start`, or `top-end`; `matchWidth` follows the trigger width. `GlassTooltip` wraps its trigger in `children` and takes `text` plus optional `placement="top" | "bottom"`.

Imperative services: mount one `GlassToaster` and one `GlassConfirmHost` near the application root, then call `message` and `confirm` anywhere:

```tsx
import { GlassToaster, GlassConfirmHost, message, confirm } from 'latere-ui';

function FeedbackHosts() {
  return <><GlassToaster /><GlassConfirmHost /></>;
}

const dismiss = message.success('Saved', { duration: 4000 });
// dismiss() closes this toast; duration: 0 keeps it until dismissed.
const approved = await confirm({ message: 'Delete this workspace?', danger: true });
```

`message.info/success/warning/error` return a closer; `message.clear()` removes all toasts. `confirm()` queues requests and resolves `true` on confirmation or `false` on cancellation. Mount a single host for each service per application.

## Session

The session helpers talk to your application's own backend, which holds the
session cookie and runs the sign-in redirect. The browser never calls an
identity provider directly. Every path below is a default and can be renamed
through `SessionProvider`'s props:

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

Wrap the application in `SessionProvider` once. It resolves the principal on
mount, owns the global 401 handler, and exposes org switching and sign-out;
`useSession()` reads it anywhere below:

```tsx
import { SessionProvider, useSession, AccountMenu } from 'latere-ui';

function App() {
  return (
    <SessionProvider csrfCookie="csrf_token" defaultReturnTo="/dashboard">
      <Shell />
    </SessionProvider>
  );
}

function Shell() {
  const { principal, loading, login } = useSession();
  if (loading) return <Spinner />;
  return (
    <>
      {/* AccountMenu reads principal, login, logout and switchOrg from the
          provider when the matching prop is omitted. */}
      <AccountMenu dashboardPath="/dashboard" />
      {principal ? <Dashboard /> : <button onClick={() => login()}>Sign in</button>}
    </>
  );
}
```

`useSession()` returns `principal` (`null` when signed out), `loading`,
`error`, `refresh()`, `login(returnTo?)`, `logout()`, `switchOrg(orgId)`,
`frontChannelLogout()`, `requireSession(returnTo?)` and the shared `client`
for app-specific calls. Pass a prebuilt `client` instead of `csrfCookie` to
share one client with code outside React.

A protected view calls `useSessionGate()`. It resolves the session on entry;
when nobody is signed in, it navigates once to `/login?prompt=none` so a
session the person already has with the identity provider carries over
without a prompt. A `sessionStorage` flag keeps the check from looping. When
the check comes back signed out, `showAuthGate` becomes true and the view
renders its own sign-in prompt linking to `loginURL`; `ready` is true once the
check has settled. The gate is router-agnostic: pass your router's current
path in `path` to re-check on each navigation, and a `stripSsoChecked` that
uses your router's replace to keep its state in sync.

```tsx
import { useSessionGate } from 'latere-ui';
import { useLocation } from 'react-router-dom';

function Protected() {
  const location = useLocation();
  const { ready, showAuthGate, loginURL } = useSessionGate({ path: location.pathname + location.search });
  if (!ready) return <Spinner />;
  if (showAuthGate) return <a href={loginURL}>Sign in</a>;
  return <Dashboard />;
}
```

`requireSession()` is the same check without a gate view: the silent check
once, then an interactive sign-in, so a directly loaded protected URL always
resolves. A request that answers 401 in the middle of a session runs the same
recovery. `expiredSessionMode` decides whether any of this redirects:
`'silent-recheck'`, the default, behaves as described; `'graceful'` never
redirects, so a public page stays usable while signed out.
`runFrontChannelLogout({ client })` (or `frontChannelLogout()` from
`useSession()`) signs out from the browser side: it reads `GET /api/logout`,
loads each entry of the answer's `front_channel_uris` in a hidden frame so
other applications clear their own sessions, waits at most 2 seconds per
frame, and then navigates to `post_logout_redirect`. `me`, `orgs`,
`switchOrg`, `switchPersonal`, `login` and `logout` are also exported as plain
async functions over an `ApiClient`, for code outside React.

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

```tsx
import { useEffect } from 'react';
import { blogPosting, mountJsonLd } from 'latere-ui/structured-data';

useEffect(() => mountJsonLd(blogPosting({ headline: post.title, url: post.url })), [post]);
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

## Status and stability

The package ships source and is pinned by tag, so a consumer upgrades only when
it changes its pin. Minor versions add components and props; the `.lu-glass-*`
class names, the CSS custom-property contract, and the exported function
signatures are the compatibility surface. A breaking change to any of them
comes with a note in this guide's migration paragraphs, as the v1.10 to v1.20
Liquid Glass change did.

Version 2 is React only: the package root resolves to the React entry, and a Vue application stays on a v1.x tag. The [changelog](../CHANGELOG.md#unreleased) lists what version 2 removed. State bindings are React values, hooks and callbacks. The appearance matrix renders every component at desktop and mobile sizes in light and dark themes; see the [visual reference](visual-reference.md).

### Compact layout defaults

Import `latere-ui/tokens` for the 4/6/8/14/18/24px radius ladder and `--font-ui` system font. Component CSS includes matching radius fallbacks when the token entrypoint is omitted. Existing host token overrides take precedence. Panels now consume `--space-4` (16px fallback), and toolbars use `--space-1-5`/`--space-3` (6px/12px fallbacks).

The default button variant and icon buttons draw their hairline from `--lu-button-border` when provided; the default mixes 20% text color into transparent to keep the control boundary visible. Check custom borders in both themes and against the intended backdrop.

`DocsLayout` has a `.lu-docs-frame` containment wrapper around `.lu-docs`. Size the component normally through its parent; the inner grid uses container queries at 1080px and 720px. Consumers with direct-child selectors should account for the new wrapper. The optional TOC contributes no column when `showToc=false`.

### Product-neutral shell styling

Omit `brandTheme` for neutral UI typography, set `brandName` to the host application name, and use the `brand` and `logo` props for a custom identity. Named brand themes remain opt-in. See the [product styling guidance](design-system.md#keep-product-styling-explicit) for Replichai, Wallfacer and Origo integration choices.

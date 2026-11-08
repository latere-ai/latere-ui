# Changelog

Every tag has a section here, and the section is the body of the GitHub
release. A tag without one fails the release workflow. Write under
`Unreleased` as work lands; `go tool lateregate release vX.Y.Z` turns that
into `## vX.Y.Z - YYYY-MM-DD` in the commit the tag points at.

A section says what changed for whoever uses the release, not what was
committed: the commit log already holds that.

## Unreleased

## v2.3.0 - 2026-11-06

### Added

- The footer's Legal column links the Data Processing Agreement at latere.ai/legal/dpa, after the Terms, in English, German and Chinese.

## v2.2.3 - 2026-10-29

### Fixed

- The account menu shows the person's initials when their picture cannot be loaded, in its button and in the open menu's header, where it showed a broken image. When `avatar_url` changes to another address, the menu tries the new picture.

## v2.2.2 - 2026-10-15

### Fixed

- A modal, drawer or confirm with a disclosure (`<details>`) lets Tab go on from its summary to the controls after it. Before, Tab from the summary jumped back to the first control, so a keyboard could not reach the buttons below a disclosure.

## v2.2.1 - 2026-10-13

### Fixed

- `SessionProvider` settles under React's StrictMode in development, as a `vite dev` server renders it. It stayed loading there, and a console behind `useSessionGate` never got past its session check: StrictMode runs every effect's cleanup and then its setup again on the same component, and the provider dropped the `/me` answer that arrived after that. A production build was not affected.

## v2.2.0 - 2026-10-11

### Added

- The footer's Company group links the product catalog, `https://latere.ai/products`, after About: Products in English, 产品 in Chinese, Produkte in German, under the `footer.products` key. Every site that draws the footer now leads to the catalog, and the company site follows the link through its own router. The Company group holds six links.

### Changed

- The footer's Applications group lists the chat as Latere Chat in every language, where it read Latere, the company's own name. The link and its hover gradient are unchanged.

## v2.1.1 - 2026-10-10

### Fixed

- A host on React 18 typechecks again: v2.1.0's select and popover set the `popover` attribute, which @types/react before 19 does not declare. `bun run typecheck` now checks the package against React 18's types as well as 19's.

## v2.1.0 - 2026-10-10

### Changed

- A select's open menu and a popover's panel are no longer cut off by a dialog, a drawer or a scrolling box around them. `GlassSelect` and `GlassPopover` draw them in the browser's top layer, over the whole page, against the control that opened them. A menu that has no room under its control opens above it, and a popover set to open above opens below where only that side has the room; with no room on either side, it takes the roomier side and scrolls. It moves sideways to stay inside the viewport, follows its control when the page or the dialog scrolls, and closes once the control has scrolled out of sight. The arrow keys scroll only the menu, never the dialog around it.
- `GlassPopover` owns Escape while it is open: inside `GlassModal` or `GlassDrawer`, Escape closes the popover and leaves the dialog open, where it used to close the dialog. In a dialog with an open select or popover, Escape closes that menu first even when the focus is elsewhere in the dialog, as after a click in Safari, which does not focus the clicked button.
- Host styles: `.lu-select-list` and `.lu-pop-panel` are `position: fixed` and placed by the component, which writes `--lu-anchor-width` (the control's width) and `--lu-layer-max-height` (the room on the side it took) on them; they stay inside their component in the DOM, so descendant selectors still reach them. Delete any rule that set their `top`, `bottom`, `left` or `right`, such as one that opened a select upward in a dialog: the component flips by itself now. A `width` or `min-width` of `100%` on either panel is the viewport's width now; use `var(--lu-anchor-width)` for the control's. `.lu-pop-panel--<side>-<edge>` names the placement the panel took after a flip, where it used to repeat `placement`.

### Fixed

- A select's options start at the menu's edge inside a host that centers its text, such as a centered drop zone, where they used to be centered.

## v2.0.0 - 2026-10-08

### Added

- The footer's Applications group lists the Gallery after the chat, linked to `https://latere.site/`: Gallery in English, 作品广场 in Chinese, Galerie in German, under the `footer.products.gallery` key. Every site that draws the footer now leads to the gallery.
- `latere-ui/ink` is the ink token ladder the platform console, its docs and the identity pages read: neutral grays with no hue, ink as the accent, and the primary action inverted between the themes. Import it after the shared styles and set `data-design="ink"` on `<html>`; `data-theme="dark"` selects the dark ladder. Every text tone reaches 4.5:1 on every surface it is set on, and control edges reach 3:1. Beside the surface, text, border, status, code syntax, terminal and admin-audience tones, it names the status tones by meaning (`--info`, `--warn`, `--danger`) and carries the radius ladder from `--radius-chip` (4px) to `--radius-card` (16px), the control heights (`--control-height` 36px, `--control-height-sm` 28px, `--control-height-lg` 40px) and the console type scale. An application that kept its own copy of this palette can import `latere-ui/ink` instead; the shared names hold the platform's values, so a copy that set `--control-height` to 32px or added CJK fonts to `--font-ui` sets those after the import.
- `latere-ui/favicon` writes the platform's browser tab icon from the navigation's mark: `platformFaviconSvg()` returns the SVG document, ink (`FAVICON_INK`) in a light tab and light ink (`FAVICON_INK_DARK`) in a dark one, and `favicon(markup)` sets the same colors in any rendered markup whose mark carries the `platform-logo-mark` class. It renders with `react-dom/server`, so it is a separate entry for build scripts and servers; the main entry never imports it.

### Changed

- **Breaking**: **Pin `github:latere-ai/latere-ui#v2.0.0` and import from `latere-ui` or `latere-ui/react`; both are the React entry.** latere-ui is React only. The package root, `latere-ui`, now resolves to the React entry, the same module as `latere-ui/react`, so every existing React import keeps working. `react` and `react-dom` 18 or 19 are required peers; `vue` and `pinia` are no longer peers. A Vue application stays on a v1.x tag, such as `github:latere-ai/latere-ui#v1.32.2`.
- **Breaking**: **On `SiteFooter`, drop `compact` and `messages`, pass `brand` with the site's lockup as its header sets it, and wire `theme` with `onThemeChange` and `locale` with `onLocaleChange` and `locales` where the site has more than one language.** Every Latere site ends in one footer, the full footer as latere.ai shows it, and a site passes only its lockup and its preference wiring. `compact` is gone: the one-line strip no longer exists, and a site that drew it gets the full footer. `messages` is gone: the footer's copy is the package's, in English, Chinese and German, and any other locale reads English. The theme menu shows only with `onThemeChange`, and the language menu only with `onLocaleChange` and two `locales` or more, so a site in one language passes one locale, or none, instead of hiding the menu. `FOOTER_GROUPS` and `FOOTER_COMPACT_LINKS` are removed; `FOOTER_COLUMNS` is the footer's one list of links.
- **Breaking**: **Delete every site rule that restyles the footer, and name `.lu-footer` in rules that exclude it.** The rules to delete are `.site-footer`, `.footer-*`, and the `.logo-*` rules meant for the footer's default lockup; a rule such as `:not(.site-footer *)` names `.lu-footer` instead. A footer that should look different is a change to this package. Every class the footer draws now starts with `lu-footer`: `.site-footer` is `.lu-footer`, `.footer-container`, `.footer-lead`, `.footer-lockup`, `.footer-social`, `.footer-rule`, `.footer-prefs`, `.footer-cols`, `.footer-col`, `.footer-group`, `.footer-col-title`, `.footer-links`, `.footer-link` and `.footer-bottom` are the same names after `lu-`, and the default lockup's `.logo-link`, `.logo-mark`, `.logo-mark-footer`, `.logo-mark-icon` and `.logo-text` are `.lu-footer-home`, `.lu-footer-mark`, `.lu-footer-mark-icon` and `.lu-footer-word`. `latere-ui/styles` no longer styles the generic `.logo-*` classes, so a header that borrowed them styles them itself.

### Removed

- **Breaking**: **Remove every import of the Vue entry and use the React counterparts.** Removed with the Vue entry: every Vue component, the Pinia session store (`createSessionStore`, `SessionStoreOptions`), the Vue `useSession` and `useSessionGate`, `createOrgSwitcher`, `createCollapse`, `createToc`, `useGlass`, `concentricRadius`, `useLiquidGlass`, `useFocusTrap`, `useClickOutside`, the reactive `toasts` and `currentConfirm`, and their option and state types. The package entry carries the counterparts: `SessionProvider` with `useSession` and `useSessionGate`, `useOrgSwitcher`, `createTocCore`, `initLiquidGlass`, and `message` and `confirm` rendered by `GlassToaster` and `GlassConfirmHost`. The framework-free helpers stay public there: `glassClass`, `createReauth` for an app that keeps its own session state, and the option types of `me`, `orgs`, `switchOrg` and `logout`.
- **Breaking**: **Drop `ProductSwitcher`, and `product` and `productLabels` from `ConsoleSidebar`.** The product switcher is retired across the family: `ProductSwitcher`, `LATERE_PRODUCTS`, `DEFAULT_PRODUCT_SWITCHER_LABELS`, `ProductInfo`, `ProductSlug`, `ProductSwitcherLabels`, `ProductSwitcherLabelOverrides`, the `.lu-ps-*` styles, and `ConsoleSidebar`'s `product` and `productLabels` props are gone. Remove the props from a sidebar that passes them.

## v1.37.0 - 2026-10-07

### Added

- The footer says which language its copy is in: `SiteFooter`, in both layouts and both adapters, sets `lang` on its `<footer>`, `zh-Hans` for Chinese, `de` and `en` for German and English, the host's locale for one it supplies through `messages`, and `en` for a locale it falls back to English for. A screen reader then reads Chinese footer copy in Chinese, and the browser picks Chinese faces for it, on a page whose own language is English. `footerLang(locale, messages)` gives the same value to a host.

### Changed

- The footer's social row leads with Slack, in the place of Discord, whose invite no longer works. `SiteFooter`, in both layouts and both adapters, links the Slack glyph to `https://latere.ai/slack`, a redirect on the company site to the current invite, so a new invite reaches every footer without a release of this package.

### Fixed

- A heading's slug keeps the letters and digits of every script. A Chinese heading's id is its own words, such as `钱包用完之后`, where every Chinese heading was `section`, `section-2`, and so on; links to those numbered ids no longer land. Latin headings keep their ids, except that letters with marks stay (`über-die-plattform`, where it was `ber-die-plattform`). Invisible format characters, such as word joiners, are left out of the slug.

## v1.36.0 - 2026-10-05

### Added

- The chat joins the lineup under its public name, Latere, and takes Wallfacer's place. The footer's Applications group lists Latere, linked to `https://chat.latere.ai/`, in both layouts and all three bundled languages, under the new `footer.products.chat` dictionary key. The compact strip sets the name in the new `.chat-brand` wordmark, the serif italic in the ink of the text with no gradient, and the full footer's column link fills with the text color under the pointer. The product switcher's first tile is the chat, slug `chat`, showing the Latere mark in `currentColor`, with `#c4511f` as its `color`.

### Removed

- Wallfacer's pages stay up, but no navigation in the package leads there. This breaks a host that still names it: `wallfacer` is no longer a `ProductSlug` or an entry of `LATERE_PRODUCTS`, `ConsoleSidebar` no longer accepts `brandTheme="wallfacer"`, and the `footer.products.wallfacer` dictionary key is gone. A `ProductSwitcher` given `current="wallfacer"`, or a `ConsoleSidebar` given `product="wallfacer"`, still renders and marks no tile as current; remove the value. The `.wallfacer-brand` wordmark class and the `--lu-brand-wallfacer` token stay for pages that cite Wallfacer by name, and the `data-design="wallfacer"` appearance is unchanged.

## v1.35.0 - 2026-10-04

### Changed

- Buttons take one shape, a capsule, in flat treatments with no glass, blur or shadow: `GlassButton`'s `primary` is a dark ink fill, the default `glass` variant a 1px hairline outline around an ink label, and `ghost` a bare label. `danger` and `danger-ghost` keep their meaning. `GlassIconButton` is a round hairline button without a fill, and the `ThemeMenu` and `LocaleMenu` buttons are round. Focus rings follow the capsule. Menus, popovers, selects and fields keep their corners and their elevation.
- `--lu-button-radius` rounds every button, icon button and the theme and language buttons, a capsule by default. `--lu-control-radius` keeps rounding fields, selects, menu rows and menu panels, and no longer rounds buttons: a host that set it to square its buttons sets `--lu-button-radius` instead. A capsule set through `--lu-control-radius` turns menu panels into pills, so keep it there no rounder than a field.
- The button element no longer carries `lu-glass-thin` (default variant) or `lu-glass-ultrathin` (`GlassIconButton`). The primary fill reads `--text` with a `--bg` label, where it read `--glass-smoke-strong` and `--glass-smoke-ink`, and the default variant's label is `--text`, where it was `--text-secondary`. A button inside `GlassBar` keeps the capsule rather than the bar's corner minus its inset. Heights are unchanged: 32px and 28px, or the host's `--lu-control-height` and `--lu-control-height-sm`.

### Fixed

- Fixed: a switch's thumb is centered in its track in a host that sizes
  every box by its border. With such a reset the thumb sat 2px low and,
  when on, 2px too far right. The track now states its own box model.

## v1.34.0 - 2026-10-03

### Removed

- Lectio leaves the package: the hosted service at `lectio.latere.ai` was retired on 2026-10-03, and every link to it was dead. The footer's Applications group lists Wallfacer alone, in both layouts, and the product switcher shows five tiles. This breaks a host that still names Lectio: `lectio` is no longer a `ProductSlug` or an entry of `LATERE_PRODUCTS`, `ConsoleSidebar` no longer accepts `brandTheme="lectio"`, and the `.lectio-brand` wordmark class, the `--lu-brand-lectio` token and the `footer.products.lectio` dictionary key are gone. A `ProductSwitcher` given `current="lectio"`, or a `ConsoleSidebar` given `product="lectio"`, still renders and marks no tile as current; remove the value.

## v1.33.0 - 2026-10-03

### Added

- The footer's Legal column, and the compact footer's links, open with Trust Center (信任中心 in Chinese), linked to `/trust` on the company site: what Latere does with a reader's data, where it is kept and for how long.

## v1.32.2 - 2026-10-01

### Fixed

- The product switcher's Topos and Cella tiles open the platform console's Agents and Environments sections. They opened `topos.latere.ai` and `cella.latere.ai`, which no longer resolve since those hosted services were retired.

## v1.32.1 - 2026-10-01

### Fixed

- `LatereLogoMark` and `PlatformLogoMark` draw the mark's dot as a true circle, at the same center and size. It was a traced outline with a flattened side that showed at large sizes.

## v1.32.0 - 2026-10-01

### Added

- `GlassSelect` can be searched by typing. With more than `SELECT_SEARCH_THRESHOLD` options (8, exported from `latere-ui` and `latere-ui/react`), its menu opens with a search field at the top and the focus in it. Typing keeps the options whose label or value contains the text, in any case, and marks the matched part of each label. The arrow keys move through what is left, Enter chooses, and Escape clears the field, then closes the menu. A letter typed on the closed select opens it with that letter in the field, and a search with no match says so in one line. `searchable` shows the field below the threshold or hides it above; `searchPlaceholder` (default "Search") is the field's placeholder and accessible name, and `noMatchLabel` (default "No matches") the no-match line. The field is a combobox that controls the listbox, so a screen reader announces the active option. Existing selects need no change.

### Changed

- A select option is one line, cut with an ellipsis, with its full label in a tooltip, where a long label used to wrap. The menu is at least as wide as the select and grows to fit its longest label, up to `--lu-select-menu-max-width` (400px), and never comes closer than 16px to either edge of the viewport.
- The options are a `ul.lu-select-options` listbox inside the `.lu-select-list` panel, so styles that restyle the panel through `.lu-select-list` keep working. The panel sizes as `border-box` and shows seven rows before it scrolls in every host; a host that sets `box-sizing: border-box` on every element saw six and a half.

### Fixed

- Escape in an open select inside a `GlassModal` or `GlassDrawer` closes only the select; it used to close the dialog as well.

## v1.31.0 - 2026-09-30

### Added

- Any sidebar row takes `value`, the short text set at its end, where only foot rows did. A section pinned to the bottom can show a balance, such as a Wallet row with "$8.16", and still be the section row, highlighted while its pages are open. The collapsed tooltip names the value as a foot row's does. `NavFootItem` is now the same type as `NavItem`; code that uses it keeps compiling.

## v1.30.1 - 2026-09-26

### Changed

- The full footer's column headings are semibold in the full text tone, darker than the links under them, where they were regular weight in the muted tone and read lighter than the links. The compact strip is unchanged.

## v1.30.0 - 2026-09-26

### Added

- `latere-ui/structured-data` describes public pages to search engines and AI agents in the schema.org vocabulary. Builders for `Organization`, `Person`, `WebSite`, `Book`, `Chapter`, `Article`, `BlogPosting` and `BreadcrumbList` take the page's data and return plain JSON-LD nodes; `jsonLdScript` writes one node, or a `@graph` of several, as the `<script type="application/ld+json">` element for the page's head, with `<`, `>`, `&`, U+2028 and U+2029 escaped so no value can end the element or inject markup. Translated pages link each language version with `workTranslation` and `translationOfWork`, and `license` takes the license's URL, such as a Creative Commons deed. A missing `name`, `headline`, `url` or `isPartOf`, a relative URL, a malformed date or an invalid language tag throws a `StructuredDataError` when the page is built or rendered. `mountJsonLd` places the same data from a browser-only app, though only crawlers that run scripts see it. No dependencies and no framework: it runs in Bun, Node and the browser, and the Vue and React entries do not include it.
- `ThemeMenu` and `LocaleMenu`, for Vue and React, replace the footer's segmented theme control and language select in both layouts: quiet icon buttons (a sun, a moon or a monitor for System; a globe) that open a solid menu with 32px rows and a check on the current choice. A header can place the same controls. New dictionary keys: `footer.theme.light`, `footer.theme.dark`, `footer.theme.system`, `footer.navigation`, `footer.social`.
- `latere-ui/telemetry` starts browser telemetry with one call, `startTelemetry({ service: '<product>-web' })`, from any framework or none. It records page loads, `fetch` and `XMLHttpRequest` calls, and the Core Web Vitals (LCP, INP, CLS, FCP, TTFB, as `browser.web_vital` spans), and sends them as OTLP traces to the same-origin relay a backend mounts with `otel.TelemetryProxy` from `latere.ai/x/pkg/otel`, at `/v1/telemetry` unless `endpoint` says otherwise. The OpenTelemetry SDK is loaded as a separate chunk after the page's `load` event, so it never delays first render; `sampleRatio` decides per page load, before anything is downloaded. No cookies or identifiers are recorded, and query strings and fragments are removed from every recorded URL. The OpenTelemetry packages and `web-vitals` are dependencies of `latere-ui`: an application that carries its own copy of this setup can delete it and drop its `@opentelemetry/*` and `zone.js` dependencies. Hosts that never import `latere-ui/telemetry` bundle none of it.
- One control scale: `--lu-control-height` (32px) and `--lu-control-height-sm` (28px) size every button, icon button, field and select, and `--lu-control-radius` rounds them, so a field and the button beside it share a baseline and a corner. Without the tokens each control keeps its current size and shape.
- `GlassButton` takes `variant="danger-ghost"`: a destructive action set as text among other actions, such as in a toolbar. Keep the filled `danger` for the confirming button of a dialog.
- A nav item takes `audience: 'admin'` for a row only people with an admin role are shown. Its icon takes `--lu-audience-admin` and, in the expanded rail, a small chip after the label names the audience (`audienceLabel`, "Admin" by default; left off a row whose label already says it). The collapsed tooltip names it too.
- `bottomGroups="foot"` sets the groups pinned to the bottom in the sidebar's foot, together with the foot rows and above the account control, so they stay in view while the nav scrolls. The arrow keys move through them as through the nav. The default, `"nav"`, keeps them at the end of the nav.
- `AccountMenu` takes `subline="role"`: the role as a small sentence-case badge in the interface face, "Platform admin", then the account in quiet text. With `subline="text"` or `"role"` the dropdown's header states the role and the account in the same case instead of the uppercase badge.
- Console icons add `info`, `check-circle`, `alert-triangle`, `x-circle` and `more`; a host draws them from `CONSOLE_ICONS` or `consoleIcon`. `identityParts` returns the role and the account the role subline states.
- The console sidebar holds sub-pages. Give a nav item `children` and it becomes an expandable row, folded until the viewer opens it or one of its pages is current, and the rail remembers the viewer's choice. Enter and Space open and close a row and the arrow keys move between rows. In the collapsed rail a parent links to its page and stays highlighted while any page under it is open.
- Nav items show a built-in stroke icon when `icon` names one (home, key, card, folder, cube, globe, sparkles, bot, branch, repo, org, shield, book, coins, terminal, plus, search, chevron, external). A row without an icon no longer leaves an empty space before its label.
- `compact` puts the sidebar's brand, name and fold button in one row and folds the head into a single logo button. `footItems` adds rows such as Documentation and a balance above the account control. With `compact`, the account card's corner follows the window's corner (`--radius-window`, 26px, minus the rail's `--lu-cs-inset`).
- The command palette takes host `items` (actions and other destinations) and a `search` function for extra results, lists sub-pages, and shows row icons.
- `AccountMenu` takes `subline="text"` for one quiet line under the name, such as "Platform admin · Personal", in place of the uppercase role badge.
- Export `PlatformLogoMark` for Vue and React: the platform's Latere symbol above two stacked layers, sharing one geometry definition.

### Changed

- The product switcher sends Lux to the platform console's Models section, `https://platform.latere.ai/console/models`. The hosted gateway at `lux.latere.ai` was retired and no longer answers.
- The full footer is redrawn with room around it. A lead block on the left holds the site's lockup, the social profiles, a short hairline and the theme and language buttons; four link columns sit beside it: Applications with Research below it, Platform (Latere Platform and Identity), Company, and Legal. Headings are quiet and regular weight over plain links 32px apart, and the copyright closes the footer. Below 1024px the lead moves above the columns; on a phone the columns go two up, then the lead. The Community column and the tagline are gone; the `footer.tagline` key remains for hosts that override it. A site passes its own lockup through the `#brand` slot (React: `brand`).
- Product names in the footer's columns rest in the body face, like their neighbors, and take their product's gradient under the pointer or keyboard focus.
- The platform's mark is the ink: `.platform-brand` draws a near-black to graphite gradient in light and off-white to silver in dark, in place of violet. Product gradients are `--lu-brand-*` tokens in `brand.css` and `footer.css`.
- `GlassMenu` follows the menu pattern: one tab stop, arrow, Home and End keys, focus that follows the mouse. Items with `checked` make a choice menu (`menuitemradio` with `aria-checked` and a check column); `label` names the menu and `autofocus` focuses the checked row on mount.
- `GlassPopover`'s panel no longer carries `role="menu"`, which nested a second menu around a `GlassMenu`; the content declares its role. It takes `surface="solid"` for an opaque menu surface, opens on ArrowDown or ArrowUp from the trigger, closes when focus moves to an element outside it, returns through the trigger on Shift+Tab, and passes the panel `id` to the trigger for `aria-controls`. The React adapter takes `className`.
- `GlassAlert` is redrawn: a leading icon in the tone's color (info, check, triangle, cross), the title and the body on one left edge beside it, a full hairline frame mixed toward the tone and a faint wash of it. The heavy left edge is gone. The markup gains `.lu-alert-icon` before `.lu-alert-body` and a `data-tone` attribute; the props are unchanged.
- A link in the documentation body carries a constant underline, a 1px line offset 0.22em in a softened tone of the link color (`--lu-link-underline-thickness`, `--lu-link-underline-offset`, `--lu-link-underline-color`), instead of gaining one on hover.
- Separate footer navigation into Applications, Research, and Platform in Vue and React, including compact layouts. Link the unified platform console and ReplicHAI, and remove the separate capability entries from the footer.

## v1.29.0 - 2026-09-20

### Added

- The footer links an Open source page at `/open-source`, in the company column and in the compact row, translated in English, Chinese and German. It resolves against `baseUrl` and routes through `routerLink` like the other site links.
- Add keyboard-accessible toast dismiss buttons and restore popover trigger focus after keyboard dismissal. Match React modal and toast transition lifecycles with Vue.
- Complete the React visual component set: add surfaces, icon buttons, switches, radios, tabs, progress/skeleton feedback, tooltips, menus, popovers, drawers, toast/confirm hosts, command palette, documentation layout, preferences, product switching and organization selection. Restore the sidebar's optional product switcher.
- Add opt-in Replichai, Wallfacer and Origo component appearances with distinct typography, density, matte materials and interaction states, plus dedicated light/dark and responsive golden figures.
- Populated workspace references at laptop, desktop and mobile sizes, rendered at 300 DPI. Pointer-aware controls retain touch target size.
- Added a per-figure design review checklist alongside the visual references.
- Added an interactive Vue/React component gallery, reviewed visual reference
  images, and browser screenshot comparisons for both themes and mobile layouts.
- Added a visual design guide and composition diagram; moved detailed usage
  examples into the integration guide.

### Changed

- Share toast/confirmation services and component styles across Vue and React. React controls use values and callbacks; `GlassRadio` uses `value` for the group selection and `optionValue` for each option.
- Extend the visual matrix to every component in both adapters, all four appearances, light/dark and desktop/mobile. Require exact decoded RGBA equality between adapters and against platform goldens, with no channel or antialiasing tolerance; recording cannot bypass adapter parity.
- Integrate the console rail with its window edge, remove the detached sidebar rim and use a flat selected-row fill, following the supplied macOS 27 reference.
- Sibling panels, toolbars and tables share a radius; nested toolbar controls derive smaller corners from the inset.
- Product-neutral shell examples and default brand typography; explicit guidance for Replichai, Wallfacer and Origo styling.
- Compact design defaults: smaller panel/control corners, tighter insets and tables, a 224px sidebar, system UI shell typography, and softer glass edges/shadows.
- Docs layout adapts to its available container width and removes the unused TOC track. Its root now includes `.lu-docs-frame`; update direct-child CSS selectors if needed.
- Rendered visual reference figures at 3.125× resolution with 300 DPI metadata
  for sharper enlarged and printed views.

### Removed

- Drive left the product lineup. The console shut down on 2026-09-19 and durable storage is now the platform's Storage section, so the product switcher and both footer variants no longer offer it, and `drive` is gone from the exported `ProductSlug` union. The `.drive-brand` wordmark class stays in `brand.css` and `footer.css`: the Storage section keeps the gold as its accent.
- The shared `Principal` no longer carries `is_superadmin`. Read platform administration from the role instead: `principal.role === 'platform_admin'`. An application whose backend still sends the flag maps it into `role` in its `mapMe`, or declares the wire field on its own type.

### Fixed

- Keep visual-reference button states grouped, show the selected organization in a styled headless example, preserve toast caption readability, and label inactive matte effects explicitly.
- Preserve organization owner-label spacing and handle text shaping in React account menus, and retain enhanced article content and heading anchors during React TOC updates.
- Compact footer links wrap without clipped labels or underlined separators; desktop preferences share a compact height and preserve touch targets.
- Refined smoke rims and backed thick overlays with an opaque reading surface;
  reduced transparency now also makes smoke opaque when contrast is increased.
- Improved control boundaries, selected states, hints and product wordmarks;
  stabilized loading buttons, switches and radios, and fixed long-label layout.
- Corrected dialog, drawer, alert and error spacing; gave mobile footer navigation
  its own row and removed empty collapsed-sidebar dividers.
- Balanced table corner radii and cell spacing, removed the nested header outline,
  and kept the glass header attached to its labels while scrolling.
- Fixed low-contrast smoke surfaces, status badges and dark tooltips, and fields
  that overflowed their containers without a global CSS reset.
- Fixed empty/disabled select keyboard handling, long-list scrolling, nested
  dialog focus and dismissal, and command-palette focus restoration.
- Kept account menus attached to their triggers and scrollable, prevented their
  buttons from submitting forms, and contained product menus, popovers and long
  notifications on narrow screens.
- Refreshed glass refraction and sheen on rescans and honored changing reduced
  motion/transparency preferences.

## v1.28.1 - 2026-09-05

### Fixed

- A Vue route gate no longer acts on a stale check that finished after the route had changed.

## v1.28.0 - 2026-08-21

### Added

- `SiteFooter` for React, in both layouts, drawn from the same copy the Vue footer reads. The README says what to alias when the host has its own palette.

### Changed

- A documentation heading's anchor id comes from the heading's visible text.

### Fixed

- After a 401 in the middle of a session, `SessionProvider` sends the person back to the page they were on. It sent them to the address of the API request that failed, so they landed on a raw JSON response after signing in again.

## v1.27.0 - 2026-07-13

### Added

- React support. `latere-ui/react` exports the twelve `Glass*` primitives, `ConsoleSidebar`, `AccountMenu`, and the session bindings `SessionProvider`, `useSession` and `useSessionGate`. `react` and `react-dom` are optional peers, so a Vue host installs as before.

### Changed

- The styles of `AccountMenu` and of the `Glass*` components are shared plain CSS sheets, no longer scoped to the Vue components, so both frameworks render the same. The Vue entry is unchanged.

## v1.26.2 - 2026-07-11

### Fixed

- Focus rings follow the design system's ink outline across the whole library. Keyboard focus on a sidebar row no longer shows the browser's default blue outline.
- The initials tiles for organizations in the account menu keep their contrast in dark mode, where white initials on a light tile were unreadable.

## v1.26.1 - 2026-07-11

### Fixed

- The product switcher's panel opens below its button and grows rightward from a sidebar on the left edge, with an opaque background so the navigation behind it does not show through, and the products use their canonical marks.

## v1.26.0 - 2026-07-11

### Added

- `ProductSwitcher`, an app grid that opens from a button and links to each product, with a shared product registry. `ConsoleSidebar` takes a `product` prop (and `productLabels`) to show the switcher beside the brand; it is hidden while the rail is collapsed, and a sidebar that does not pass `product` renders as before.

### Fixed

- Glass refraction filters no longer pile up as a single-page app navigates. A site that re-scanned on each route change grew by one filter per scan, a slow memory leak in a long session.

## v1.25.0 - 2026-07-11

### Added

- The footer links Drive in the product lineup, in both layouts.

## v1.24.1 - 2026-07-11

### Fixed

- In the account menu's dropdown header, a long organization name or the word `INDIVIDUAL` wraps onto its own line instead of being cut with an ellipsis.

## v1.24.0 - 2026-07-11

### Changed

- The account menu's open dropdown header shows the person's role badge and the organization or individual context under the name and email, so the role is always readable on click even when the trigger hides it.

## v1.23.2 - 2026-07-11

### Fixed

- Overlays stack in a fixed order: popovers, tooltips, modals, confirm dialogs, then toasts. A confirm opened from a modal appeared behind it and looked like a dead button. `GlassModal` takes a `layer` prop, and the `--lu-z-*` tokens name the levels.

## v1.23.1 - 2026-07-11

### Fixed

- The collapsed sidebar's account button is centered in the sidebar's foot.
- Passing a single role label to `AccountMenu` typechecks. The `labels` prop accepts partial role labels (`AccountMenuLabelOverrides`, now exported).

## v1.23.0 - 2026-07-10

### Added

- `AccountMenu` shows a role badge next to the identity for the four roles every product shares: platform admin, org admin, org member and individual. The shared `Principal` gains a `role`; each app sets it, and the labels are overridable through `labels.roles`. Without a role the menu reads as before.

## v1.22.2 - 2026-07-08

### Removed

- The footer no longer links Agon, in either layout. The `footer.products.agon` strings, the `.agon-brand` wordmark and the `agon` value of the sidebar's `BrandTheme` are gone.

## v1.22.1 - 2026-07-08

### Fixed

- The account menu's dropdown is opaque over a glass navigation bar or sidebar. Page text showed through it before.

## v1.22.0 - 2026-07-07

### Changed

- Glass reads as bright frost instead of a dark scrim: every tier lifts the luminance behind it through the `--glass-brightness` token, in every browser engine, and the dark fills are lighter.

## v1.21.1 - 2026-07-06

### Changed

- The cursor-following sheen on glass panels is opt-in through `data-lg-sheen`, and its default is calmer. It used to attach to every panel 260px wide or more and read as a stray light blob on footers and cards.

## v1.21.0 - 2026-07-06

### Added

- The Liquid Glass lensing runtime: `initLiquidGlass()` and the `useLiquidGlass()` composable bend the background at the rounded edges of glass, and add a cursor-following sheen on large panels. It refracts in Chromium only, respects reduced motion and reduced transparency, and is safe to call during server rendering.

## v1.20.1 - 2026-07-06

### Fixed

- Overlays (the thick glass tier) are near-opaque, so page text no longer reads through an account menu, command palette, modal, popover, drawer or select list.

## v1.20.0 - 2026-07-06

### Added

- Liquid Glass v2: a five-tier material ladder (`ultrathin`, `thin`, regular, `thick`, `smoke`) with layered floating shadows and new tokens such as `--glass-pill-fill` and `--glass-smoke-*`.

### Changed

- `ConsoleSidebar` is a floating glass rail with capsule rows and a filled capsule for the active row, in place of the 3px accent bar. Its API is unchanged.
- The `Glass*` components, the documentation layout, the footer, the account menu and the command palette move to the v2 material. A primary `GlassButton` is smoked ink glass, `GlassIconButton` is round, and `GlassTabs` marks the active tab with a capsule instead of an underline. Props are unchanged.

### Removed

- **Breaking**: The Clear glass variant, `.lu-glass-clear`, and the `.lu-glass-dim` utility are retired. Use the five tiers.

## v1.10.1 - 2026-07-05

### Added

- `useFocusTrap` takes an optional `initialFocus`, so a prompt-style dialog can focus its text field on open.

### Changed

- The compact footer is a glass strip over the page.

### Fixed

- Glass fallbacks degrade fully under reduced transparency, increased contrast and browsers without `backdrop-filter`: every `--glass-blur*` and `--glass-saturate` token drops to zero, so a host that wrote its own `backdrop-filter` from the tokens no longer keeps a faint frost.

## v1.10.0 - 2026-07-05

### Added

- Liquid Glass, the shared material, as `latere-ui/glass`: three tiers (thin, regular, thick) with a specular edge, vibrancy and light and dark values, and a `useGlass()` composable. Glass degrades to opaque surfaces under reduced transparency, increased contrast, and browsers without `backdrop-filter`.
- The `Glass*` component library for Vue: `GlassSurface`, `GlassPanel`, `GlassBar`, `GlassButton`, `GlassField`, `GlassBadge`, `GlassAlert`, `GlassModal`, `GlassPopover`, `GlassIconButton`, `GlassSwitch`, `GlassSegmented`, `GlassCheckbox`, `GlassRadio`, `GlassTabs`, `GlassSpinner`, `GlassProgress`, `GlassSkeleton`, `GlassTooltip`, `GlassMenu`, `GlassSelect`, `GlassDrawer` and `GlassTable`, plus the imperative `message` and `confirm`. The README documents the surface.

### Changed

- `ConsoleSidebar` paints a frosted glass surface when the host sets glass tokens, and an opaque surface otherwise.

## v1.9.14 - 2026-06-28

### Fixed

- Clicking the brand of a collapsed `ConsoleSidebar` expands it and no longer navigates home.
- `OrgSwitcher` shows its loading state from the reactive flag.

## v1.9.13 - 2026-06-16

### Fixed

- The console sidebar stays put when the page is over-scrolled past its top. Importing `latere-ui/console` now turns off the page's elastic overscroll, for every app that imports it.

## v1.9.12 - 2026-06-14

### Fixed

- A collapsed sidebar can be unfolded again, and the active tab has stronger contrast.

## v1.9.11 - 2026-06-14

### Fixed

- The sidebar's account popup draws over the main content, not under it.

## v1.9.10 - 2026-06-14

### Fixed

- The logo stays fixed when the sidebar folds; the fold button is hidden while it is collapsed.

## v1.9.9 - 2026-06-14

### Fixed

- The sidebar's search bar is taller and draws below the `#top` slot.

## v1.9.8 - 2026-06-14

### Fixed

- Collapsed sidebar items are centered squares, and the accent bar is gone.

## v1.9.7 - 2026-06-14

### Fixed

- The account dropdown from a collapsed sidebar keeps a usable width and opens outside the rail.

## v1.9.6 - 2026-06-14

### Fixed

- The collapsed account control is a tight circle, not a wide rectangle.

## v1.9.5 - 2026-06-14

### Added

- `ConsoleSidebar` has a built-in search bar, opened with Cmd+K or Ctrl+K, that emits `search`, and a minimal `ConsolePalette` that jumps to a nav entry. A `#logo` slot and `brandColor` give every console the same brand layout with a colored logo box.

## v1.9.4 - 2026-06-14

### Added

- Nav items can be actions: clickable without a route, with an optional dot indicator.

## v1.9.3 - 2026-06-14

### Added

- `ConsoleSidebar` has an `#extra` slot below the nav for contextual content such as a recent list or a workspace switcher.

## v1.9.2 - 2026-06-14

### Added

- `ConsoleSidebar` has a `#top` slot between the head and the nav, for a command palette or search.

## v1.9.1 - 2026-06-14

### Fixed

- The account control in a collapsed sidebar shrinks to its avatar. It overflowed the 64px rail.

## v1.9.0 - 2026-06-14

### Added

- `ConsoleSidebar`, a collapsible navigation rail for product consoles, with a headless nav model and a fold primitive, and its stylesheet at `latere-ui/console`.
- `DocsLayout`, a documentation layout with a grouped index, the article, an automatic table of contents with scroll-spy, and previous and next links, over a headless grouped-docs model with a search index.
- `latere-ui/markdown`, an injectable `markdown-it` configuration helper for documentation pages.

### Fixed

- `footer.css` is self-contained: a relative import in it could drop every wordmark on a site whose CSS pipeline failed to resolve it.

## v1.8.1 - 2026-06-01

### Changed

- No change for consumers: a type-import cleanup.

## v1.8.0 - 2026-05-31

### Added

- A framework-free session core: `me`, `orgs`, `switchOrg`, `logout` and `login`.
- `OrgSwitcher`, a headless organization switcher with a Vue adapter.
- `runFrontChannelLogout`, a helper for a single-page app to answer a front-channel logout.

## v1.7.0 - 2026-05-30

### Changed

- The footer is a sitemap: four labeled columns for Products, Latere, Legal and a new Community column linking Discord, X, GitHub and LinkedIn. Products is one flat list, and the social row gains a Discord icon.

## v1.6.3 - 2026-05-30

### Changed

- The footer lays its product categories side by side in a wider container.

## v1.6.2 - 2026-05-30

### Changed

- The footer's product category labels are in plain language.

## v1.6.1 - 2026-05-25

### Added

- The footer links Lectio in the product lineup.

## v1.6.0 - 2026-05-25

### Added

- `useSession()`, one standard bootstrap for every app: it resolves `/me` on mount, runs the one-time silent `prompt=none` sign-in check when logged out, re-checks on navigation for gated pages, and wires the 401 handler. It works with `createSessionStore` or an app's own store.

## v1.5.1 - 2026-05-25

### Changed

- A logged-out `AccountMenu` trigger keeps the pill shape: an avatar and Sign in.

## v1.5.0 - 2026-05-25

### Added

- `AccountPrefs` for the account menu's `#prefs` slot: theme pills and a language row driven by the host's `localeOptions`, so it scales past two languages.

### Fixed

- The account menu header no longer draws a doubled separator.

## v1.4.4 - 2026-05-25

### Fixed

- A logged-out `AccountMenu` no longer opens an empty dropdown.

## v1.4.3 - 2026-05-25

### Added

- `AccountMenu` takes `extraItems`, a list of rows an app adds to the dropdown.

## v1.4.2 - 2026-05-25

### Fixed

- `AccountMenu` fits the sidebar placement, and hides the organization section when there are no organizations.

## v1.4.1 - 2026-05-25

### Fixed

- Types are re-exported from `.ts` modules, not `.vue` files, so TypeScript consumers can import them.

## v1.4.0 - 2026-05-25

### Added

- The shared session client: `createApiClient`, a same-origin fetch with a configurable CSRF cookie and an `onUnauthorized` handler; `createSessionStore`, a Pinia store with `me`, `fetchMe`, `login`, `logout` and `switchOrg`; `createReauth`, the shared expiry policy; `useSessionGate`, a silent sign-in for protected routes; and `AccountMenu`, with the principal, the organization switcher and `#prefs` and `#extra` slots.

### Fixed

- A session that expires in the middle of a visit is rejected and signed in again, silently first and then interactively, instead of leaving the person stranded.

## v1.3.2 - 2026-05-24

### Fixed

- The compact footer spans the full width.

## v1.3.1 - 2026-05-24

### Changed

- The compact footer is a single-line bar.

## v1.3.0 - 2026-05-24

### Added

- `SiteFooter` takes `compact`: the brand, one wrapped row of links and the theme and language controls, about a third of the full footer's height, for app pages such as sign-in and dashboards.

## v1.2.3 - 2026-05-24

### Changed

- No change for consumers: a test typecheck.

## v1.2.2 - 2026-05-24

### Fixed

- Brand gradient text keeps its clipping.

## v1.2.1 - 2026-05-24

### Changed

- The footer's copyright line reads Latere AI.

## v1.2.0 - 2026-05-24

### Added

- The footer bundles German strings, so a German page renders its footer with no `messages` wiring and no flash of English on first paint. `messages` still overrides the bundled copy.

## v1.1.0 - 2026-05-23

### Added

- `SiteFooter` takes `locales` and `messages`. A host can support a locale the package does not bundle without a new release, and `Locale` is any string.

### Changed

- The footer's language choice is one dropdown, in place of segmented buttons. The theme control stays segmented.

## v1.0.2 - 2026-05-23

### Changed

- No change for consumers: the README install snippet.

## v1.0.1 - 2026-05-23

### Added

- The package carries an MIT license.

## v1.0.0 - 2026-05-23

### Added

- `SiteFooter`, the shared Latere footer, with theme and language controls through props and update events, `LatereLogoMark`, bundled English and Chinese footer copy and footer styles. It ships as source for Vite and Vue 3 hosts, installed with `bun` from GitHub.

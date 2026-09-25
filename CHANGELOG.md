# Changelog

Every tag has a section here, and the section is the body of the GitHub
release. A tag without one fails the release workflow. Write under
`Unreleased` as work lands; before tagging, turn that into
`## vX.Y.Z - YYYY-MM-DD` in the same commit the tag points at.

A section says what changed for whoever uses the release, not what was
committed: the commit log already holds that.

## Unreleased

- The full footer is redrawn with room around it. A lead block on the left holds the site's lockup, the social profiles, a short hairline and the theme and language buttons; four link columns sit beside it: Applications with Research below it, Platform (Latere Platform and Identity), Company, and Legal. Headings are quiet and regular weight over plain links 32px apart, and the copyright closes the footer. Below 1024px the lead moves above the columns; on a phone the columns go two up, then the lead. The Community column and the tagline are gone; the `footer.tagline` key remains for hosts that override it. A site passes its own lockup through the `#brand` slot (React: `brand`).
- Product names in the footer's columns rest in the body face, like their neighbors, and take their product's gradient under the pointer or keyboard focus.
- The platform's mark is the ink: `.platform-brand` draws a near-black to graphite gradient in light and off-white to silver in dark, in place of violet. Product gradients are `--lu-brand-*` tokens in `brand.css` and `footer.css`.
- `ThemeMenu` and `LocaleMenu`, for Vue and React, replace the footer's segmented theme control and language select in both layouts: quiet icon buttons (a sun, a moon or a monitor for System; a globe) that open a solid menu with 32px rows and a check on the current choice. A header can place the same controls. New dictionary keys: `footer.theme.light`, `footer.theme.dark`, `footer.theme.system`, `footer.navigation`, `footer.social`.
- `GlassMenu` follows the menu pattern: one tab stop, arrow, Home and End keys, focus that follows the mouse. Items with `checked` make a choice menu (`menuitemradio` with `aria-checked` and a check column); `label` names the menu and `autofocus` focuses the checked row on mount.
- `GlassPopover`'s panel no longer carries `role="menu"`, which nested a second menu around a `GlassMenu`; the content declares its role. It takes `surface="solid"` for an opaque menu surface, opens on ArrowDown or ArrowUp from the trigger, closes when focus moves to an element outside it, returns through the trigger on Shift+Tab, and passes the panel `id` to the trigger for `aria-controls`. The React adapter takes `className`.
- The visual references that show the footer or the preferences sheet need recording again.
- `latere-ui/telemetry` starts browser telemetry with one call, `startTelemetry({ service: '<product>-web' })`, from any framework or none. It records page loads, `fetch` and `XMLHttpRequest` calls, and the Core Web Vitals (LCP, INP, CLS, FCP, TTFB, as `browser.web_vital` spans), and sends them as OTLP traces to the same-origin relay a backend mounts with `otel.TelemetryProxy` from `latere.ai/x/pkg/otel`, at `/v1/telemetry` unless `endpoint` says otherwise. The OpenTelemetry SDK is loaded as a separate chunk after the page's `load` event, so it never delays first render; `sampleRatio` decides per page load, before anything is downloaded. No cookies or identifiers are recorded, and query strings and fragments are removed from every recorded URL. The OpenTelemetry packages and `web-vitals` are dependencies of `latere-ui`: an application that carries its own copy of this setup can delete it and drop its `@opentelemetry/*` and `zone.js` dependencies. Hosts that never import `latere-ui/telemetry` bundle none of it.
- `GlassAlert` is redrawn: a leading icon in the tone's color (info, check, triangle, cross), the title and the body on one left edge beside it, a full hairline frame mixed toward the tone and a faint wash of it. The heavy left edge is gone. The markup gains `.lu-alert-icon` before `.lu-alert-body` and a `data-tone` attribute; the props are unchanged. The visual references that show an alert need recording again.
- One control scale: `--lu-control-height` (32px) and `--lu-control-height-sm` (28px) size every button, icon button, field and select, and `--lu-control-radius` rounds them, so a field and the button beside it share a baseline and a corner. Without the tokens each control keeps its current size and shape.
- `GlassButton` takes `variant="danger-ghost"`: a destructive action set as text among other actions, such as in a toolbar. Keep the filled `danger` for the confirming button of a dialog.
- A nav item takes `audience: 'admin'` for a row only people with an admin role are shown. Its icon takes `--lu-audience-admin` and, in the expanded rail, a small chip after the label names the audience (`audienceLabel`, "Admin" by default; left off a row whose label already says it). The collapsed tooltip names it too.
- `bottomGroups="foot"` sets the groups pinned to the bottom in the sidebar's foot, together with the foot rows and above the account control, so they stay in view while the nav scrolls. The arrow keys move through them as through the nav. The default, `"nav"`, keeps them at the end of the nav.
- `AccountMenu` takes `subline="role"`: the role as a small sentence-case badge in the interface face, "Platform admin", then the account in quiet text. With `subline="text"` or `"role"` the dropdown's header states the role and the account in the same case instead of the uppercase badge.
- Console icons add `info`, `check-circle`, `alert-triangle`, `x-circle` and `more`; a host draws them from `CONSOLE_ICONS` or `consoleIcon`. `identityParts` returns the role and the account the role subline states.
- A link in the documentation body carries a constant underline, a 1px line offset 0.22em in a softened tone of the link color (`--lu-link-underline-thickness`, `--lu-link-underline-offset`, `--lu-link-underline-color`), instead of gaining one on hover.
- The console sidebar holds sub-pages. Give a nav item `children` and it becomes an expandable row, folded until the viewer opens it or one of its pages is current, and the rail remembers the viewer's choice. Enter and Space open and close a row and the arrow keys move between rows. In the collapsed rail a parent links to its page and stays highlighted while any page under it is open.
- Nav items show a built-in stroke icon when `icon` names one (home, key, card, folder, cube, globe, sparkles, bot, branch, repo, org, shield, book, coins, terminal, plus, search, chevron, external). A row without an icon no longer leaves an empty space before its label.
- `compact` puts the sidebar's brand, name and fold button in one row and folds the head into a single logo button. `footItems` adds rows such as Documentation and a balance above the account control. With `compact`, the account card's corner follows the window's corner (`--radius-window`, 26px, minus the rail's `--lu-cs-inset`).
- The command palette takes host `items` (actions and other destinations) and a `search` function for extra results, lists sub-pages, and shows row icons.
- `AccountMenu` takes `subline="text"` for one quiet line under the name, such as "Platform admin · Personal", in place of the uppercase role badge.
- Export `PlatformLogoMark` for Vue and React: the platform's Latere symbol above two stacked layers, sharing one geometry definition.
- Separate footer navigation into Applications, Research, and Platform in Vue and React, including compact layouts. Link the unified platform console and ReplicHAI, and remove the separate capability entries from the footer.

## v1.29.0 - 2026-09-20

- Drive left the product lineup. The console shut down on 2026-09-19 and durable storage is now the platform's Storage section, so the product switcher and both footer variants no longer offer it, and `drive` is gone from the exported `ProductSlug` union. The `.drive-brand` wordmark class stays in `brand.css` and `footer.css`: the Storage section keeps the gold as its accent.
- The footer links an Open source page at `/open-source`, in the company column and in the compact row, translated in English, Chinese and German. It resolves against `baseUrl` and routes through `routerLink` like the other site links.
- The shared `Principal` no longer carries `is_superadmin`. Read platform administration from the role instead: `principal.role === 'platform_admin'`. An application whose backend still sends the flag maps it into `role` in its `mapMe`, or declares the wire field on its own type.
- Add keyboard-accessible toast dismiss buttons and restore popover trigger focus after keyboard dismissal. Match React modal and toast transition lifecycles with Vue.
- Keep visual-reference button states grouped, show the selected organization in a styled headless example, preserve toast caption readability, and label inactive matte effects explicitly.
- Complete the React visual component set: add surfaces, icon buttons, switches, radios, tabs, progress/skeleton feedback, tooltips, menus, popovers, drawers, toast/confirm hosts, command palette, documentation layout, preferences, product switching and organization selection. Restore the sidebar's optional product switcher.
- Share toast/confirmation services and component styles across Vue and React. React controls use values and callbacks; `GlassRadio` uses `value` for the group selection and `optionValue` for each option.
- Extend the visual matrix to every component in both adapters, all four appearances, light/dark and desktop/mobile. Require exact decoded RGBA equality between adapters and against platform goldens, with no channel or antialiasing tolerance; recording cannot bypass adapter parity.
- Preserve organization owner-label spacing and handle text shaping in React account menus, and retain enhanced article content and heading anchors during React TOC updates.

- Add opt-in Replichai, Wallfacer and Origo component appearances with distinct typography, density, matte materials and interaction states, plus dedicated light/dark and responsive golden figures.
- Integrate the console rail with its window edge, remove the detached sidebar rim and use a flat selected-row fill, following the supplied macOS 27 reference.

- Compact footer links wrap without clipped labels or underlined separators; desktop preferences share a compact height and preserve touch targets.
- Sibling panels, toolbars and tables share a radius; nested toolbar controls derive smaller corners from the inset.
- Product-neutral shell examples and default brand typography; explicit guidance for Replichai, Wallfacer and Origo styling.

- Compact design defaults: smaller panel/control corners, tighter insets and tables, a 224px sidebar, system UI shell typography, and softer glass edges/shadows.
- Docs layout adapts to its available container width and removes the unused TOC track. Its root now includes `.lu-docs-frame`; update direct-child CSS selectors if needed.
- Populated workspace references at laptop, desktop and mobile sizes, rendered at 300 DPI. Pointer-aware controls retain touch target size.

- Refined smoke rims and backed thick overlays with an opaque reading surface;
  reduced transparency now also makes smoke opaque when contrast is increased.
- Improved control boundaries, selected states, hints and product wordmarks;
  stabilized loading buttons, switches and radios, and fixed long-label layout.
- Corrected dialog, drawer, alert and error spacing; gave mobile footer navigation
  its own row and removed empty collapsed-sidebar dividers.
- Added a per-figure design review checklist alongside the visual references.

- Rendered visual reference figures at 3.125× resolution with 300 DPI metadata
  for sharper enlarged and printed views.

- Balanced table corner radii and cell spacing, removed the nested header outline,
  and kept the glass header attached to its labels while scrolling.

- Added an interactive Vue/React component gallery, reviewed visual reference
  images, and browser screenshot comparisons for both themes and mobile layouts.
- Added a visual design guide and composition diagram; moved detailed usage
  examples into the integration guide.
- Fixed low-contrast smoke surfaces, status badges and dark tooltips, and fields
  that overflowed their containers without a global CSS reset.
- Fixed empty/disabled select keyboard handling, long-list scrolling, nested
  dialog focus and dismissal, and command-palette focus restoration.
- Kept account menus attached to their triggers and scrollable, prevented their
  buttons from submitting forms, and contained product menus, popovers and long
  notifications on narrow screens.
- Refreshed glass refraction and sheen on rescans and honored changing reduced
  motion/transparency preferences.

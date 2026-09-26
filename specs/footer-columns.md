---
title: Footer columns, native preference menus, and the platform ink mark
status: complete
depends_on:
  - specs/footer-navigation-groups.md
  - specs/react-site-footer-v1.28.md
affects:
  - src/components/SiteFooter.vue
  - src/react/SiteFooter.tsx
  - src/components/footerNavigation.ts
  - src/components/preferenceMenus.ts
  - src/components/ThemeMenu.vue
  - src/components/LocaleMenu.vue
  - src/react/ThemeMenu.tsx
  - src/react/LocaleMenu.tsx
  - src/components/GlassMenu.vue
  - src/react/GlassMenu.tsx
  - src/components/GlassPopover.vue
  - src/react/GlassPopover.tsx
  - src/i18n/footer.ts
  - src/styles/footer.css
  - src/styles/brand.css
  - src/styles/presets.css
  - src/styles/components/glass-menu.css
  - src/styles/components/glass-popover.css
  - src/styles/components/preference-menu.css
  - tests
effort: large
created: 2026-09-25
updated: 2026-09-26
author: changkun
dispatched_task_id: null
---

# Footer columns, native preference menus, and the platform ink mark

## Overview

The full footer read as one dense line: bold grey group labels, product names
as italic serif gradient wordmarks, plain links after them, and below that a
bordered three-way theme pill beside a bordered language select whose menu is
the browser's own popup. Three problems follow from it. The footer is too
compact to scan, the platform's violet has no reason to be violet, and the two
preference controls look like form fields rather than the quiet controls a
site footer carries.

This spec gives the full footer a lead block and link columns with generous
spacing, replaces the two controls with icon buttons that open native-feeling
menus, and draws the platform's mark in ink.

## Layout

Desktop, above 1024px, is a two-part grid inside the 1200px container:

- **Lead**, on the left: the host's lockup, a row of social glyphs, a 32px
  hairline, then the theme and language menu buttons. The lockup defaults to
  the Latere AI mark and wordmark; a host replaces it through the Vue `#brand`
  slot or the React `brand` prop, so platform.latere.ai shows its own
  Latere | Platform lockup.
- **Columns**, on the right: four columns of groups. Each group is a heading
  in the semibold weight and the full text tone, over plain links in the body
  face set 32px apart (20px line, 12px gap). The links sit at 82% of the text
  tone, so the heading reads apart from them by weight and by tone. A second
  group in a column sits 40px below the first.
- **Copyright**, closing the footer 72px below the tallest block, in the small
  muted tone.

The footer opens with 96px of space above its content. Between 641px and
1024px the lead takes its own row above the four columns. At 640px and below
the columns go two up, the lead follows them, then the copyright, with 56px
above and a 16px gutter. No width overflows horizontally.

The groups come from the shared model in `footerNavigation.ts`:

| Column | Groups |
| --- | --- |
| 1 | Applications (Wallfacer, Lectio), then Research (ReplicHAI) |
| 2 | Platform (Latere Platform, Identity) |
| 3 | Company (About, Why Latere, Blog, Open Source, Contact) |
| 4 | Legal (Privacy, Terms, Impressum) |

Identity moves into Platform: one sign-in across the products is part of the
ground the platform provides. The Community column is gone; the social glyphs
in the lead carry the same four profiles. The tagline is no longer drawn; its
dictionary key stays, so host overrides keep compiling. Company links resolve
against `baseUrl`, or through `routerLink` with a relative `to`, as before.

Each group is `role="group"` named by its heading, the columns are one `nav`
named "Footer", and headings are `h2` without ids, so no table of contents
that scans the article picks them up.

The compact layout keeps its single wrapped strip. Its Platform group now
holds Identity as well, which leaves the rendered order unchanged, and its
controls become the same two menu buttons, opening upward from the right.

## Product identity in the columns

In the columns a product name is a plain link in the body face and color, like
every other link, so the columns read as one even list. The product's gradient
appears only under the pointer or keyboard focus, clipped to the text.

The alternative, a small gradient mark before each product name, keeps the
identity visible at rest but gives product rows a leading glyph their
neighbors lack: in the Platform column, Latere Platform would carry a mark and
Identity would not, and the column's left edge would split. The hover gradient
keeps a single left edge, needs no new artwork per product, and turns the
footer's existing hover feedback, a color change, into the product's own color
at the moment the reader points at it. The compact strip keeps its italic
wordmarks unchanged.

## The platform's color

The platform is the ground every product stands on, so its mark is the ink
itself: a monochrome gradient from near-black to graphite in the light theme
(`#0a0a0a`, `#262626`, `#4a4a4a`) and from off-white to silver in the dark
theme (`#fafafa`, `#d8d8d8`, `#a8a8a8`). Each product keeps its hue. Every stop
reaches 4.5:1 on the page background in its theme.

The gradients are tokens, `--lu-brand-<product>`, stated for light and dark in
both `brand.css` and `footer.css` (the footer sheet stays a single resolvable
file), and `.platform-brand` joins the gradient wordmark classes. Where the
Platform wordmark appears:

- the compact footer strip and the full footer's Latere Platform hover, in this
  package;
- latere.ai's header and account menu, which set `.platform-brand` inside
  their own copy. The header's `color: var(--text)` override no longer applies
  under the transparent text fill, and the ink gradient reads as the text color
  it asked for;
- the platform frontend, which draws its lockup in plain text and does not use
  the class.

Identity's key glyph in the product switcher keeps its violet: it is
Identity's own icon, not the platform's mark.

## Preference menus

`ThemeMenu` and `LocaleMenu` are exported from both entrypoints. The footer
uses them; a host header places the same controls.

- **Trigger**: a 32px square icon button on the control corner
  (`--lu-control-height`, `--lu-control-radius`), with no border, the icon in
  the secondary tone, and a fill on hover and while its menu is open. The theme
  trigger shows the current preference: a sun, a moon, or a monitor for System.
  The language trigger shows a globe. On coarse pointers both grow to 44px.
  The accessible name states the menu and the current value, "Theme: System"
  or "Language: English"; the title names the menu.
- **Menu**: an opaque surface (`--lu-menu-bg`, falling back to `--bg-surface`)
  with a hairline edge (`--border-strong`) and the menu shadow (`--shadow-menu`),
  no glass layer. Rows are 32px on the control corner; the panel's corner is
  the row corner plus its 6px padding, so the two stay concentric whatever the
  host's radius ladder. A 16px check column leads every row, so every label
  starts at the same x, and the check marks the current choice. Languages are
  named in their own language.
- **Keys and focus**: the trigger is `aria-haspopup="menu"` with
  `aria-expanded` and, while open, `aria-controls` naming the panel. Enter,
  Space, ArrowDown or ArrowUp open the menu and focus the checked row. The
  arrows move between rows and wrap, skipping disabled ones; Home and End jump
  to the ends. Enter or Space choose. Escape closes and returns focus to the
  trigger, as does a choice; Shift+Tab returns through the trigger; Tab moves
  on to the next control and the menu closes. The mouse moves focus with it, so
  the highlighted row and the keyboard position are one row.
- **Roles**: the menu is `role="menu"` named by its label, and each row is
  `role="menuitemradio"` with `aria-checked`, the same pattern as the platform
  header's language menu, so two menus on one page behave alike.

The footer's menus open upward, since the footer sits at the end of a page or
a scroll container; a header's open downward.

### Fixes to the primitives

The menus are compositions of `GlassPopover` and `GlassMenu`; nothing is
forked. The primitives gain what the menus need, and each gain is a correction
the existing components needed anyway:

- `GlassMenu` now follows the menu pattern: one row in the tab order, arrow,
  Home and End keys, and focus that follows the mouse. An item with `checked`
  turns the list into a choice menu (`menuitemradio`, `aria-checked`, check
  column, 32px rows). `label` names the menu; `autofocus` focuses the checked
  or first row on mount.
- `GlassPopover` no longer puts `role="menu"` on its panel. Wrapping a
  `GlassMenu`, it announced a menu holding a second, empty menu. The content
  declares its own role. The popover gains `surface: 'glass' | 'solid'`
  (glass by default), ArrowDown and ArrowUp opening from the trigger, closing
  when focus moves to another element outside it, Shift+Tab returning through
  the trigger, and the panel id in the trigger's scope for `aria-controls`.
  The React adapter takes `className` on its root, as a Vue host's class falls
  through.

### Shared preference state

The footer, a header menu, and `AccountPrefs` are presentational. Each takes
the current value and reports a choice; the host keeps one preference, so all
three stay in step. The visual reference's preferences sheet binds
`AccountPrefs` and both menus to one theme and one locale.

## Presets

The Replichai, Wallfacer and Origo appearances drop their rules for the
retired segmented control and select. The menu triggers and rows take each
appearance's `--radius-sm`, and the popover's preset overlay shadow applies to
the solid surface as well.

## Acceptance

- Both adapters render the same markup for both layouts; the paired Vue/React
  capture of every appearance, theme and width stays pixel-equal.
- The columns hold five groups in four columns with the destinations above, in
  English, Chinese and German, with host message overrides applied.
- The lead holds the lockup, the social row, the hairline and the two menus in
  that order; a host lockup replaces the default.
- Product links rest plain and take their gradient under the pointer and focus;
  every gradient stop reaches 4.5:1.
- Menus: the ARIA, keys, focus return and choice reporting above, in both
  adapters, including translated labels.
- At 320, 390, 768 and 1280px the layout follows the breakpoints above without
  horizontal overflow; triggers are 32px (44px on touch) with centered 16px
  glyphs.

## Verification

Unit tests cover the choice menu, the popover's surface, keys and focus, both
preference menus, both footer layouts and the brand tokens, in both adapters.
Browser checks cover the columns, breakpoints, link spacing, hover gradients,
contrast, the solid menu surface, row and panel geometry, touch targets, link
decoration and the popover's arrow keys, for every appearance and theme.

## Outcome

Implemented as specified in both adapters. Type checking and the unit suite
pass. Locally, on a platform without committed references, every browser check
that does not compare against a reference passes, and the paired Vue/React
capture is pixel-equal for every sheet, appearance, theme and width, the
footer, compact footer and preferences sheets included. The committed
references of the footer, compact footer and preferences sheets predate the
redesign; they need recording again through the visual workflow's
`record_goldens` input, and a review, before the visual check passes on the
recorded platforms.

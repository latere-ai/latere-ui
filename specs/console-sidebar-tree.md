---
title: Console sidebar tree, compact head and foot rows
status: complete
depends_on:
  - specs/integrated-sidebar.md
  - specs/react-shell-parity.md
affects:
  - src/console/nav.ts
  - src/console/openState.ts
  - src/console/navKeys.ts
  - src/console/icons.ts
  - src/console/palette.ts
  - src/components/ConsoleSidebar.vue
  - src/react/ConsoleSidebar.tsx
  - src/components/ConsolePalette.vue
  - src/react/ConsolePalette.tsx
  - src/components/AccountMenu.vue
  - src/react/AccountMenu.tsx
  - src/styles/console.css
  - src/styles/tokens.css
effort: medium
created: 2026-09-24
updated: 2026-09-25
author: changkun
dispatched_task_id: null
---

# Console sidebar tree, compact head and foot rows

## Purpose

A console whose sections have several screens each shows those screens as a
strip of tabs on the page, which spends the top of every page on navigation
the rail could hold. The rail also leaves an empty icon slot before every
label when the host draws no icons, and its brand block is taller than a row.
This spec moves section navigation into the rail as a tree, gives the rail
its own stroke icons, a one-row head, foot rows for documentation and a
balance, and an account line that states the role in plain words.

## Behavior

- `NavItem.children` makes a row a parent. Expanded, the parent is a
  disclosure button (`aria-expanded`, `aria-controls` naming a `role="group"`
  that stays in the DOM, `hidden` while folded) over child rows indented to
  the parent's label. Children render one level deep.
- A parent is folded until the viewer opens it or a page under it becomes
  active. Arriving at a page opens every parent above it. The viewer's
  choices persist in localStorage under `openKey`
  (`latere-ui:console-nav-open` by default, `null` for none); unreadable or
  blocked storage leaves the rail working without memory.
- A parent on the active path carries `data-path="true"`: its label takes
  the text color, and while folded it takes the selected fill so the
  location stays visible.
- Keys: Enter and Space toggle a parent (native button). Up and Down move
  between visible rows, Home and End to the ends, Right opens a parent or
  enters its first child, Left folds a parent or returns to it from a child.
- Collapsed rail: a parent is a link to its own `to`, or to its first enabled
  child's, and carries `data-active="true"` while any page under it is open.
  A flyout was the alternative. It was not taken: it needs an overlay whose
  position, focus and dismissal must match pixel for pixel in both adapters,
  and every child stays one step away through the expanded rail or the
  palette.
- Icons: a row's `icon` naming a built-in stroke icon (Lucide shapes, ISC)
  renders at 16px in `currentColor`. A host `renderIcon` or `#icon` slot
  still wins. A row with no icon renders no slot, so its label starts at the
  row padding; the collapsed rail keeps the first-letter fallback for a row
  without an icon.
- `compact`: the head is one row as tall as a nav row. Collapsed, it is one
  square button showing the logo, which turns into the expand glyph on hover
  or focus. Collapsed rows, search and fold are 36px squares centered on
  their icon with the expanded row's corner.
- `footItems`: rows above the `foot` slot, each a link or action with an
  icon and an optional right-aligned `value`. Collapsed, they are icons
  whose `title` carries label and value.
- Window-concentric account card: with `compact`, the rail keeps one inset
  `--lu-cs-inset` (12px) from the window's left and bottom edges, and the
  account trigger's radius is `--radius-window` minus that inset
  (`--lu-cs-account-radius`, 26px − 12px = 14px). `--radius-window` is 26px:
  macOS 26 draws windows with a toolbar, Safari's included, at 26pt, and a
  2x capture of such a window's bottom-left corner measures about 52 device
  pixels.
- `ConsolePalette` lists child rows (their parent as the group), then host
  `items` (destinations and actions, matched by label, group and
  `keywords`), and on a query appends the host `search` results. Rows with a
  built-in icon show it.
- `AccountMenu subline="text"` replaces the uppercase badge line with one
  quiet line, the role then the account: "Platform admin · Personal",
  "Admin · Design studio". `labels.roleNames` localizes the role names.

## Compatibility

Every addition is optional. A model without children, a sidebar without
`compact` or `footItems`, a palette with only `model` and an account menu
without `subline` render as before, except that a row whose `icon` names a
built-in icon now shows it, and an expanded row without an icon no longer
reserves the 18px slot.

## Verification

- Unit tests for the model helpers, storage, icons, palette matching and
  identity line, and for both adapters: disclosure, persistence, keys,
  collapsed links, compact head, foot rows, palette entries, text subline.
- `tests/visual/sidebar-tree.spec.ts` compares Vue with React pixel for pixel
  for the tree, the folded rail and the palette in both themes, and drives
  Enter, Space and the arrow keys in a real browser.
- The sidebar, palette and workspace goldens change: the empty icon slot is
  gone and the parity fixture's Overview row now shows its home icon. They
  are re-recorded on macOS 15 (CI) and macOS 27.

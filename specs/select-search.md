---
title: GlassSelect type-to-search
status: complete
depends_on: []
affects:
  - src/glass/selectSearch.ts (new)
  - src/components/GlassSelect.vue
  - src/react/GlassSelect.tsx
  - src/styles/components/glass-select.css
  - src/styles/presets.css (Origo menu heights and search inset)
  - src/glass/focusTrap.ts (Escape owned by an open control)
  - src/index.ts, src/react/index.ts (SELECT_SEARCH_THRESHOLD)
  - tests/select-search.test.ts, tests/glass-select-search.test.ts, src/react/__tests__/glass-select-search.test.tsx (new)
  - tests/visual (filtered references, browser checks, parity data values)
  - docs/api-guide.md, CHANGELOG.md
effort: small
trigger: console dropdowns such as time zones, repositories and branches hold dozens to hundreds of choices and can only be scrolled; every dropdown should be searchable by typing, without each host adding its own filter
created: 2026-10-01
---

# GlassSelect type-to-search

## Behavior

- A select with more than `SELECT_SEARCH_THRESHOLD` (8) options shows a search
  field at the top of its menu. `searchable` overrides the count either way.
  Eight or fewer choices are read faster than typed: such a menu scrolls by
  one row at most, and a field would only add a step.
- Opening the menu moves focus into the field. A printed character typed on a
  focused, closed trigger opens the menu with that character in the field.
  Space opens without typing, as on a native select. Keys with Ctrl, Meta or
  Alt are left to the host.
- The query, trimmed, matches a case-insensitive substring of the label or of
  the value. Matching the value finds options whose stored form differs from
  the label, such as `America/New_York` shown as "America/New York".
  Matches in the label are wrapped in `mark.lu-select-match`; a highlighted
  row carries `aria-label` with the whole label, so its accessible name is
  the label in every DOM, including test DOMs that space inline elements.
- A non-empty query makes the first enabled match active, so Enter takes it.
  An empty query returns to the chosen value. Arrows wrap through the visible
  enabled options; Enter chooses; Escape clears a non-empty query, then
  closes and returns focus to the trigger. Focus leaving the control (Tab, a
  click elsewhere) closes the menu without choosing.
- Nothing matching shows one line, `noMatchLabel` ("No matches"), as a
  status.

## Shared logic

`src/glass/selectSearch.ts` holds everything the adapters must agree on:
the threshold, filtering, label runs, stepping over a visible subset,
type-to-search keys, and the horizontal shift that keeps the menu inside the
viewport. Indices are positions in the full `options` array, so option ids,
the active option and `aria-activedescendant` stay stable while filtering.

## Markup and styling constraints

- `.lu-select-list` stays the menu panel. Hosts restyle it (the platform's
  ink design sets its padding, border, background and shadow), so the
  listbox moved to an inner `ul.lu-select-options` and the field sits above
  it inside the panel.
- Without a field the panel is still the scroller with its padding inside the
  scrolled area, and it sets no `overflow-x` or `overscroll-behavior`: either
  one moved the rasterized menu by a device pixel against the previous
  references. A plain menu renders pixel-identical to v1.31.0.
- With a field the panel is a flex column; only the list scrolls, capped at
  seven rows (`max-height: 224px`, 196px in Origo).
- The panel is `border-box`, `min-width: 100%` and `width: max-content`,
  capped at `--lu-select-menu-max-width` (400px) and the viewport less 32px,
  never below the trigger. Options are one line with an ellipsis and a
  `title`. While open, the adapters hold the widest measured width as an
  inline `min-width`, so the menu does not narrow as the query hides long
  labels, and shift it left when it would cross the viewport's 16px gutter.
- The field is the menu's header row, as in the command palette: edge to edge
  over a hairline, its text inset aligned with the rows.

## Accessibility

The trigger keeps `role="combobox"` and its accessible name, so hosts that
query it by name are unaffected. The field is a second combobox
(`aria-autocomplete="list"`, `aria-controls` on the listbox,
`aria-activedescendant` on the active option) named by `searchPlaceholder`
("Search"), never by the trigger's name, so a name query still finds exactly
one control. The trigger carries `aria-activedescendant` only while it holds
focus, which is when there is no field. The listbox has `tabindex="-1"`:
Chromium makes a scrolling element keyboard-focusable, and Tab from the field
must leave the control rather than land on the list.

## Escape inside dialogs

The focus trap of `GlassModal` and `GlassDrawer` handles Escape on the
document in the capture phase, before the select sees it, which closed the
dialog and discarded its draft. An open select marks its root
`data-lu-owns-escape`; the trap returns early for a key whose target is
inside such an element, and the select stops the event after handling it.

## Outcome

Shipped in v1.32.0. Unit tests cover the shared logic and both adapters
(threshold and prop, filtering, the keyboard path, typing to open, no match,
pointer choice, focus leaving, width hold and viewport shift, Escape inside a
modal). Browser checks cover typing to open, Escape then Tab, and a menu wider
than a trigger at the viewport's edge. The macOS 15 references of the select
sheet and the new filtered references were recorded on the hosted runner; the
macOS 27 documentation figures were not re-recorded.

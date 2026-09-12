# Changelog

Every tag has a section here, and the section is the body of the GitHub
release. A tag without one fails the release workflow. Write under
`Unreleased` as work lands; before tagging, turn that into
`## vX.Y.Z - YYYY-MM-DD` in the same commit the tag points at.

A section says what changed for whoever uses the release, not what was
committed: the commit log already holds that.

## Unreleased

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

# Changelog

Every tag has a section here, and the section is the body of the GitHub
release. A tag without one fails the release workflow. Write under
`Unreleased` as work lands; before tagging, turn that into
`## vX.Y.Z - YYYY-MM-DD` in the same commit the tag points at.

A section says what changed for whoever uses the release, not what was
committed: the commit log already holds that.

## Unreleased

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

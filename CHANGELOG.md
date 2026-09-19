# Changelog

Every tag has a section here, and the section is the body of the GitHub
release. A tag without one fails the release workflow. Write under
`Unreleased` as work lands; before tagging, turn that into
`## vX.Y.Z - YYYY-MM-DD` in the same commit the tag points at.

A section says what changed for whoever uses the release, not what was
committed: the commit log already holds that.

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

# UI and CSS review

The September 2026 review examined the Vue component library, React adapters,
shared styles, console and documentation layouts, and Liquid Glass runtime.
The resulting [reference index](visual-reference.md) links the real browser
renders used by the regression suite.

## Corrected defects

| Area | What was wrong | Verification |
|---|---|---|
| Smoke surfaces | Surface foreground overrode inverse ink, producing dark-on-dark or light-on-light labels. | Browser computed-color checks in both adapters and themes. |
| Fields | Padding and borders added 30px beyond the container without a host box-sizing reset. | Browser bounding-box assertions for inputs and textareas. |
| Selects | Empty options crashed on Enter; disabled choices received keyboard selection; long lists hid the active option. | Vue/React regressions plus real keyboard and scrolling tests. |
| Dialogs | Escape closed multiple stacked dialogs; focus could escape or restore to the wrong overlay. | Shared focus ownership, unit regressions and nested-dialog browser tests. |
| Command palette | Initial focus and focus restoration were missing; keyboard selection could leave the scroll viewport. | Focus, filtering and long-list browser checks. |
| Account menu | Buttons submitted enclosing forms, long dropdowns could hide sign-out, and the dropdown could detach horizontally from the trigger. | Form regressions, scroll tests and browser alignment checks. |
| Product switcher | Neither flipped placement fit some narrow screens; an open panel did not follow viewport changes. | Bounds at 390, 320 and 240px, resize and short-screen scrolling. |
| Toasts | Long unbroken text escaped narrow viewports. | Text and panel bounds at 320 and 240px. |
| Popovers | `matchWidth` imposed only a minimum width; content could enlarge the panel. | Exact trigger/panel width and overflow checks at 240 and 120px. |
| Glass runtime | Refraction retained old theme/size filters; reduced preferences could leave effects active; rescans missed the root surface. | Runtime regressions and browser theme/resize/preference tests. |
| Sheen | A visible highlight retained its light-theme intensity after switching themes. | Runtime and browser rescan tests. |
| Badges | Semantic fills borrowed smoke ink even though their colors did not invert with the theme; several default labels had insufficient contrast. | All six tones, glass/solid variants, both themes and adapters meet 4.5:1 on the fixture canvas. |
| Tooltips | Dark labels used a nearly transparent light fill, yielding about 1.23:1 contrast; reduced transparency left blur active. | Alpha-composited contrast, opaque fallback and computed-filter browser tests. |

Every listed bug has a reproducible regression that failed before its fix.
Expected screenshots are captured after the fixes and reviewed visually.

## What the references cover

The manifest accounts for every exported Vue and React UI component. Reference
sheets include light/dark themes, control variants, form states, both drawer
sides, popover placements, nested dialogs, expanded/collapsed navigation,
footer variants, and representative mobile layouts. Additional images cover
hover, keyboard focus, palette filtering/scrolling, refraction, sheen, reduced
motion, reduced transparency, and increased contrast.

The [design skeleton](figures/design-skeleton.svg) explains how tokens,
materials, components and application chrome fit together. It is a conceptual
composition diagram. Component PNGs are actual renders, not illustrations.

## Practical limits

- The goldens target pinned Chromium on macOS 15 and 27, with separate OS-version directories. They are not a claim of
  pixel parity across operating systems, Firefox, or Safari.
- Images cover named states, not every prop combination, viewport, translation,
  or application-supplied content. Custom palettes still need contrast checks.
- `OrgSwitcher` is intentionally headless; its reference shows the unstyled
  adapter. Hosts own its presentation.
- Generic popover and tooltip placement is caller-selected. The product
  switcher has viewport collision handling; the generic primitives do not
  promise automatic flipping.
- Runtime rescans refresh theme and size changes. Call `initLiquidGlass()` after
  these changes, or wire Vue's `watchSource`; the Vue composable also watches
  reduced-motion and reduced-transparency preferences.
- Browser behavior tests verify keyboard/focus/scrolling and effect updates;
  still images alone cannot establish those behaviors or full accessibility.

## Recheck a change

Run `bun run test:coverage`, `bun run typecheck`, and `bun run test:visual`.
Inspect differences before using the explicit baseline-update command. The
[contributor guide](../CONTRIBUTING.md) explains the reference platform and
review workflow.

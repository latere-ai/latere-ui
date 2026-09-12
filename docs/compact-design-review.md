# Compact template review

The September 2026 compact revision reduces wasted space while keeping text readable and touch controls usable. See the [design guide](design-system.md) for defaults and the [figure index](visual-reference.md) for individual references.

![Compact workspace on a laptop](../tests/visual/goldens/darwin-27/workspace-light-laptop.png)

## Corrections

| Observed problem | Correction | Reproducible browser check |
|---|---|---|
| Large corners and insets consumed laptop space | 14px panels, 8px fields/navigation, 16px panel padding, compact table cells and a 224px sidebar | `compact-design.spec.ts` |
| Docs used viewport breakpoints inside narrower containers and reserved an absent TOC column | Container queries and removal of the unused grid track | `compact-design.spec.ts` |
| Shrinking desktop controls could reduce touch usability | Coarse-pointer buttons and fields retain 44px targets | `compact-design.spec.ts` |
| Light glass buttons lacked a clear edge; pressed icons were difficult to distinguish | Neutral borders and a separate pressed fill | `compact-affordances.spec.ts` |
| Selected options were faint and the eighth row peeked through the popup's bottom edge | Selected-row outline and a seven-row opening height | `compact-affordances.spec.ts` |
| A populated laptop example overflowed after adding a project; mobile navigation did not expand from its brand control | Tighter workspace composition and enabled brand expansion | `workspace.spec.ts` |
| Nested primary-action blur produced unstable text/edge rasterization in full-page mobile captures | Glass toolbars supply the backdrop blur once; their primary actions keep the smoke fill without another blur layer | `workspace.spec.ts`, eight repeated mounts |

The new geometry/layout checks failed before implementation. The four button/select checks also failed before their corrections and passed afterward. Golden updates follow visual inspection; passing image comparison alone does not establish good design.

## Inspection coverage

Each of the 160 figures on macOS 27 and macOS 15 was opened individually: 320 reviewed PNGs, including light/dark and supported mobile states. Counts below are per platform:

| Group | Figures | Review focus |
|---|---:|---|
| Controls, forms, selects, feedback and preferences | 34 | Boundaries, pressed/selected states, labels, complete scroll rows and focus rings |
| Containers, effects, popovers, tooltips, toasts, confirms and drawers | 42 | Material hierarchy, restrained rims, content insets and overlay fit |
| Modals, palettes, accounts, product/organization identity and logos | 42 | Nested surfaces, wrapping, selection and scrolling |
| Navigation, docs, footers and populated workspaces | 42 | Available width, reading flow, alignment and laptop/mobile density |

The button and select findings above were caught during this pass; their 14 affected figures were inspected again after correction. Headless organization controls intentionally retain host/native presentation. Mobile examples may scroll vertically; no horizontal page overflow is expected.

References render at 3.125× CSS size with 300 DPI metadata. Separate native macOS baselines preserve platform font rendering. The Apple macOS site informed material and geometry choices; the supplied Figma frame could not be inspected because its URL returned HTTP 403.

## Verification

The complete local comparison passed all 304 browser checks with zero differing pixels permitted. The [native macOS recording](https://github.com/latere-ai/latere-ui/actions/runs/34700953601) passed the same 304 checks; its final changed images were inspected before acceptance. Type checking and all 446 unit tests passed, with 92.74% line coverage. Every PNG passed chunk-integrity and 300 DPI metadata checks, and both platforms contain the same 160 named states.

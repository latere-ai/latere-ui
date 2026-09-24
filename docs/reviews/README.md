# Visual review records

For contributors. Each record documents one review of the committed golden
figures: what was inspected, which defects were found, how each was
corrected, and which browser check now guards it. A record describes the
components as they were at the time of the review. The current behavior is
in the [design guide](../design-system.md) and the
[integration guide](../api-guide.md), and the current figures are in the
[visual reference index](../visual-reference.md).

| Record | Scope |
|---|---|
| [UI and CSS review](visual-review.md) | The first review of the component library, React adapters, shared styles, and optical effects, with the defect categories it corrected |
| [Individual figure review at 300 DPI](visual-audit-300dpi.md) | A per-figure checklist from the first 300 DPI audit |
| [Compact template review](compact-design-review.md) | Spacing, control, and responsive-layout corrections of the compact revision |
| [Product appearance review](product-style-review.md) | The initial Replichai, Wallfacer, and Origo appearance rollout |
| [Complete component visual review](complete-visual-review.md) | The full matrix: every component in both adapters, all four appearances, both themes, desktop and mobile |

Add a record when a change regenerates a set of figures on purpose.
[Contributing](../../CONTRIBUTING.md#update-a-reference-deliberately) says
how to regenerate and inspect them.

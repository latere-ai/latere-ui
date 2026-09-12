# Product appearance review · September 2026

The shared components now support three optional matte appearances alongside default glass. The [design guide](design-system.md#keep-product-styling-explicit) explains installation, font ownership and intentional adaptations from each product. The [reference index](visual-reference.md#product-style-variations) links every rendered sheet.

## What changed

| Appearance | Component treatment |
|---|---|
| Replichai | Inter, warm matte surfaces, 18px cards, 8px fields, ink actions and blue hover |
| Wallfacer | Inter, compact 14px cards, 10px fields, ink actions and clay hover |
| Origo | IBM Plex Sans/Mono, flat 4px panels and fields, 3px actions, dense tables and iris controls |
| Default glass | Window-integrated sidebar with a flat selected row; outer window owns corner clipping |

The example content remains Workspace, projects and activity. Choosing an appearance does not add product branding. Fixed wordmarks, headless organization UI and glass-only optical effects keep their existing default references.

## Defects caught during review

Each correction has a browser regression that reproduced the problem before the fix:

- Matte menus retained backdrop blur; preset account, product and command overlays now remove it.
- Origo preferences, badges and code blocks retained rounded geometry or the wrong font; they now use the repository appearance.
- Origo inverse panels and tooltips became iris-colored; reading surfaces now stay neutral while primary actions and checked controls use iris.
- Expanded mobile navigation squeezed example content into a narrow column; its example now stacks at narrow widths.
- Expanded mobile React navigation hid account identity despite available space; names remain visible until the rail collapses.
- Dark loading placeholders nearly disappeared into the canvas; their surface contrast is now tested.
- The stacked mobile example stretched collapsed navigation to full width; the collapsed rail now remains 64px beside its content.
- The default sidebar had a detached rim and outlined selection; integrated geometry, flat selection, focus, clipping and collapse behavior now have explicit checks.

Tests also check primary hover and keyboard focus, selected controls, theme changes, root scope for teleported overlays, restoring default appearance, text contrast, and coarse-pointer targets.

## Reference coverage

Each appearance has 82 figures per platform: 78 component sheets across available Vue/React adapters, light/dark themes and selected mobile layouts, plus four focus/hover sheets. The default appearance retains 160 figures. Both platforms therefore contain 406 figures, rendered at 3.125× and carrying 300 DPI metadata.

Figures are reviewed individually. This review covers all new appearance sheets and changed default sheets; fixes receive a second visual review. These are pinned Chromium references for macOS 27 and the macOS 15 CI runner, not a claim of parity across all browser engines or every possible component composition.

## Verification

- Type checking and all 449 unit tests pass; source line coverage is 92.74%.
- The final local browser comparison passes all 623 tests without updating snapshots.
- The [final native recording](https://github.com/latere-ai/latere-ui/actions/runs/34716054272) passes the same 623 browser checks. Its 406 candidates were accepted only after individual inspection, including every difference from the first native recording.
- Both platform inventories match. All 812 PNGs pass chunk-checksum and 300 DPI metadata validation.
- Main CI compares committed references in normal mode; it never accepts new pixels automatically.

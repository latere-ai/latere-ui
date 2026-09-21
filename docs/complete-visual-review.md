# Complete component visual review

All 35 visual components now have Vue and React implementations. The same 25 component sheets cover default glass, Replichai, Wallfacer and Origo in light/dark themes at desktop/mobile widths. Use the [visual index](visual-reference.md) to inspect each composition, or run `bun run visual:dev` to try its controls.

## Coverage

| Scope | Per native platform |
|---|---:|
| Component sheets | 25 |
| Appearances | 4 |
| Theme and viewport combinations | 4 |
| Vue/React comparisons | 400 |
| Separate adapter figures | 800 |
| Additional interaction and accessibility figures | 52 |
| Total figures | 852 |

Desktop sheets use 1100px for default components and 1280px for documentation and matte appearances; mobile sheets use 390px. Additional workspace checks cover 1280px, 1470px and 2560px layouts. Captures use a 3.125 device scale and carry 300 DPI metadata: the pixels are rendered at that resolution, not enlarged afterward.

The references are native to macOS 27 (`darwin-27`) and macOS 15 (`darwin-24`). Pixel equality is required between adapters and against the matching platform's reference. Different operating systems keep separate references because their native font rendering can differ.

## Corrections verified during review

| Problem | Result | Reproduction and regression |
|---|---|---|
| Full footer inherited browser underlines while compact navigation removed them | Both layouts reset decoration on their anchors, including wordmarks and social links; navigation hover and keyboard focus remain visible. | [Link decoration across adapters, appearances, themes and widths](../tests/visual/link-decoration.spec.ts) |
| Full-footer theme and language controls had different heights | Both layouts share explicit outer heights, centered segments and matching corner insets, including larger touch targets. | [Preference geometry across layouts, adapters, appearances and input types](../tests/visual/preference-geometry.spec.ts) |
| Detached sidebar rim and outlined selection | The rail sits flush with its host; the window owns outer corner clipping and selection stays flat. | [Integrated sidebar](../tests/visual/sidebar-integrated.spec.ts) |
| Design skeleton retained the old detached rail | The scalable illustration now shows the same integrated geometry and flat selection. | [Documentation skeleton](../tests/visual/documentation-skeleton.spec.ts) |
| Button examples split variants from their disabled/loading states | Each variant keeps its three states together at both widths. | [Button layout](../tests/visual/button-sheet-layout.spec.ts) |
| Notification stacks covered the mobile figure heading | Figure captions and triggers sit below the measured stack. | [Toast layout](../tests/visual/toast-sheet-layout.spec.ts) |
| Notifications required pointer dismissal | Both adapters expose a named, keyboard-operable dismiss button. | [Toast dismissal](../tests/visual/toast-dismiss.spec.ts) |
| Headless organization examples resembled unfinished native controls | Documented host CSS supplies readable rows, focus and current selection. | [Organization layout](../tests/visual/organization-sheet-layout.spec.ts) |
| Matte figures claimed active optical effects | Captions identify intentional matte fallbacks; refraction and sheen remain inactive. | [Matte effects](../tests/visual/parity-matte-effects.spec.ts) |
| React project counts and button captions shaped text differently | Single interpolated text nodes give both adapters the same shaping input. | [Workspace count](../tests/visual/workspace-count-parity.spec.ts), [button captions](../tests/visual/button-sheet-layout.spec.ts) |
| React modal/toast transitions differed from Vue | Shared enter/leave lifecycles preserve animation, hit testing and interrupted transitions. | [Overlay interactions](../tests/visual/parity-overlays.spec.ts) |
| Closing a focused popover lost keyboard position | Escape and selection restore trigger focus; outside clicks retain their target. | [Overlay interactions](../tests/visual/parity-overlays.spec.ts) |
| Global screenshot animation overrides produced inconsistent SVG pixels | Capture waits for finite transitions, temporarily pauses loops at their first frame, then restores their state. | [Capture synchronization](../tests/visual/animation-capture.spec.ts) |
| A stalled Chromium screenshot consumed the entire test timeout | Each screenshot has a bounded timeout; recovery still requires two fresh exact captures within the original stability budget. | [Capture synchronization](../tests/visual/animation-capture.spec.ts) |
| Toast geometry checks measured rows during staggered entrances or residual transforms | Measurements wait for transition classes, actual finite animations and rendered frames to settle. | [Toast dismissal](../tests/visual/toast-dismiss.spec.ts) |
| Cold gallery startup reloaded an open Vue overlay when React first loaded | The JSX runtime is prebundled before either adapter opens. | [Cold startup](../tests/visual/vite-startup.spec.ts) |
| Golden tests retained a shared browser process after earlier captures | Each golden test owns and closes its browser; configuration and exact pixels are verified across fresh processes. | [Browser isolation](../tests/visual/browser-isolation.spec.ts), [workspace raster](../tests/visual/workspace-raster.spec.ts) |
| Native screenshot resizing could remove the pointer sheen | Optical figures sample the mouse handler at fixed coordinates and require the intended opacity and gradient throughout capture. Real pointer equivalence and exit remain tested. | [Interaction capture](../tests/visual/interaction-capture.spec.ts) |

The sidebar follows the integrated rail visible in [Apple's supplied Mail reference](https://www.apple.com/v/os/g/images/macos/improvements/search__gca3sckqsxym_large_2x.jpg). The [design guide](design-system.md) explains the shared geometry and the deliberate differences among the matte presets. Example workspace content is product neutral. Product identity artwork retains its brand shape; choosing a preset does not rename the workspace.

## Review method

Each new or changed composition is inspected individually for clipping, text alignment, corner treatment, spacing, contrast and state visibility. Native device-pixel crops resolve details that a reduced preview can conceal. An unchanged figure retains its earlier review only when its hash matches. A React counterpart inherits a reviewed Vue composition only after every decoded RGBA channel matches.

Each platform was reviewed separately: 400 paired compositions and 52 supplemental figures, covering all 1,704 committed PNGs across both platforms. Final file hashes were checked after inspection. Native macOS 15 pixels differed from the local macOS 27 figures, so none of its compositions inherited a local review. Button states, toast captions and dismissal, organization selection, material edges, table insets, account icons and compact footer controls received additional native-resolution inspection.

Long account menus and drawer content deliberately scroll. Logo artwork can wrap without being cropped. Headless organization controls demonstrate host styling; they do not gain a built-in visual contract. Matte presets show the optical fallback rather than adding glass effects that conflict with their appearance.

The comparator accepts zero changed pixels and zero channel tolerance, including antialiased edges and transparent RGB. No masks or ignored regions are used. Recording must pass the Vue/React comparison before either reference is written. The [contributor guide](../CONTRIBUTING.md) explains how to reproduce a failure, inspect its diff and update reviewed figures.

## Verification record

- Type checking passes; 540 unit tests pass with 94.37% source line coverage.
- Local recording contains all 852 figures, with valid PNG checksums and 300 DPI metadata. All 400 stored Vue/React pairs match exactly. The final strict run with isolated golden browsers passed all 831 browser tests in 15.8 minutes without changing the references. Every current figure hash matches its individual review record.
- Browser isolation passed 16 focused native checks, including repeated laptop references, fresh-process pixel equality, viewport resets and pulse-phase changes, in [run 34727571023](https://github.com/latere-ai/latere-ui/actions/runs/34727571023). The regression fails when a golden inherits the previous test's live browser. Trace checks preserve DOM snapshots, screenshot actions and source files.
- Native macOS 15 recording passed all 827 browser tests in 22.6 minutes in [run 34723912848](https://github.com/latere-ai/latere-ui/actions/runs/34723912848). All 852 native figures were individually reviewed, have valid PNG checksums and 300 DPI metadata, and retain their reviewed hashes. All 400 stored Vue/React pairs match exactly. The main-branch workflow checks subsequent renders against these committed native references without recording or accepting changes.

This expands the [initial appearance rollout](product-style-review.md), which recorded a smaller, selective matrix.

### Footer decoration follow-up — 2026-09-13

The earlier review missed browser-default underlines in the full footer. Compact links had their own reset, so the two layouts differed across every appearance. The shared footer now resets decoration on the anchors themselves, including brand and social links. Navigation retains hover underlines and keyboard focus outlines.

The new regression visits eight link-bearing sheets across both adapters, all four appearances, both themes and both widths: 256 page visits. It checks resting decoration, a later host anchor rule, footer hover and focus, and unchanged host prose styling. The Origo dark desktop case fails against the previous stylesheet and passes with the fix. Account-menu fixtures opt into a real hyperlink row for this check.

All 73 focused local browser checks passed, followed by 32 strict full/compact footer comparisons. Native [run 34756280559](https://github.com/latere-ai/latere-ui/actions/runs/34756280559) passed the 32 link regressions and 32 paired footer captures, plus type checking and all 540 unit tests. Source line coverage remains 94.37%.

All 16 changed compositions were inspected separately on each platform, with exact Vue/React RGBA parity and 300 DPI metadata verified. The 64 updated files change only underline rows; text shapes, geometry and controls retain their pixels. The other 1,640 figures retain their previous hashes, including every compact-footer reference. Main CI continues to compare against committed figures with zero pixel tolerance.

The first full [main run](https://github.com/latere-ai/latere-ui/actions/runs/34756542808) passed 862 checks, including every golden comparison and link-decoration case. Its sole failure measured a 24px toast dismiss button as 23.999998px. A new regression reproduces a residual transform after transition classes disappear; it fails with the previous waiter. The waiter now follows actual finite animations and two rendered frames before measuring. All 34 local toast checks pass. The 24px requirement, screenshot comparator and golden files remain unchanged by this test synchronization fix.

### Preference height follow-up — 2026-09-13

The full footer retained intrinsic control sizing after the compact footer gained explicit dimensions. Its theme selector measured 28px while the language dropdown measured 24px, offsetting both edges by 2px. The shared footer rules now give both controls a 28px outer height, matching corner insets and centered theme icons. Coarse-pointer devices use 50px outer heights with 44px theme-button targets.

The [regression](../tests/visual/preference-geometry.spec.ts) fails against the previous stylesheet. Its 32 cases check both footer layouts at 320px and 1280px, both adapters, four appearances, both themes and both pointer types, before and after changing preferences. It also checks equal pill heights in standalone and account-menu preferences. All 73 focused browser checks pass locally and in native [run 34760931088](https://github.com/latere-ai/latere-ui/actions/runs/34760931088), alongside type checking and 540 unit tests with 94.37% source line coverage. All 64 strict local footer/account/preference comparisons pass.

The 16 changed full-footer compositions were inspected separately on each platform, including control details at native resolution. All 64 updated files retain 300 DPI metadata and exact Vue/React pixel parity. The other 1,640 figures, including every compact-footer reference, retain their previous hashes.

### Origo selected corners — 2026-09-13

Subtracting an inset from Origo's 4px radius left selected segments with nearly square 1px corners. Both footer layouts and the form segmented control now use a visible 3px inner radius. Their outer radii include the actual border and padding: 6px for footer controls and 7px for form segments.

The [corner regression](../tests/visual/segment-corners.spec.ts) fails against the previous stylesheet and checks every selected position across both adapters, all four appearances and both themes. All 48 corner/preference checks and 48 strict local figure comparisons pass. Native [run 34761662874](https://github.com/latere-ai/latere-ui/actions/runs/34761662874) passes the same 48 behavior checks and 48 paired captures, plus type checking and 540 unit tests. Line coverage remains 94.37%.

The changed regions of all 12 compositions were inspected at native resolution separately on each platform. All 48 updated Origo PNGs retain 300 DPI metadata and exact Vue/React pixel parity. The other 1,656 references retain their previous hashes.

### Balanced footer taglines — 2026-09-13

The full footer's English tagline left “loop.” alone on its last line. Shared balanced wrapping now produces “Human intelligence” / “in the loop.” at desktop widths, without manual breaks in translations or host copy.

The [wrapping regression](../tests/visual/tagline-wrapping.spec.ts) fails against the previous stylesheet. It measures actual text lines across both adapters, all four appearances, both themes and four widths, with English, German, Chinese and custom inline copy. Local verification passes all 40 wrapping/geometry checks and eight strict paired desktop comparisons. Native [run 34763510415](https://github.com/latere-ai/latere-ui/actions/runs/34763510415) passes the same 40 behavior checks, 32 paired full/compact captures, type checking and 540 unit tests with 94.37% source line coverage.

All eight changed compositions were inspected at native resolution separately on each platform. The 32 updated desktop PNGs retain 300 DPI metadata and exact Vue/React pixel parity. The other 1,672 references retain their previous hashes, including every mobile and compact-footer figure.

### Account typography — 2026-09-13

The account trigger's 1px name-to-metadata gap crowded the role badge against the display name. Shared styling now reserves 4px in standalone and sidebar triggers. Preference pills centered the font's line box, leaving the visible capitals slightly below the control's center. Their labels now use cap-height and alphabetic-baseline trimming inside a centered flex container; controls retain their 24px outer height. Browsers without CSS text-box support keep ordinary flex centering.

Both regressions fail against the preceding implementation. The [identity regression](../tests/visual/account-identity-spacing.spec.ts) measures the rendered gap, edge insets and menu separation at three widths across both adapters, all four appearances and both themes. An opt-in gallery fixture places the actual account component in the sidebar slot, including its collapsed state. The [label regression](../tests/visual/preference-label-alignment.spec.ts) measures the actual baseline against font cap metrics in standalone and account-menu preferences, before and after selecting each language and theme.

All 34 focused local behavior checks and 34 strict visual comparisons pass. Native [run 34766453734](https://github.com/latere-ai/latere-ui/actions/runs/34766453734) passes 66 typography/preference checks and 34 capture cases. Both environments pass type checking and 540 unit tests, with 94.38% source line coverage.

The changed details of all 22 compositions were inspected separately on each platform, including the scrolled account menu. All 84 updated PNGs have valid 300 DPI metadata and exact Vue/React parity where paired. The other 1,620 references retain their previous hashes.

The platform identity mark now shares its geometry between adapters. The logo
sheets were reviewed in all four appearances, light/dark, and desktop/mobile on
macOS 27; all 16 paired captures match exactly (32 adapter references). Corporate
logo geometry and production footer appearance are unchanged.

The same 32 logo references were reviewed separately on macOS 15 from
[CI run 35582723366](https://github.com/latere-ai/latere-ui/actions/runs/35582723366).
All 16 paired browser checks passed; the artifact changed only these logo sheets.

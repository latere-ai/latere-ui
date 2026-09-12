# Complete component visual review

All 34 visual components now have Vue and React implementations. The same 25 component sheets cover default glass, Replichai, Wallfacer and Origo in light/dark themes at desktop/mobile widths. Use the [visual index](visual-reference.md) to inspect each composition, or run `bun run visual:dev` to try its controls.

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
| Toast geometry checks measured rows during staggered entrances | Measurements wait for every toast entrance to finish. | [Toast dismissal](../tests/visual/toast-dismiss.spec.ts) |
| Cold gallery startup reloaded an open Vue overlay when React first loaded | The JSX runtime is prebundled before either adapter opens. | [Cold startup](../tests/visual/vite-startup.spec.ts) |
| Native screenshot resizing could remove the pointer sheen | Optical figures sample the mouse handler at fixed coordinates and require the intended opacity and gradient throughout capture. Real pointer equivalence and exit remain tested. | [Interaction capture](../tests/visual/interaction-capture.spec.ts) |

The sidebar follows the integrated rail visible in [Apple's supplied Mail reference](https://www.apple.com/v/os/g/images/macos/improvements/search__gca3sckqsxym_large_2x.jpg). The [design guide](design-system.md) explains the shared geometry and the deliberate differences among the matte presets. Example workspace content is product neutral. Product identity artwork retains its brand shape; choosing a preset does not rename the workspace.

## Review method

Each new or changed composition is inspected individually for clipping, text alignment, corner treatment, spacing, contrast and state visibility. Native device-pixel crops resolve details that a reduced preview can conceal. An unchanged figure retains its earlier review only when its hash matches. A React counterpart inherits a reviewed Vue composition only after every decoded RGBA channel matches.

Each platform was reviewed separately: 400 paired compositions and 52 supplemental figures, covering all 1,704 committed PNGs across both platforms. Final file hashes were checked after inspection. Native macOS 15 pixels differed from the local macOS 27 figures, so none of its compositions inherited a local review. Button states, toast captions and dismissal, organization selection, material edges, table insets, account icons and compact footer controls received additional native-resolution inspection.

Long account menus and drawer content deliberately scroll. Logo artwork can wrap without being cropped. Headless organization controls demonstrate host styling; they do not gain a built-in visual contract. Matte presets show the optical fallback rather than adding glass effects that conflict with their appearance.

The comparator accepts zero changed pixels and zero channel tolerance, including antialiased edges and transparent RGB. No masks or ignored regions are used. Recording must pass the Vue/React comparison before either reference is written. The [contributor guide](../CONTRIBUTING.md) explains how to reproduce a failure, inspect its diff and update reviewed figures.

## Verification record

- Type checking passes; 540 unit tests pass with 94.37% source line coverage.
- Local recording contains all 852 figures, with valid PNG checksums and 300 DPI metadata. All 400 stored Vue/React pairs match exactly. The final strict run passed all 827 browser tests in 15.5 minutes without changing the references. Every current figure hash matches its individual review record.
- Native macOS 15 recording passed all 827 browser tests in 22.6 minutes in [run 34723912848](https://github.com/latere-ai/latere-ui/actions/runs/34723912848). All 852 native figures were individually reviewed, have valid PNG checksums and 300 DPI metadata, and retain their reviewed hashes. All 400 stored Vue/React pairs match exactly. The main-branch workflow checks subsequent renders against these committed native references without recording or accepting changes.

This expands the [initial appearance rollout](product-style-review.md), which recorded a smaller, selective matrix.

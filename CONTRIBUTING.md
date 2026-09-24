# Contributing

Start with the [README](README.md) for what this repository is and how to
build and test it. Every bug fix ships with a test that fails without it,
and every change is one small commit with a message that says why.

## Writing

Every sentence latere-ui emits or carries is written for one reader, and the
register follows the reader:

- User, a person or a coding harness: component copy and default labels, the
  README and the docs. Short and plain: what happened and what to do next,
  naming a command or a page, never a package, a function, a table, or a
  Kubernetes object.
- Contributor, someone changing latere-ui: specs, this file, package
  documentation, commit messages, source comments. Precise, in the project's
  own terms, with the reason a design is what it is.
- Developer, someone debugging a running system: console warnings a
  component emits and test failure output. Exact and complete: object,
  operation, observed value, expected value, and the underlying error.

An error has one code, one fixed user sentence in `message`, and one
developer detail in a separate field shown only on request. The canonical
statement, worked examples, and the review checklist are in the registers
document in pkg:
https://github.com/latere-ai/pkg/blob/main/docs/writing/registers.md
The rule applies to new text and to reviews; existing text is fixed as it is
touched.

## Preview the components

```sh
bun install --frozen-lockfile
bunx playwright install chromium
bun run visual:dev
```

Open <http://127.0.0.1:4173>. Choose an appearance, framework, component sheet, and theme.
Each page mounts source components with local fonts and fixed sample content. Canonical comparisons use `VueGallery.vue` and `ReactParityGallery.tsx`, with fixture data shared in `parity-data.ts`; the `parity=1` query selects those React examples.
The gallery is a development fixture; it is not included in the published package.

## Compare visual references

```sh
bun run test:coverage    # Unit tests; enforces 90% source line coverage
bun run typecheck
bun run test:visual      # Browser behavior and golden comparisons
bun run test:visual:report
```

Expected PNGs live in `tests/visual/goldens/<platform>/`. macOS paths include
its Darwin major: `darwin-24` for macOS 15 (CI), `darwin-27` for macOS 27 (the
local documentation figures). Chromium is installed by the pinned Playwright
version. CoreText and blur rendering can differ between macOS releases, so
these references remain separate. Comparisons decode PNGs and require equal dimensions and every RGBA channel to match exactly. There is no channel threshold, antialiasing exclusion, pixel allowance, mask, or adapter-specific tolerance; PNG compression differences do not count as visual changes.
The viewport is 1100 × 850 for default desktop sheets (1280 × 850 for three-column docs
and product appearances) and 390 × 844 for mobile in CSS pixels. Captures render at 3.125×
(300/96), retain device pixels, and store 300 DPI PNG metadata. A standard
desktop figure is approximately 3438 × 2656 pixels, so text stays sharp when
enlarged or printed. CSS layout and component sizing stay the same.
Fonts are bundled locally;
media preferences are explicit, with dedicated accessibility scenarios.
No backend, remote images, or web font service is needed.

Golden tests use the `goldenTest` fixture from `tests/visual/fixtures.ts`. Each test launches and closes its own Chromium process so paint caches do not carry over from earlier examples; its Vue and React renders still share the same fresh page. Configured fonts, DPR, viewport, browser arguments and tracing remain in effect. Use the ordinary `test` fixture for behavior checks that do not need a committed visual reference.

Each capture waits for finite transitions to finish, pauses looping animations at their first frame, hides the text caret, and requires two identical decoded RGBA images. It restores the previous animation state afterward. Avoid Playwright's global animation override: repeated SVG captures exposed raster differences with that override. For every scenario, the suite compares Vue directly with React before checking either committed golden. Explicit recording cannot bypass this adapter parity check.

Optical figures send a fixed pointer sample through the component's mouse handler, with the native cursor outside the panel. Native full-page captures can temporarily resize Chromium to 1×1 and dispatch an unrelated mouse-leave event. The fixture avoids that input disturbance; capture also checks the sampled opacity and gradient before accepting each frame. Separate browser tests verify that the sample matches real pointer input and that real pointer exit fades the sheen. DOM/action traces remain enabled; background trace screencast images are disabled to avoid a second native capture stream.

The matrix includes every public visual component in both frameworks, all four appearances (default, Replichai, Wallfacer and Origo), desktop/mobile, and light/dark. Fixed logos, headless organization lists, collapsed sidebars and optical-effects examples also participate; a preset may intentionally leave a fixed identity unchanged.

Normal verification also checks the 300 DPI metadata without modifying files.
Explicit updates stamp density after capture; they never enlarge old pixels.
Separate interaction tests check focus, keyboard navigation, scrolling, and
optical effect updates. A still image cannot verify motion or every possible
host layout. This suite targets Chromium; it does not establish Firefox or
Safari rendering compatibility.

A normal run fails on a missing or changed image. Inspect the HTML report's
expected, actual, and diff images before deciding whether a change is intended.
Actual images, differences, and traces stay under ignored `output/playwright/`.
CI uploads that folder on failure. Push and pull-request checks never regenerate expected images.

## Update a reference deliberately

```sh
# Narrow the update to the component you changed.
bun run test:visual:update --grep 'parity default buttons '
# Then compare the result without update mode.
bun run test:visual --grep 'parity default buttons '
# Review a specific appearance in both adapters and themes.
bun run test:visual:update --grep 'parity origo forms '
bun run test:visual --grep 'parity origo forms '
```

Review each changed PNG individually in both themes and both layouts for every affected appearance and adapter.
Inspect the full composition and native-size details: corner clearance, text
insets, border weight, contrast, active/disabled states, clipping and overlay
occlusion. A matching screenshot proves consistency, not design quality. Record
findings and corrections in a review record such as the [compact template review](docs/reviews/compact-design-review.md) or [per-figure checklist](docs/reviews/visual-audit-300dpi.md),
and recheck the actual regenerated image after fixing its source. Include the
source change, its regression test, and the reviewed PNGs in the same pull
request. The README and design guide embed these files directly, so accepting a
baseline also changes the public visual documentation.

Run updates on the reference platform. Other OS versions require their own
reviewed references. A Linux run must not overwrite macOS figures or silently
accept missing images. Browser or font upgrades require a reviewed regeneration.

To record candidates on the hosted macOS 15 runner, manually dispatch **UI
verification** with `record_goldens` enabled (or run `gh workflow run visual.yml -f record_goldens=true`). Download the `golden-candidates` artifact, inspect the
PNG changes, and commit approved files under `tests/visual/goldens/darwin-24/`.
This explicit recording run never commits files or replaces normal verification;
the subsequent push must pass comparison without update mode.

## Add a component or state

1. Add equivalent source-component examples to `tests/visual/VueGallery.vue` and
   `tests/visual/ReactParityGallery.tsx`. Share data in `parity-data.ts`; preserve
   equivalent DOM, whitespace and content so the pixel comparison is meaningful.
2. Register the public export in `tests/visual/manifest.ts`. The inventory test
   requires a scenario; `design-manifest.ts` applies the same set to every appearance
   and mobile layout without exclusions.
3. Add representative states and browser interactions for both adapters. Include
   open overlays, disabled/error states, keyboard focus and narrow layouts. The
   shell behavior suite is `tests/visual/parity-shell.spec.ts`.
4. Resolve any Vue/React pixel differences in source or canonical fixture content
   before recording. Investigate font loading, inline text shaping, dimensions
   and compositing; keep the zero-tolerance comparison intact.
5. Generate and inspect the figures, rerun comparisons, and update the
   [design guide](docs/design-system.md). Run `bun run visual:index` to regenerate
   the [reference index](docs/visual-reference.md); do not hand-edit its tables.

See [Playwright's visual comparison guide](https://playwright.dev/docs/test-snapshots)
for how stable screenshots and platform-specific rendering work.

## Documentation

The [README](README.md) and the guides in [`docs/`](docs/README.md) are
written for developers who use the package: what to import, which props to
pass, and what a component looks like. They describe `main`, and a change
that is not yet released is named under Unreleased in the
[changelog](CHANGELOG.md). Review records go in
[`docs/reviews/`](docs/reviews/README.md), and design reasoning goes in
[`specs/`](specs/README.md). `docs/visual-reference.md` is generated by
`bun run visual:index`.

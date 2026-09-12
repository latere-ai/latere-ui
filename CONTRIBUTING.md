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

Open <http://127.0.0.1:4173>. Choose a framework, component sheet, and theme.
Each page mounts source components with local fonts and fixed sample content.
The gallery is a development fixture; it is not included in the published package.

## Compare visual references

```sh
bun run test:coverage    # Unit tests; enforces 90% source line coverage
bun run typecheck
bun run test:visual      # Browser behavior and golden comparisons
bun run test:visual:report
```

Expected PNGs live in `tests/visual/goldens/darwin/`. The initial reference
platform is macOS with the exact Chromium build installed by the pinned
Playwright version. CI runs on `macos-15`. The viewport is 1100 × 850 for
desktop (1280 × 850 for the three-column docs layout) and 390 × 844 for mobile, at device scale 1. Fonts are bundled locally;
no backend, remote images, or web font service is needed.

Playwright compares stable screenshots with animations disabled for capture.
Separate interaction tests check focus, keyboard navigation, scrolling, and
optical effect updates. A still image cannot verify motion or every possible
host layout. This suite targets Chromium; it does not establish Firefox or
Safari rendering compatibility.

A normal run fails on a missing or changed image. Inspect the HTML report's
expected, actual, and diff images before deciding whether a change is intended.
Actual images, differences, and traces stay under ignored `output/playwright/`.
CI uploads that folder on failure and never regenerates expected images.

## Update a reference deliberately

```sh
# Narrow the update to the component you changed.
bun run test:visual:update --grep 'vue buttons'
# Then compare the result without update mode.
bun run test:visual --grep 'vue buttons'
```

Review each changed PNG in both themes and relevant mobile states. Include the
source change, its regression test, and the reviewed PNGs in the same pull
request. The README and design guide embed these files directly, so accepting a
baseline also changes the public visual documentation.

Run updates on the reference platform. Playwright keeps other operating
systems in separate golden directories: a Linux run must not overwrite the
macOS references or automatically accept its own missing images. To adopt
another platform, generate its full matrix, inspect it, and commit that baseline
with an explicit CI job. Browser or font upgrades also require a reviewed full
regeneration.

## Add a component or state

1. Add a real Vue or React example in `tests/visual/VueGallery.vue` or
   `tests/visual/ReactGallery.tsx`.
2. Register its export in `tests/visual/manifest.ts`. The unit inventory test
   fails when a new public UI component has no scenario.
3. Add representative states and browser interactions. Include open overlays,
   disabled/error states, keyboard focus, and narrow layouts where relevant.
4. Generate and inspect its figures, rerun comparisons, and update the
   [design guide](docs/design-system.md) or [reference index](docs/visual-reference.md).

See [Playwright's visual comparison guide](https://playwright.dev/docs/test-snapshots)
for how stable screenshots and platform-specific rendering work.

# latere-ui Specs

Design specs for the shared React and framework-agnostic UI, auth, and session code used by the Latere product frontends.

## Releases and shared libraries

| Spec | Status | Deliverable |
|---|---|---|
| [Shared auth client](auth-client-v1.8.md) | Complete | v1.8: vanilla async core, OrgSwitcher, runFrontChannelLogout |
| [Console shell](console-shell-v1.9.md) | Complete | Shared ConsoleSidebar and DocsLayout shipped in v1.9.0; per-product migrations pending |
| [Liquid Glass design system](liquid-glass-v1.10.md) | Complete | Material tokens and a reusable component library (sidebar, button, modal, alert, message, field); products adopt by setting canvas tokens and importing Glass* components |
| [Liquid Glass v2](liquid-glass-v2-v1.20.md) | Complete | Five-tier material ladder, capsule geometry and radii ladder, ink-only accent, layered floating-glass shadows; the shell adopts the floating-capsule rail; released as v1.20.0 |
| [React support](react-support-v1.27.md) | Validated | React bindings for the Glass primitives, console shell and session client, from `latere-ui/react` |
| [React site footer](react-site-footer-v1.28.md) | Validated | SiteFooter and LatereLogoMark for React consumers |
| [Browser telemetry](browser-telemetry.md) | Complete | `latere-ui/telemetry`, one lazy browser telemetry entry paired with otel.TelemetryProxy |
| [Structured data](structured-data.md) | Complete | `latere-ui/structured-data`, schema.org JSON-LD builders and an escaped script serializer for public pages |
| [Select search](select-search.md) | Complete | GlassSelect search by typing above SELECT_SEARCH_THRESHOLD options, shared in src/glass |

## Dependencies

- **Upstream**: the platform-wide auth unification design, tracked outside this repo. The auth backend additions land first; the library work lands in parallel and is independent of backend deploy.
- **Downstream**: each consuming product's own migration plan references these specs when bumping `latere-ui` to v1.8.0 and renaming CSRF cookies.

## Conventions

- Frontmatter mirrors the platform-wide spec model.
- React and React DOM (18 or 19) are the only peerDependencies. Since v2.0.0 the package is React only; the Vue components and the Pinia store live on the v1.x tags.
- SSR safety: every browser-coupled helper must be a no-op without `window`.
- CSS strategy: **headless primitives** ship without styles; **styled adapter
  components** (`SiteFooter`, `ConsoleSidebar`, `DocsLayout`, and the `Glass*`
  library) ship token-based CSS as opt-in subpath entrypoints so the consoles
  can align visually. See `console-shell-v1.9.md`.

## Visual verification

| Spec | Status | Deliverable |
|---|---|---|
| [Visual regression harness](visual-regression-harness.md) | Complete | Browser gallery, committed images and comparison workflow |
| [Component coverage](visual-component-coverage.md) | Complete | Every UI export, glass effects and responsive states |
| [Reference resolution](visual-reference-resolution.md) | Complete | Native browser figures at 300 DPI, verified density and individual review on both platforms |
| [Compact desktop template](compact-design-template.md) | Complete | Smaller corners, restrained glass and layouts sized to available space |

## Product appearances

| Spec | Status | Deliverable |
|---|---|---|
| [Product style presets](product-style-presets.md) | Complete | Importable Replichai, Wallfacer and Origo component appearances |
| [Product style figures](product-style-figures.md) | Complete | Per-style component references and visual regression matrix |
| [Integrated sidebar](integrated-sidebar.md) | Complete | macOS 27 window-integrated navigation geometry |
| [Sidebar tree, compact head and foot rows](console-sidebar-tree.md) | Complete | Expandable sections, built-in icons, one-row head, foot rows, window-concentric account card |

## Complete adapter and visual coverage

| Spec | Status | Deliverable |
|---|---|---|
| [React basic component parity](react-basic-parity.md) | Complete | React basic component parity |
| [React overlay and service parity](react-overlay-parity.md) | Complete | React overlay and service parity |
| [React shell and account parity](react-shell-parity.md) | Complete | React shell and account parity |
| [Complete component visual matrix](complete-visual-matrix.md) | Complete | Complete component visual matrix |
| [Footer navigation groups](footer-navigation-groups.md) | Complete | Applications, Research, and Platform in both footer adapters and all designs |
| [Footer columns and preference menus](footer-columns.md) | Complete | Lead block and link columns, theme and language menus on fixed menu primitives, the platform's ink mark |
| [One control shape, the flat capsule](capsule-controls.md) | Complete | Capsule buttons in flat fill, hairline and bare treatments; `--lu-button-radius` apart from `--lu-control-radius` |
| [One footer on every Latere site](one-footer.md) | Testing | One footer shape, `lu-footer` classes, lockup and preference wiring as the only site inputs, the Gallery under Applications |

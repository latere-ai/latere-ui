# Visual reference index

These PNGs are the expected renders used by the browser suite. Figures are rendered at 3.125× browser resolution and carry 300 DPI metadata. Open a figure to inspect sharp text and edges at full size. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.

These documentation figures use macOS 27 and pinned Chromium. The [macOS 15 CI references](../tests/visual/goldens/darwin-24) are reviewed separately. Every exported Vue and React UI component has a scenario; this is component inventory coverage, not a percentage of all possible appearances or browser engines.

## Vue

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin-27/vue-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin-27/vue-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-forms-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-forms-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-forms-dark-mobile.png) |
| select | GlassSelect | [View](../tests/visual/goldens/darwin-27/vue-select-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-select-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-select-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-select-dark-mobile.png) |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin-27/vue-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-feedback-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-feedback-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-feedback-dark-mobile.png) |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-27/vue-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-containers-dark-desktop.png) | — |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin-27/vue-popover-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-popover-dark-desktop.png) | — |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin-27/vue-tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-tooltip-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-27/vue-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-modal-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-modal-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-modal-dark-mobile.png) |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin-27/vue-drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-drawer-left-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-drawer-left-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-drawer-left-dark-mobile.png) |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin-27/vue-drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-drawer-right-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-drawer-right-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-drawer-right-dark-mobile.png) |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin-27/vue-toast-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-toast-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-toast-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-toast-dark-mobile.png) |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin-27/vue-confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-confirm-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-confirm-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-confirm-dark-mobile.png) |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-27/vue-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-27/vue-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-sidebar-collapsed-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-sidebar-collapsed-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-sidebar-collapsed-dark-mobile.png) |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin-27/vue-palette-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-palette-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-palette-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-palette-dark-mobile.png) |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin-27/vue-docs-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-docs-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-docs-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-docs-dark-mobile.png) |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin-27/vue-account-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-account-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-account-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-account-dark-mobile.png) |
| preferences | AccountPrefs | [View](../tests/visual/goldens/darwin-27/vue-preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-preferences-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-preferences-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-preferences-dark-mobile.png) |
| products | ProductSwitcher | [View](../tests/visual/goldens/darwin-27/vue-products-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-products-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-products-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-products-dark-mobile.png) |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin-27/vue-organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-organizations-dark-desktop.png) | — |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-27/vue-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-footer-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-footer-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-footer-dark-mobile.png) |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-27/vue-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-footer-compact-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/vue-footer-compact-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/vue-footer-compact-dark-mobile.png) |
| logo | LatereLogoMark | [View](../tests/visual/goldens/darwin-27/vue-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-logo-dark-desktop.png) | — |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin-27/vue-effects-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/vue-effects-dark-desktop.png) | — |

## React

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| buttons | GlassButton | [View](../tests/visual/goldens/darwin-27/react-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassSegmented, GlassSelect | [View](../tests/visual/goldens/darwin-27/react-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-forms-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-forms-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-forms-dark-mobile.png) |
| feedback | GlassBadge, GlassAlert, GlassSpinner | [View](../tests/visual/goldens/darwin-27/react-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-feedback-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-feedback-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-feedback-dark-mobile.png) |
| containers | GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-27/react-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-containers-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-27/react-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-modal-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-modal-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-modal-dark-mobile.png) |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-27/react-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-27/react-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-sidebar-collapsed-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-sidebar-collapsed-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-sidebar-collapsed-dark-mobile.png) |
| account | AccountMenu | [View](../tests/visual/goldens/darwin-27/react-account-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-account-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-account-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-account-dark-mobile.png) |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-27/react-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-footer-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-footer-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-footer-dark-mobile.png) |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-27/react-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-footer-compact-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-27/react-footer-compact-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-27/react-footer-compact-dark-mobile.png) |
| logo | LatereLogoMark | [View](../tests/visual/goldens/darwin-27/react-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-27/react-logo-dark-desktop.png) | — |

## Interaction and accessibility states

Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.

- [account-scrolled-dark](../tests/visual/goldens/darwin-27/account-scrolled-dark.png)
- [account-scrolled-light](../tests/visual/goldens/darwin-27/account-scrolled-light.png)
- [buttons-dark-focus](../tests/visual/goldens/darwin-27/buttons-dark-focus.png)
- [buttons-dark-hover](../tests/visual/goldens/darwin-27/buttons-dark-hover.png)
- [buttons-light-focus](../tests/visual/goldens/darwin-27/buttons-light-focus.png)
- [buttons-light-hover](../tests/visual/goldens/darwin-27/buttons-light-hover.png)
- [effects-dark-contrast](../tests/visual/goldens/darwin-27/effects-dark-contrast.png)
- [effects-dark-reduced-motion](../tests/visual/goldens/darwin-27/effects-dark-reduced-motion.png)
- [effects-dark-reduced-transparency](../tests/visual/goldens/darwin-27/effects-dark-reduced-transparency.png)
- [effects-light-contrast](../tests/visual/goldens/darwin-27/effects-light-contrast.png)
- [effects-light-reduced-motion](../tests/visual/goldens/darwin-27/effects-light-reduced-motion.png)
- [effects-light-reduced-transparency](../tests/visual/goldens/darwin-27/effects-light-reduced-transparency.png)
- [palette-empty-dark](../tests/visual/goldens/darwin-27/palette-empty-dark.png)
- [palette-empty-light](../tests/visual/goldens/darwin-27/palette-empty-light.png)
- [palette-filtered-dark](../tests/visual/goldens/darwin-27/palette-filtered-dark.png)
- [palette-filtered-light](../tests/visual/goldens/darwin-27/palette-filtered-light.png)
- [palette-scrolled-dark](../tests/visual/goldens/darwin-27/palette-scrolled-dark.png)
- [palette-scrolled-light](../tests/visual/goldens/darwin-27/palette-scrolled-light.png)
- [popover-dark-bottom-end](../tests/visual/goldens/darwin-27/popover-dark-bottom-end.png)
- [popover-dark-top-end](../tests/visual/goldens/darwin-27/popover-dark-top-end.png)
- [popover-dark-top-start](../tests/visual/goldens/darwin-27/popover-dark-top-start.png)
- [popover-light-bottom-end](../tests/visual/goldens/darwin-27/popover-light-bottom-end.png)
- [popover-light-top-end](../tests/visual/goldens/darwin-27/popover-light-top-end.png)
- [popover-light-top-start](../tests/visual/goldens/darwin-27/popover-light-top-start.png)
- [react-modal-nested-dark](../tests/visual/goldens/darwin-27/react-modal-nested-dark.png)
- [react-modal-nested-light](../tests/visual/goldens/darwin-27/react-modal-nested-light.png)
- [react-select-open-dark](../tests/visual/goldens/darwin-27/react-select-open-dark.png)
- [react-select-open-light](../tests/visual/goldens/darwin-27/react-select-open-light.png)
- [tooltip-bottom-dark](../tests/visual/goldens/darwin-27/tooltip-bottom-dark.png)
- [tooltip-bottom-light](../tests/visual/goldens/darwin-27/tooltip-bottom-light.png)
- [tooltip-reduced-transparency-dark](../tests/visual/goldens/darwin-27/tooltip-reduced-transparency-dark.png)
- [tooltip-reduced-transparency-light](../tests/visual/goldens/darwin-27/tooltip-reduced-transparency-light.png)
- [vue-modal-nested-dark](../tests/visual/goldens/darwin-27/vue-modal-nested-dark.png)
- [vue-modal-nested-light](../tests/visual/goldens/darwin-27/vue-modal-nested-light.png)

Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.

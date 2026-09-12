# Visual reference index

These PNGs are the expected renders used by the browser suite. Open a figure to inspect it at full size. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.

The initial baseline uses macOS and pinned Chromium. Every exported Vue and React UI component has a scenario; this is component inventory coverage, not a percentage of all possible appearances or browser engines.

## Vue

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin/vue-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin/vue-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-forms-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-forms-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-forms-dark-mobile.png) |
| select | GlassSelect | [View](../tests/visual/goldens/darwin/vue-select-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-select-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-select-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-select-dark-mobile.png) |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin/vue-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-feedback-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-feedback-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-feedback-dark-mobile.png) |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin/vue-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-containers-dark-desktop.png) | — |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin/vue-popover-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-popover-dark-desktop.png) | — |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin/vue-tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-tooltip-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin/vue-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-modal-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-modal-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-modal-dark-mobile.png) |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin/vue-drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-drawer-left-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-drawer-left-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-drawer-left-dark-mobile.png) |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin/vue-drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-drawer-right-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-drawer-right-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-drawer-right-dark-mobile.png) |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin/vue-toast-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-toast-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-toast-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-toast-dark-mobile.png) |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin/vue-confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-confirm-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-confirm-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-confirm-dark-mobile.png) |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin/vue-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin/vue-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-sidebar-collapsed-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-sidebar-collapsed-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-sidebar-collapsed-dark-mobile.png) |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin/vue-palette-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-palette-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-palette-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-palette-dark-mobile.png) |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin/vue-docs-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-docs-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-docs-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-docs-dark-mobile.png) |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin/vue-account-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-account-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-account-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-account-dark-mobile.png) |
| preferences | AccountPrefs | [View](../tests/visual/goldens/darwin/vue-preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-preferences-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-preferences-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-preferences-dark-mobile.png) |
| products | ProductSwitcher | [View](../tests/visual/goldens/darwin/vue-products-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-products-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-products-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-products-dark-mobile.png) |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin/vue-organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-organizations-dark-desktop.png) | — |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin/vue-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-footer-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-footer-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-footer-dark-mobile.png) |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin/vue-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-footer-compact-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/vue-footer-compact-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/vue-footer-compact-dark-mobile.png) |
| logo | LatereLogoMark | [View](../tests/visual/goldens/darwin/vue-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-logo-dark-desktop.png) | — |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin/vue-effects-light-desktop.png) | [View](../tests/visual/goldens/darwin/vue-effects-dark-desktop.png) | — |

## React

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| buttons | GlassButton | [View](../tests/visual/goldens/darwin/react-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassSegmented, GlassSelect | [View](../tests/visual/goldens/darwin/react-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-forms-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-forms-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-forms-dark-mobile.png) |
| feedback | GlassBadge, GlassAlert, GlassSpinner | [View](../tests/visual/goldens/darwin/react-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-feedback-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-feedback-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-feedback-dark-mobile.png) |
| containers | GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin/react-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-containers-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin/react-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-modal-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-modal-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-modal-dark-mobile.png) |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin/react-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin/react-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-sidebar-collapsed-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-sidebar-collapsed-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-sidebar-collapsed-dark-mobile.png) |
| account | AccountMenu | [View](../tests/visual/goldens/darwin/react-account-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-account-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-account-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-account-dark-mobile.png) |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin/react-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-footer-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-footer-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-footer-dark-mobile.png) |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin/react-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-footer-compact-dark-desktop.png) | [Light](../tests/visual/goldens/darwin/react-footer-compact-light-mobile.png) · [Dark](../tests/visual/goldens/darwin/react-footer-compact-dark-mobile.png) |
| logo | LatereLogoMark | [View](../tests/visual/goldens/darwin/react-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin/react-logo-dark-desktop.png) | — |

## Interaction and accessibility states

Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.

- [account-scrolled-dark](../tests/visual/goldens/darwin/account-scrolled-dark.png)
- [account-scrolled-light](../tests/visual/goldens/darwin/account-scrolled-light.png)
- [buttons-dark-focus](../tests/visual/goldens/darwin/buttons-dark-focus.png)
- [buttons-dark-hover](../tests/visual/goldens/darwin/buttons-dark-hover.png)
- [buttons-light-focus](../tests/visual/goldens/darwin/buttons-light-focus.png)
- [buttons-light-hover](../tests/visual/goldens/darwin/buttons-light-hover.png)
- [effects-dark-contrast](../tests/visual/goldens/darwin/effects-dark-contrast.png)
- [effects-dark-reduced-motion](../tests/visual/goldens/darwin/effects-dark-reduced-motion.png)
- [effects-dark-reduced-transparency](../tests/visual/goldens/darwin/effects-dark-reduced-transparency.png)
- [effects-light-contrast](../tests/visual/goldens/darwin/effects-light-contrast.png)
- [effects-light-reduced-motion](../tests/visual/goldens/darwin/effects-light-reduced-motion.png)
- [effects-light-reduced-transparency](../tests/visual/goldens/darwin/effects-light-reduced-transparency.png)
- [palette-empty-dark](../tests/visual/goldens/darwin/palette-empty-dark.png)
- [palette-empty-light](../tests/visual/goldens/darwin/palette-empty-light.png)
- [palette-filtered-dark](../tests/visual/goldens/darwin/palette-filtered-dark.png)
- [palette-filtered-light](../tests/visual/goldens/darwin/palette-filtered-light.png)
- [palette-scrolled-dark](../tests/visual/goldens/darwin/palette-scrolled-dark.png)
- [palette-scrolled-light](../tests/visual/goldens/darwin/palette-scrolled-light.png)
- [popover-dark-bottom-end](../tests/visual/goldens/darwin/popover-dark-bottom-end.png)
- [popover-dark-top-end](../tests/visual/goldens/darwin/popover-dark-top-end.png)
- [popover-dark-top-start](../tests/visual/goldens/darwin/popover-dark-top-start.png)
- [popover-light-bottom-end](../tests/visual/goldens/darwin/popover-light-bottom-end.png)
- [popover-light-top-end](../tests/visual/goldens/darwin/popover-light-top-end.png)
- [popover-light-top-start](../tests/visual/goldens/darwin/popover-light-top-start.png)
- [react-modal-nested-dark](../tests/visual/goldens/darwin/react-modal-nested-dark.png)
- [react-modal-nested-light](../tests/visual/goldens/darwin/react-modal-nested-light.png)
- [react-select-open-dark](../tests/visual/goldens/darwin/react-select-open-dark.png)
- [react-select-open-light](../tests/visual/goldens/darwin/react-select-open-light.png)
- [tooltip-bottom-dark](../tests/visual/goldens/darwin/tooltip-bottom-dark.png)
- [tooltip-bottom-light](../tests/visual/goldens/darwin/tooltip-bottom-light.png)
- [tooltip-reduced-transparency-dark](../tests/visual/goldens/darwin/tooltip-reduced-transparency-dark.png)
- [tooltip-reduced-transparency-light](../tests/visual/goldens/darwin/tooltip-reduced-transparency-light.png)
- [vue-modal-nested-dark](../tests/visual/goldens/darwin/vue-modal-nested-dark.png)
- [vue-modal-nested-light](../tests/visual/goldens/darwin/vue-modal-nested-light.png)

Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.

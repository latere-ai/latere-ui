# Visual reference index

These PNGs are the expected renders used by the browser suite. Chromium renders them on macOS 15 at 2× browser resolution, as on a high-density display. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.

Every visual component renders in light and dark themes at desktop and mobile widths. Each figure is compared with exact decoded RGBA equality, with no channel or antialiasing tolerance.

## Components

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| workspace | ConsoleSidebar, GlassBar, GlassPanel, GlassTable | [View](../tests/visual/goldens/darwin-24/workspace-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/workspace-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/workspace-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/workspace-dark-mobile.png) |
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin-24/buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/buttons-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/buttons-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/buttons-dark-mobile.png) |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin-24/forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/forms-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/forms-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/forms-dark-mobile.png) |
| select | GlassSelect | [View](../tests/visual/goldens/darwin-24/select-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/select-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/select-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/select-dark-mobile.png) |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin-24/feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/feedback-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/feedback-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/feedback-dark-mobile.png) |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-24/containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/containers-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/containers-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/containers-dark-mobile.png) |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin-24/popover-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/popover-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/popover-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/popover-dark-mobile.png) |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin-24/tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/tooltip-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/tooltip-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/tooltip-dark-mobile.png) |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-24/modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/modal-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/modal-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/modal-dark-mobile.png) |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin-24/drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/drawer-left-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/drawer-left-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/drawer-left-dark-mobile.png) |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin-24/drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/drawer-right-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/drawer-right-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/drawer-right-dark-mobile.png) |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin-24/toast-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/toast-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/toast-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/toast-dark-mobile.png) |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin-24/confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/confirm-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/confirm-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/confirm-dark-mobile.png) |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/sidebar-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/sidebar-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/sidebar-dark-mobile.png) |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/sidebar-collapsed-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/sidebar-collapsed-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/sidebar-collapsed-dark-mobile.png) |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin-24/palette-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/palette-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/palette-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/palette-dark-mobile.png) |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin-24/docs-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/docs-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/docs-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/docs-dark-mobile.png) |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin-24/account-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/account-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/account-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/account-dark-mobile.png) |
| preferences | AccountPrefs, ThemeMenu, LocaleMenu | [View](../tests/visual/goldens/darwin-24/preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/preferences-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/preferences-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/preferences-dark-mobile.png) |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin-24/organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/organizations-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/organizations-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/organizations-dark-mobile.png) |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-24/footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/footer-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/footer-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/footer-dark-mobile.png) |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-24/footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/footer-compact-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/footer-compact-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/footer-compact-dark-mobile.png) |
| logo | LatereLogoMark, PlatformLogoMark | [View](../tests/visual/goldens/darwin-24/logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/logo-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/logo-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/logo-dark-mobile.png) |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin-24/effects-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/effects-dark-desktop.png) | [Light](../tests/visual/goldens/darwin-24/effects-light-mobile.png) · [Dark](../tests/visual/goldens/darwin-24/effects-dark-mobile.png) |

## Product style variations

Real components rendered with the optional `latere-ui/presets` stylesheet, in both themes at desktop width for each style. Identity marks retain their brand artwork; headless organization controls demonstrate host styling; optical opt-ins show their intentional matte fallback in these presets.

### replichai

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| workspace | ConsoleSidebar, GlassBar, GlassPanel, GlassTable | [View](../tests/visual/goldens/darwin-24/replichai-workspace-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-workspace-dark-desktop.png) | — |
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin-24/replichai-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin-24/replichai-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-forms-dark-desktop.png) | — |
| select | GlassSelect | [View](../tests/visual/goldens/darwin-24/replichai-select-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-select-dark-desktop.png) | — |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin-24/replichai-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-feedback-dark-desktop.png) | — |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-24/replichai-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-containers-dark-desktop.png) | — |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin-24/replichai-popover-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-popover-dark-desktop.png) | — |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin-24/replichai-tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-tooltip-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-24/replichai-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-modal-dark-desktop.png) | — |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin-24/replichai-drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-drawer-left-dark-desktop.png) | — |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin-24/replichai-drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-drawer-right-dark-desktop.png) | — |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin-24/replichai-toast-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-toast-dark-desktop.png) | — |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin-24/replichai-confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-confirm-dark-desktop.png) | — |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/replichai-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/replichai-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-sidebar-collapsed-dark-desktop.png) | — |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin-24/replichai-palette-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-palette-dark-desktop.png) | — |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin-24/replichai-docs-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-docs-dark-desktop.png) | — |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin-24/replichai-account-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-account-dark-desktop.png) | — |
| preferences | AccountPrefs, ThemeMenu, LocaleMenu | [View](../tests/visual/goldens/darwin-24/replichai-preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-preferences-dark-desktop.png) | — |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin-24/replichai-organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-organizations-dark-desktop.png) | — |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-24/replichai-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-footer-dark-desktop.png) | — |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-24/replichai-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-footer-compact-dark-desktop.png) | — |
| logo | LatereLogoMark, PlatformLogoMark | [View](../tests/visual/goldens/darwin-24/replichai-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-logo-dark-desktop.png) | — |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin-24/replichai-effects-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/replichai-effects-dark-desktop.png) | — |

### wallfacer

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| workspace | ConsoleSidebar, GlassBar, GlassPanel, GlassTable | [View](../tests/visual/goldens/darwin-24/wallfacer-workspace-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-workspace-dark-desktop.png) | — |
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin-24/wallfacer-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin-24/wallfacer-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-forms-dark-desktop.png) | — |
| select | GlassSelect | [View](../tests/visual/goldens/darwin-24/wallfacer-select-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-select-dark-desktop.png) | — |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin-24/wallfacer-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-feedback-dark-desktop.png) | — |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-24/wallfacer-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-containers-dark-desktop.png) | — |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin-24/wallfacer-popover-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-popover-dark-desktop.png) | — |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin-24/wallfacer-tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-tooltip-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-24/wallfacer-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-modal-dark-desktop.png) | — |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin-24/wallfacer-drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-drawer-left-dark-desktop.png) | — |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin-24/wallfacer-drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-drawer-right-dark-desktop.png) | — |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin-24/wallfacer-toast-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-toast-dark-desktop.png) | — |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin-24/wallfacer-confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-confirm-dark-desktop.png) | — |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/wallfacer-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/wallfacer-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-sidebar-collapsed-dark-desktop.png) | — |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin-24/wallfacer-palette-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-palette-dark-desktop.png) | — |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin-24/wallfacer-docs-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-docs-dark-desktop.png) | — |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin-24/wallfacer-account-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-account-dark-desktop.png) | — |
| preferences | AccountPrefs, ThemeMenu, LocaleMenu | [View](../tests/visual/goldens/darwin-24/wallfacer-preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-preferences-dark-desktop.png) | — |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin-24/wallfacer-organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-organizations-dark-desktop.png) | — |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-24/wallfacer-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-footer-dark-desktop.png) | — |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-24/wallfacer-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-footer-compact-dark-desktop.png) | — |
| logo | LatereLogoMark, PlatformLogoMark | [View](../tests/visual/goldens/darwin-24/wallfacer-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-logo-dark-desktop.png) | — |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin-24/wallfacer-effects-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/wallfacer-effects-dark-desktop.png) | — |

### origo

| Sheet | Components | Light | Dark | Mobile |
|---|---|---|---|---|
| workspace | ConsoleSidebar, GlassBar, GlassPanel, GlassTable | [View](../tests/visual/goldens/darwin-24/origo-workspace-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-workspace-dark-desktop.png) | — |
| buttons | GlassButton, GlassIconButton | [View](../tests/visual/goldens/darwin-24/origo-buttons-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-buttons-dark-desktop.png) | — |
| forms | GlassField, GlassCheckbox, GlassRadio, GlassSwitch, GlassSegmented, GlassTabs | [View](../tests/visual/goldens/darwin-24/origo-forms-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-forms-dark-desktop.png) | — |
| select | GlassSelect | [View](../tests/visual/goldens/darwin-24/origo-select-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-select-dark-desktop.png) | — |
| feedback | GlassBadge, GlassAlert, GlassSpinner, GlassProgress, GlassSkeleton | [View](../tests/visual/goldens/darwin-24/origo-feedback-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-feedback-dark-desktop.png) | — |
| containers | GlassSurface, GlassPanel, GlassBar, GlassTable | [View](../tests/visual/goldens/darwin-24/origo-containers-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-containers-dark-desktop.png) | — |
| popover | GlassPopover, GlassMenu | [View](../tests/visual/goldens/darwin-24/origo-popover-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-popover-dark-desktop.png) | — |
| tooltip | GlassTooltip | [View](../tests/visual/goldens/darwin-24/origo-tooltip-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-tooltip-dark-desktop.png) | — |
| modal | GlassModal | [View](../tests/visual/goldens/darwin-24/origo-modal-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-modal-dark-desktop.png) | — |
| drawer-left | GlassDrawer | [View](../tests/visual/goldens/darwin-24/origo-drawer-left-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-drawer-left-dark-desktop.png) | — |
| drawer-right | GlassDrawer | [View](../tests/visual/goldens/darwin-24/origo-drawer-right-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-drawer-right-dark-desktop.png) | — |
| toast | GlassToaster | [View](../tests/visual/goldens/darwin-24/origo-toast-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-toast-dark-desktop.png) | — |
| confirm | GlassConfirmHost | [View](../tests/visual/goldens/darwin-24/origo-confirm-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-confirm-dark-desktop.png) | — |
| sidebar | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/origo-sidebar-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-sidebar-dark-desktop.png) | — |
| sidebar-collapsed | ConsoleSidebar | [View](../tests/visual/goldens/darwin-24/origo-sidebar-collapsed-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-sidebar-collapsed-dark-desktop.png) | — |
| palette | ConsolePalette | [View](../tests/visual/goldens/darwin-24/origo-palette-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-palette-dark-desktop.png) | — |
| docs | DocsLayout | [View](../tests/visual/goldens/darwin-24/origo-docs-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-docs-dark-desktop.png) | — |
| account | AccountMenu, AccountPrefs | [View](../tests/visual/goldens/darwin-24/origo-account-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-account-dark-desktop.png) | — |
| preferences | AccountPrefs, ThemeMenu, LocaleMenu | [View](../tests/visual/goldens/darwin-24/origo-preferences-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-preferences-dark-desktop.png) | — |
| organizations | OrgSwitcher | [View](../tests/visual/goldens/darwin-24/origo-organizations-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-organizations-dark-desktop.png) | — |
| footer | SiteFooter | [View](../tests/visual/goldens/darwin-24/origo-footer-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-footer-dark-desktop.png) | — |
| footer-compact | SiteFooter | [View](../tests/visual/goldens/darwin-24/origo-footer-compact-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-footer-compact-dark-desktop.png) | — |
| logo | LatereLogoMark, PlatformLogoMark | [View](../tests/visual/goldens/darwin-24/origo-logo-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-logo-dark-desktop.png) | — |
| effects | GlassSurface | [View](../tests/visual/goldens/darwin-24/origo-effects-light-desktop.png) | [View](../tests/visual/goldens/darwin-24/origo-effects-dark-desktop.png) | — |

## Interaction and accessibility states

Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.

- [account-scrolled-dark](../tests/visual/goldens/darwin-24/account-scrolled-dark.png)
- [account-scrolled-light](../tests/visual/goldens/darwin-24/account-scrolled-light.png)
- [buttons-dark-focus](../tests/visual/goldens/darwin-24/buttons-dark-focus.png)
- [buttons-dark-hover](../tests/visual/goldens/darwin-24/buttons-dark-hover.png)
- [buttons-light-focus](../tests/visual/goldens/darwin-24/buttons-light-focus.png)
- [buttons-light-hover](../tests/visual/goldens/darwin-24/buttons-light-hover.png)
- [effects-dark-contrast](../tests/visual/goldens/darwin-24/effects-dark-contrast.png)
- [effects-dark-reduced-motion](../tests/visual/goldens/darwin-24/effects-dark-reduced-motion.png)
- [effects-dark-reduced-transparency](../tests/visual/goldens/darwin-24/effects-dark-reduced-transparency.png)
- [effects-light-contrast](../tests/visual/goldens/darwin-24/effects-light-contrast.png)
- [effects-light-reduced-motion](../tests/visual/goldens/darwin-24/effects-light-reduced-motion.png)
- [effects-light-reduced-transparency](../tests/visual/goldens/darwin-24/effects-light-reduced-transparency.png)
- [origo-react-buttons-states-dark](../tests/visual/goldens/darwin-24/origo-react-buttons-states-dark.png)
- [origo-react-buttons-states-light](../tests/visual/goldens/darwin-24/origo-react-buttons-states-light.png)
- [palette-empty-dark](../tests/visual/goldens/darwin-24/palette-empty-dark.png)
- [palette-empty-light](../tests/visual/goldens/darwin-24/palette-empty-light.png)
- [palette-filtered-dark](../tests/visual/goldens/darwin-24/palette-filtered-dark.png)
- [palette-filtered-light](../tests/visual/goldens/darwin-24/palette-filtered-light.png)
- [palette-scrolled-dark](../tests/visual/goldens/darwin-24/palette-scrolled-dark.png)
- [palette-scrolled-light](../tests/visual/goldens/darwin-24/palette-scrolled-light.png)
- [popover-dark-bottom-end](../tests/visual/goldens/darwin-24/popover-dark-bottom-end.png)
- [popover-dark-top-end](../tests/visual/goldens/darwin-24/popover-dark-top-end.png)
- [popover-dark-top-start](../tests/visual/goldens/darwin-24/popover-dark-top-start.png)
- [popover-light-bottom-end](../tests/visual/goldens/darwin-24/popover-light-bottom-end.png)
- [popover-light-top-end](../tests/visual/goldens/darwin-24/popover-light-top-end.png)
- [popover-light-top-start](../tests/visual/goldens/darwin-24/popover-light-top-start.png)
- [react-modal-nested-dark](../tests/visual/goldens/darwin-24/react-modal-nested-dark.png)
- [react-modal-nested-light](../tests/visual/goldens/darwin-24/react-modal-nested-light.png)
- [react-select-filtered-dark](../tests/visual/goldens/darwin-24/react-select-filtered-dark.png)
- [react-select-filtered-light](../tests/visual/goldens/darwin-24/react-select-filtered-light.png)
- [react-select-open-dark](../tests/visual/goldens/darwin-24/react-select-open-dark.png)
- [react-select-open-light](../tests/visual/goldens/darwin-24/react-select-open-light.png)
- [replichai-react-buttons-states-dark](../tests/visual/goldens/darwin-24/replichai-react-buttons-states-dark.png)
- [replichai-react-buttons-states-light](../tests/visual/goldens/darwin-24/replichai-react-buttons-states-light.png)
- [tooltip-bottom-dark](../tests/visual/goldens/darwin-24/tooltip-bottom-dark.png)
- [tooltip-bottom-light](../tests/visual/goldens/darwin-24/tooltip-bottom-light.png)
- [tooltip-reduced-transparency-dark](../tests/visual/goldens/darwin-24/tooltip-reduced-transparency-dark.png)
- [tooltip-reduced-transparency-light](../tests/visual/goldens/darwin-24/tooltip-reduced-transparency-light.png)
- [wallfacer-react-buttons-states-dark](../tests/visual/goldens/darwin-24/wallfacer-react-buttons-states-dark.png)
- [wallfacer-react-buttons-states-light](../tests/visual/goldens/darwin-24/wallfacer-react-buttons-states-light.png)
- [workspace-dark-laptop-large](../tests/visual/goldens/darwin-24/workspace-dark-laptop-large.png)
- [workspace-dark-laptop](../tests/visual/goldens/darwin-24/workspace-dark-laptop.png)
- [workspace-dark-studio](../tests/visual/goldens/darwin-24/workspace-dark-studio.png)
- [workspace-light-laptop-large](../tests/visual/goldens/darwin-24/workspace-light-laptop-large.png)
- [workspace-light-laptop](../tests/visual/goldens/darwin-24/workspace-light-laptop.png)
- [workspace-light-studio](../tests/visual/goldens/darwin-24/workspace-light-studio.png)

Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.

# latere-ui Specs

Design specs for the shared Vue and framework-agnostic UI, auth, and session code used by the Latere product frontends.

## Tree

Active specs:

```
specs/
  auth-client-v1.8.md      (complete, leaf — v1.8 adds vanilla async core, OrgSwitcher, runFrontChannelLogout)
  console-shell-v1.9.md    (complete — shared ConsoleSidebar + DocsLayout shipped in v1.9.0; per-product migrations pending)
  liquid-glass-v1.10.md    (complete — shared Liquid Glass design system: material tokens + a reusable component library (sidebar, button, modal, alert, message, field, ...); products adopt by setting canvas tokens and importing Glass* components)
  liquid-glass-v2-v1.20.md (complete — Liquid Glass v2: five-tier material ladder (ultrathin/thin/regular/thick/smoke), capsule geometry + radii ladder, ink-only accent, layered floating-glass shadows; shell adopts the 1d floating-capsule rail; token-layer reskin on the existing .lu-glass-* contracts, released as v1.20.0)
  react-support-v1.27.md   (complete — React bindings for the Glass primitives, console shell, and session client, from `latere-ui/react`)
  react-site-footer-v1.28.md (validated — SiteFooter + LatereLogoMark for React consumers)
```

## Dependencies

- **Upstream**: the platform-wide auth unification design, tracked outside this repo. The auth backend additions land first; the library work lands in parallel and is independent of backend deploy.
- **Downstream**: each consuming product's own migration plan references these specs when bumping `latere-ui` to v1.8.0 and renaming CSRF cookies.

## Conventions

- Frontmatter mirrors the platform-wide spec model.
- Vue + Pinia are peerDependencies; React bindings shipped in v1.27, Svelte remains out of scope until a consumer appears.
- SSR safety: every browser-coupled helper must be a no-op without `window`.
- CSS strategy: **headless primitives** ship without styles; **styled adapter SFCs**
  (`SiteFooter`, and the planned `ConsoleSidebar` / `DocsLayout`) ship token-based CSS
  as opt-in subpath entrypoints so the consoles can align visually. See
  `console-shell-v1.9.md`.

## Visual verification

| Spec | Status | Deliverable |
|---|---|---|
| [Visual regression harness](visual-regression-harness.md) | Complete | Browser gallery, committed images and comparison workflow |
| [Component coverage](visual-component-coverage.md) | Complete | Every UI export, glass effects and responsive states |

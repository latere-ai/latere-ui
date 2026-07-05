# latere-ui Specs

Design specs for the shared Vue + framework-agnostic auth/session client used by latere.ai consumer product frontends.

## Tree

Active specs:

```
specs/
  auth-client-v1.8.md      (complete, leaf — v1.8 adds vanilla async core, OrgSwitcher, runFrontChannelLogout)
  console-shell-v1.9.md    (complete — shared ConsoleSidebar + DocsLayout shipped in v1.9.0; per-product migrations pending)
  liquid-glass-v1.10.md    (complete — shared Liquid Glass design system: material tokens + a reusable component library (sidebar, button, modal, alert, message, field, ...); products adopt by setting canvas tokens and importing Glass* components)
  liquid-glass-v2-v1.20.md (complete — Liquid Glass v2: five-tier material ladder (ultrathin/thin/regular/thick/smoke), capsule geometry + radii ladder, ink-only accent, layered floating-glass shadows; shell adopts the 1d floating-capsule rail; token-layer reskin on the existing .lu-glass-* contracts, released as v1.20.0)
```

## Dependencies

- **Upstream**: `auth/specs/auth-unification.md` (parent), and the library design specs under `auth/specs/auth-unification/`. The backend pkg/oidc + pkg/authkit additions land first; this spec lands in parallel and is independent of backend deploy.
- **Downstream**: per-product migration specs in each consuming product's `specs/auth-unification-migration.md` reference this spec when bumping `latere-ui` to v1.8.0 and renaming CSRF cookies.

## Conventions

- Frontmatter mirrors the `auth/specs/*.md` model.
- Vue + Pinia are peerDependencies; React/Svelte adapters are out of scope until a consumer appears in the monorepo.
- SSR safety: every browser-coupled helper must be a no-op without `window`.
- CSS strategy: **headless primitives** ship without styles; **styled adapter SFCs**
  (`SiteFooter`, and the planned `ConsoleSidebar` / `DocsLayout`) ship token-based CSS
  as opt-in subpath entrypoints so the consoles can align visually. See
  `console-shell-v1.9.md`.

# latere-ui Specs

Design specs for the shared Vue + framework-agnostic auth/session client used by latere.ai consumer product frontends.

## Tree

Active specs:

```
specs/
  auth-client-v1.8.md      (planned, leaf — v1.8 adds vanilla async core, OrgSwitcher, runFrontChannelLogout)
```

## Dependencies

- **Upstream**: `auth/specs/auth-unification.md` (parent), and the library design specs under `auth/specs/auth-unification/`. The backend pkg/oidc + pkg/authkit additions land first; this spec lands in parallel and is independent of backend deploy.
- **Downstream**: per-product migration specs in each consuming product's `specs/auth-unification-migration.md` reference this spec when bumping `latere-ui` to v1.8.0 and renaming CSRF cookies.

## Conventions

- Frontmatter mirrors the `auth/specs/*.md` model.
- Vue + Pinia are peerDependencies; React/Svelte adapters are out of scope until a consumer appears in the monorepo.
- SSR safety: every browser-coupled helper must be a no-op without `window`.
- CSS-unopinionated: components ship without styles; consumers apply their own.

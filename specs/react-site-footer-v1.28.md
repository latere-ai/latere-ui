---
title: latere-ui v1.28 — SiteFooter for React consumers
status: validated
depends_on:
  - specs/react-support-v1.27.md
affects:
  - src/react/LatereLogoMark.tsx (new)
  - src/react/SiteFooter.tsx (new)
  - src/react/index.ts (exports)
  - src/react/__tests__/site-footer.test.tsx (new)
  - package.json (bump to 1.28.0)
  - README.md (React footer section)
effort: small
trigger: replichai (React + Vite) is putting the shared footer on its landing page; v1.27 deferred the SiteFooter port until a React consumer appeared, and one has
created: 2026-08-21
updated: 2026-08-21
author: changkun
dispatched_task_id: null
---

# latere-ui v1.28 — SiteFooter for React

## Overview

Port `SiteFooter.vue` to `src/react/SiteFooter.tsx` so React hosts get the
same footer the Vue consoles and the marketing site render. Both variants
(full and `compact`) ship together; a host that adopts one usually needs the
other on a different surface.

No de-scoping work: the footer's CSS already lives in `src/styles/footer.css`
as the `latere-ui/styles` entrypoint, and both adapters render the same class
names against it.

## Single source of truth

| Layer | Source | Vue | React |
|---|---|---|---|
| copy | `src/i18n/footer.ts` (`translator`) | imports | imports |
| product lineup | `src/components/productSwitcher.ts` | imports | imports |
| CSS | `src/styles/footer.css` | host imports `latere-ui/styles` | tsx imports it directly |
| logo | `LatereLogoMark.vue` | SFC | `LatereLogoMark.tsx` (same path data) |

The mark's path data is the one thing duplicated across the two adapters,
because an SVG cannot be shared between a template and JSX without a runtime.
`site-footer.test.tsx` asserts the two files carry byte-identical `d`
attributes, so a change to one that skips the other fails.

## API

`v-model` splits into value + handler, matching the other React adapters:

```tsx
<SiteFooter theme={theme} onThemeChange={setTheme}
            locale={locale} onLocaleChange={setLocale} />
```

Props: `theme`, `onThemeChange`, `locale`, `onLocaleChange`, `locales`,
`messages`, `compact`, `baseUrl`, `routerLink`. Defaults match the SFC's
`withDefaults` block exactly. `routerLink` is a `ComponentType<{to}>` as in
`ConsoleSidebar`; without it internal links are absolute `<a href>` under
`baseUrl`.

The keys the SFC renders through `v-html` (`footer.rights`, `footer.tagline`,
`footer.contact`, `footer.identity`, and the column titles) carry HTML
entities, so React renders them through `dangerouslySetInnerHTML` — same
nodes, same output. Host `messages` are trusted here exactly as they are in
the Vue adapter.

## Acceptance

- `SiteFooter` and `LatereLogoMark` exported from `latere-ui/react`.
- Full variant renders brand, four link columns, prefs, social, bottom bar.
- Compact variant renders one line: copyright, link strip, prefs, social.
- Theme buttons mark the active one and fire `onThemeChange`.
- The locale `<select>` fires `onLocaleChange` and honours a custom `locales`.
- `messages` override wins over the bundled dictionary.
- `routerLink` receives a relative `to`; without it links are `baseUrl`-absolute.
- Existing Vue `tests/footer.test.ts` stays green.

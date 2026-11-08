# Security

## Reporting a vulnerability

Report one privately, through
[GitHub's private vulnerability reporting](https://github.com/latere-ai/latere-ui/security/advisories/new)
or by email to security@latere.ai. Do not open a public issue for it. The
[organization's security policy](https://github.com/latere-ai/.github/blob/main/SECURITY.md)
sets the response times, how disclosure works, and the safe harbor for
research done in good faith.

A fix ships in the next release of version 2, and the
[changelog](CHANGELOG.md) says which release has it. Version 1, the line
Vue applications stay on, has had no release since v1.37.0.

## What is protected

latere-ui runs in your page, with its origin and its permissions. What it
handles comes from your backend's answers (the signed-in person, their
organizations, the answers to switching organization and signing out), from
the page data you hand the structured data builders, and from the person
using the page. Against an answer that is malformed or names an unexpected
target, and against a value that would break out of the element it is
written into, the package commits to the following, and the named tests
check each property. Each test is named by its file and its title.

| Property | Tests |
|---|---|
| Session requests send the CSRF token from its cookie only with state-changing methods, and only to the page's own origin. A request to another site never carries it. | `tests/session-client.test.ts`: "echoes the CSRF cookie on state-changing requests only", "attaches the CSRF token only to requests for the page origin" |
| A navigation target your backend names, the redirect after switching organization or after signing out, is followed only when it resolves to an `http:` or `https:` address. A target with any other scheme falls back to the default path, so an answer cannot run script in your page. | `tests/session-me-core.test.ts`: "does not follow a redirect that is not an http(s) address"; `tests/front-channel-logout.test.ts`: "does not navigate to a post_logout_redirect that is not an http(s) address", "falls through to app_url when post_logout_redirect is unsafe" |
| Front-channel sign-out always leaves the page, also when the logout endpoint fails or answers with something other than the expected object. | `tests/front-channel-logout.test.ts`: "still navigates when the logout endpoint itself errors", "navigates to / when /api/logout answers 204 with an empty body", "navigates when front_channel_uris is a string instead of a list" |
| A successful `/me` answer that is not a principal is an error, never a signed-in person. | `tests/session-me-core.test.ts`: "throws an ApiError when a 2xx answer is not a principal", "throws when the mapped value has no string principal_id" |
| A request that answers 401 clears the signed-in person, and a `/me` answer already in flight cannot bring them back. | `src/react/__tests__/session.test.tsx`: "a mid-session 401 clears the principal and runs the silent-recheck seam", "does not let a /me answer in flight restore a principal after a mid-session 401" |
| Recovering an expired session runs the silent check once and the interactive sign-in once, then stops and reports the lost session. A backend whose `/me` succeeds while another call answers 401 cannot send the page around in a loop. | `tests/session-reauth.test.ts`: "runs the silent check, then one interactive login, then reports exhausted"; `src/react/__tests__/session.test.tsx`: "runs the silent check once, then one sign-in, then reports the lost session" |
| The account picture loads with `referrerpolicy="no-referrer"`, so the host serving it does not learn which page showed it. | `src/react/__tests__/account-menu-avatar.test.tsx`: "draws the picture in the trigger and the menu header when the principal has one" |
| Telemetry sends spans only to an endpoint on the page's origin, and adds the `traceparent` header only to requests for the page's origin. | `tests/telemetry.test.ts`: "refuses an endpoint on another origin"; `tests/telemetry-sdk.test.ts`: "sends traceparent to the page origin only" |
| Every URL telemetry records loses its query string, its fragment, and any user name and password before it leaves the browser. | `tests/telemetry-sdk.test.ts`: "cuts the query string and fragment", "removes a user name and password from the authority", "exports HTTP spans with the resource attributes and without query strings or fragments" |
| Structured data written into a `<script type="application/ld+json">` element contains no `<`, `>`, `&`, U+2028 or U+2029, so no string can end the element or open a comment, and the text parses back to the same object. | `tests/structured-data-serialize.test.ts`: "escapes every string of a … node and round-trips through JSON.parse" (one test for each builder), "uses JSON escapes, not HTML character references" |
| Every URL-valued field the structured data builders emit, in a hand-written author, publisher or translator too, is an absolute `http:` or `https:` address, and every `@id` is an absolute IRI of any scheme; otherwise the builder throws. | `tests/structured-data.test.ts`: "checks every URL-valued field and the node identifier", "refuses a hand-written author with no name or a relative url, naming the field", "refuses a hand-written publisher without a url and a translator with a bad @id" |
| A queued `confirm()` resolves only from its own dialog: pressing Confirm twice confirms one request, and the next request opens as a new dialog with focus on its first control. | `src/react/__tests__/overlay-parity.test.tsx`: "does not confirm the next queued request when Confirm is pressed twice", "starts focus on the first control of each queued request"; `tests/overlay-service-core.test.ts`: "queues requests, snapshots options and resolves each request once" |

## What is not defended

- **What your backend answers.** The signed-in person, their
  organizations and the answers to switching organization and signing out
  are used as they come, apart from the scheme check on navigation
  targets. A redirect to another `http:` or `https:` origin is followed,
  because OpenID Connect post-logout redirects often live there. Checking
  where `return_to` and post-login redirects lead is the backend's job; the
  package sends the current path or the `returnTo` you pass,
  percent-encoded and otherwise unchecked.
- **The addresses you call.** `createApiClient` fetches whatever URL you
  give it, with the page's credentials. The CSRF protection is
  double-submit: it works only when your backend compares the
  `X-CSRF-Token` header with the cookie.
- **The session cookie.** It is your backend's. The package never reads it
  and cannot clear it; signing out is a navigation to the backend. Whether
  a request from another site can reach the logout endpoint, which
  front-channel logout calls with `GET /api/logout`, is the backend's to
  defend.
- **Signing out of other applications.** Front-channel logout loads each
  application's logout address in a hidden frame with
  `sandbox="allow-same-origin"` and no scripts, so an application that
  needs script to end its session stays signed in. A browser that blocks
  third-party cookies sends no cookie to another site's frame, so
  applications on other sites may stay signed in too. The package reports
  no result for each application.
- **The re-check limit.** The silent check and the interactive sign-in are
  counted in `sessionStorage`, per tab. A new tab starts its own count, and
  where storage is unavailable the silent check is skipped.
- **Links and pictures your application supplies.** `AccountMenu`'s
  `extraItems[].href`, `dashboardPath` and the principal's `avatar_url`,
  and `DocsLayout`'s `base` and router links, are rendered as given, with
  no scheme check. React 19 blocks a script URL in `href`; React 18 only
  warns and renders it, so the same configuration behaves differently by
  React version.
- **HTML you render.** `DocsLayout` inserts `articleHtml` as HTML, so pass
  only HTML you trust. `createMarkdown` passes raw HTML in the markdown
  source through unless you set `options: { html: false }`. Links in
  markdown are filtered by markdown-it's own link validation, and what your
  `rewriteLink` returns is not checked again. Heading ids are not prefixed,
  so a heading can produce an id equal to another element's id or to a
  global name in the page; prefix them when you render text from others.
- **What telemetry records.** URL paths are recorded as they are, so an
  id, an email address or a token in a path segment is sent. The hosts of
  third-party requests and the browser's user agent are recorded too.
  `fetch` and `XMLHttpRequest` stay patched for the page's lifetime. The
  relay that receives the spans runs on your backend, which decides how it
  is authenticated and limited.
- **Hand-written structured data.** A node you write yourself is checked
  for `@type` and escaped, nothing more. The escaping is for the text of a
  script element; it does not make a string safe for an HTML attribute or
  any other context.

## Audit

latere-ui has had no external security audit.

## Supply chain

The package is not on a registry and ships as source: your application
installs a release tag from this repository and compiles the `.tsx`, `.ts`
and `.css` files with its own toolchain. A release is an annotated version
tag on `main`, with its section of the changelog as its release notes. Bun
records the commit the tag pointed at and a checksum of the archive in your
lockfile, so `bun install --frozen-lockfile` installs that commit again.
The package's runtime dependencies are the OpenTelemetry packages and
`web-vitals`, which only `latere-ui/telemetry` loads, in a chunk it fetches
after the page has loaded; React and React DOM are peers your application
provides. To check what you have:

```sh
bun audit
```

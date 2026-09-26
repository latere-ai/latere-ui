---
title: latere-ui/structured-data, schema.org JSON-LD for public pages
status: complete
depends_on: []
affects:
  - src/structured-data/index.ts (new)
  - src/structured-data/types.ts (new)
  - src/structured-data/builders.ts (new)
  - src/structured-data/validate.ts (new)
  - src/structured-data/serialize.ts (new)
  - tests/structured-data*.test.ts (new)
  - tests/visual/structured-data.spec.ts, structured-data.html, structured-data-page.ts (new)
  - package.json (exports "./structured-data", description)
  - docs/api-guide.md (Structured data section)
  - docs/README.md (integration guide row)
  - README.md (surface and import tables)
  - CHANGELOG.md (Unreleased)
effort: small
trigger: an org-wide standard makes public pages readable by search engines and AI agents; a Go package in latere.ai/x/pkg (agentweb) serves robots.txt, sitemaps, llms.txt and Markdown negotiation, and the structured data in each page's head needs one shared builder instead of hand-written JSON in every site
created: 2026-09-26
updated: 2026-09-26
author: changkun
dispatched_task_id: null
---

# latere-ui/structured-data

## Overview

A crawler or an agent that reads a page's HTML learns what the page is from
its structured data: a `<script type="application/ld+json">` element in the
head that describes the page in the schema.org vocabulary. The server half of
the machine-readable standard (robots.txt, sitemaps, llms.txt, Markdown
negotiation) is a Go package; the per-page half lives in the HTML every site
renders, which is built by several toolchains: a Bun static build, Vite SPAs,
server templates.

This spec adds a framework-neutral subpath, `latere-ui/structured-data`, with
typed builders for the schema.org types Latere's public pages use and one
serializer that turns them into a script element that is safe to embed. The
first adopters are a book site (a Book with Chapters, every page in English
and Chinese, licensed CC BY-NC-ND 4.0) and a marketing site with a blog
(Organization, WebSite, BlogPosting).

## Scope

In scope:

- Builders for `Organization`, `Person`, `WebSite`, `Book`, `Chapter`,
  `Article`, `BlogPosting` and `BreadcrumbList`.
- Build-time validation of required fields, URLs, dates and language tags.
- Serialization to the JSON text and to the script element, one node or a
  `@graph` of several, escaped for embedding in HTML.
- A DOM helper for hosts that only render in the browser.

Out of scope:

- `<link rel="alternate" hreflang>`, `<link rel="canonical">`, Open Graph and
  other meta tags. They are HTML head elements with their own rules, not
  JSON-LD.
- Microdata and RDFa.
- Checking eligibility for a particular search engine's rich results.
- Schema.org types and properties beyond the table below. The builders return
  plain objects, so a host adds a property with an object spread and the
  serializer accepts any JSON-LD node.

## Vocabulary source

Definitions were read from schema.org version 30.1 (2026-09-16), from the
published vocabulary file
(`https://schema.org/version/latest/schemaorg-current-https.jsonld`) and the
type pages:

- https://schema.org/CreativeWork
- https://schema.org/Book
- https://schema.org/Chapter
- https://schema.org/BlogPosting
- https://schema.org/Article
- https://schema.org/WebSite
- https://schema.org/Organization
- https://schema.org/Person
- https://schema.org/BreadcrumbList

Facts the design depends on:

| Term | Definition in 30.1 |
|---|---|
| `Chapter` | Subtype of `CreativeWork`: "One of the sections into which a book is divided." Defined in the bib extension (`bib.schema.org`). Its own properties are `pageStart`, `pageEnd`, `pagination`; everything else is inherited. |
| `BlogPosting` | `CreativeWork` > `Article` > `SocialMediaPosting` > `BlogPosting`. |
| `isPartOf` | Domain `CreativeWork`, range `CreativeWork` or `URL`, inverse `hasPart`. |
| `position` | Domain `CreativeWork` and `ListItem`, range `Integer` or `Text`. |
| `workTranslation` | Domain and range `CreativeWork`: "A work that is a translation of the content of this work." bib extension, inverse `translationOfWork`. |
| `translationOfWork` | Domain and range `CreativeWork`: "The work that this work has been translated from." bib extension. |
| `translator` | Domain `CreativeWork`, range `Organization` or `Person`. |
| `inLanguage` | Range `Language` or `Text`; text values are IETF BCP 47 codes. |
| `license` | Domain `CreativeWork`, range `CreativeWork` or `URL`: "typically indicated by URL". |
| `headline` | Domain `CreativeWork`, range `Text`. |
| `author`, `publisher` | Range `Organization` or `Person`. |
| `datePublished`, `dateModified` | Range `Date` or `DateTime`. |
| `image` | Range `ImageObject` or `URL`. |
| `sameAs` | Range `URL`: a page that "unambiguously indicates the item's identity". |
| `itemListElement` | `ListItem` with `position` when order matters: "The order of elements in your mark-up is not sufficient". |

## Types covered

Every builder takes one input object whose keys are the schema.org property
names, plus `'@id'` for the JSON-LD node identifier, and returns a node that
starts with `"@context": "https://schema.org"` and `"@type"`.

| Builder | `@type` | Required | Optional |
|---|---|---|---|
| `organization` | `Organization` | `name`, `url` | `@id`, `alternateName`, `description`, `logo`, `image`, `sameAs` |
| `person` | `Person` | `name` | `@id`, `url`, `description`, `image`, `sameAs` |
| `webSite` | `WebSite` | `name`, `url` | `@id`, `alternateName`, `description`, `inLanguage`, `publisher` |
| `book` | `Book` | `name`, `url` | creative work fields, `isbn`, `bookEdition`, `numberOfPages`, `hasPart` |
| `chapter` | `Chapter` | `name`, `url`, `isPartOf` | creative work fields, `position` |
| `article` | `Article` | `headline`, `url` | creative work fields, `articleSection`, `wordCount` |
| `blogPosting` | `BlogPosting` | `headline`, `url` | as `article` |
| `breadcrumbList` | `BreadcrumbList` | one or more items, each with `name`, and `url` on all but the last | none |

The creative work fields are shared by `book`, `chapter`, `article` and
`blogPosting`: `@id`, `description`, `inLanguage`, `author`, `publisher`,
`translator`, `datePublished`, `dateModified`, `image`, `license`,
`keywords`, `workTranslation` and `translationOfWork`.

A person often has no page of their own, so `person` requires `name` only;
every other builder describes a page or a site and requires `url`. Articles
take `headline` because that is the property schema.org and search engines
read for an article's title; the others take `name`.

`breadcrumbList(items)` numbers the items from 1 in the order given and emits
each as a `ListItem` with `position`, `name` and `item` (the URL). The last
item may omit its URL, since it is the page the list is on.

## Nodes and references

Two kinds of value link one node to another:

- **Parties** (`author`, `publisher`, `translator`): a node returned by
  `person` or `organization`, embedded in full, or a reference `{ "@id" }`
  to a node elsewhere on the page. `ref(node)` returns the reference of a node
  that has an `@id`.
- **Works** (`isPartOf`, `hasPart`, `workTranslation`, `translationOfWork`):
  an object with any of `@id`, `name`, `headline`, `url` and `inLanguage`, of
  which `url` or `@id` is required. A node returned by a builder is accepted
  as well. The builder reduces the value to those fields and sets its
  `@type`: `Book`
  for a chapter's `isPartOf`, `Chapter` for a book's `hasPart`, and the node's
  own type for translations, since a translated chapter is a chapter.

Embedded nodes never carry `@context`: only the top-level node, or the
`@graph` wrapper, does. The recommended `@id` is the canonical URL of the page
the node describes, with a fragment when one page describes several nodes
(`https://example.com/#organization`).

## Translations

Schema.org models a translation as a separate work in its own language, linked
to its source. The Book examples on schema.org describe each language edition
as its own node with `inLanguage` and connect them with `workTranslation` on
the source and `translationOfWork` on the translation, referring by `@id`.
This module follows that model:

- Each language version of a page is its own node with its own `url` and
  `inLanguage`.
- The source-language node lists its translations in `workTranslation`.
- Each translated node names its source in `translationOfWork`, and may name
  its `translator`.
- A chapter's `isPartOf` names the book of its own language.

Schema.org defines no property for "the same page in another language" other
than these; `sameAs` asserts identity and would state that two translations
are one work, so it is not used for them. The HTML `hreflang` alternates that
search engines use to pair language versions stay in the host's head markup.

`Chapter`, `workTranslation` and `translationOfWork` are bib extension terms.
They are part of the published vocabulary under the `https://schema.org`
context, and general-purpose parsers and agents read them; they are not among
the types search engines build rich results from, so the value of a Chapter
node is a precise description of the page, not a search feature.

## Output contract

- Builders return plain objects of strings, numbers, arrays and objects that
  survive `JSON.parse(JSON.stringify(node))` unchanged.
- Key order: `@context`, `@type`, `@id`, then properties.
- An optional field that is `undefined`, `null`, an empty string or an empty
  array is left out. No `null` is ever emitted.
- A single value stays single and an array stays an array (`author`,
  `image`, `keywords`, `sameAs`, `workTranslation`, `hasPart`).
- String values are emitted as given. A `Date` is emitted as its ISO 8601
  string (`toISOString()`).
- Inputs are not mutated.

## Validation

Output is generated at build or render time, so a mistake should fail the
build rather than publish a broken description. Builders throw a
`StructuredDataError` carrying `code`, `type` (the schema.org type being
built), `field` (the input path, such as `author[1].url`) and `value`; its
message states all of them for the build log.

| Check | Rule | `code` |
|---|---|---|
| Required text | `name` or `headline` is a string with a non-space character | `missing` |
| Required reference | `url`, `isPartOf`, and at least one breadcrumb item are present | `missing` |
| URL | `url`, `image`, `logo`, `license`, `sameAs`, breadcrumb URLs and work URLs parse as absolute `http:` or `https:` URLs | `invalid_url` |
| Node identifier | `@id` parses as an absolute IRI | `invalid_id` |
| Date | `YYYY-MM-DD` or `YYYY-MM-DDThh:mm[:ss[.fff]][Z or ±hh:mm]` naming a real calendar day, or a valid `Date` | `invalid_date` |
| Language | `Intl.getCanonicalLocales` accepts the tag; the tag is emitted as given | `invalid_language` |
| Other values | `position` is a positive integer or non-empty text; `numberOfPages` and `wordCount` are non-negative integers; a party is a Person or Organization node or `{ "@id" }`; a work has `url` or `@id` | `invalid_value` |

Relative URLs are refused because a JSON-LD consumer resolves them against a
base it may not know (an agent reading a copy, a cache), and an absolute URL
means the same thing everywhere.

## Serialization

```ts
jsonLd(data: JsonLdNode | JsonLdNode[]): string        // the JSON text
jsonLdScript(data: JsonLdNode | JsonLdNode[]): string  // the script element
```

- One node: the node, with `@context` added first when it has none.
- An array, of any length: `{ "@context": "https://schema.org", "@graph":
  [...] }`, with `@context` removed from each member that carries the
  schema.org context. An array always produces `@graph`, so the shape does
  not change when a page adds a second node. An empty array throws.
- Every node needs a `@type`; a node without one throws `invalid_value`.

The JSON text is `JSON.stringify` output with five characters replaced by
their JSON escapes:

| Character | Written as | Why |
|---|---|---|
| `<` | `\u003c` | the HTML tokenizer ends script data at `</script` and enters escape states at `<!--` |
| `>` | `\u003e` | closes `-->` and `]]>` sequences |
| `&` | `\u0026` | keeps the text inert if a host embeds it in an attribute or XHTML |
| U+2028, U+2029 | `\u2028`, `\u2029` | line terminators in JavaScript source before ES2019, so the text is also safe to inline in a script |

These characters can only occur inside JSON strings, and the escapes are
valid JSON, so `JSON.parse` of the script's text returns the original values.
HTML character references (`&lt;`) are not used: script content is raw text
and a parser would not decode them.

`jsonLdScript` returns `<script type="application/ld+json">` followed by the
JSON text and `</script>`, with no other attributes.

## Using it on a page

**Build time or server rendering.** The page's generator calls the builders
with the page's data and writes `jsonLdScript(...)` into the `<head>` of the
HTML it emits. This is the preferred path: the description is in the first
response, where every crawler and agent reads it, including those that do not
run scripts.

**Browser only.** A host that renders only in the browser calls:

```ts
mountJsonLd(data: JsonLdNode | JsonLdNode[], key = 'page'): () => void
```

It finds or creates one `<script type="application/ld+json"
data-lu-structured-data="{key}">` in `document.head`, sets its text to
`jsonLd(data)`, and returns a function that removes that element. Calling it
again with the same key replaces the text, so a router can call it on every
navigation; the removal function of the earlier call then does nothing, so a
view that unmounts after the next one mounted cannot remove its successor's
data. Without a `document` it does nothing and returns a no-op. Only
crawlers that execute scripts see data added this way, so a host that can
emit HTML at build time should.

## Dependencies and runtimes

No runtime dependencies. The module uses `JSON`, `URL`, `Date` and
`Intl.getCanonicalLocales`, available in Bun, Node 18+ and current browsers.
It does not touch the DOM except in `mountJsonLd`. `latere-ui` and
`latere-ui/react` do not import it.

## Acceptance

- `latere-ui/structured-data` exports the eight builders, `ref`, `jsonLd`,
  `jsonLdScript`, `mountJsonLd`, `StructuredDataError`, `SCHEMA_ORG` and the
  input and node types.
- Each builder emits `@context`, `@type` and the fields in the table, and
  leaves out absent optional fields.
- Missing `name`, `headline`, `url` or `isPartOf` throws `missing`; a
  relative URL throws `invalid_url`; an invalid date or language tag throws
  its code.
- Embedded parties and work references carry no `@context`; work references
  carry the `@type` described above.
- `jsonLdScript` output contains no `</script`, no `<!--` and no raw U+2028
  or U+2029 for any string field, and its inner text parses back to the
  original values.
- An array produces a `@graph` whose members carry no schema.org `@context`.
- Builders and serializers run without a DOM; `mountJsonLd` without a
  document is a no-op.

## Verification

- Unit tests per builder: output shape, required-field errors, URL, date,
  language and value errors, omitted optional fields, and a JSON round trip.
- Serializer tests: a hostile string (`</script>`, `<!--`, U+2028, U+2029) in
  a field of every builder, `@graph` output, and an empty array.
- `mountJsonLd` tests in happy-dom: create, replace by key, remove, and a
  stale removal function that leaves a later call's element in place.
- A test in the Node environment builds and serializes without a DOM.
- `tests/visual/structured-data.spec.ts` runs Chromium's HTML parser over a
  server-rendered script element holding hostile strings in text and URL
  fields: no injected script runs, the head holds exactly the elements
  written, and the element's text parses back to the graph. A browser-only
  fixture page checks that `mountJsonLd` keeps one element per key across a
  navigation and removes it.

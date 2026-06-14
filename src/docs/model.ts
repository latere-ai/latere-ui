// Headless docs model: the grouped-document information architecture every
// product's in-app docs already reinvent — categories of pages, a flattened
// order for prev/next, and a flat search index for the command palette.
//
// Shape mirrors the model proven in production (e.g. the document-intelligence
// console's CATEGORIES: `{ id, label, icon?, advanced?, pages: [{ slug, title }] }`
// + a flattened list for lookup/prev-next + a searchable index). No DOM, no
// markdown, no framework — DocsLayout.vue renders this; any harness can too.

/** A single documentation page within a group. */
export interface DocPage {
  /** Stable, URL-safe id (unique within its group). */
  slug: string;
  /** Display title. */
  title: string;
  /** Optional badge rendered next to the title (count or 'live'). */
  badge?: number | 'live';
  /** Mark as advanced/internal so hosts can visually de-emphasize or gate it. */
  advanced?: boolean;
}

/** A labeled category of pages. */
export interface DocGroup {
  /** Stable id; part of the URL (`<base>/<group.id>/<page.slug>`). */
  id: string;
  /** Section heading. */
  label: string;
  /** Icon name passed through to the host's icon slot. */
  icon?: string;
  /** Mark the whole group advanced/internal. */
  advanced?: boolean;
  pages: DocPage[];
}

/** A page lifted out of its group, carrying group context + global position. */
export interface FlatDoc extends DocPage {
  groupId: string;
  groupLabel: string;
  /** Zero-based position in the flattened, in-order list. */
  index: number;
}

/** One row of the searchable index (palette / full-text). */
export interface DocSearchEntry {
  slug: string;
  title: string;
  groupId: string;
  groupLabel: string;
  /** Route built from `docPath`. */
  path: string;
  /** Optional pre-rendered plain-text body for full-text search. */
  text?: string;
}

/** Flatten groups into one in-order list, tagging group + global index. */
export function flattenDocs(groups: DocGroup[]): FlatDoc[] {
  const out: FlatDoc[] = [];
  for (const g of groups) {
    for (const p of g.pages) {
      out.push({ ...p, groupId: g.id, groupLabel: g.label, index: out.length });
    }
  }
  return out;
}

/**
 * Resolve a page by group + slug. When `groupId` is omitted, the first page
 * with a matching slug across all groups wins (slugs are usually unique).
 */
export function findDoc(
  groups: DocGroup[],
  slug: string,
  groupId?: string,
): FlatDoc | null {
  const flat = flattenDocs(groups);
  return (
    flat.find(
      (d) => d.slug === slug && (groupId === undefined || d.groupId === groupId),
    ) ?? null
  );
}

/** Previous/next page in the flattened reading order (null at the ends). */
export function adjacentDocs(
  groups: DocGroup[],
  slug: string,
  groupId?: string,
): { prev: FlatDoc | null; next: FlatDoc | null } {
  const flat = flattenDocs(groups);
  const i = flat.findIndex(
    (d) => d.slug === slug && (groupId === undefined || d.groupId === groupId),
  );
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i < flat.length - 1 ? flat[i + 1] : null,
  };
}

/** Build a route for a page: `<base>/<groupId>/<slug>` (base defaults to ''). */
export function docPath(groupId: string, slug: string, base = ''): string {
  const prefix = base.replace(/\/$/, '');
  return `${prefix}/${groupId}/${slug}`;
}

/**
 * Build the flat search index. `getText(doc)` optionally supplies a plain-text
 * body for full-text search; omit it for title-only search.
 */
export function buildDocSearchIndex(
  groups: DocGroup[],
  opts: { base?: string; getText?: (doc: FlatDoc) => string } = {},
): DocSearchEntry[] {
  return flattenDocs(groups).map((d) => ({
    slug: d.slug,
    title: d.title,
    groupId: d.groupId,
    groupLabel: d.groupLabel,
    path: docPath(d.groupId, d.slug, opts.base),
    text: opts.getText?.(d),
  }));
}

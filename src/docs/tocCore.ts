// Headless table-of-contents + scroll-spy primitive for the docs article pane.
// `scan(container)` extracts the heading outline (assigning stable slug ids to
// headings that lack one) and wires an IntersectionObserver so `activeId`
// tracks the heading currently in view. SSR-safe: without `document` /
// `IntersectionObserver` it degrades to a no-op that still returns the outline
// when a container is passed in a browser-like test env.


export interface TocItem {
  /** The heading element's id (assigned if it had none). */
  id: string;
  /** Trimmed text content. */
  text: string;
  /** Heading level (2 for h2, 3 for h3, …). */
  level: number;
}

export interface TocOptions {
  /** Heading levels to include. Default: `[2, 3]`. */
  levels?: number[];
  /** IntersectionObserver rootMargin. Default biases toward the top. */
  rootMargin?: string;
}

export interface TocSnapshot { items: TocItem[]; activeId: string; }
export interface TocCore {
  getSnapshot: () => TocSnapshot;
  scan: (container: HTMLElement | null) => TocItem[];
  setActive: (id: string) => void;
  dispose: () => void;
}

/** Turn heading text into a URL-safe, unique-within-doc slug. */
export function slugify(text: string, used?: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  if (!used) return base;
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/**
 * Visible text of a heading's inline token, the source string the id scheme
 * slugifies. It is the token-level equivalent of `element.textContent`, which
 * is what `scan()` slugifies from the DOM: one id scheme, two representations
 * of the same text. `inline.content` is the raw markdown source and must not
 * be used — it carries link URLs, image paths, and markup characters that the
 * reader never sees.
 *
 * Images are skipped explicitly: markdown-it puts a heading image's alt text
 * in `token.content`, so a default text branch would fold alt text into the id
 * while the rendered `<img>` contributes nothing to `textContent`.
 */
export function headingSlugSource(inline: { children?: { type: string; content: string }[] | null }): string {
  const children = inline.children;
  if (!children) return '';
  let out = '';
  for (const t of children) {
    if (t.type === 'text' || t.type === 'code_inline') out += t.content;
    else if (t.type === 'softbreak' || t.type === 'hardbreak') out += ' ';
  }
  return out;
}

const hasDom = (): boolean =>
  typeof document !== 'undefined' && typeof window !== 'undefined';

export function createTocCore(opts: TocOptions = {}, onChange: (state: TocSnapshot) => void = () => {}): TocCore {
  const levels = opts.levels ?? [2, 3];
  const rootMargin = opts.rootMargin ?? '0px 0px -70% 0px';

  let state: TocSnapshot = { items: [], activeId: '' };
  function publish(items: TocItem[], activeId: string) { state = { items, activeId }; onChange(state); }
  let observer: IntersectionObserver | null = null;

  function dispose() {
    observer?.disconnect();
    observer = null;
  }

  function scan(container: HTMLElement | null): TocItem[] {
    dispose();
    if (!container || !hasDom()) { publish([], ''); return []; }

    const selector = levels.map((l) => `h${l}`).join(',');
    if (!selector) { publish([], ''); return []; }
    const headings = Array.from(
      container.querySelectorAll<HTMLElement>(selector),
    );
    const used = new Set<string>();
    const out: TocItem[] = [];
    for (const h of headings) {
      const text = (h.textContent ?? '').trim();
      if (!text) continue;
      let id = h.id;
      if (!id) {
        id = slugify(text, used);
        h.id = id;
      } else {
        used.add(id);
      }
      out.push({ id, text, level: Number(h.tagName.slice(1)) });
    }
    publish(out, out[0]?.id ?? '');

    if (typeof IntersectionObserver !== 'undefined' && out.length) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && e.target.id) {
              setActive(e.target.id);
            }
          }
        },
        { rootMargin },
      );
      for (const h of headings) {
        if (h.id) observer.observe(h);
      }
    }
    return out;
  }

  function setActive(id: string) {
    publish(state.items, id);
  }

  return { getSnapshot: () => state, scan, setActive, dispose };
}

// Base markdown-it configuration shared by the docs renderer. latere-ui does
// NOT depend on markdown-it: the host injects its own constructor (like the
// routerLink injection pattern), so docs-free consumers pay nothing and every
// consumer pins one markdown-it version. The shared value here is the heading
// id scheme — it uses the SAME slugify as the TOC primitive, so heading anchors
// and the on-this-page TOC always agree — plus opt-in link rewriting.
//
// App-specific concerns (mermaid fences, light/dark image rewriting,
// `[[diagram:name]]` mounts) stay in each app, applied via DocsLayout's
// `enhance` hook over the rendered DOM.

import type MarkdownIt from 'markdown-it';
import type { Options as MarkdownItOptions } from 'markdown-it';

import { headingSlugSource, slugify } from './toc';

export interface MarkdownConfig {
  /** markdown-it options, merged over the defaults (html+linkify on). */
  options?: MarkdownItOptions;
  /**
   * Rewrite a link href at render time, e.g. `./output.md` → `/docs/output`.
   * Return `null`/`undefined` to leave the href unchanged.
   */
  rewriteLink?: (href: string) => string | null | undefined;
  /** Heading levels that receive auto ids. Default: `[2, 3, 4]`. */
  headingLevels?: number[];
}

/** Add `id` attributes to headings, matching the TOC's slugify exactly. */
function addHeadingIds(md: MarkdownIt, levels: number[]): void {
  const tags = new Set(levels.map((l) => `h${l}`));
  md.core.ruler.push('latere_heading_ids', (state) => {
    const used = new Set<string>();
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type !== 'heading_open' || !tags.has(t.tag)) continue;
      const inline = tokens[i + 1];
      const text = inline ? headingSlugSource(inline) : '';
      if (!text) continue;
      if (t.attrIndex('id') < 0) t.attrSet('id', slugify(text, used));
      else used.add(t.attrGet('id') ?? '');
    }
  });
}

/** Wrap the link_open renderer so hrefs pass through `rewriteLink`. */
function addLinkRewrite(
  md: MarkdownIt,
  rewrite: NonNullable<MarkdownConfig['rewriteLink']>,
): void {
  const fallback = md.renderer.rules.link_open
    ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hi = token.attrIndex('href');
    if (hi >= 0 && token.attrs) {
      const next = rewrite(token.attrs[hi][1]);
      if (next != null) token.attrs[hi][1] = next;
    }
    return fallback(tokens, idx, options, env, self);
  };
}

/**
 * Build a markdown-it instance with the shared docs config. The host supplies
 * the constructor: `createMarkdown(MarkdownIt, { rewriteLink })`.
 */
export function createMarkdown(
  MarkdownItCtor: typeof MarkdownIt,
  config: MarkdownConfig = {},
): MarkdownIt {
  const md = new MarkdownItCtor({
    html: true,
    linkify: true,
    breaks: false,
    ...config.options,
  });
  addHeadingIds(md, config.headingLevels ?? [2, 3, 4]);
  if (config.rewriteLink) addLinkRewrite(md, config.rewriteLink);
  return md;
}

/**
 * Drop a leading H1 from the source so DocsLayout can render the page title
 * itself without it appearing twice in the body.
 */
export function stripFirstHeading(src: string): string {
  return src.replace(/^\s*#\s+.*(?:\r?\n)?/, '');
}

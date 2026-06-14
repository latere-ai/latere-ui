import { describe, expect, it } from 'vitest';
import MarkdownIt from 'markdown-it';

import { createMarkdown, stripFirstHeading } from '../src/docs/markdown';
import { slugify } from '../src/docs/toc';

describe('createMarkdown()', () => {
  it('assigns heading ids using the same slugify as the TOC', () => {
    const md = createMarkdown(MarkdownIt);
    const html = md.render('## Getting Started\n\ntext\n\n### Sub Section');
    expect(html).toContain(`<h2 id="${slugify('Getting Started')}">`);
    expect(html).toContain(`<h3 id="${slugify('Sub Section')}">`);
  });

  it('disambiguates duplicate heading slugs', () => {
    const md = createMarkdown(MarkdownIt);
    const html = md.render('## Setup\n\n## Setup');
    expect(html).toContain('id="setup"');
    expect(html).toContain('id="setup-2"');
  });

  it('respects headingLevels (h4 off by default config override)', () => {
    const md = createMarkdown(MarkdownIt, { headingLevels: [2] });
    const html = md.render('## Two\n\n### Three');
    expect(html).toContain('<h2 id="two">');
    expect(html).toContain('<h3>Three</h3>'); // no id at h3
  });

  it('rewrites link hrefs through rewriteLink', () => {
    const md = createMarkdown(MarkdownIt, {
      rewriteLink: (href) => (href.endsWith('.md') ? `/docs/${href.replace(/\.md$/, '')}` : undefined),
    });
    const html = md.render('[next](output.md) and [ext](https://x.test)');
    expect(html).toContain('href="/docs/output"');
    expect(html).toContain('href="https://x.test"'); // untouched
  });
});

describe('stripFirstHeading()', () => {
  it('removes a leading H1 and keeps the rest', () => {
    expect(stripFirstHeading('# Title\n\nBody')).toBe('\nBody');
  });
  it('leaves content without a leading H1 untouched', () => {
    expect(stripFirstHeading('Intro\n\n# Later')).toBe('Intro\n\n# Later');
  });
});

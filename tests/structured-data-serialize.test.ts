// Serialization of structured data: the escaped JSON text, the script
// element, the @graph form, and the DOM helper for browser-only hosts.
import { afterEach, describe, expect, it } from 'vitest';

import {
  SCHEMA_ORG,
  StructuredDataError,
  article,
  blogPosting,
  book,
  breadcrumbList,
  chapter,
  jsonLd,
  jsonLdScript,
  mountJsonLd,
  organization,
  person,
  webSite,
  type JsonLdNode,
} from '../src/structured-data/index';

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
// A value that would end the script element, open an HTML comment, or break
// a JavaScript string if it reached the page unescaped.
const hostile = `x</script><script>alert(1)</script><!-- & ]]> ${LS}${PS} </SCRIPT >`;
const hostileUrl = 'https://example.com/a</script><!--';

const open = '<script type="application/ld+json">';
const close = '</script>';

// inner returns the text between the script tags, checking the wrapper.
function inner(script: string): string {
  expect(script.startsWith(open)).toBe(true);
  expect(script.endsWith(close)).toBe(true);
  return script.slice(open.length, -close.length);
}

function expectInert(text: string) {
  expect(text.toLowerCase()).not.toContain('</script');
  expect(text).not.toContain('<!--');
  expect(text).not.toContain('<');
  expect(text).not.toContain('>');
  expect(text).not.toContain('&');
  expect(text).not.toContain(LS);
  expect(text).not.toContain(PS);
}

const author = person({ name: hostile, url: hostileUrl, description: hostile });
const publisher = organization({ name: hostile, url: 'https://example.com/', description: hostile, logo: hostileUrl });

// One node per builder, each carrying the hostile string in its text fields,
// its URL fields and a nested node.
const nodes: Record<string, JsonLdNode> = {
  organization: publisher,
  person: author,
  webSite: webSite({ name: hostile, url: hostileUrl, description: hostile, publisher }),
  book: book({ name: hostile, url: hostileUrl, author, keywords: [hostile], hasPart: [{ url: hostileUrl, name: hostile }] }),
  chapter: chapter({ name: hostile, url: hostileUrl, isPartOf: { url: hostileUrl, name: hostile }, position: hostile, author }),
  article: article({ headline: hostile, url: hostileUrl, publisher, articleSection: hostile }),
  blogPosting: blogPosting({ headline: hostile, url: hostileUrl, author: [author], workTranslation: { url: hostileUrl, headline: hostile } }),
  breadcrumbList: breadcrumbList([{ name: hostile, url: hostileUrl }, { name: hostile }]),
};

describe('jsonLdScript', () => {
  for (const [builder, node] of Object.entries(nodes)) {
    it(`escapes every string of a ${builder} node and round-trips through JSON.parse`, () => {
      const text = inner(jsonLdScript(node));
      expectInert(text);
      expect(JSON.parse(text)).toStrictEqual(node);
    });
  }

  it('uses JSON escapes, not HTML character references', () => {
    const text = jsonLd(person({ name: `<>&${LS}${PS}` }));
    expect(text).toContain(String.raw`"name":"\u003c\u003e\u0026\u2028\u2029"`);
    expect(text).not.toContain('&lt;');
  });

  it('adds the schema.org context to a hand-written node and keeps its own otherwise', () => {
    expect(JSON.parse(jsonLd({ '@type': 'Thing', name: 'x' }))).toStrictEqual({ '@context': SCHEMA_ORG, '@type': 'Thing', name: 'x' });
    const own = { '@context': { '@vocab': 'https://schema.org/' }, '@type': 'Thing', name: 'x' };
    expect(JSON.parse(jsonLd(own))).toStrictEqual(own);
    expect(Object.keys(JSON.parse(jsonLd({ name: 'x', '@type': 'Thing' })))[0]).toBe('@context');
  });

  it('accepts a builder node extended with a spread and drops nulls from it', () => {
    const extended = { ...book({ name: 'Book', url: 'https://book.example.com/' }), abridged: false, illustrator: null, genre: [undefined, 'Nonfiction'] };
    expect(JSON.parse(jsonLd(extended))).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'Book',
      name: 'Book',
      url: 'https://book.example.com/',
      abridged: false,
      genre: ['Nonfiction'],
    });
  });

  it('keeps Date values as JSON renders them in hand-written nodes', () => {
    const when = new Date(Date.UTC(2026, 8, 26));
    expect(JSON.parse(jsonLd({ '@type': 'Event', startDate: when })).startDate).toBe('2026-09-26T00:00:00.000Z');
  });

  it('refuses a node without a type', () => {
    for (const value of [{ name: 'x' }, { '@type': '' }, { '@type': [] }, { '@type': ['Book', 3] }, 'Book', null]) {
      let caught: unknown;
      try {
        jsonLd(value as JsonLdNode);
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(StructuredDataError);
      expect((caught as StructuredDataError).code).toBe('invalid_value');
      expect((caught as StructuredDataError).type).toBe('jsonLd');
    }
    expect(JSON.parse(jsonLd({ '@type': ['Book', 'Product'], name: 'x' }))['@type']).toEqual(['Book', 'Product']);
  });
});

describe('@graph', () => {
  it('wraps several nodes in one context and strips theirs', () => {
    const org = organization({ '@id': 'https://example.com/#organization', name: 'Example', url: 'https://example.com/' });
    const site = webSite({ name: 'Example', url: 'https://example.com/', publisher: { '@id': 'https://example.com/#organization' } });
    const foreign = { '@context': 'https://example.org/vocab', '@type': 'Widget' };
    const parsed = JSON.parse(inner(jsonLdScript([org, site, foreign])));
    expect(Object.keys(parsed)).toEqual(['@context', '@graph']);
    expect(parsed['@context']).toBe(SCHEMA_ORG);
    expect(parsed['@graph']).toStrictEqual([
      { '@type': 'Organization', '@id': 'https://example.com/#organization', name: 'Example', url: 'https://example.com/' },
      { '@type': 'WebSite', name: 'Example', url: 'https://example.com/', publisher: { '@id': 'https://example.com/#organization' } },
      // A member in another vocabulary keeps its own context.
      foreign,
    ]);
  });

  it('uses the graph form for a one-node array and escapes its members', () => {
    const parsed = JSON.parse(inner(jsonLdScript([nodes.chapter])));
    expect(parsed['@graph']).toHaveLength(1);
    expectInert(jsonLd(Object.values(nodes)));
    const { '@context': _context, ...member } = nodes.chapter;
    expect(parsed['@graph'][0]).toStrictEqual(member);
  });

  it('refuses an empty array and names the failing member', () => {
    let caught = (() => { try { jsonLd([]); } catch (err) { return err; } })() as StructuredDataError;
    expect(caught.code).toBe('missing');
    expect(caught.field).toBe('@graph');
    caught = (() => { try { jsonLd([nodes.person, { name: 'untyped' } as unknown as JsonLdNode]); } catch (err) { return err; } })() as StructuredDataError;
    expect(caught.code).toBe('invalid_value');
    expect(caught.field).toBe('@graph[1].@type');
  });
});

describe('mountJsonLd', () => {
  const scripts = () => Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));

  afterEach(() => {
    for (const element of scripts()) element.remove();
  });

  it('places one script per key in the head and replaces its text', () => {
    const post = blogPosting({ headline: 'First', url: 'https://example.com/blog/first' });
    mountJsonLd(post);
    expect(scripts()).toHaveLength(1);
    expect(JSON.parse(scripts()[0].textContent ?? '')).toStrictEqual(post);

    const next = blogPosting({ headline: 'Second', url: 'https://example.com/blog/second' });
    mountJsonLd(next);
    expect(scripts()).toHaveLength(1);
    expect(JSON.parse(scripts()[0].textContent ?? '').headline).toBe('Second');

    mountJsonLd(organization({ name: 'Example', url: 'https://example.com/' }), 'site');
    expect(scripts()).toHaveLength(2);
    expect(scripts().map((element) => element.getAttribute('data-lu-structured-data'))).toEqual(['page', 'site']);
  });

  it('removes its element, unless a later call with the same key replaced it', () => {
    const first = mountJsonLd(person({ name: 'First' }));
    const second = mountJsonLd(person({ name: 'Second' }));
    first();
    expect(scripts()).toHaveLength(1);
    expect(JSON.parse(scripts()[0].textContent ?? '').name).toBe('Second');
    second();
    expect(scripts()).toHaveLength(0);
    second();
    expect(scripts()).toHaveLength(0);
  });

  it('leaves unrelated JSON-LD in the head alone', () => {
    const other = document.createElement('script');
    other.setAttribute('type', 'application/ld+json');
    other.textContent = '{"@type":"Thing"}';
    document.head.appendChild(other);
    const remove = mountJsonLd(person({ name: 'Ada' }));
    expect(scripts()).toHaveLength(2);
    remove();
    expect(scripts()).toEqual([other]);
  });

  it('validates before touching the document', () => {
    expect(() => mountJsonLd([])).toThrow(StructuredDataError);
    expect(scripts()).toHaveLength(0);
  });
});

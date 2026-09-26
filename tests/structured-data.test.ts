// Builder output shapes and build-time validation for latere-ui/structured-data.
// Assertions read codes, types and fields, never error prose.
import { describe, expect, it } from 'vitest';

import {
  SCHEMA_ORG,
  StructuredDataError,
  article,
  blogPosting,
  book,
  breadcrumbList,
  chapter,
  organization,
  person,
  ref,
  webSite,
  type StructuredDataErrorCode,
} from '../src/structured-data/index';

const license = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';

// expectError runs build and checks the thrown StructuredDataError by its
// machine-readable fields.
function expectError(build: () => unknown, code: StructuredDataErrorCode, type: string, field: string) {
  let caught: unknown;
  try {
    build();
  } catch (err) {
    caught = err;
  }
  expect(caught).toBeInstanceOf(StructuredDataError);
  const err = caught as StructuredDataError;
  expect({ code: err.code, type: err.type, field: err.field }).toEqual({ code, type, field });
  expect(err.name).toBe('StructuredDataError');
  expect(err.message).toContain(`${type}.${field}`);
}

// Casts let the tests pass what a caller without type checking could pass.
const loose = <T>(value: unknown) => value as T;

const author = person({ name: 'Ada Example', url: 'https://example.com/ada', sameAs: ['https://code.example.com/ada'] });
const publisher = organization({
  '@id': 'https://example.com/#organization',
  name: 'Example',
  url: 'https://example.com/',
  logo: 'https://example.com/logo.png',
});

describe('organization', () => {
  it('emits the context, type and given fields in order', () => {
    const node = organization({
      '@id': 'https://example.com/#organization',
      name: 'Example',
      url: 'https://example.com/',
      alternateName: 'Example Inc.',
      description: 'Makes examples.',
      logo: 'https://example.com/logo.png',
      image: 'https://example.com/office.jpg',
      sameAs: ['https://code.example.com/example', 'https://social.example.com/example'],
    });
    expect(node).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'Organization',
      '@id': 'https://example.com/#organization',
      name: 'Example',
      url: 'https://example.com/',
      alternateName: 'Example Inc.',
      description: 'Makes examples.',
      logo: 'https://example.com/logo.png',
      image: 'https://example.com/office.jpg',
      sameAs: ['https://code.example.com/example', 'https://social.example.com/example'],
    });
    expect(Object.keys(node).slice(0, 3)).toEqual(['@context', '@type', '@id']);
  });

  it('leaves out absent optional fields instead of emitting nulls', () => {
    const node = organization({
      name: 'Example',
      url: 'https://example.com/',
      description: '',
      logo: loose<string>(null),
      sameAs: [],
      image: undefined,
    });
    expect(node).toStrictEqual({ '@context': SCHEMA_ORG, '@type': 'Organization', name: 'Example', url: 'https://example.com/' });
  });

  it('requires a name and an absolute url', () => {
    expectError(() => organization(loose({ url: 'https://example.com/' })), 'missing', 'Organization', 'name');
    expectError(() => organization({ name: '   ', url: 'https://example.com/' }), 'missing', 'Organization', 'name');
    expectError(() => organization(loose({ name: 7, url: 'https://example.com/' })), 'invalid_value', 'Organization', 'name');
    expectError(() => organization(loose({ name: 'Example' })), 'missing', 'Organization', 'url');
    expectError(() => organization({ name: 'Example', url: '/about' }), 'invalid_url', 'Organization', 'url');
    expectError(() => organization({ name: 'Example', url: 'javascript:alert(1)' }), 'invalid_url', 'Organization', 'url');
    expectError(() => organization(loose({ name: 'Example', url: 42 })), 'invalid_url', 'Organization', 'url');
  });

  it('checks every URL-valued field and the node identifier', () => {
    const base = { name: 'Example', url: 'https://example.com/' };
    expectError(() => organization({ ...base, logo: 'logo.png' }), 'invalid_url', 'Organization', 'logo');
    expectError(() => organization({ ...base, sameAs: ['https://ok.example.com/', '//cdn.example.com/x'] }), 'invalid_url', 'Organization', 'sameAs[1]');
    expectError(() => organization({ ...base, '@id': '#organization' }), 'invalid_id', 'Organization', '@id');
    expectError(() => organization(loose({ ...base, description: 3 })), 'invalid_value', 'Organization', 'description');
  });

  it('refuses a missing input object', () => {
    expectError(() => organization(loose(undefined)), 'invalid_value', 'Organization', 'input');
    expectError(() => person(loose([])), 'invalid_value', 'Person', 'input');
  });
});

describe('person', () => {
  it('requires a name only, since a person may have no page', () => {
    expect(person({ name: 'Ada Example' })).toStrictEqual({ '@context': SCHEMA_ORG, '@type': 'Person', name: 'Ada Example' });
    expect(author).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'Person',
      name: 'Ada Example',
      url: 'https://example.com/ada',
      sameAs: ['https://code.example.com/ada'],
    });
    expectError(() => person(loose({})), 'missing', 'Person', 'name');
    expectError(() => person({ name: 'Ada', url: 'example.com/ada' }), 'invalid_url', 'Person', 'url');
  });

  it('accepts an IRI that is not a web URL as @id', () => {
    expect(person({ '@id': 'urn:uuid:5f1d1f7e-0000-4000-8000-000000000000', name: 'Ada' })['@id']).toBe('urn:uuid:5f1d1f7e-0000-4000-8000-000000000000');
  });
});

describe('webSite', () => {
  it('emits a site with a publisher reference', () => {
    const node = webSite({
      '@id': 'https://example.com/#website',
      name: 'Example',
      url: 'https://example.com/',
      alternateName: 'EX',
      inLanguage: 'en',
      publisher: ref(publisher),
    });
    expect(node).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'WebSite',
      '@id': 'https://example.com/#website',
      name: 'Example',
      url: 'https://example.com/',
      alternateName: 'EX',
      inLanguage: 'en',
      publisher: { '@id': 'https://example.com/#organization' },
    });
  });

  it('embeds a publisher node without its context', () => {
    const node = webSite({ name: 'Example', url: 'https://example.com/', publisher });
    expect(node.publisher).toStrictEqual({
      '@type': 'Organization',
      '@id': 'https://example.com/#organization',
      name: 'Example',
      url: 'https://example.com/',
      logo: 'https://example.com/logo.png',
    });
  });

  it('requires a name and url and a valid language tag', () => {
    expectError(() => webSite(loose({ url: 'https://example.com/' })), 'missing', 'WebSite', 'name');
    expectError(() => webSite(loose({ name: 'Example' })), 'missing', 'WebSite', 'url');
    expectError(() => webSite({ name: 'Example', url: 'https://example.com/', inLanguage: 'english please' }), 'invalid_language', 'WebSite', 'inLanguage');
    expectError(() => webSite(loose({ name: 'Example', url: 'https://example.com/', inLanguage: 1 })), 'invalid_language', 'WebSite', 'inLanguage');
  });
});

describe('book', () => {
  it('emits a book with license, language, translation and chapters', () => {
    const node = book({
      '@id': 'https://book.example.com/en/',
      name: 'An Example Book',
      url: 'https://book.example.com/en/',
      description: 'A book about examples.',
      inLanguage: 'en',
      author,
      publisher: ref(publisher),
      datePublished: '2026-06-01',
      dateModified: '2026-09-20T08:30:00Z',
      image: ['https://book.example.com/cover.png'],
      license,
      keywords: ['examples', 'systems'],
      isbn: '978-0-00-000000-0',
      bookEdition: '2nd',
      numberOfPages: 320,
      workTranslation: { '@id': 'https://book.example.com/zh/', name: '示例之书', url: 'https://book.example.com/zh/', inLanguage: 'zh-CN' },
      hasPart: [
        { url: 'https://book.example.com/en/intro/', name: 'Introduction' },
        { url: 'https://book.example.com/en/scheduling/', name: 'Scheduling' },
      ],
    });
    expect(node).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'Book',
      '@id': 'https://book.example.com/en/',
      name: 'An Example Book',
      url: 'https://book.example.com/en/',
      description: 'A book about examples.',
      inLanguage: 'en',
      author: { '@type': 'Person', name: 'Ada Example', url: 'https://example.com/ada', sameAs: ['https://code.example.com/ada'] },
      publisher: { '@id': 'https://example.com/#organization' },
      datePublished: '2026-06-01',
      dateModified: '2026-09-20T08:30:00Z',
      image: ['https://book.example.com/cover.png'],
      license,
      keywords: ['examples', 'systems'],
      workTranslation: { '@type': 'Book', '@id': 'https://book.example.com/zh/', name: '示例之书', url: 'https://book.example.com/zh/', inLanguage: 'zh-CN' },
      isbn: '978-0-00-000000-0',
      bookEdition: '2nd',
      numberOfPages: 320,
      hasPart: [
        { '@type': 'Chapter', name: 'Introduction', url: 'https://book.example.com/en/intro/' },
        { '@type': 'Chapter', name: 'Scheduling', url: 'https://book.example.com/en/scheduling/' },
      ],
    });
  });

  it('requires a name and url and checks its own fields', () => {
    expectError(() => book(loose({ url: 'https://book.example.com/' })), 'missing', 'Book', 'name');
    expectError(() => book(loose({ name: 'Book' })), 'missing', 'Book', 'url');
    expectError(() => book({ name: 'Book', url: 'https://book.example.com/', numberOfPages: 12.5 }), 'invalid_value', 'Book', 'numberOfPages');
    expectError(() => book({ name: 'Book', url: 'https://book.example.com/', numberOfPages: -1 }), 'invalid_value', 'Book', 'numberOfPages');
    expectError(() => book({ name: 'Book', url: 'https://book.example.com/', hasPart: [{ name: 'No link' }] }), 'invalid_value', 'Book', 'hasPart[0]');
    expectError(() => book({ name: 'Book', url: 'https://book.example.com/', license: 'CC BY-NC-ND 4.0' }), 'invalid_url', 'Book', 'license');
  });
});

describe('chapter', () => {
  const zhChapter = chapter({
    '@id': 'https://book.example.com/zh/scheduling/',
    name: '调度',
    url: 'https://book.example.com/zh/scheduling/',
    inLanguage: 'zh-CN',
    isPartOf: { '@id': 'https://book.example.com/zh/', name: '示例之书', url: 'https://book.example.com/zh/' },
    position: 3,
    license,
    translator: person({ name: 'Bo Example' }),
    translationOfWork: { '@id': 'https://book.example.com/en/scheduling/', url: 'https://book.example.com/en/scheduling/', inLanguage: 'en' },
  });

  it('emits the book as a Book reference with the chapter position', () => {
    const englishBook = book({ '@id': 'https://book.example.com/en/', name: 'An Example Book', url: 'https://book.example.com/en/', inLanguage: 'en', author, license });
    const node = chapter({
      name: 'Scheduling',
      url: 'https://book.example.com/en/scheduling/',
      inLanguage: 'en',
      isPartOf: englishBook,
      position: 3,
      author,
      license,
      workTranslation: zhChapter,
    });
    expect(node).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'Chapter',
      name: 'Scheduling',
      url: 'https://book.example.com/en/scheduling/',
      inLanguage: 'en',
      author: { '@type': 'Person', name: 'Ada Example', url: 'https://example.com/ada', sameAs: ['https://code.example.com/ada'] },
      license,
      // A full node passed as a reference is reduced to what identifies it.
      workTranslation: {
        '@type': 'Chapter',
        '@id': 'https://book.example.com/zh/scheduling/',
        name: '调度',
        url: 'https://book.example.com/zh/scheduling/',
        inLanguage: 'zh-CN',
      },
      isPartOf: {
        '@type': 'Book',
        '@id': 'https://book.example.com/en/',
        name: 'An Example Book',
        url: 'https://book.example.com/en/',
        inLanguage: 'en',
      },
      position: 3,
    });
  });

  it('names its source on a translated chapter', () => {
    expect(zhChapter.translationOfWork).toStrictEqual({
      '@type': 'Chapter',
      '@id': 'https://book.example.com/en/scheduling/',
      url: 'https://book.example.com/en/scheduling/',
      inLanguage: 'en',
    });
    expect(zhChapter.translator).toStrictEqual({ '@type': 'Person', name: 'Bo Example' });
    expect(zhChapter.isPartOf['@type']).toBe('Book');
  });

  it('takes text positions for appendices and refuses others', () => {
    const base = { name: 'Appendix', url: 'https://book.example.com/en/a/', isPartOf: { url: 'https://book.example.com/en/' } };
    expect(chapter({ ...base, position: 'A' }).position).toBe('A');
    expect(chapter(base)).not.toHaveProperty('position');
    expectError(() => chapter({ ...base, position: 0 }), 'invalid_value', 'Chapter', 'position');
    expectError(() => chapter({ ...base, position: 1.5 }), 'invalid_value', 'Chapter', 'position');
    expectError(() => chapter({ ...base, position: ' ' }), 'invalid_value', 'Chapter', 'position');
  });

  it('requires a name, url and the book it is part of', () => {
    const isPartOf = { url: 'https://book.example.com/en/' };
    expectError(() => chapter(loose({ url: 'https://book.example.com/en/x/', isPartOf })), 'missing', 'Chapter', 'name');
    expectError(() => chapter(loose({ name: 'X', isPartOf })), 'missing', 'Chapter', 'url');
    expectError(() => chapter(loose({ name: 'X', url: 'https://book.example.com/en/x/' })), 'missing', 'Chapter', 'isPartOf');
    expectError(() => chapter({ name: 'X', url: 'https://book.example.com/en/x/', isPartOf: {} }), 'invalid_value', 'Chapter', 'isPartOf');
    expectError(() => chapter(loose({ name: 'X', url: 'https://book.example.com/en/x/', isPartOf: 'https://book.example.com/en/' })), 'invalid_value', 'Chapter', 'isPartOf');
    expectError(() => chapter({ name: 'X', url: 'https://book.example.com/en/x/', isPartOf: { url: '/en/' } }), 'invalid_url', 'Chapter', 'isPartOf.url');
    expectError(() => chapter({ name: 'X', url: 'https://book.example.com/en/x/', isPartOf: { '@id': 'book' } }), 'invalid_id', 'Chapter', 'isPartOf.@id');
    expectError(() => chapter({ name: 'X', url: 'https://book.example.com/en/x/', isPartOf: { url: 'https://book.example.com/en/', inLanguage: 'no such tag' } }), 'invalid_language', 'Chapter', 'isPartOf.inLanguage');
  });
});

describe('article and blogPosting', () => {
  const input = {
    headline: 'Shipping structured data',
    url: 'https://example.com/blog/structured-data',
    description: 'How pages describe themselves.',
    author: [author, person({ name: 'Bo Example' })],
    publisher,
    datePublished: new Date('2026-09-26T09:00:00Z'),
    dateModified: '2026-09-26',
    image: 'https://example.com/blog/structured-data.png',
    keywords: 'json-ld, schema.org',
    articleSection: 'Engineering',
    wordCount: 1200,
  };

  it('emits a BlogPosting with author, publisher and dates', () => {
    expect(blogPosting(input)).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'BlogPosting',
      headline: 'Shipping structured data',
      url: 'https://example.com/blog/structured-data',
      description: 'How pages describe themselves.',
      author: [
        { '@type': 'Person', name: 'Ada Example', url: 'https://example.com/ada', sameAs: ['https://code.example.com/ada'] },
        { '@type': 'Person', name: 'Bo Example' },
      ],
      publisher: { '@type': 'Organization', '@id': 'https://example.com/#organization', name: 'Example', url: 'https://example.com/', logo: 'https://example.com/logo.png' },
      datePublished: '2026-09-26T09:00:00.000Z',
      dateModified: '2026-09-26',
      image: 'https://example.com/blog/structured-data.png',
      keywords: 'json-ld, schema.org',
      articleSection: 'Engineering',
      wordCount: 1200,
    });
  });

  it('shares the shape with Article and translates within its own type', () => {
    const node = article({ ...input, workTranslation: [{ url: 'https://example.com/de/blog/structured-data', inLanguage: 'de', headline: 'Strukturierte Daten' }] });
    expect(node['@type']).toBe('Article');
    expect(node.workTranslation).toStrictEqual([
      { '@type': 'Article', headline: 'Strukturierte Daten', url: 'https://example.com/de/blog/structured-data', inLanguage: 'de' },
    ]);
  });

  it('requires a headline and url', () => {
    expectError(() => blogPosting(loose({ url: 'https://example.com/blog/x' })), 'missing', 'BlogPosting', 'headline');
    expectError(() => article(loose({ headline: 'X' })), 'missing', 'Article', 'url');
    expectError(() => blogPosting({ headline: 'X', url: 'https://example.com/blog/x', wordCount: -3 }), 'invalid_value', 'BlogPosting', 'wordCount');
    expectError(() => blogPosting({ headline: 'X', url: 'https://example.com/blog/x', keywords: ['ok', ''] }), 'missing', 'BlogPosting', 'keywords[1]');
  });

  it('checks parties', () => {
    const base = { headline: 'X', url: 'https://example.com/blog/x' };
    expectError(() => blogPosting(loose({ ...base, author: 'Ada Example' })), 'invalid_value', 'BlogPosting', 'author');
    expectError(() => blogPosting(loose({ ...base, author: [author, { '@type': 'Book', name: 'Nope' }] })), 'invalid_value', 'BlogPosting', 'author[1].@type');
    expectError(() => blogPosting(loose({ ...base, publisher: { name: 'No type or id' } })), 'invalid_value', 'BlogPosting', 'publisher');
    expectError(() => blogPosting(loose({ ...base, publisher: { '@id': 'organization' } })), 'invalid_id', 'BlogPosting', 'publisher.@id');
    expectError(() => blogPosting(loose({ ...base, translator: [{ '@id': 'https://example.com/#t' }, 5] })), 'invalid_value', 'BlogPosting', 'translator[1]');
  });
});

describe('dates', () => {
  const at = (datePublished: unknown) => article(loose({ headline: 'X', url: 'https://example.com/x', datePublished }));

  it('accepts ISO 8601 dates and date-times, and Date objects', () => {
    for (const value of ['2026-09-26', '2024-02-29', '2026-09-26T09:00', '2026-09-26T09:00:30', '2026-09-26T09:00:30.123Z', '2026-09-26T09:00:30+02:00']) {
      expect(at(value).datePublished).toBe(value);
    }
    expect(at(new Date(Date.UTC(2026, 8, 26))).datePublished).toBe('2026-09-26T00:00:00.000Z');
  });

  it('refuses other formats and days that do not exist', () => {
    for (const value of ['26.09.2026', '2026-9-26', '2026-02-30', '2025-02-29', '1900-02-29', '2026-13-01', '2026-09-26T24:00', '2026-09-26 09:00', 'yesterday', 20260926, new Date('not a date')]) {
      expectError(() => at(value), 'invalid_date', 'Article', 'datePublished');
    }
  });
});

describe('breadcrumbList', () => {
  it('numbers items from 1 and lets the last item omit its url', () => {
    expect(breadcrumbList([
      { name: 'Example', url: 'https://example.com/' },
      { name: 'Blog', url: 'https://example.com/blog/' },
      { name: 'Shipping structured data' },
    ])).toStrictEqual({
      '@context': SCHEMA_ORG,
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Example', item: 'https://example.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://example.com/blog/' },
        { '@type': 'ListItem', position: 3, name: 'Shipping structured data' },
      ],
    });
  });

  it('requires items, names, and urls on all but the last item', () => {
    expectError(() => breadcrumbList([]), 'missing', 'BreadcrumbList', 'items');
    expectError(() => breadcrumbList(loose(undefined)), 'missing', 'BreadcrumbList', 'items');
    expectError(() => breadcrumbList([{ name: 'Home' }, { name: 'Page' }]), 'missing', 'BreadcrumbList', 'items[0].url');
    expectError(() => breadcrumbList([{ name: 'Home', url: 'https://example.com/' }, loose({})]), 'missing', 'BreadcrumbList', 'items[1].name');
    expectError(() => breadcrumbList([loose(null), { name: 'Page' }]), 'invalid_value', 'BreadcrumbList', 'items[0]');
    expectError(() => breadcrumbList([{ name: 'Home', url: 'https://example.com/' }, { name: 'Page', url: 'page' }]), 'invalid_url', 'BreadcrumbList', 'items[1].url');
  });
});

describe('ref', () => {
  it('returns the @id reference of a node and requires one', () => {
    expect(ref(publisher)).toStrictEqual({ '@id': 'https://example.com/#organization' });
    expectError(() => ref(author), 'missing', 'Person', '@id');
    expectError(() => ref(loose(undefined)), 'invalid_value', 'ref', 'input');
  });
});

describe('purity', () => {
  it('does not mutate its input and returns JSON-serializable nodes', () => {
    const input = { name: 'Scheduling', url: 'https://book.example.com/en/scheduling/', isPartOf: { url: 'https://book.example.com/en/' }, author, position: 3 };
    const before = JSON.stringify(input);
    const node = chapter(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(JSON.parse(JSON.stringify(node))).toStrictEqual(node);
    expect(author['@context']).toBe(SCHEMA_ORG);
  });
});

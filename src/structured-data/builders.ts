// Builders for the schema.org types Latere's public pages describe. Each one
// validates its input, stamps `@context` and `@type`, and returns a plain
// JSON-serializable object with absent optional fields left out.

import type {
  ArticleInput,
  ArticleNode,
  BlogPostingNode,
  BookInput,
  BookNode,
  BreadcrumbItem,
  BreadcrumbListNode,
  ChapterInput,
  ChapterNode,
  CreativeWorkInput,
  NodeRef,
  OrganizationInput,
  OrganizationNode,
  PartyValue,
  PersonInput,
  PersonNode,
  WebSiteInput,
  WebSiteNode,
  WorkRefValue,
} from './types';
import { Checker, SCHEMA_ORG, absent, isObject, prune, withoutContext } from './validate';

// start returns the checker for one node and refuses a missing input object,
// which only a caller without type checking can pass.
function start(type: string, input: unknown): Checker {
  const check: Checker = new Checker(type);
  if (!isObject(input)) check.fail('invalid_value', 'input', input, 'must be an object');
  return check;
}

// A party is embedded in full when it is a Person or Organization node, and
// emitted as a bare reference when it only carries an `@id`.
function party(check: Checker, field: string, value: unknown): PartyValue {
  if (!isObject(value)) check.fail('invalid_value', field, value, 'must be a Person or Organization node or an {"@id"} reference');
  const type = value['@type'];
  if (type === undefined) {
    const id = check.optId(`${field}.@id`, value['@id']);
    if (id === undefined) check.fail('invalid_value', field, value, 'must be a Person or Organization node or an {"@id"} reference');
    return { '@id': id } satisfies NodeRef;
  }
  if (type !== 'Person' && type !== 'Organization') {
    check.fail('invalid_value', `${field}.@type`, type, 'must be "Person" or "Organization"');
  }
  return prune(withoutContext(value)) as PartyValue;
}

// A work reference keeps only what identifies the work and sets the type the
// relation implies, so a full node passed as a reference does not repeat
// itself inside the page's description.
function work<T extends string>(check: Checker, field: string, value: unknown, type: T): WorkRefValue<T> {
  if (!isObject(value)) check.fail('invalid_value', field, value, 'must be an object with a url or an @id');
  const id = check.optId(`${field}.@id`, value['@id']);
  const url = check.optUrl(`${field}.url`, value.url);
  if (id === undefined && url === undefined) check.fail('invalid_value', field, value, 'must have a url or an @id');
  return prune({
    '@type': type,
    '@id': id,
    name: check.optText(`${field}.name`, value.name),
    headline: check.optText(`${field}.headline`, value.headline),
    url,
    inLanguage: check.optLanguage(`${field}.inLanguage`, value.inLanguage),
  });
}

// The fields every creative work shares, in the order they are emitted after
// the type's own name or headline. A translation has the same type as the
// work it translates.
function creativeWork<T extends string>(check: Checker, type: T, input: CreativeWorkInput) {
  return {
    url: check.url('url', input.url),
    description: check.optText('description', input.description),
    inLanguage: check.optLanguage('inLanguage', input.inLanguage),
    author: check.many('author', input.author, (f, v) => party(check, f, v)),
    publisher: absent(input.publisher) ? undefined : party(check, 'publisher', input.publisher),
    translator: check.many('translator', input.translator, (f, v) => party(check, f, v)),
    datePublished: check.optDate('datePublished', input.datePublished),
    dateModified: check.optDate('dateModified', input.dateModified),
    image: check.optUrls('image', input.image),
    license: check.optUrl('license', input.license),
    keywords: check.optTexts('keywords', input.keywords),
    workTranslation: check.many('workTranslation', input.workTranslation, (f, v) => work(check, f, v, type)),
    translationOfWork: absent(input.translationOfWork)
      ? undefined
      : work(check, 'translationOfWork', input.translationOfWork, type),
  };
}

/** organization describes a company or group: required `name` and `url`. */
export function organization(input: OrganizationInput): OrganizationNode {
  const check: Checker = start('Organization', input);
  return prune({
    '@context': SCHEMA_ORG,
    '@type': 'Organization',
    '@id': check.optId('@id', input['@id']),
    name: check.text('name', input.name),
    url: check.url('url', input.url),
    alternateName: check.optText('alternateName', input.alternateName),
    description: check.optText('description', input.description),
    logo: check.optUrl('logo', input.logo),
    image: check.optUrls('image', input.image),
    sameAs: check.optUrls('sameAs', input.sameAs),
  }) as OrganizationNode;
}

/** person describes an author or other individual: required `name`. */
export function person(input: PersonInput): PersonNode {
  const check: Checker = start('Person', input);
  return prune({
    '@context': SCHEMA_ORG,
    '@type': 'Person',
    '@id': check.optId('@id', input['@id']),
    name: check.text('name', input.name),
    url: check.optUrl('url', input.url),
    description: check.optText('description', input.description),
    image: check.optUrls('image', input.image),
    sameAs: check.optUrls('sameAs', input.sameAs),
  }) as PersonNode;
}

/** webSite describes a site as a whole: required `name` and `url`. */
export function webSite(input: WebSiteInput): WebSiteNode {
  const check: Checker = start('WebSite', input);
  return prune({
    '@context': SCHEMA_ORG,
    '@type': 'WebSite',
    '@id': check.optId('@id', input['@id']),
    name: check.text('name', input.name),
    url: check.url('url', input.url),
    alternateName: check.optText('alternateName', input.alternateName),
    description: check.optText('description', input.description),
    inLanguage: check.optLanguage('inLanguage', input.inLanguage),
    publisher: absent(input.publisher) ? undefined : party(check, 'publisher', input.publisher),
  }) as WebSiteNode;
}

/** book describes a book, one node per language: required `name` and `url`. */
export function book(input: BookInput): BookNode {
  const check: Checker = start('Book', input);
  return prune({
    '@context': SCHEMA_ORG,
    '@type': 'Book',
    '@id': check.optId('@id', input['@id']),
    name: check.text('name', input.name),
    ...creativeWork(check, 'Book', input),
    isbn: check.optText('isbn', input.isbn),
    bookEdition: check.optText('bookEdition', input.bookEdition),
    numberOfPages: check.optCount('numberOfPages', input.numberOfPages),
    hasPart: check.many('hasPart', input.hasPart, (f, v) => work(check, f, v, 'Chapter')),
  }) as BookNode;
}

/**
 * chapter describes one chapter page: required `name`, `url` and `isPartOf`,
 * the book it belongs to, emitted as a Book reference.
 */
export function chapter(input: ChapterInput): ChapterNode {
  const check: Checker = start('Chapter', input);
  if (absent(input.isPartOf)) check.fail('missing', 'isPartOf', input.isPartOf, 'is required');
  return prune({
    '@context': SCHEMA_ORG,
    '@type': 'Chapter',
    '@id': check.optId('@id', input['@id']),
    name: check.text('name', input.name),
    ...creativeWork(check, 'Chapter', input),
    isPartOf: work(check, 'isPartOf', input.isPartOf, 'Book'),
    position: check.optPosition('position', input.position),
  }) as ChapterNode;
}

function articleOf<T extends 'Article' | 'BlogPosting'>(type: T, input: ArticleInput): ArticleNode<T> {
  const check: Checker = start(type, input);
  return prune({
    '@context': SCHEMA_ORG,
    '@type': type,
    '@id': check.optId('@id', input['@id']),
    headline: check.text('headline', input.headline),
    ...creativeWork(check, type, input),
    articleSection: check.optTexts('articleSection', input.articleSection),
    wordCount: check.optCount('wordCount', input.wordCount),
  }) as ArticleNode<T>;
}

/** article describes an article page: required `headline` and `url`. */
export function article(input: ArticleInput): ArticleNode {
  return articleOf('Article', input);
}

/** blogPosting describes a blog post: required `headline` and `url`. */
export function blogPosting(input: ArticleInput): BlogPostingNode {
  return articleOf('BlogPosting', input);
}

/**
 * breadcrumbList describes the trail from the site's top to the current
 * page. Items are numbered from 1 in the order given; every item needs a
 * `name`, and all but the last need a `url`.
 */
export function breadcrumbList(items: readonly BreadcrumbItem[]): BreadcrumbListNode {
  const check: Checker = new Checker('BreadcrumbList');
  if (!Array.isArray(items) || items.length === 0) check.fail('missing', 'items', items, 'needs at least one item');
  return {
    '@context': SCHEMA_ORG,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((step, i) => {
      const field = `items[${i}]`;
      if (!isObject(step)) check.fail('invalid_value', field, step, 'must be an object with a name');
      const last = i === items.length - 1;
      return prune({
        '@type': 'ListItem' as const,
        position: i + 1,
        name: check.text(`${field}.name`, step.name),
        item: last ? check.optUrl(`${field}.url`, step.url) : check.url(`${field}.url`, step.url),
      });
    }),
  };
}

/** ref returns the `{ "@id" }` reference to a node, which must have an `@id`. */
export function ref(node: { '@id'?: string; '@type'?: unknown }): NodeRef {
  const check: Checker = start(typeof node?.['@type'] === 'string' ? node['@type'] : 'ref', node);
  const id = check.optId('@id', node['@id']);
  if (id === undefined) check.fail('missing', '@id', node['@id'], 'is required to reference the node');
  return { '@id': id };
}

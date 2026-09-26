// Input and output shapes of the schema.org builders. Input keys are the
// schema.org property names, plus `@id` for the JSON-LD node identifier, so
// a node returned by one builder can be passed where another expects a
// reference without renaming anything.

import type { SCHEMA_ORG } from './validate';

/** One value or several; arrays are emitted as arrays. */
export type OneOrMany<T> = T | readonly T[];

/** An ISO 8601 date (`2026-09-26`) or date-time string, or a Date. */
export type DateInput = string | Date;

/** A reference to a node described elsewhere on the page. */
export interface NodeRef {
  '@id': string;
}

/**
 * A node the serializers accept: the output of a builder, or any object with
 * a `@type`, such as a builder's output extended with an object spread.
 */
export type JsonLdNode =
  | OrganizationNode
  | PersonNode
  | WebSiteNode
  | BookNode
  | ChapterNode
  | ArticleNode
  | BlogPostingNode
  | BreadcrumbListNode
  | { '@type': string | readonly string[]; [key: string]: unknown };

interface NodeBase<T extends string> {
  '@context': typeof SCHEMA_ORG;
  '@type': T;
  '@id'?: string;
}

/** A node as embedded in another node: no `@context`. */
export type Embedded<N> = Omit<N, '@context'>;

/** A person or organization for `author`, `publisher` and `translator`. */
export type Party = PersonNode | OrganizationNode | NodeRef;

/** How a party appears inside the node that names it. */
export type PartyValue = Embedded<PersonNode> | Embedded<OrganizationNode> | NodeRef;

/**
 * A reference to another creative work, for `isPartOf`, `hasPart`,
 * `workTranslation` and `translationOfWork`. `url` or `@id` is required. A
 * node returned by a builder is accepted and reduced to these fields.
 */
export interface WorkRef {
  '@id'?: string;
  name?: string;
  headline?: string;
  url?: string;
  inLanguage?: string;
}

/** A work reference as emitted: the reduced fields plus the work's `@type`. */
export interface WorkRefValue<T extends string> extends WorkRef {
  '@type': T;
}

export interface OrganizationInput {
  '@id'?: string;
  name: string;
  /** Absolute URL of the organization's site. */
  url: string;
  alternateName?: string;
  description?: string;
  /** Absolute URL of the logo image. */
  logo?: string;
  image?: OneOrMany<string>;
  /** Profiles that identify the organization, such as its code host or social accounts. */
  sameAs?: OneOrMany<string>;
}

export interface OrganizationNode extends NodeBase<'Organization'> {
  name: string;
  url: string;
  alternateName?: string;
  description?: string;
  logo?: string;
  image?: string | string[];
  sameAs?: string | string[];
}

export interface PersonInput {
  '@id'?: string;
  name: string;
  /** Absolute URL of the person's own page, when there is one. */
  url?: string;
  description?: string;
  image?: OneOrMany<string>;
  sameAs?: OneOrMany<string>;
}

export interface PersonNode extends NodeBase<'Person'> {
  name: string;
  url?: string;
  description?: string;
  image?: string | string[];
  sameAs?: string | string[];
}

export interface WebSiteInput {
  '@id'?: string;
  name: string;
  /** Absolute URL of the site's home page. */
  url: string;
  alternateName?: string;
  description?: string;
  inLanguage?: string;
  publisher?: Party;
}

export interface WebSiteNode extends NodeBase<'WebSite'> {
  name: string;
  url: string;
  alternateName?: string;
  description?: string;
  inLanguage?: string;
  publisher?: PartyValue;
}

/** Fields every creative work builder (book, chapter, article, blog post) takes. */
export interface CreativeWorkInput {
  '@id'?: string;
  /** Absolute URL of the page that presents the work. */
  url: string;
  description?: string;
  /** BCP 47 language tag of the content, such as `en` or `zh-CN`. */
  inLanguage?: string;
  author?: OneOrMany<Party>;
  publisher?: Party;
  translator?: OneOrMany<Party>;
  datePublished?: DateInput;
  dateModified?: DateInput;
  image?: OneOrMany<string>;
  /** Absolute URL of the license, such as a Creative Commons deed. */
  license?: string;
  keywords?: OneOrMany<string>;
  /** Translations of this work, on the source-language node. */
  workTranslation?: OneOrMany<WorkRef>;
  /** The work this one was translated from, on a translated node. */
  translationOfWork?: WorkRef;
}

interface CreativeWorkFields<T extends string> {
  url: string;
  description?: string;
  inLanguage?: string;
  author?: PartyValue | PartyValue[];
  publisher?: PartyValue;
  translator?: PartyValue | PartyValue[];
  datePublished?: string;
  dateModified?: string;
  image?: string | string[];
  license?: string;
  keywords?: string | string[];
  workTranslation?: WorkRefValue<T> | WorkRefValue<T>[];
  translationOfWork?: WorkRefValue<T>;
}

export interface BookInput extends CreativeWorkInput {
  name: string;
  isbn?: string;
  bookEdition?: string;
  numberOfPages?: number;
  /** The book's chapters, emitted as Chapter references. */
  hasPart?: OneOrMany<WorkRef>;
}

export interface BookNode extends NodeBase<'Book'>, CreativeWorkFields<'Book'> {
  name: string;
  isbn?: string;
  bookEdition?: string;
  numberOfPages?: number;
  hasPart?: WorkRefValue<'Chapter'> | WorkRefValue<'Chapter'>[];
}

export interface ChapterInput extends CreativeWorkInput {
  name: string;
  /** The book this chapter belongs to, emitted as a Book reference. */
  isPartOf: WorkRef;
  /** Place in the book: a chapter number, or text such as "A" for an appendix. */
  position?: number | string;
}

export interface ChapterNode extends NodeBase<'Chapter'>, CreativeWorkFields<'Chapter'> {
  name: string;
  isPartOf: WorkRefValue<'Book'>;
  position?: number | string;
}

export interface ArticleInput extends CreativeWorkInput {
  headline: string;
  articleSection?: OneOrMany<string>;
  wordCount?: number;
}

export interface ArticleNode<T extends 'Article' | 'BlogPosting' = 'Article'> extends NodeBase<T>, CreativeWorkFields<T> {
  headline: string;
  articleSection?: string | string[];
  wordCount?: number;
}

export type BlogPostingNode = ArticleNode<'BlogPosting'>;

/** One step of a breadcrumb trail. The last step, the current page, may omit `url`. */
export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface ListItemValue {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface BreadcrumbListNode extends NodeBase<'BreadcrumbList'> {
  itemListElement: ListItemValue[];
}

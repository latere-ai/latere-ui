// latere-ui/structured-data: schema.org JSON-LD for a page's head.
//
// Builders validate a page's data and return plain schema.org nodes; the
// serializers turn one node or a @graph of several into JSON text escaped
// for HTML. Framework-neutral and dependency-free, so a static build, a
// server template and a browser-only app share one description of a page.

export {
  organization,
  person,
  webSite,
  book,
  chapter,
  article,
  blogPosting,
  breadcrumbList,
  ref,
} from './builders';
export { jsonLd, jsonLdScript, mountJsonLd } from './serialize';
export { SCHEMA_ORG, StructuredDataError } from './validate';
export type { StructuredDataErrorCode } from './validate';
export type {
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
  DateInput,
  Embedded,
  JsonLdNode,
  ListItemValue,
  NodeRef,
  OneOrMany,
  OrganizationInput,
  OrganizationNode,
  Party,
  PartyValue,
  PersonInput,
  PersonNode,
  WebSiteInput,
  WebSiteNode,
  WorkRef,
  WorkRefValue,
} from './types';

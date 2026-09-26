// Serialization of JSON-LD nodes for a page's head: the JSON text, the
// script element that carries it, and a DOM helper for hosts that only
// render in the browser.

import type { JsonLdNode } from './types';
import { Checker, SCHEMA_ORG, isObject, prune, withoutContext, type PlainObject } from './validate';

// Script content is raw text: the HTML tokenizer does not decode character
// references there, and it ends the element at "</script" and changes state
// at "<!--". Replacing these characters with their JSON escapes keeps the
// text inert in HTML and leaves JSON.parse results unchanged. They can only
// occur inside JSON strings, so a global replace never touches structure.
// U+2028 and U+2029 are line terminators in JavaScript source before ES2019,
// so the text also stays valid when inlined into a script.
const unsafe = /[<>&\u2028\u2029]/g;
const escapes: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

function node(check: Checker, field: string, value: unknown): PlainObject {
  if (!isObject(value)) check.fail('invalid_value', field, value, 'must be a JSON-LD node object');
  const type = value['@type'];
  const typed = typeof type === 'string'
    ? type.trim() !== ''
    : Array.isArray(type) && type.length > 0 && type.every((t) => typeof t === 'string' && t.trim() !== '');
  if (!typed) check.fail('invalid_value', `${field}.@type`, type, 'must be a schema.org type name');
  return prune(value);
}

// toDocument builds the top-level JSON-LD object. One node keeps its own
// context, or gets schema.org first; an array of any length becomes a @graph
// under one schema.org context, so the shape does not depend on how many
// nodes a page happens to have.
function toDocument(data: JsonLdNode | readonly JsonLdNode[]): PlainObject {
  const check: Checker = new Checker('jsonLd');
  if (Array.isArray(data)) {
    if (data.length === 0) check.fail('missing', '@graph', data, 'needs at least one node');
    return {
      '@context': SCHEMA_ORG,
      '@graph': data.map((item, i) => withoutContext(node(check, `@graph[${i}]`, item))),
    };
  }
  const { '@context': context, ...rest } = node(check, 'node', data);
  return { '@context': context ?? SCHEMA_ORG, ...rest };
}

/**
 * jsonLd returns the JSON-LD text for one node, or a `@graph` of several,
 * escaped so it can be placed inside a `<script>` element or set as its text.
 */
export function jsonLd(data: JsonLdNode | readonly JsonLdNode[]): string {
  return JSON.stringify(toDocument(data)).replace(unsafe, (c) => escapes[c]);
}

/**
 * jsonLdScript returns the `<script type="application/ld+json">` element
 * for one node, or a `@graph` of several, ready to write into a page's head.
 */
export function jsonLdScript(data: JsonLdNode | readonly JsonLdNode[]): string {
  return `<script type="application/ld+json">${jsonLd(data)}</script>`;
}

const keyAttribute = 'data-lu-structured-data';

// owners records which mountJsonLd call last wrote each element, so the
// cleanup of an earlier call cannot remove data a later call placed.
const owners = new WeakMap<Element, object>();

/**
 * mountJsonLd places the JSON-LD for `data` in `document.head`, in one
 * script element per `key`, and returns a function that removes it. Calling
 * it again with the same key replaces the element's text; the cleanup of the
 * earlier call then does nothing. Without a document it does nothing.
 *
 * Only crawlers that run scripts see data placed this way; a page that can
 * be built or rendered on the server should write `jsonLdScript` instead.
 */
export function mountJsonLd(data: JsonLdNode | readonly JsonLdNode[], key = 'page'): () => void {
  const text = jsonLd(data);
  const doc = globalThis.document;
  if (!doc?.head) return () => {};
  let element = Array.from(doc.head.querySelectorAll('script[type="application/ld+json"]'))
    .find((candidate) => candidate.getAttribute(keyAttribute) === key);
  if (!element) {
    element = doc.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute(keyAttribute, key);
    doc.head.appendChild(element);
  }
  element.textContent = text;
  const owned = element;
  const token = {};
  owners.set(owned, token);
  return () => {
    if (owners.get(owned) === token) {
      owners.delete(owned);
      owned.remove();
    }
  };
}

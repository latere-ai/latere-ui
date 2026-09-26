// Build-time checks shared by the builders and the serializer. Structured
// data is generated when a page is built or rendered, so an invalid value is
// a programming error in the page's data and is thrown, never emitted.

/** The JSON-LD context every node is expressed in. */
export const SCHEMA_ORG = 'https://schema.org';

/**
 * Machine-readable reason for a StructuredDataError:
 * - `missing`: a required field is absent or empty.
 * - `invalid_url`: a URL field is not an absolute http(s) URL.
 * - `invalid_id`: an `@id` is not an absolute IRI.
 * - `invalid_date`: a date is neither ISO 8601 nor a valid Date.
 * - `invalid_language`: `inLanguage` is not a BCP 47 language tag.
 * - `invalid_value`: any other value of the wrong shape.
 */
export type StructuredDataErrorCode =
  | 'missing'
  | 'invalid_url'
  | 'invalid_id'
  | 'invalid_date'
  | 'invalid_language'
  | 'invalid_value';

/** Thrown by the builders and serializers for invalid input. */
export class StructuredDataError extends Error {
  /** Why the value was refused. */
  readonly code: StructuredDataErrorCode;
  /** The schema.org type being built, or `jsonLd` for the serializer. */
  readonly type: string;
  /** Input path of the refused value, such as `url` or `author[1].url`. */
  readonly field: string;
  /** The refused value as given. */
  readonly value: unknown;

  constructor(code: StructuredDataErrorCode, type: string, field: string, value: unknown, expected: string) {
    super(`structured-data: ${type}.${field} ${expected}, got ${show(value)} (${code})`);
    this.name = 'StructuredDataError';
    this.code = code;
    this.type = type;
    this.field = field;
    this.value = value;
  }
}

function show(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value.length > 80 ? `${value.slice(0, 77)}...` : value);
  if (isDate(value)) return String(value);
  try {
    const text = JSON.stringify(value);
    if (text === undefined) return String(value);
    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
  } catch {
    return String(value);
  }
}

export type PlainObject = Record<string, unknown>;

/** isObject reports a plain object literal, not an array, Date or class instance. */
export function isObject(value: unknown): value is PlainObject {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

/** absent treats undefined, null and the empty string as "not given". */
export function absent(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function isIri(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ISO 8601 calendar date, optionally followed by a time of day with optional
// seconds, fraction and offset. The day is checked against the month below,
// because Date.parse rolls 2026-02-30 over into March.
const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/;

function isCalendarDay(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= days;
}

/**
 * Checker validates the fields of one node. `type` names the schema.org type
 * in every error it throws, so a build log points at the node and the field.
 */
export class Checker {
  constructor(readonly type: string) {}

  fail(code: StructuredDataErrorCode, field: string, value: unknown, expected: string): never {
    throw new StructuredDataError(code, this.type, field, value, expected);
  }

  /** A required text field with at least one non-space character. */
  text(field: string, value: unknown): string {
    if (absent(value)) this.fail('missing', field, value, 'is required');
    if (typeof value !== 'string') this.fail('invalid_value', field, value, 'must be text');
    if (value.trim() === '') this.fail('missing', field, value, 'is required');
    return value;
  }

  optText(field: string, value: unknown): string | undefined {
    if (absent(value)) return undefined;
    if (typeof value !== 'string') this.fail('invalid_value', field, value, 'must be text');
    return value;
  }

  optTexts(field: string, value: unknown): string | string[] | undefined {
    return this.many(field, value, (f, v) => this.text(f, v));
  }

  /** A required absolute http(s) URL. */
  url(field: string, value: unknown): string {
    if (absent(value)) this.fail('missing', field, value, 'is required');
    if (typeof value !== 'string' || !isHttpUrl(value)) {
      this.fail('invalid_url', field, value, 'must be an absolute http(s) URL');
    }
    return value;
  }

  optUrl(field: string, value: unknown): string | undefined {
    return absent(value) ? undefined : this.url(field, value);
  }

  optUrls(field: string, value: unknown): string | string[] | undefined {
    return this.many(field, value, (f, v) => this.url(f, v));
  }

  optId(field: string, value: unknown): string | undefined {
    if (absent(value)) return undefined;
    if (typeof value !== 'string' || !isIri(value)) this.fail('invalid_id', field, value, 'must be an absolute IRI');
    return value;
  }

  /** An ISO 8601 date or date-time string, or a valid Date as its ISO string. */
  optDate(field: string, value: unknown): string | undefined {
    if (absent(value)) return undefined;
    if (isDate(value)) {
      if (Number.isNaN(value.getTime())) this.fail('invalid_date', field, value, 'must be a valid Date');
      return value.toISOString();
    }
    const match = typeof value === 'string' ? isoDate.exec(value) : null;
    if (!match || !isCalendarDay(Number(match[1]), Number(match[2]), Number(match[3]))) {
      this.fail('invalid_date', field, value, 'must be an ISO 8601 date or date-time');
    }
    return value as string;
  }

  /** A BCP 47 language tag, emitted as given. */
  optLanguage(field: string, value: unknown): string | undefined {
    if (absent(value)) return undefined;
    if (typeof value === 'string') {
      try {
        Intl.getCanonicalLocales(value);
        return value;
      } catch {
        // Falls through to the error below.
      }
    }
    this.fail('invalid_language', field, value, 'must be a BCP 47 language tag');
  }

  optCount(field: string, value: unknown): number | undefined {
    if (absent(value)) return undefined;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      this.fail('invalid_value', field, value, 'must be a non-negative integer');
    }
    return value;
  }

  /** A position in a sequence: a positive integer, or text such as "A" or "xiii". */
  optPosition(field: string, value: unknown): number | string | undefined {
    if (absent(value)) return undefined;
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
    if (typeof value === 'string' && value.trim() !== '') return value;
    this.fail('invalid_value', field, value, 'must be a positive integer or text');
  }

  /**
   * many applies `each` to a single value or to every element of an array,
   * keeping the single or array form. An empty array counts as absent.
   */
  many<T>(field: string, value: unknown, each: (field: string, value: unknown) => T): T | T[] | undefined {
    if (absent(value)) return undefined;
    if (Array.isArray(value)) {
      if (value.length === 0) return undefined;
      return value.map((item, i) => each(`${field}[${i}]`, item));
    }
    return each(field, value);
  }
}

/**
 * prune returns a copy of a JSON-like value without undefined or null object
 * members and array elements, so a node never serializes a null.
 */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null).map((item) => prune(item)) as T;
  }
  if (isObject(value)) {
    const out: PlainObject = {};
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined && item !== null) out[key] = prune(item);
    }
    return out as T;
  }
  return value;
}

/** withoutContext drops a schema.org `@context`, which only the top level carries. */
export function withoutContext(node: PlainObject): PlainObject {
  if (node['@context'] !== SCHEMA_ORG) return node;
  const { '@context': _context, ...rest } = node;
  return rest;
}

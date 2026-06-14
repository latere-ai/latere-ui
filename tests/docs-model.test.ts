import { describe, expect, it } from 'vitest';

import {
  flattenDocs,
  findDoc,
  adjacentDocs,
  docPath,
  buildDocSearchIndex,
  type DocGroup,
} from '../src/docs/model';

const groups: DocGroup[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    icon: 'rocket',
    pages: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'quick-start', title: 'Quick start' },
    ],
  },
  {
    id: 'internals',
    label: 'Internals',
    advanced: true,
    pages: [{ slug: 'architecture', title: 'Architecture' }],
  },
];

describe('flattenDocs()', () => {
  it('flattens in order with group context and a global index', () => {
    const flat = flattenDocs(groups);
    expect(flat.map((d) => d.slug)).toEqual(['overview', 'quick-start', 'architecture']);
    expect(flat.map((d) => d.index)).toEqual([0, 1, 2]);
    expect(flat[2]).toMatchObject({ groupId: 'internals', groupLabel: 'Internals' });
  });
});

describe('findDoc()', () => {
  it('finds by slug', () => {
    expect(findDoc(groups, 'architecture')?.groupId).toBe('internals');
  });
  it('disambiguates by groupId when given', () => {
    expect(findDoc(groups, 'overview', 'internals')).toBeNull();
    expect(findDoc(groups, 'overview', 'getting-started')?.title).toBe('Overview');
  });
  it('returns null for an unknown slug', () => {
    expect(findDoc(groups, 'nope')).toBeNull();
  });
});

describe('adjacentDocs()', () => {
  it('walks the flattened order across group boundaries', () => {
    const a = adjacentDocs(groups, 'quick-start');
    expect(a.prev?.slug).toBe('overview');
    expect(a.next?.slug).toBe('architecture'); // crosses into the next group
  });
  it('returns null at the ends', () => {
    expect(adjacentDocs(groups, 'overview').prev).toBeNull();
    expect(adjacentDocs(groups, 'architecture').next).toBeNull();
  });
  it('returns nulls for an unknown slug', () => {
    expect(adjacentDocs(groups, 'nope')).toEqual({ prev: null, next: null });
  });
});

describe('docPath()', () => {
  it('builds <base>/<group>/<slug> and trims a trailing slash on base', () => {
    expect(docPath('internals', 'architecture')).toBe('/internals/architecture');
    expect(docPath('internals', 'architecture', '/docs')).toBe('/docs/internals/architecture');
    expect(docPath('internals', 'architecture', '/docs/')).toBe('/docs/internals/architecture');
  });
});

describe('buildDocSearchIndex()', () => {
  it('produces a flat index with paths and optional text', () => {
    const idx = buildDocSearchIndex(groups, {
      base: '/docs',
      getText: (d) => `body of ${d.slug}`,
    });
    expect(idx).toHaveLength(3);
    expect(idx[0]).toMatchObject({
      slug: 'overview',
      groupLabel: 'Getting started',
      path: '/docs/getting-started/overview',
      text: 'body of overview',
    });
  });
  it('omits text when no getText is supplied', () => {
    expect(buildDocSearchIndex(groups)[0].text).toBeUndefined();
  });
});

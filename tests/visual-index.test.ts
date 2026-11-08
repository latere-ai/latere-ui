import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderVisualIndex } from './visual/write-index';

describe('visual reference index', () => {
  it('is what the generator writes', () => {
    expect(readFileSync('docs/visual-reference.md', 'utf8')).toBe(renderVisualIndex());
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/console.css'), 'utf8');

describe('console.css', () => {
  it('imports the shared brand partial for wordmark gradients', () => {
    expect(css).toMatch(/@import\s+['"]\.\/brand\.css['"]/);
  });

  it('shrinks an AccountMenu foot to its avatar when collapsed (fits the 64px rail)', () => {
    // Regression guard: without this rule the account control overflows the
    // collapsed rail into the main content (caught during the lux pilot).
    expect(css).toMatch(/\[data-collapsed="true"\][^}]*\.lu-cs-foot[\s\S]*\.lu-am-id/);
  });
});

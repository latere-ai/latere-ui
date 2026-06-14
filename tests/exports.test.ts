import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

// The package.json `exports` map is the shipped public surface. Its CSS
// entrypoints (latere-ui/console, /docs, /brand, …) are referenced only as
// strings, so a typo would ship broken with no other test catching it. Assert
// every subpath target actually exists on disk.
const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
) as { exports: Record<string, string> };

describe('package.json exports', () => {
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    it(`"${subpath}" -> ${target} exists`, () => {
      expect(existsSync(resolve(process.cwd(), target))).toBe(true);
    });
  }
});

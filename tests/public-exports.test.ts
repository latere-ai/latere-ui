// The console's icon component and the identity helpers are public in both
// entrypoints, so a host can draw a built-in icon, such as the row menu's
// ellipsis or the admin shield, the way the sidebar does.
import { describe, expect, it } from 'vitest';

import * as vue from '../src/index';
import * as react from '../src/react/index';

describe('public exports', () => {
  it('exposes ConsoleIcon and the identity helpers to Vue and React hosts', () => {
    for (const entry of [vue, react] as Record<string, unknown>[]) {
      expect(entry.ConsoleIcon).toBeDefined();
      expect(typeof entry.identityLine).toBe('function');
      expect(typeof entry.identityParts).toBe('function');
    }
  });
});

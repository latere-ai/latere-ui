// The identity helpers and the icon data are public in both entrypoints, so
// a host can state the role and the account as the account menu does and
// draw a built-in icon, such as a row menu's ellipsis or the admin shield.
import { describe, expect, it } from 'vitest';

import * as vue from '../src/index';
import * as react from '../src/react/index';

describe('public exports', () => {
  it('exposes the identity helpers and the console icons to Vue and React hosts', () => {
    for (const entry of [vue, react] as Record<string, unknown>[]) {
      expect(typeof entry.identityLine).toBe('function');
      expect(typeof entry.identityParts).toBe('function');
      expect(typeof entry.consoleIcon).toBe('function');
      expect(Object.keys(entry.CONSOLE_ICONS as object)).toEqual(expect.arrayContaining(['shield', 'more', 'info', 'check-circle', 'alert-triangle', 'x-circle']));
    }
  });
});

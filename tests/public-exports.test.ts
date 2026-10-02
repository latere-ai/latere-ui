// The identity helpers and the icon data are public, so a host can state the role and the account as the account menu does and
// draw a built-in icon, such as a row menu's ellipsis or the admin shield. The framework-free helpers a host uses without a
// component, the glass tier class and the expired-session policy, are public too.
import { describe, expect, it } from 'vitest';

import * as react from '../src/react/index';

describe('public exports', () => {
  it('exposes the identity helpers and the console icons', () => {
    const entry = react as Record<string, unknown>;
    expect(typeof entry.identityLine).toBe('function');
    expect(typeof entry.identityParts).toBe('function');
    expect(typeof entry.consoleIcon).toBe('function');
    expect(Object.keys(entry.CONSOLE_ICONS as object)).toEqual(expect.arrayContaining(['shield', 'more', 'info', 'check-circle', 'alert-triangle', 'x-circle']));
  });

  it('exposes the glass tier class and the expired-session policy', () => {
    expect(react.glassClass('thick')).toBe('lu-glass-thick');
    expect(react.glassClass()).toBe('lu-glass');
    const reauth = react.createReauth({ loginPath: '/signin' });
    expect(typeof reauth.recoverSession).toBe('function');
    expect(typeof reauth.login).toBe('function');
  });
});

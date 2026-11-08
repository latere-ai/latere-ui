// The expired-session recovery policy in src/session/reauth.ts: one silent
// prompt=none check, then one interactive login, a one-shot navigation guard,
// and a flag store that tolerates unavailable sessionStorage.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createReauth } from '../src/session/reauth';

let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation(pathname = '/', search = '') {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname, search, href: '', origin: 'http://localhost' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => 'http://localhost/', set });
  Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
}

beforeEach(() => {
  stubLocation();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('createReauth() navigation guard', () => {
  it('navigates again after the page is restored from the back/forward cache', () => {
    const reauth = createReauth();
    reauth.login('/a');
    reauth.login('/ignored');
    expect(hrefSpy).toHaveBeenCalledTimes(1);

    const restored = new Event('pageshow');
    Object.defineProperty(restored, 'persisted', { value: true });
    window.dispatchEvent(restored);
    reauth.login('/b');
    expect(hrefSpy).toHaveBeenCalledTimes(2);
    expect(hrefSpy).toHaveBeenLastCalledWith('/login?return_to=%2Fb');
  });

  it('stays guarded on a pageshow that is not a restore', () => {
    const reauth = createReauth();
    reauth.login('/a');
    const shown = new Event('pageshow');
    Object.defineProperty(shown, 'persisted', { value: false });
    window.dispatchEvent(shown);
    reauth.login('/b');
    expect(hrefSpy).toHaveBeenCalledTimes(1);
  });
});

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

describe('createReauth() with sessionStorage unavailable', () => {
  function blockStorage() {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.stubGlobal('sessionStorage', { getItem: blocked, setItem: blocked, removeItem: blocked, clear: blocked });
  }

  it('skips the silent check and goes straight to the interactive login', () => {
    blockStorage();
    const reauth = createReauth();
    reauth.recoverSession('/a');
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(String(hrefSpy.mock.calls[0][0])).not.toContain('prompt=none');
  });

  it('attemptSilentReauth does nothing and clearRecheck does not throw', () => {
    blockStorage();
    const reauth = createReauth();
    reauth.attemptSilentReauth('/a');
    expect(hrefSpy).not.toHaveBeenCalled();
    expect(() => reauth.clearRecheck()).not.toThrow();
  });
});

describe('createReauth() recovery steps', () => {
  it('runs the silent check, then one interactive login, then reports exhausted', () => {
    const steps: string[] = [];
    for (let page = 0; page < 3; page++) {
      // Each loop is a fresh page load: new reauth, same sessionStorage.
      steps.push(createReauth().recoverSession('/a'));
    }
    expect(steps).toEqual(['silent', 'login', 'exhausted']);
    expect(hrefSpy).toHaveBeenCalledTimes(2);
    expect(String(hrefSpy.mock.calls[0][0])).toContain('prompt=none');
    expect(String(hrefSpy.mock.calls[1][0])).not.toContain('prompt=none');
  });

  it('skips recovery under graceful mode and while a navigation is under way', () => {
    expect(createReauth({ mode: 'graceful' }).recoverSession()).toBe('skipped');
    const reauth = createReauth();
    expect(reauth.recoverSession()).toBe('silent');
    expect(reauth.recoverSession()).toBe('skipped');
  });

  it('keeps recent flags and clears stale ones', () => {
    const reauth = createReauth();
    sessionStorage.setItem('latere.sso_checked.session', String(Date.now()));
    sessionStorage.setItem('latere.sso_login.session', '1');
    reauth.clearStaleRecheck();
    expect(sessionStorage.getItem('latere.sso_checked.session')).not.toBeNull();
    expect(sessionStorage.getItem('latere.sso_login.session')).toBeNull();
    reauth.clearRecheck();
    expect(sessionStorage.getItem('latere.sso_checked.session')).toBeNull();
  });
});

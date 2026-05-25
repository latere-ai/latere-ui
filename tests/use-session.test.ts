import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';

import { useSession } from '../src';

// useSession redirects via window.location.href on the silent probe. happy-dom
// throws on real navigation, so stub the assignment and record it instead.
let navigatedTo = '';
beforeEach(() => {
  navigatedTo = '';
  sessionStorage.clear();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname: '/',
      search: '',
      get href() {
        return navigatedTo;
      },
      set href(v: string) {
        navigatedTo = v;
      },
    },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

function harness(opts: {
  me: unknown | null;
  loaded?: boolean;
  storeId?: string;
  shouldProbe?: (p: string) => boolean;
  onUnauthorized?: (fn: () => void) => void;
  onExpired?: () => void;
}) {
  const meRef = ref(opts.me);
  const loadedRef = ref(opts.loaded ?? false);
  const fetch = vi.fn(async () => {
    loadedRef.value = true;
  });
  const Comp = defineComponent({
    setup() {
      useSession({
        me: () => meRef.value,
        loaded: () => loadedRef.value,
        fetch,
        storeId: opts.storeId ?? 'test',
        shouldProbe: opts.shouldProbe,
        onUnauthorized: opts.onUnauthorized,
        onExpired: opts.onExpired,
      });
      return () => h('div');
    },
  });
  return { wrapper: mount(Comp), fetch, meRef, loadedRef };
}

describe('useSession', () => {
  it('fetches /me on mount when not yet loaded', async () => {
    const { fetch } = harness({ me: null });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('logged out (marketing default): fires the one-time silent probe', async () => {
    harness({ me: null, storeId: 'mkt' });
    await Promise.resolve();
    await Promise.resolve();
    // attemptSilentReauth marks the guard flag and navigates to prompt=none.
    expect(sessionStorage.getItem('latere.sso_checked.mkt')).toBe('1');
    expect(navigatedTo).toContain('/login?prompt=none');
  });

  it('logged in: clears the recheck flag, never probes', async () => {
    sessionStorage.setItem('latere.sso_checked.signed', '1');
    harness({ me: { id: 'x' }, loaded: true, storeId: 'signed' });
    await Promise.resolve();
    await Promise.resolve();
    expect(sessionStorage.getItem('latere.sso_checked.signed')).toBeNull();
    expect(navigatedTo).toBe('');
  });

  it('dashboard: does NOT probe when shouldProbe is false for the path', async () => {
    harness({ me: null, storeId: 'dash', shouldProbe: () => false });
    await Promise.resolve();
    await Promise.resolve();
    expect(sessionStorage.getItem('latere.sso_checked.dash')).toBeNull();
    expect(navigatedTo).toBe('');
  });

  it('registers the 401 seam with the supplied onExpired handler', async () => {
    let installed: (() => void) | null = null;
    const onExpired = vi.fn();
    harness({
      me: { id: 'x' },
      loaded: true,
      onUnauthorized: (fn) => {
        installed = fn;
      },
      onExpired,
    });
    expect(installed).toBeTypeOf('function');
    installed!();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});

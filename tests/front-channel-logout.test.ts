import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from '../src/session/client';
import { runFrontChannelLogout } from '../src/session/frontChannel';

let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation() {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname: '/', search: '', href: '', origin: 'http://localhost' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => 'http://localhost/', set });
  Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
}

function mockFetch(responses: Array<[number, unknown]>) {
  let i = 0;
  return vi.fn(async () => {
    const [status, body] = responses[Math.min(i++, responses.length - 1)];
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: 'x',
      text: async () => JSON.stringify(body),
    } as Response;
  });
}

beforeEach(() => {
  stubLocation();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelectorAll('iframe').forEach((f) => f.remove());
});

describe('runFrontChannelLogout()', () => {
  it('renders an iframe per front_channel_uris entry, then navigates to post_logout_redirect', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [
          200,
          {
            app_url: 'https://auth.example/',
            post_logout_redirect: '/signed-out',
            front_channel_uris: [
              'https://a.example/logout/notify',
              'https://b.example/logout/notify',
            ],
          },
        ],
      ]),
    );
    // happy-dom fails an iframe's page load at once, which settles and
    // removes it, so record the iframes as they are appended.
    const appended: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLIFrameElement) appended.push(node.src);
        });
      }
    });
    observer.observe(document.body, { childList: true });
    const c = createApiClient();
    const promise = runFrontChannelLogout({ client: c, iframeTimeoutMs: 50 });

    // Wait a tick for the iframes to be appended.
    await new Promise((r) => setTimeout(r, 0));
    observer.disconnect();
    expect(appended).toEqual([
      'https://a.example/logout/notify',
      'https://b.example/logout/notify',
    ]);

    await promise;
    expect(hrefSpy).toHaveBeenCalledWith('/signed-out');
    // iframes are removed when settled.
    expect(document.querySelectorAll('iframe').length).toBe(0);
  });

  it('falls back to app_url when post_logout_redirect is missing', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [
          200,
          {
            app_url: 'https://auth.example/',
            front_channel_uris: [],
          },
        ],
      ]),
    );
    const c = createApiClient();
    await runFrontChannelLogout({ client: c });
    expect(hrefSpy).toHaveBeenCalledWith('https://auth.example/');
  });

  it('falls back to "/" when both post_logout_redirect and app_url are missing', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, {}]]));
    const c = createApiClient();
    await runFrontChannelLogout({ client: c });
    expect(hrefSpy).toHaveBeenCalledWith('/');
  });

  it('honors finalRedirect override', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([[200, { post_logout_redirect: '/server-says-here' }]]),
    );
    const c = createApiClient();
    await runFrontChannelLogout({ client: c, finalRedirect: '/caller-says-here' });
    expect(hrefSpy).toHaveBeenCalledWith('/caller-says-here');
  });

  it('still navigates when the logout endpoint itself errors', async () => {
    vi.stubGlobal('fetch', mockFetch([[500, { error: 'boom' }]]));
    const c = createApiClient();
    await runFrontChannelLogout({ client: c });
    expect(hrefSpy).toHaveBeenCalledWith('/');
  });

  it('iframe timeout fires when load never arrives', async () => {
    // Use a vanishingly short timeout to keep the test fast; the assertion
    // is that runFrontChannelLogout resolves and navigates regardless.
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [
          200,
          {
            post_logout_redirect: '/x',
            front_channel_uris: ['about:blank'],
          },
        ],
      ]),
    );
    const c = createApiClient();
    await runFrontChannelLogout({ client: c, iframeTimeoutMs: 5 });
    expect(hrefSpy).toHaveBeenCalledWith('/x');
    expect(document.querySelectorAll('iframe').length).toBe(0);
  });
});

describe('runFrontChannelLogout() navigation target', () => {
  const unsafe = ['java', 'script:void(0)'].join('');

  function rawFetch(status: number, body: string) {
    return vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'x',
      text: async () => body,
    }) as Response);
  }

  it('does not navigate to a post_logout_redirect that is not an http(s) address', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { post_logout_redirect: unsafe }]]));
    await runFrontChannelLogout({ client: createApiClient() });
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy).toHaveBeenCalledWith('/');
  });

  it('falls through to app_url when post_logout_redirect is unsafe', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([[200, { post_logout_redirect: unsafe, app_url: 'https://app.example/' }]]),
    );
    await runFrontChannelLogout({ client: createApiClient() });
    expect(hrefSpy).toHaveBeenCalledWith('https://app.example/');
  });

  it('follows an http(s) redirect on another origin', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { post_logout_redirect: 'https://idp.example/bye' }]]));
    await runFrontChannelLogout({ client: createApiClient() });
    expect(hrefSpy).toHaveBeenCalledWith('https://idp.example/bye');
  });

  it('navigates to / when /api/logout answers 204 with an empty body', async () => {
    vi.stubGlobal('fetch', rawFetch(204, ''));
    await runFrontChannelLogout({ client: createApiClient() });
    expect(hrefSpy).toHaveBeenCalledWith('/');
  });

  it('navigates when front_channel_uris is a string instead of a list', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([[200, { post_logout_redirect: '/bye', front_channel_uris: 'https://a.example/' }]]),
    );
    await runFrontChannelLogout({ client: createApiClient() });
    expect(hrefSpy).toHaveBeenCalledWith('/bye');
  });

  it('loads only the string entries of front_channel_uris and still navigates', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([[200, { post_logout_redirect: '/bye', front_channel_uris: [7, null, 'https://a.example/n'] }]]),
    );
    const appended: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => {
        if (n instanceof HTMLIFrameElement) appended.push(n.src);
      });
    });
    observer.observe(document.body, { childList: true });
    await runFrontChannelLogout({ client: createApiClient() });
    await Promise.resolve();
    observer.disconnect();
    expect(appended).toEqual(['https://a.example/n']);
    expect(hrefSpy).toHaveBeenCalledWith('/bye');
  });
});

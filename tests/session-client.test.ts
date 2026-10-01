// The shared API client: JSON in and out, the CSRF double-submit header on
// state-changing requests, error envelopes normalized into ApiError, and the
// global 401 seam.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, createApiClient } from '../src/session/client';

function respond(status: number, body: string) {
  return vi.fn(async (_path: string, _init?: RequestInit) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Status text',
    text: async () => body,
  }) as Response);
}

function headersOf(fetchMock: ReturnType<typeof respond>, call = 0): Record<string, string> {
  return fetchMock.mock.calls[call][1]!.headers as Record<string, string>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'app.csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('createApiClient()', () => {
  it('sends JSON with same-origin credentials and parses the JSON reply', async () => {
    const fetchMock = respond(200, '{"ok":true}');
    vi.stubGlobal('fetch', fetchMock);
    const client = createApiClient();
    await expect(client.api('POST', '/v1/things', { name: 'a' })).resolves.toEqual({ ok: true });
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('same-origin');
    expect(init.body).toBe('{"name":"a"}');
    expect(headersOf(fetchMock)).toEqual({ Accept: 'application/json', 'Content-Type': 'application/json' });
  });

  it('echoes the CSRF cookie on state-changing requests only', async () => {
    document.cookie = 'app.csrf=tok%2Fen';
    const fetchMock = respond(200, '');
    vi.stubGlobal('fetch', fetchMock);
    const client = createApiClient({ csrfCookie: 'app.csrf' });
    expect(client.csrfToken()).toBe('tok/en');
    await client.api('DELETE', '/v1/things/1');
    await client.api('GET', '/v1/things');
    await client.api('HEAD', '/v1/things');
    expect(headersOf(fetchMock, 0)['X-CSRF-Token']).toBe('tok/en');
    expect(headersOf(fetchMock, 1)['X-CSRF-Token']).toBeUndefined();
    expect(headersOf(fetchMock, 2)['X-CSRF-Token']).toBeUndefined();
  });

  it('sends no CSRF header when the cookie is absent or no cookie name is configured', async () => {
    const fetchMock = respond(200, '');
    vi.stubGlobal('fetch', fetchMock);
    await createApiClient({ csrfCookie: 'app.csrf' }).api('POST', '/v1/things');
    document.cookie = 'app.csrf=tok';
    await createApiClient().api('POST', '/v1/things');
    expect(headersOf(fetchMock, 0)['X-CSRF-Token']).toBeUndefined();
    expect(headersOf(fetchMock, 1)['X-CSRF-Token']).toBeUndefined();
    expect(createApiClient().csrfToken()).toBe('');
  });

  it('uploads multipart forms without setting a Content-Type, with the CSRF header', async () => {
    document.cookie = 'app.csrf=tok';
    const fetchMock = respond(200, '{"id":"f1"}');
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.append('file', 'content');
    await expect(createApiClient({ csrfCookie: 'app.csrf' }).apiUpload('/v1/files', form)).resolves.toEqual({ id: 'f1' });
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(form);
    expect(headersOf(fetchMock)).toEqual({ Accept: 'application/json', 'X-CSRF-Token': 'tok' });
  });

  it('returns a non-JSON body as text and an empty body as null', async () => {
    vi.stubGlobal('fetch', respond(200, 'plain text'));
    await expect(createApiClient().api('GET', '/health')).resolves.toBe('plain text');
    vi.stubGlobal('fetch', respond(204, ''));
    await expect(createApiClient().api('GET', '/health')).resolves.toBeNull();
  });

  it.each([
    ['a nested error message', '{"error":{"message":"Nested failure"}}', 'Nested failure'],
    ['a flat message', '{"error":"bad_request","message":"Flat failure"}', 'Flat failure'],
    ['an empty nested message, falling back to the flat one', '{"error":{"message":""},"message":"Flat"}', 'Flat'],
    ['no message, falling back to the status text', '{"error":"bad_request"}', 'Status text'],
    ['a text body, falling back to the status text', 'gateway timeout', 'Status text'],
  ])('reads %s into ApiError', async (_, body, message) => {
    vi.stubGlobal('fetch', respond(400, body));
    const failure = await createApiClient().api('GET', '/v1/things').catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 400, message });
  });

  it('fires the 401 seam with the failing request unless the caller opts out', async () => {
    vi.stubGlobal('fetch', respond(401, '{"error":"unauthorized"}'));
    const onUnauthorized = vi.fn();
    const client = createApiClient({ onUnauthorized });
    await expect(client.api('GET', '/v1/jobs')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ path: '/v1/jobs', method: 'GET' });
    await expect(client.api('GET', '/api/me', undefined, { allowUnauthenticated: true })).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});

// Tiny fetch wrapper shared by every Latere SPA. JSON in/out, cookies sent to
// the page's own origin only, CSRF threaded on state-changing requests to that
// origin, errors normalized into `ApiError`, and a single global 401 seam
// (`onUnauthorized`) so an expired session is handled uniformly. The CSRF
// cookie name is configurable.
//
// The session cookie is HTTP-only: we never read it. The CSRF cookie (the
// double-submit pattern) is readable by JS and echoed in `X-CSRF-Token` on
// same-origin requests.

import { ApiError, type ApiClient, type ApiClientOptions, type RequestOptions } from './types';

export { ApiError };

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const csrfCookie = options.csrfCookie;

  function csrfToken(): string {
    if (typeof document === 'undefined' || !csrfCookie) return '';
    const m = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + escapeRegExp(csrfCookie) + '=([^;]+)'),
    );
    if (!m) return '';
    try {
      return decodeURIComponent(m[1]);
    } catch {
      // A value that is not valid percent-encoding is sent as it is; the
      // server decides whether it matches, and the request is not blocked.
      return m[1];
    }
  }

  const client: ApiClient = {
    csrfToken,
    onUnauthorized: options.onUnauthorized,

    async api<T = unknown>(method: string, path: string, body?: unknown, opts?: RequestOptions) {
      const headers: Record<string, string> = { Accept: 'application/json' };
      let payload: string | undefined;
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
      }
      if (csrfCookie && method !== 'GET' && method !== 'HEAD' && isSameOrigin(path)) {
        const tok = csrfToken();
        if (tok) headers['X-CSRF-Token'] = tok;
      }
      return request<T>(client, method, path, headers, payload, opts);
    },

    // Multipart upload (e.g. POST /v1/files). The browser sets the multipart
    // Content-Type boundary itself, so we must not set it here.
    async apiUpload<T = unknown>(path: string, form: FormData, opts?: RequestOptions) {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (csrfCookie && isSameOrigin(path)) {
        const tok = csrfToken();
        if (tok) headers['X-CSRF-Token'] = tok;
      }
      return request<T>(client, 'POST', path, headers, form, opts);
    },
  };

  return client;
}

async function request<T>(
  client: ApiClient,
  method: string,
  path: string,
  headers: Record<string, string>,
  payload: string | FormData | undefined,
  opts: RequestOptions | undefined,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers,
    body: payload,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    // 401 → fire the global seam before throwing, unless the caller opted out
    // (fetchMe does, so a logged-out visitor probing /api/me is not bounced).
    if (res.status === 401 && !opts?.allowUnauthenticated) {
      client.onUnauthorized?.({ path, method });
    }
    throw new ApiError(res.status, data, errorMessage(res, data));
  }
  return data as T;
}

// Pull a human message from the various error envelopes the backends use:
// a nested `{error:{message}}`, a flat `{message}`, or the auth server's
// 401 body `{error, message}`.
function errorMessage(res: Response, data: unknown): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const err = obj.error;
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as Record<string, unknown>).message;
      if (typeof m === 'string' && m) return m;
    }
    if (typeof obj.message === 'string' && obj.message) return obj.message;
  }
  return res.statusText;
}

// The CSRF token belongs to this page's origin only. A request URL that
// resolves anywhere else, or that does not parse, never carries it.
function isSameOrigin(path: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(path, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

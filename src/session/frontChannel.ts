// SPA-side helper that drives an RFC 6749 OIDC front-channel logout: fetches
// the logout endpoint, renders a hidden iframe for each front_channel_uris
// entry so each RP's session cookie clears in-place, waits up to a per-iframe
// timeout so a dead RP cannot block the user's logout, then navigates to the
// final post_logout_redirect.
//
// Latere-ai renders this flow server-side (see latere-ai/internal/handler/
// auth.go's LogoutNotify path); SPAs that want client-side control over the
// orchestration use runFrontChannelLogout() instead.

import type { ApiClient } from './types';

const hasWindow = () => typeof window !== 'undefined';

export interface FrontChannelLogoutResponse {
  /** Where to navigate after the iframes finish (or time out). */
  post_logout_redirect?: string;
  /** Auth-server canonical app URL used as the final fallback target. */
  app_url?: string;
  /** RP notification iframes to render. */
  front_channel_uris?: string[];
}

export interface FrontChannelLogoutOptions {
  /** The shared API client. */
  client: ApiClient;
  /** Endpoint returning a `FrontChannelLogoutResponse`. Default `'/api/logout'`. */
  logoutEndpoint?: string;
  /** Per-iframe load timeout. Default `2000` ms. */
  iframeTimeoutMs?: number;
  /** Final redirect override. Falls back to `post_logout_redirect`, then `app_url`. */
  finalRedirect?: string;
}

/**
 * Run a front-channel logout flow. Resolves once the navigation has been
 * scheduled (or, in SSR / non-browser contexts, immediately as a no-op).
 *
 * Iframes are appended with `sandbox="allow-same-origin"` so the embedded
 * RP can clear its own cookie. Each iframe is given `iframeTimeoutMs` to
 * fire `load`; whichever comes first (load or timeout) counts as done. We
 * never wait for all iframes serially — a dead RP must not block the user.
 */
export async function runFrontChannelLogout(opts: FrontChannelLogoutOptions): Promise<void> {
  if (!hasWindow()) return;
  const { client, logoutEndpoint = '/api/logout', iframeTimeoutMs = 2000 } = opts;

  let resp: FrontChannelLogoutResponse;
  try {
    resp = await client.api<FrontChannelLogoutResponse>('GET', logoutEndpoint, undefined, {
      allowUnauthenticated: true,
    });
  } catch {
    // If the logout endpoint itself fails, fall back to the simple navigate
    // path: there's nothing to iframe.
    resp = {};
  }

  const uris = resp.front_channel_uris ?? [];
  if (uris.length > 0) {
    await Promise.allSettled(uris.map((u) => loadIframe(u, iframeTimeoutMs)));
  }

  const target = opts.finalRedirect || resp.post_logout_redirect || resp.app_url || '/';
  window.location.href = target;
}

function loadIframe(src: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      try {
        iframe.remove();
      } catch {
        // ignore — happens if the DOM is already tearing down.
      }
      resolve();
    };

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.left = '-9999px';
    iframe.addEventListener('load', settle);
    iframe.addEventListener('error', settle);
    iframe.src = src;

    document.body.appendChild(iframe);
    setTimeout(settle, timeoutMs);
  });
}

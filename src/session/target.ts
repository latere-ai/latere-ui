// Navigation targets that come from a server answer (a switch-org redirect, a
// logout redirect) are followed only when they are web addresses. A target
// with any other scheme would run in the application's origin.

/**
 * webTarget returns `target` when it is a string that resolves, against the
 * page's address, to an `http:` or `https:` URL, and `fallback` otherwise.
 * Targets on another origin are allowed: OIDC post-logout redirects often
 * live there. The returned string is the target as given, not the resolved
 * URL, so a relative target stays relative.
 */
export function webTarget(target: unknown, fallback: string): string {
  if (typeof target !== 'string' || target === '' || typeof window === 'undefined') return fallback;
  try {
    const { protocol } = new URL(target, window.location.href);
    return protocol === 'http:' || protocol === 'https:' ? target : fallback;
  } catch {
    // An address that does not parse cannot be navigated to.
    return fallback;
  }
}

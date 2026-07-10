// Shared session/auth types for the Latere platform SPAs. The canonical
// `Principal` mirrors the `orgs[]`/`org_id` JSON shape every product backend
// already serves at its own `/api/me` (the auth server's richer
// `memberships[]` shape is adapted server-side per product). Apps whose
// backend drifts from this map into it via `SessionStoreOptions.mapMe`.

/** One organization the principal belongs to. */
export interface OrgEntry {
  id: string;
  name: string;
  slug?: string;
  /** True when the principal owns this org. */
  owner?: boolean;
}

/**
 * Canonical account role, shared by every Latere product. A principal is
 * exactly one of these at a time:
 * - `platform_admin`: a Latere-wide superadmin (operates across all orgs).
 * - `org_admin`: an admin of the active org.
 * - `org_member`: a non-admin member of the active org.
 * - `individual`: a personal principal with no org.
 * Derivation is app-specific (which scope means "admin" differs per product),
 * so each app computes `Principal.role`; AccountMenu owns the shared badge
 * rendering and labels.
 */
export type PlatformRole = 'platform_admin' | 'org_admin' | 'org_member' | 'individual';

/** The authenticated principal, as consumed by the store + AccountMenu. */
export interface Principal {
  principal_id: string;
  email: string;
  name?: string;
  display_name?: string;
  avatar_url?: string;
  /** Letters shown in the avatar when no `avatar_url` is present. */
  initials?: string;
  /** Active org id; empty string means the personal (no-org) view. */
  org_id: string;
  org_name?: string;
  orgs: OrgEntry[];
  is_superadmin?: boolean;
  /**
   * Canonical account role. When set, AccountMenu renders a role badge next
   * to the identity and uses the role for the no-org subline ("Individual").
   * Omit to fall back to the plain org/Personal subline (legacy behavior).
   */
  role?: PlatformRole;
  auth_url?: string;
}

/** Error thrown by the fetch client for any non-2xx response. */
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Context handed to the global 401 handler. */
export interface UnauthorizedContext {
  path: string;
  method: string;
}

export interface ApiClientOptions {
  /**
   * Name of the readable CSRF cookie (double-submit). When set, its value is
   * echoed in `X-CSRF-Token` on state-changing requests. Omit for apps the
   * backend does not CSRF-protect (e.g. the marketing sites / lux).
   */
  csrfCookie?: string;
  /** Invoked on a 401 (unless the call opted out). Settable post-construction. */
  onUnauthorized?: (ctx: UnauthorizedContext) => void;
}

/** Per-call options. */
export interface RequestOptions {
  /**
   * Suppress the global 401 seam for this call. Set by `fetchMe`, so a
   * never-logged-in visitor probing `/api/me` is not bounced to login.
   */
  allowUnauthenticated?: boolean;
}

export interface ApiClient {
  api<T = unknown>(method: string, path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
  apiUpload<T = unknown>(path: string, form: FormData, opts?: RequestOptions): Promise<T>;
  csrfToken(): string;
  /** Global 401 handler; assigned after the session store exists. */
  onUnauthorized?: (ctx: UnauthorizedContext) => void;
}

/** What to do when a session is found to be expired/absent. */
export type ExpiredSessionMode = 'silent-recheck' | 'graceful';

/** How `switchOrg` navigates after POSTing the new org. */
export type SwitchOrgMode = 'follow-redirect' | 'login-bounce';

export interface SessionStoreOptions<Raw = Principal> {
  client: ApiClient;
  /** Pinia store id. Default `'session'`. */
  storeId?: string;
  /** Endpoint returning the principal. Default `'/api/me'` (lux: `'/me'`). */
  meEndpoint?: string;
  /** Org-switch endpoint. Default `'/api/me/switch-org'`. */
  switchOrgEndpoint?: string;
  /** Where to land after an interactive login. Default `'/'`. */
  defaultReturnTo?: string;
  /** Server login entry point. Default `'/login'`. */
  loginPath?: string;
  /** Server logout entry point. Default `'/logout'`. */
  logoutPath?: string;
  /** Adapt a backend-specific shape into `Principal`. Default: identity. */
  mapMe?: (raw: Raw) => Principal;
  /**
   * Dashboards default to `'silent-recheck'` (sandbox's `prompt=none`
   * auto-login); marketing sites pass `'graceful'`.
   */
  expiredSessionMode?: ExpiredSessionMode;
  /** `'follow-redirect'` uses the POST's `{redirect}`; `'login-bounce'` builds a URL. */
  switchOrgMode?: SwitchOrgMode;
}

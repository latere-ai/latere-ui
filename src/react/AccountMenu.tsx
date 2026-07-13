// React adapter of AccountMenu.vue — the shared account menu for every
// Latere SPA: identity header → optional "Open dashboard" → an org list with
// an explicit Personal (no-org) row and each membership → an optional prefs
// slot (theme/locale) → Sign out / Sign in.
//
// Decoupled like the Vue original: it does not require a router. Unlike the
// Vue original, it CAN optionally read `principal`/`login`/`logout`/
// `switchOrg` from a `<SessionProvider>` ancestor (via `useOptionalSession`)
// when the corresponding prop is omitted, so `<AccountMenu />` alone under a
// provider "just works" — but every prop the Vue component takes still works
// standalone (e.g. inside a host that keeps its own session state).
// Requires `import 'latere-ui/console'` when nested in ConsoleSidebar's foot
// (that sheet carries the `.lu-cs-foot .lu-am-*` size overrides); the menu's
// own styles are self-contained via the import below.
import { useRef, useState, type ReactNode } from 'react';

import type { Principal } from '../session/types';
import '../styles/components/account-menu.css';
import {
  DEFAULT_ACCOUNT_MENU_LABELS,
  type AccountMenuItem,
  type AccountMenuLabelOverrides,
  type AccountMenuLabels,
} from '../components/accountMenu';
import { cx, useClickOutside } from './internal';
import { useOptionalSession } from './session';

export type { AccountMenuLabels, AccountMenuItem };

type Placement = 'top-end' | 'bottom-start';

export interface AccountMenuProps {
  /**
   * The signed-in principal, or `null` when logged out. Omit to read from
   * the ambient `<SessionProvider>` (falls back to `null` with no provider).
   */
  principal?: Principal | null;
  /** `top-end`: top-nav dropdown opening down-right. `bottom-start`: left-rail pill opening up. */
  placement?: Placement;
  /** When set, shows an "Open dashboard" row that calls `onNavigate`. */
  dashboardPath?: string | null;
  /** Org id currently being switched to (`''` = Personal); drives the spinner + dims others. */
  switchingOrgId?: string | null;
  /** When true, render nothing while logged out (instead of a Sign-in CTA). */
  signedInOnly?: boolean;
  /** Per-locale label overrides (deep-partial; `roles` merges over defaults). */
  labels?: AccountMenuLabelOverrides;
  /** Per-app custom rows (e.g. Admin Panel), rendered in the menu's own style. */
  extraItems?: AccountMenuItem[];
  /** Called when a membership/Personal row is picked. Omit to use the ambient provider's `switchOrg`. */
  onSwitchOrg?: (orgId: string) => void;
  /** Called for the dashboard row and `to`-style extra items. */
  onNavigate?: (path: string) => void;
  /** Called on the Sign-in action. Omit to use the ambient provider's `login`. */
  onLogin?: () => void;
  /** Called on the Sign-out action. Omit to use the ambient provider's `logout`. */
  onLogout?: () => void;
  /** Called for `id`-style extra items (pure actions, no `href`/`to`). */
  onItemSelect?: (id: string) => void;
  /** Preferences content (theme/locale pills), rendered in its own section. */
  prefs?: ReactNode;
  /** Escape hatch for fully custom markup, styled to match via `.lu-am-item`. */
  extra?: ReactNode;
}

export function AccountMenu({
  principal: principalProp,
  placement = 'top-end',
  dashboardPath = null,
  switchingOrgId = null,
  signedInOnly = false,
  labels,
  extraItems = [],
  onSwitchOrg,
  onNavigate,
  onLogin,
  onLogout,
  onItemSelect,
  prefs,
  extra,
}: AccountMenuProps) {
  const session = useOptionalSession();
  const principal = principalProp !== undefined ? principalProp : (session?.principal ?? null);
  const login = onLogin ?? (session ? () => session.login() : undefined);
  const logout = onLogout ?? (session ? () => session.logout() : undefined);
  const switchOrg =
    onSwitchOrg ?? (session ? (orgId: string) => void session.switchOrg(orgId) : undefined);

  const t: AccountMenuLabels = {
    ...DEFAULT_ACCOUNT_MENU_LABELS,
    ...labels,
    // Deep-merge the roles sub-object so a consumer passing partial role
    // labels doesn't wipe the defaults for the rest.
    roles: { ...DEFAULT_ACCOUNT_MENU_LABELS.roles, ...labels?.roles },
  };

  const hasDropdown = !!principal || !!prefs || !!extra || extraItems.length > 0;

  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useClickOutside(root, open, () => setOpen(false));

  function onTrigger() {
    if (hasDropdown) setOpen((o) => !o);
    else login?.(); // logged out + nothing to show → straight to login
  }

  const initials = principal?.initials || '?';
  const avatarUrl = principal?.avatar_url || '';
  const name = principal?.display_name || principal?.name || principal?.email || t.account;
  const email = principal?.email || '';
  const orgName = principal?.org_name || '';

  const role = principal?.role;
  const roleBadge = role && role !== 'individual' ? t.roles[role] : '';
  const identitySub = orgName || (role ? t.roles.individual : t.personal);
  const orgs = principal?.orgs ?? [];
  const activeOrgId = principal?.org_id || '';
  const isPersonal = !activeOrgId;

  const opensUp = placement === 'bottom-start';

  function rowOpacity(id: string): number {
    return switchingOrgId !== null && switchingOrgId !== id ? 0.5 : 1;
  }

  function pickOrg(id: string) {
    if (id === activeOrgId || switchingOrgId !== null) return;
    switchOrg?.(id);
  }
  function goto(path: string) {
    setOpen(false);
    onNavigate?.(path);
  }
  function onSignOut() {
    setOpen(false);
    logout?.();
  }
  function onSignIn() {
    setOpen(false);
    login?.();
  }
  function onExtraItem(item: AccountMenuItem) {
    setOpen(false);
    if (item.to) onNavigate?.(item.to);
    else if (item.id) onItemSelect?.(item.id);
  }

  if (!principal && signedInOnly) return null;

  return (
    <div ref={root} className={cx('lu-am', opensUp && 'lu-am-up')}>
      <button
        className="lu-am-trigger"
        onClick={onTrigger}
        aria-expanded={hasDropdown ? open : undefined}
        title={principal ? t.account : t.signIn}
      >
        {/* Avatar always present so the pill keeps its shape; logged out shows
            the "?" initials fallback. */}
        <span className="lu-am-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : <span>{initials}</span>}
        </span>
        <span className="lu-am-id">
          <span className="lu-am-id-name">{principal ? name : t.signIn}</span>
          {/* Sub-label (role badge + org / Individual) only when signed in —
              the logged-out "Sign in" trigger stays a single line. */}
          {principal && (
            <span className="lu-am-id-sub">
              {roleBadge && (
                <span className={cx('lu-am-role', `lu-am-role-${role}`)}>{roleBadge}</span>
              )}
              <span className="lu-am-id-sub-text">{identitySub}</span>
            </span>
          )}
        </span>
        {hasDropdown && (
          <svg
            className="lu-am-chev"
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {opensUp ? <path d="M3 7.5l3-3 3 3" /> : <path d="M3 4.5l3 3 3-3" />}
          </svg>
        )}
      </button>

      {open && hasDropdown && (
        <div className={cx('lu-am-dd', placement === 'top-end' ? 'lu-am-dd-right' : 'lu-am-dd-left')}>
          {/* Identity header */}
          {principal ? (
            <div className="lu-am-head">
              <span className="lu-am-head-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initials}</span>
                )}
              </span>
              <div className="lu-am-head-text">
                <div className="lu-am-head-name">{name}</div>
                <div className="lu-am-head-email">{email}</div>
                {/* Identity descriptor: the role badge + org/individual context.
                    Triggers may hide these to stay compact, so the dropdown is
                    the canonical place they always resolve. */}
                {(roleBadge || identitySub) && (
                  <div className="lu-am-head-meta">
                    {roleBadge && (
                      <span className={cx('lu-am-role', `lu-am-role-${role}`)}>{roleBadge}</span>
                    )}
                    <span className="lu-am-head-context">{identitySub}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lu-am-head lu-am-head-muted">{t.notSignedIn}</div>
          )}

          {principal && (
            <>
              {/* Dashboard link */}
              {dashboardPath && (
                <div className="lu-am-section">
                  <button className="lu-am-item" onClick={() => goto(dashboardPath)}>
                    <span>{t.openDashboard}</span>
                  </button>
                </div>
              )}

              {/* Organizations — only when the principal actually has memberships, so
                  a degraded /api/me (orgs fetch failed) doesn't show a lonely Personal. */}
              {orgs.length > 0 && (
                <div className="lu-am-section">
                  <div className="lu-am-section-label">{t.organizations}</div>

                  {/* Personal (no-org): present so the user can switch back. */}
                  <button
                    className={cx('lu-am-item', 'lu-am-org', isPersonal && 'is-active')}
                    style={{ opacity: rowOpacity('') }}
                    onClick={() => pickOrg('')}
                  >
                    <span className="lu-am-org-mark">{initials}</span>
                    <span className="lu-am-org-text">
                      <span className="lu-am-org-name">{t.personal}</span>
                      <span className="lu-am-org-meta">{t.noOrganization}</span>
                    </span>
                    {isPersonal ? (
                      <svg
                        className="lu-am-check"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5L20 6" />
                      </svg>
                    ) : (
                      switchingOrgId === '' && <span className="lu-am-spin">…</span>
                    )}
                  </button>

                  {orgs.map((o) => (
                    <button
                      key={o.id}
                      className={cx('lu-am-item', 'lu-am-org', o.id === activeOrgId && 'is-active')}
                      style={{ opacity: rowOpacity(o.id) }}
                      onClick={() => pickOrg(o.id)}
                    >
                      <span className="lu-am-org-mark lu-am-org-team">
                        {(o.name || o.id).slice(0, 2).toUpperCase()}
                      </span>
                      <span className="lu-am-org-text">
                        <span className="lu-am-org-name">
                          {o.name || o.id}
                          {o.owner && <span className="lu-am-owner">{t.owner}</span>}
                        </span>
                        {o.slug && <span className="lu-am-org-meta">@{o.slug}</span>}
                      </span>
                      {o.id === activeOrgId ? (
                        <svg
                          className="lu-am-check"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12l5 5L20 6" />
                        </svg>
                      ) : (
                        switchingOrgId === o.id && <span className="lu-am-spin">…</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* App-provided preferences (theme / locale pills). */}
          {prefs && <div className="lu-am-section">{prefs}</div>}

          {/* Per-app custom rows (data-driven; styled in this component so they
              always match). Links render as <a>, router paths call onNavigate,
              pure actions call onItemSelect. */}
          {extraItems.length > 0 && (
            <div className="lu-am-section">
              {extraItems.map((item, i) =>
                item.href ? (
                  <a
                    key={item.id || item.href || item.to || i}
                    className={cx('lu-am-item', item.danger && 'lu-am-danger')}
                    href={item.href}
                    target={item.target}
                    rel={item.target === '_blank' ? 'noopener' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <button
                    key={item.id || item.href || item.to || i}
                    className={cx('lu-am-item', item.danger && 'lu-am-danger')}
                    onClick={() => onExtraItem(item)}
                  >
                    <span>{item.label}</span>
                  </button>
                ),
              )}
            </div>
          )}

          {/* Escape hatch for fully-custom markup. */}
          {extra && <div className="lu-am-section">{extra}</div>}

          <div className="lu-am-section">
            {principal ? (
              <button className="lu-am-item lu-am-danger" onClick={onSignOut}>
                <span>{t.signOut}</span>
              </button>
            ) : (
              <button className="lu-am-item" onClick={onSignIn}>
                <span>{t.signIn}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

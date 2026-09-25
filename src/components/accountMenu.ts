// Types + defaults for AccountMenu, kept in a .ts module (not the .vue) so the
// package entrypoint can re-export them without a consumer's vue-tsc falling
// back to the default-only `*.vue` shim and losing the named members.

// A per-app custom menu row (e.g. "Admin Panel", "Deck access"). Rendered by
// AccountMenu in its own scope so it always matches the menu's item style —
// passing markup through a slot doesn't get the scoped `.lu-am-item` styles.
export interface AccountMenuItem {
  /** Row text. */
  label: string;
  /** External / full URL → rendered as an <a href>. */
  href?: string;
  /** Internal router path → emits `navigate` (host calls router.push). */
  to?: string;
  /** Stable id emitted via `item-select` for pure-action rows (no href/to). */
  id?: string;
  /** Style as a destructive action. */
  danger?: boolean;
  /** `_blank` etc. for href rows. */
  target?: string;
}

/** Localized labels for the canonical account roles (badge + subline). */
export interface AccountRoleLabels {
  platform_admin: string;
  org_admin: string;
  org_member: string;
  individual: string;
}

export interface AccountMenuLabels {
  account: string;
  notSignedIn: string;
  openDashboard: string;
  organizations: string;
  personal: string;
  noOrganization: string;
  owner: string;
  signOut: string;
  signIn: string;
  /** Role badge / subline labels (spec: shared four-role account model). */
  roles: AccountRoleLabels;
  /**
   * Role names in running text, for the `subline="text"` trigger line
   * ("Platform admin · Personal"). Sentence case; merged over the defaults.
   */
  roleNames?: AccountRoleLabels;
}

/**
 * Deep-partial label overrides consumers pass to `<AccountMenu :labels>`:
 * every label is optional, including individual role labels (the component
 * deep-merges `roles` over the defaults).
 */
export type AccountMenuLabelOverrides = Partial<Omit<AccountMenuLabels, 'roles' | 'roleNames'>> & {
  roles?: Partial<AccountRoleLabels>;
  roleNames?: Partial<AccountRoleLabels>;
};

export const DEFAULT_ACCOUNT_MENU_LABELS: AccountMenuLabels = {
  account: 'Account',
  notSignedIn: 'Not signed in',
  openDashboard: 'Open dashboard',
  organizations: 'Organizations',
  personal: 'Personal',
  noOrganization: 'No organization',
  owner: 'owner',
  signOut: 'Sign out',
  signIn: 'Sign in',
  roles: {
    platform_admin: 'Platform Admin',
    org_admin: 'Admin',
    org_member: 'Member',
    individual: 'Individual',
  },
  roleNames: {
    platform_admin: 'Platform admin',
    org_admin: 'Admin',
    org_member: 'Member',
    individual: 'Personal',
  },
};

/**
 * How the trigger states the role and the account under the name: `badge`
 * (the default) as an uppercase badge beside the organization, `text` as one
 * quiet line, `role` as a sentence-case badge followed by the account in
 * quiet text. With `text` and `role` the dropdown's header states them in the
 * same sentence case.
 */
export type AccountMenuSubline = 'badge' | 'text' | 'role';

/**
 * The role and the account a sentence-case subline states: the role's name,
 * empty for a person without a role beyond their own account, and the
 * organization the session is in or the personal label.
 */
export function identityParts(
  principal: { role?: string; org_name?: string } | null | undefined,
  labels: Pick<AccountMenuLabels, 'personal' | 'roleNames'>,
): { role: string; context: string } {
  if (!principal) return { role: '', context: '' };
  const names = { ...DEFAULT_ACCOUNT_MENU_LABELS.roleNames!, ...labels.roleNames };
  const role = principal.role && principal.role !== 'individual'
    ? names[principal.role as keyof AccountRoleLabels] ?? ''
    : '';
  return { role, context: principal.org_name || labels.personal };
}

/**
 * The one quiet line under the name in the `text` subline: the role, then
 * the account the session is in, "Platform admin · Personal" or
 * "Admin · Design Studio". A person without a role beyond their own account
 * reads the account alone.
 */
export function identityLine(
  principal: { role?: string; org_name?: string } | null | undefined,
  labels: Pick<AccountMenuLabels, 'personal' | 'roleNames'>,
): string {
  if (!principal) return '';
  const { role, context } = identityParts(principal, labels);
  return [role, context].filter(Boolean).join(' · ');
}

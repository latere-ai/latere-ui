// Types + defaults for AccountMenu, kept in a .ts module (not the .vue) so the
// package entrypoint can re-export them without a consumer's vue-tsc falling
// back to the default-only `*.vue` shim and losing the named members.

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
}

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
};

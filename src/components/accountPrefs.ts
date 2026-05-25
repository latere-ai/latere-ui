// Types + defaults for AccountPrefs, kept in a .ts module (not the .vue) so the
// package entrypoint can re-export them without a consumer's vue-tsc falling
// back to the default-only `*.vue` shim and losing the named members (this
// breaks clean / vite-ssg builds).

export interface AccountPrefsLabels {
  language: string;
  theme: string;
  light: string;
  dark: string;
  auto: string;
}

export const DEFAULT_ACCOUNT_PREFS_LABELS: AccountPrefsLabels = {
  language: 'Language',
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',
};

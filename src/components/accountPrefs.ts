// Types and defaults for AccountPrefs.

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

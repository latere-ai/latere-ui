// Framework-free model of the theme and language menus: glyphs, default
// labels and the menu items both adapters render. Kept in a .ts module so the
// Vue SFCs and the React components cannot drift on what the menus offer.
import type { Theme, LocaleOption } from '../i18n/footer';
import type { MenuItem } from '../glass/types';

// Fixed SVG geometry keeps the glyphs independent of font metrics. Each draws
// on a 24-unit grid with a 1.5 stroke so the four read as one family at 16px.
const svg = (body: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

/** The glyph a theme trigger shows for each preference: sun, moon, and a monitor for following the system. */
export const THEME_ICONS: Record<Theme, string> = {
  light: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  dark: svg('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>'),
  auto: svg('<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>'),
};

/** The language trigger's globe. */
export const GLOBE_ICON = svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>');

/** The check a choice menu draws beside the current item. */
export const CHECK_ICON = svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>');

/** Visible and accessible text of the theme menu. */
export interface ThemeMenuLabels {
  /** Name of the menu and prefix of the trigger's accessible name. */
  theme: string;
  light: string;
  dark: string;
  /** The `auto` preference: follow the operating system. */
  system: string;
}

export const DEFAULT_THEME_MENU_LABELS: ThemeMenuLabels = {
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const THEME_ORDER: Theme[] = ['light', 'dark', 'auto'];

/** Light, Dark and System, with the current preference checked. */
export function themeMenuItems(theme: Theme, labels: ThemeMenuLabels): MenuItem[] {
  return THEME_ORDER.map(value => ({ value, label: themeLabel(value, labels), checked: value === theme }));
}

export function themeLabel(theme: Theme, labels: ThemeMenuLabels): string {
  return theme === 'auto' ? labels.system : labels[theme];
}

/** Accessible name of a theme trigger: the menu name and the current preference. */
export function themeTriggerLabel(theme: Theme, labels: ThemeMenuLabels): string {
  return `${labels.theme}: ${themeLabel(theme, labels)}`;
}

export const DEFAULT_LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中', name: '中文' },
];

const localeName = (option: LocaleOption) => option.name ?? option.label;

/** One item per offered language, named in that language, with the current one checked. */
export function localeMenuItems(locale: string, locales: LocaleOption[]): MenuItem[] {
  return locales.map(option => ({ value: option.code, label: localeName(option), checked: option.code === locale }));
}

/** Accessible name of a language trigger: the menu name and the current language. */
export function localeTriggerLabel(locale: string, locales: LocaleOption[], label: string): string {
  const current = locales.find(option => option.code === locale);
  return current ? `${label}: ${localeName(current)}` : label;
}

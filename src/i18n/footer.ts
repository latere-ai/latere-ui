// Self-contained dictionary for the shared footer. Mirrors the footer.* and
// nav.cat.* keys from the marketing site so consuming apps need not provide them.
//
// `Locale` is an open string: the package bundles en + zh, and hosts can support
// additional locales (e.g. de) by passing a `messages` override to the footer.
export type Locale = string;

type Dict = Record<string, string>;

/** Per-locale string overrides supplied by the host, merged over the bundled dicts. */
export type Messages = Record<string, Dict>;

/** Theme selection driving the footer's theme toggle. */
export type Theme = 'light' | 'dark' | 'auto';

/** One selectable language in the footer's locale dropdown. */
export interface LocaleOption {
  code: string;
  /** Short label (e.g. "EN", "中"); falls back to `code` if `name` is absent. */
  label: string;
  /** Full display name shown in the dropdown (e.g. "English", "中文"). */
  name?: string;
}

export const en: Dict = {
  'nav.cat.workspace': 'Work surface',
  'nav.cat.agents': 'Governance',
  'nav.cat.infrastructure': 'Runtime',
  'footer.products': 'Products',
  'footer.products.wallfacer': 'Wallfacer',
  'footer.products.topos': 'Topos',
  'footer.products.agon': 'Agon',
  'footer.products.cella': 'Cella',
  'footer.products.lux': 'Lux',
  'footer.products.lectio': 'Lectio',
  'footer.foundation': 'Account',
  'footer.identity': 'Identity',
  'footer.identity.note': 'One sign-in for Latere products.',
  'footer.company': 'Company',
  'footer.blog': 'Blog',
  'footer.team': 'Team',
  'footer.contact': 'Contact',
  'footer.legal': 'Legal',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.impressum': 'Impressum',
  'footer.tagline': 'Human intelligence in the loop.',
  'footer.theme': 'Theme',
  'footer.language': 'Language',
  'footer.rights': '&copy; 2026 Latere AI. All rights reserved.',
};

export const zh: Dict = {
  'nav.cat.workspace': '工作界面',
  'nav.cat.agents': '治理',
  'nav.cat.infrastructure': '运行时',
  'footer.products': '产品',
  'footer.products.wallfacer': 'Wallfacer',
  'footer.products.topos': 'Topos',
  'footer.products.agon': 'Agon',
  'footer.products.cella': 'Cella',
  'footer.products.lux': 'Lux',
  'footer.products.lectio': 'Lectio',
  'footer.foundation': '账户',
  'footer.identity': '身份',
  'footer.identity.note': '一次登录即可使用 Latere 产品。',
  'footer.company': '公司',
  'footer.blog': '博客',
  'footer.team': '团队',
  'footer.contact': '联系',
  'footer.legal': '法律',
  'footer.privacy': '隐私政策',
  'footer.terms': '服务条款',
  'footer.impressum': '法律声明',
  'footer.tagline': '人类智慧始终在回路中。',
  'footer.theme': '主题',
  'footer.language': '语言',
  'footer.rights': '&copy; 2026 Latere AI. 保留所有权利。',
};

export const de: Dict = {
  'nav.cat.workspace': 'Arbeitsfläche',
  'nav.cat.agents': 'Governance',
  'nav.cat.infrastructure': 'Laufzeit',
  'footer.products': 'Produkte',
  'footer.products.wallfacer': 'Wallfacer',
  'footer.products.topos': 'Topos',
  'footer.products.agon': 'Agon',
  'footer.products.cella': 'Cella',
  'footer.products.lux': 'Lux',
  'footer.products.lectio': 'Lectio',
  'footer.foundation': 'Konto',
  'footer.identity': 'Identität',
  'footer.identity.note': 'Eine Anmeldung für alle Latere-Produkte.',
  'footer.company': 'Unternehmen',
  'footer.blog': 'Blog',
  'footer.team': 'Team',
  'footer.contact': 'Kontakt',
  'footer.legal': 'Rechtliches',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'AGB',
  'footer.impressum': 'Impressum',
  'footer.tagline': 'Menschliche Intelligenz im Loop.',
  'footer.theme': 'Design',
  'footer.language': 'Sprache',
  'footer.rights': '&copy; 2026 Latere AI. Alle Rechte vorbehalten.',
};

const dicts: Record<string, Dict> = { en, zh, de };

/**
 * Resolve footer copy for a locale. Lookup order: host `messages` override →
 * bundled dictionary for the locale → English → the key itself.
 */
export function translator(locale: Locale, messages?: Messages) {
  return (key: string): string =>
    messages?.[locale]?.[key] ?? dicts[locale]?.[key] ?? en[key] ?? key;
}

// Self-contained dictionary for the shared footer. Mirrors the footer.* and
// nav.cat.* keys from the marketing site so consuming apps need not provide them.
export type Locale = 'en' | 'zh';

type Dict = Record<string, string>;

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
  'footer.rights': '&copy; 2026 Latere. All rights reserved.',
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
  'footer.rights': '&copy; 2026 Latere. 保留所有权利。',
};

const dicts: Record<Locale, Dict> = { en, zh };

export function translator(locale: Locale) {
  const active = dicts[locale] || en;
  return (key: string): string => active[key] ?? en[key] ?? key;
}

import { LATERE_PRODUCTS } from './productSwitcher';

interface FooterLink {
  slug: string;
  labelKey: string;
  href: string;
  brandClass?: string;
}

interface FooterGroup {
  id: string;
  labelKey: string;
  links: readonly FooterLink[];
}

function application(slug: 'wallfacer' | 'lectio'): FooterLink {
  const product = LATERE_PRODUCTS.find(p => p.slug === slug)!;
  return { slug, labelKey: `footer.products.${slug}`, href: `${product.url}/`, brandClass: product.brandClass };
}

/** Shared wayfinding for full and compact footers in both adapters. */
export const FOOTER_GROUPS: readonly FooterGroup[] = [
  { id: 'applications', labelKey: 'footer.applications', links: [application('wallfacer'), application('lectio')] },
  { id: 'research', labelKey: 'footer.research', links: [{ slug: 'replichai', brandClass: 'replichai-brand', labelKey: 'footer.products.replichai', href: 'https://replichai.latere.ai/' }] },
  { id: 'platform', labelKey: 'footer.platform', links: [{ slug: 'platform', brandClass: 'platform-brand', labelKey: 'footer.products.platform', href: 'https://platform.latere.ai/console' }] },
];

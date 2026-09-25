import { LATERE_PRODUCTS } from './productSwitcher';

/**
 * One footer destination. `href` is absolute, or a path on the host's company
 * site when `site` is set: those render through the host's `routerLink`
 * with a relative `to`, or as `baseUrl + href` without one.
 */
interface FooterLink {
  slug: string;
  labelKey: string;
  href: string;
  site?: boolean;
  /** The label copy carries entities or markup and renders as HTML. */
  html?: boolean;
  /** Product wordmark class for the compact strip. */
  brandClass?: string;
  /**
   * Product whose gradient the full footer's column link takes on hover. The
   * link rests in the body face like its neighbors, so the columns read
   * evenly; the brand appears where the pointer or focus is.
   */
  brand?: string;
}

interface FooterGroup {
  id: string;
  labelKey: string;
  links: readonly FooterLink[];
}

function application(slug: 'wallfacer' | 'lectio'): FooterLink {
  const product = LATERE_PRODUCTS.find(p => p.slug === slug)!;
  return { slug, labelKey: `footer.products.${slug}`, href: `${product.url}/`, brandClass: product.brandClass, brand: slug };
}

const identity: FooterLink = { slug: 'identity', labelKey: 'footer.identity', href: 'https://auth.latere.ai/', html: true };
const contact: FooterLink = { slug: 'contact', labelKey: 'footer.contact', href: 'mailto:contact@latere.ai', html: true };
const site = (slug: string, labelKey: string, href: string): FooterLink => ({ slug, labelKey, href, site: true });

const applications: FooterGroup = { id: 'applications', labelKey: 'footer.applications', links: [application('wallfacer'), application('lectio')] };
const research: FooterGroup = { id: 'research', labelKey: 'footer.research', links: [{ slug: 'replichai', brandClass: 'replichai-brand', brand: 'replichai', labelKey: 'footer.products.replichai', href: 'https://replichai.latere.ai/' }] };
const platform: FooterGroup = { id: 'platform', labelKey: 'footer.platform', links: [{ slug: 'platform', brandClass: 'platform-brand', brand: 'platform', labelKey: 'footer.products.platform', href: 'https://platform.latere.ai/console' }, identity] };

/** The product groups, in order, shared by both layouts in both adapters. */
export const FOOTER_GROUPS: readonly FooterGroup[] = [applications, research, platform];

/** Company pages under the host's base URL, and the contact address. */
const company: FooterGroup = {
  id: 'company',
  labelKey: 'footer.company',
  links: [
    site('about', 'footer.about', '/about'),
    site('why-latere', 'footer.whyLatere', '/blog/why-latere'),
    site('blog', 'footer.blog', '/blog'),
    site('open-source', 'footer.openSource', '/open-source'),
    contact,
  ],
};

const legal: FooterGroup = {
  id: 'legal',
  labelKey: 'footer.legal',
  links: [
    site('privacy', 'footer.privacy', '/legal/privacy'),
    site('terms', 'footer.terms', '/legal/terms'),
    site('impressum', 'footer.impressum', '/legal/impressum'),
  ],
};

/**
 * The full footer's link columns, left to right. A column holds one or more
 * groups; Research sits under Applications as a second heading, so the five
 * groups fill four columns of similar height.
 */
export const FOOTER_COLUMNS: readonly (readonly FooterGroup[])[] = [
  [applications, research],
  [platform],
  [company],
  [legal],
];

/** The compact strip's company links: shorter labels, same destinations. */
export const FOOTER_COMPACT_LINKS: readonly FooterLink[] = [
  site('team', 'footer.team', '/about'),
  site('blog', 'footer.blog', '/blog'),
  site('open-source', 'footer.openSource', '/open-source'),
  contact,
  ...legal.links,
];

/** The social profiles, drawn as a row of glyphs. */
export const FOOTER_SOCIALS: readonly { title: string; href: string; d: string }[] = [
  { href: 'https://discord.gg/kAHqEAEA', title: 'Discord', d: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
  { href: 'https://www.linkedin.com/company/latere-ai/about/', title: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { href: 'https://x.com/LatereAI', title: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://github.com/latere-ai', title: 'GitHub', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
];

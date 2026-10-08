/**
 * One footer destination. `href` is absolute, or a path on the host's company
 * site when `site` is set: those render through the host's `routerLink`
 * with a relative `to`, or as `baseUrl + href` without one.
 */
export interface FooterLink {
  slug: string;
  labelKey: string;
  href: string;
  site?: boolean;
  /** The label copy carries entities or markup and renders as HTML. */
  html?: boolean;
  /**
   * Product whose gradient the column link takes on hover. The link rests in
   * the body face like its neighbors, so the columns read evenly; the brand
   * appears where the pointer or focus is.
   */
  brand?: string;
}

export interface FooterGroup {
  id: string;
  labelKey: string;
  links: readonly FooterLink[];
}

const site = (slug: string, labelKey: string, href: string): FooterLink => ({ slug, labelKey, href, site: true });

/** The chat, under its public name Latere, then the gallery of what people made with it. */
const applications: FooterGroup = {
  id: 'applications',
  labelKey: 'footer.applications',
  links: [
    { slug: 'chat', labelKey: 'footer.products.chat', href: 'https://chat.latere.ai/', brand: 'chat' },
    { slug: 'gallery', labelKey: 'footer.products.gallery', href: 'https://latere.site/' },
  ],
};

const research: FooterGroup = {
  id: 'research',
  labelKey: 'footer.research',
  links: [{ slug: 'replichai', labelKey: 'footer.products.replichai', href: 'https://replichai.latere.ai/', brand: 'replichai' }],
};

const platform: FooterGroup = {
  id: 'platform',
  labelKey: 'footer.platform',
  links: [
    { slug: 'platform', labelKey: 'footer.products.platform', href: 'https://platform.latere.ai/console', brand: 'platform' },
    { slug: 'identity', labelKey: 'footer.identity', href: 'https://auth.latere.ai/', html: true },
  ],
};

/** Company pages under the host's base URL, and the contact address. */
const company: FooterGroup = {
  id: 'company',
  labelKey: 'footer.company',
  links: [
    site('about', 'footer.about', '/about'),
    site('why-latere', 'footer.whyLatere', '/blog/why-latere'),
    site('blog', 'footer.blog', '/blog'),
    site('open-source', 'footer.openSource', '/open-source'),
    { slug: 'contact', labelKey: 'footer.contact', href: 'mailto:contact@latere.ai', html: true },
  ],
};

const legal: FooterGroup = {
  id: 'legal',
  labelKey: 'footer.legal',
  links: [
    site('trust', 'footer.trust', '/trust'),
    site('privacy', 'footer.privacy', '/legal/privacy'),
    site('terms', 'footer.terms', '/legal/terms'),
    site('impressum', 'footer.impressum', '/legal/impressum'),
  ],
};

/**
 * The footer's link columns, left to right. A column holds one or more
 * groups; Research sits under Applications as a second heading, so the five
 * groups fill four columns of similar height. Every Latere site draws these
 * columns, so they are the one list of where the family's footer leads.
 */
export const FOOTER_COLUMNS: readonly (readonly FooterGroup[])[] = [
  [applications, research],
  [platform],
  [company],
  [legal],
];

/**
 * The social profiles, drawn as a row of glyphs. Slack goes through the
 * company site's /slack redirect to the current invite, so a rotated invite
 * changes the site and not this package.
 */
export const FOOTER_SOCIALS: readonly { title: string; href: string; d: string }[] = [
  { href: 'https://latere.ai/slack', title: 'Slack', d: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z' },
  { href: 'https://www.linkedin.com/company/latere-ai/about/', title: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { href: 'https://x.com/LatereAI', title: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://github.com/latere-ai', title: 'GitHub', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
];

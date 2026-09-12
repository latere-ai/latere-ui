// React adapter of SiteFooter.vue — the shared Latere footer, in both its
// variants. Presentational: it takes `theme`/`locale` and reports changes back,
// so the host's own prefs store stays the single source of truth.
//
// Copy comes from `i18n/footer.ts` and the product lineup from
// `components/productSwitcher.ts`; both are framework-free `.ts` modules the
// SFC reads too, so the two adapters cannot drift on what the footer says or
// which products it lists.
import { type ComponentType, type ReactNode } from 'react';
import '../styles/footer.css';
import { translator, type Locale, type Messages, type Theme, type LocaleOption } from '../i18n/footer';
import { LATERE_PRODUCTS } from '../components/productSwitcher';
import { LatereLogoMark } from './LatereLogoMark';

export type { Locale, Messages, Theme, LocaleOption };

/** Router link component, e.g. react-router's `Link`. Receives a relative `to`. */
export type RouterLinkComponent = ComponentType<any>;

export interface SiteFooterProps {
  /** Current theme; drives the active state of the theme toggle. */
  theme: Theme;
  /** Called with the theme the reader picked. */
  onThemeChange?: (theme: Theme) => void;
  /** Current locale; selects footer copy and the active language option. */
  locale: Locale;
  /** Called with the locale the reader picked. */
  onLocaleChange?: (locale: Locale) => void;
  /** Languages offered in the locale dropdown. Defaults to English + Chinese. */
  locales?: LocaleOption[];
  /** Per-locale string overrides, merged over the bundled footer dictionaries. */
  messages?: Messages;
  /**
   * Compact layout: brand + a single wrapped row of links + controls, instead
   * of the full product-showcase columns. ~1/3 the height; for app surfaces
   * (auth, dashboards) where the full footer is too tall.
   */
  compact?: boolean;
  /** Origin used for the site's own links (Team, Blog, Legal, home). */
  baseUrl?: string;
  /**
   * Optional router-link component. When provided, internal links render
   * through it with a relative `to`, preserving SPA navigation. Otherwise they
   * fall back to absolute `<a>` under `baseUrl`.
   */
  routerLink?: RouterLinkComponent;
}

const DEFAULT_LOCALES: LocaleOption[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中', name: '中文' },
];

const THEMES: { v: Theme; label: string }[] = [
  { v: 'light', label: '☀' },
  { v: 'dark', label: '☾' },
  { v: 'auto', label: '◐' },
];

// Product links come from the shared registry (also used by ProductSwitcher)
// so the lineup lives in one place; Identity stays a separate row because the
// footer presents it as the platform sign-in, not a product.
const FOOTER_PRODUCTS = LATERE_PRODUCTS.filter((p) => p.slug !== 'identity');

const SOCIALS: { href: string; title: string; d: string }[] = [
  { href: 'https://discord.gg/kAHqEAEA', title: 'Discord', d: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
  { href: 'https://www.linkedin.com/company/latere-ai/about/', title: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { href: 'https://x.com/LatereAI', title: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://github.com/latere-ai', title: 'GitHub', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' }
];

// The SFC renders these keys with `v-html` because the copy carries entities
// (`&copy;`) and inline markup. Same nodes, same trust boundary: a host that
// passes `messages` is passing markup into its own page.
function Html({ as: Tag = 'span', html, ...rest }: { as?: any; html: string } & Record<string, unknown>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

// The community column and the icon row list the same four places in
// different orders — the column reads as a list, the row as a strip — so the
// order is stated per surface rather than shared.
const COMMUNITY = ['Discord', 'X', 'GitHub', 'LinkedIn'].map(
  (title) => SOCIALS.find((s) => s.title === title)!,
);

function Social() {
  return (
    <div className="footer-social">
      {SOCIALS.map((s) => (
        <a key={s.title} href={s.href} target="_blank" rel="noopener" title={s.title}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d={s.d} />
          </svg>
        </a>
      ))}
    </div>
  );
}

export function SiteFooter({
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
  locales = DEFAULT_LOCALES,
  messages,
  compact = false,
  baseUrl = 'https://latere.ai',
  routerLink,
}: SiteFooterProps) {
  const t = translator(locale, messages);

  // Internal link rendering: relative `to` for routerLink, absolute href
  // otherwise — the same branch the SFC makes with `<component :is>`.
  const Link: any = routerLink ?? 'a';
  const to = (path: string) => (routerLink ? { to: path } : { href: baseUrl + path });
  const link = (path: string, key: string): ReactNode => (
    <Link key={path} {...to(path)}>
      {t(key)}
    </Link>
  );

  const prefs = (
    <div className="footer-prefs">
      <div className="footer-seg" role="group" aria-label={t('footer.theme')}>
        {THEMES.map((opt) => (
          <button
            key={opt.v}
            type="button"
            className={theme === opt.v ? 'footer-seg-btn is-active' : 'footer-seg-btn'}
            onClick={() => onThemeChange?.(opt.v)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="footer-lang">
        <select
          className="footer-lang-select"
          value={locale}
          aria-label={t('footer.language')}
          onChange={(e) => onLocaleChange?.(e.target.value)}
        >
          {locales.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name ?? opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Compact: a desktop bar with a separate mobile navigation row (copyright, scrollable links, controls) for app
  // surfaces where the full footer is too tall. Stays one line tall at any
  // width; the link strip scrolls horizontally when it does not fit.
  if (compact) {
    return (
      <footer className="site-footer site-footer-compact">
        <Html as="p" className="footer-compact-copy" html={t('footer.rights')} />
        <nav className="footer-compact-links" aria-label={t('footer.products')}>
          {FOOTER_PRODUCTS.map((p) => (
            <a key={p.slug} href={`${p.url}/`}>
              <span className={p.brandClass}>{t(`footer.products.${p.slug}`)}</span>
            </a>
          ))}
          <Html as="a" href="https://auth.latere.ai/" html={t('footer.identity')} />
          {link('/about', 'footer.team')}
          {link('/blog', 'footer.blog')}
          <Html as="a" href="mailto:contact@latere.ai" html={t('footer.contact')} />
          {link('/legal/privacy', 'footer.privacy')}
          {link('/legal/terms', 'footer.terms')}
          {link('/legal/impressum', 'footer.impressum')}
        </nav>
        <div className="footer-extra">
          {prefs}
          <Social />
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link {...to('/')} className="logo-link">
            <span className="logo-mark logo-mark-footer" aria-hidden="true">
              <LatereLogoMark className="logo-mark-icon" />
            </span>
            <span className="logo-text">Latere AI</span>
          </Link>
          <Html as="p" className="footer-tagline" html={t('footer.tagline')} />
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <Html as="h4" className="footer-col-title" html={t('footer.products')} />
            {FOOTER_PRODUCTS.map((p) => (
              <a key={p.slug} href={`${p.url}/`}>
                <span className={p.brandClass}>{t(`footer.products.${p.slug}`)}</span>
              </a>
            ))}
          </div>
          <div className="footer-col">
            <Html as="h4" className="footer-col-title" html={t('footer.latere')} />
            {link('/about', 'footer.about')}
            {link('/blog/why-latere', 'footer.whyLatere')}
            {link('/blog', 'footer.blog')}
            <Html as="a" href="mailto:contact@latere.ai" html={t('footer.contact')} />
            <Html as="a" href="https://auth.latere.ai/" html={t('footer.identity')} />
          </div>
          <div className="footer-col">
            <Html as="h4" className="footer-col-title" html={t('footer.legal')} />
            {link('/legal/privacy', 'footer.privacy')}
            {link('/legal/terms', 'footer.terms')}
            {link('/legal/impressum', 'footer.impressum')}
          </div>
          <div className="footer-col">
            <Html as="h4" className="footer-col-title" html={t('footer.community')} />
            {COMMUNITY.map((s) => (
              <a key={s.title} href={s.href} target="_blank" rel="noopener" className="footer-external">
                {s.title}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-extra">
          {prefs}
          <Social />
        </div>
      </div>

      <div className="footer-bottom">
        <Html as="p" html={t('footer.rights')} />
      </div>
    </footer>
  );
}

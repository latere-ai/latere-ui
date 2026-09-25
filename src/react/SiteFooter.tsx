// React adapter of SiteFooter.vue — the shared Latere footer, in both its
// variants. Presentational: it takes `theme`/`locale` and reports changes back,
// so the host's own prefs store stays the single source of truth.
//
// Copy comes from `i18n/footer.ts` and the links from
// `components/footerNavigation.ts`; both are framework-free `.ts` modules the
// SFC reads too, so the two adapters cannot drift on what the footer says or
// where it links.
import { type ComponentType, type ReactNode } from 'react';
import '../styles/footer.css';
import { translator, type Locale, type Messages, type Theme, type LocaleOption } from '../i18n/footer';
import { FOOTER_COLUMNS, FOOTER_COMPACT_LINKS, FOOTER_GROUPS, FOOTER_SOCIALS } from '../components/footerNavigation';
import { DEFAULT_LOCALE_OPTIONS } from '../components/preferenceMenus';
import { LatereLogoMark } from './LatereLogoMark';
import { ThemeMenu } from './ThemeMenu';
import { LocaleMenu } from './LocaleMenu';

export type { Locale, Messages, Theme, LocaleOption };

/** Router link component, e.g. react-router's `Link`. Receives a relative `to`. */
export type RouterLinkComponent = ComponentType<any>;

export interface SiteFooterProps {
  /** Current theme; drives the theme menu's icon and checked item. */
  theme: Theme;
  /** Called with the theme the reader picked. */
  onThemeChange?: (theme: Theme) => void;
  /** Current locale; selects footer copy and the checked language. */
  locale: Locale;
  /** Called with the locale the reader picked. */
  onLocaleChange?: (locale: Locale) => void;
  /** Languages offered in the language menu. Defaults to English + Chinese. */
  locales?: LocaleOption[];
  /** Per-locale string overrides, merged over the bundled footer dictionaries. */
  messages?: Messages;
  /**
   * Compact layout: one wrapped row of links above the controls, instead of
   * the lockup and link columns. For app surfaces (auth, dashboards) where
   * the full footer is too tall.
   */
  compact?: boolean;
  /** Origin used for the site's own links (About, Blog, Legal, home). */
  baseUrl?: string;
  /**
   * Optional router-link component. When provided, internal links render
   * through it with a relative `to`, preserving SPA navigation. Otherwise they
   * fall back to absolute `<a>` under `baseUrl`.
   */
  routerLink?: RouterLinkComponent;
  /**
   * The host site's lockup at the head of the full footer, the Vue adapter's
   * `#brand` slot. Defaults to the Latere AI lockup linked to `baseUrl`.
   */
  brand?: ReactNode;
}

// The SFC renders these keys with `v-html` because the copy carries entities
// (`&copy;`) and inline markup. Same nodes, same trust boundary: a host that
// passes `messages` is passing markup into its own page.
function Html({ as: Tag = 'span', html, ...rest }: { as?: any; html: string } & Record<string, unknown>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Social({ label }: { label: string }) {
  return (
    <div className="footer-social" role="group" aria-label={label}>
      {FOOTER_SOCIALS.map((s) => (
        <a key={s.title} href={s.href} target="_blank" rel="noopener" title={s.title} aria-label={s.title}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
  locales = DEFAULT_LOCALE_OPTIONS,
  messages,
  compact = false,
  baseUrl = 'https://latere.ai',
  routerLink,
  brand,
}: SiteFooterProps) {
  const t = translator(locale, messages);
  const themeLabels = {
    theme: t('footer.theme'),
    light: t('footer.theme.light'),
    dark: t('footer.theme.dark'),
    system: t('footer.theme.system'),
  };

  // Internal link rendering: relative `to` for routerLink, absolute href
  // otherwise — the same branch the SFC makes with `<component :is>`.
  const Link: any = routerLink ?? 'a';
  const to = (path: string) => (routerLink ? { to: path } : { href: baseUrl + path });

  const prefs = (placement: 'top-start' | 'top-end') => (
    <div className="footer-prefs">
      <ThemeMenu theme={theme} labels={themeLabels} placement={placement} onThemeChange={onThemeChange} />
      <LocaleMenu locale={locale} locales={locales} label={t('footer.language')} placement={placement} onLocaleChange={onLocaleChange} />
    </div>
  );

  // Compact navigation wraps complete labels; preferences sit below.
  if (compact) {
    return (
      <footer className="site-footer site-footer-compact">
        <Html as="p" className="footer-compact-copy" html={t('footer.rights')} />
        <nav className="footer-compact-links" aria-label={t('footer.products')}>
          {FOOTER_GROUPS.map(group => (
            <div key={group.id} className="footer-compact-group" data-footer-group={group.id} role="group" aria-label={t(group.labelKey)}>
              <span className="footer-group-title" aria-hidden="true">{t(group.labelKey)}</span>
              {group.links.map(link => link.html
                ? <Html key={link.slug} as="a" href={link.href} html={t(link.labelKey)} />
                : <a key={link.slug} href={link.href}><span className={link.brandClass}>{t(link.labelKey)}</span></a>)}
            </div>
          ))}
          {FOOTER_COMPACT_LINKS.map(link => link.html
            ? <Html key={link.slug} as="a" href={link.href} html={t(link.labelKey)} />
            : <Link key={link.slug} {...to(link.href)}>{t(link.labelKey)}</Link>)}
        </nav>
        <div className="footer-extra">
          {prefs('top-end')}
          <Social label={t('footer.social')} />
        </div>
      </footer>
    );
  }

  // The lockup, the social row and the preferences lead; the link columns
  // follow; the copyright closes the footer.
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-lead">
          <div className="footer-lockup">
            {brand ?? (
              <Link {...to('/')} className="logo-link">
                <span className="logo-mark logo-mark-footer" aria-hidden="true">
                  <LatereLogoMark className="logo-mark-icon" />
                </span>
                <span className="logo-text">Latere AI</span>
              </Link>
            )}
          </div>
          <Social label={t('footer.social')} />
          <hr className="footer-rule" />
          {prefs('top-start')}
        </div>

        <nav className="footer-cols" aria-label={t('footer.navigation')}>
          {FOOTER_COLUMNS.map((column, index) => (
            <div key={index} className="footer-col">
              {column.map(group => (
                <div key={group.id} className="footer-group" data-footer-group={group.id} role="group" aria-label={t(group.labelKey)}>
                  <h2 className="footer-col-title">{t(group.labelKey)}</h2>
                  <ul className="footer-links">
                    {group.links.map(link => (
                      <li key={link.slug}>
                        {link.html
                          ? <Html as="a" href={link.href} className="footer-link" html={t(link.labelKey)} />
                          : link.site
                            ? <Link {...to(link.href)} className="footer-link">{t(link.labelKey)}</Link>
                            : <a href={link.href} className="footer-link" data-brand={link.brand}>{t(link.labelKey)}</a>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <Html as="p" html={t('footer.rights')} />
      </div>
    </footer>
  );
}

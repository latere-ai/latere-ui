// SiteFooter: the one footer every Latere site ends in. The family's lineup,
// the company and legal links, the social profiles, the theme and language
// menus and the copyright are the same on every site; a site passes its own
// lockup (`brand`) and wires the theme and the language to its own
// preferences, and nothing else. Its classes are `lu-footer*` and its sheet
// is footer.css: a site does not restyle them.
//
// Copy comes from `i18n/footer.ts` and the links from
// `components/footerNavigation.ts`, framework-free modules, so the footer's
// words and destinations have one source.
import { type ComponentType, type ReactNode } from 'react';
import '../styles/footer.css';
import { footerLang, translator, type Locale, type Theme, type LocaleOption } from '../i18n/footer';
import { FOOTER_COLUMNS, FOOTER_SOCIALS } from '../components/footerNavigation';
import { DEFAULT_LOCALE_OPTIONS } from '../components/preferenceMenus';
import { LatereLogoMark } from './LatereLogoMark';
import { ThemeMenu } from './ThemeMenu';
import { LocaleMenu } from './LocaleMenu';

export type { Locale, Theme, LocaleOption };

/** Router link component, e.g. react-router's `Link`. Receives a relative `to`. */
export type RouterLinkComponent = ComponentType<any>;

export interface SiteFooterProps {
  /** Current theme; drives the theme menu's icon and checked item. */
  theme: Theme;
  /**
   * Called with the theme the reader picked. Without it the footer shows no
   * theme menu, since a pick would change nothing.
   */
  onThemeChange?: (theme: Theme) => void;
  /** Current locale; selects the footer's copy and the checked language. */
  locale: Locale;
  /**
   * Called with the locale the reader picked. Without it, or with fewer than
   * two `locales`, the footer shows no language menu: a site in one language
   * offers no other.
   */
  onLocaleChange?: (locale: Locale) => void;
  /** Languages offered in the language menu. Defaults to English and Chinese. */
  locales?: LocaleOption[];
  /** Origin of the company site's own links (About, Blog, Legal). */
  baseUrl?: string;
  /**
   * Optional router-link component. When provided, the company site's links
   * render through it with a relative `to`, preserving SPA navigation, as on
   * the company site itself. Otherwise they are absolute `<a>` under
   * `baseUrl`.
   */
  routerLink?: RouterLinkComponent;
  /**
   * The site's lockup at the head of the footer: its mark and its name, as
   * its header sets them, linked to its home. Defaults to the Latere AI
   * lockup linked to `baseUrl`.
   */
  brand?: ReactNode;
}

// The copy carries entities (`&copy;`) and inline markup, so these keys
// render as HTML. The dictionaries are the package's own.
function Html({ as: Tag = 'span', html, ...rest }: { as?: any; html: string } & Record<string, unknown>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Social({ label }: { label: string }) {
  return (
    <div className="lu-footer-social" role="group" aria-label={label}>
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
  baseUrl = 'https://latere.ai',
  routerLink,
  brand,
}: SiteFooterProps) {
  const t = translator(locale);
  const themeLabels = {
    theme: t('footer.theme'),
    light: t('footer.theme.light'),
    dark: t('footer.theme.dark'),
    system: t('footer.theme.system'),
  };

  // The company site's links: a relative `to` through the host's router, or
  // an absolute href under `baseUrl`.
  const Link: any = routerLink ?? 'a';
  const to = (path: string) => (routerLink ? { to: path } : { href: baseUrl + path });

  const themeMenu = onThemeChange !== undefined;
  const localeMenu = onLocaleChange !== undefined && locales.length > 1;

  // The lockup, the social row and the preferences lead; the link columns
  // follow; the copyright closes the footer.
  return (
    <footer className="lu-footer" lang={footerLang(locale)}>
      <div className="lu-footer-container">
        <div className="lu-footer-lead">
          <div className="lu-footer-lockup">
            {brand ?? (
              <Link {...to('/')} className="lu-footer-home">
                <span className="lu-footer-mark" aria-hidden="true">
                  <LatereLogoMark className="lu-footer-mark-icon" />
                </span>
                <span className="lu-footer-word">Latere AI</span>
              </Link>
            )}
          </div>
          <Social label={t('footer.social')} />
          {(themeMenu || localeMenu) && (
            <>
              <hr className="lu-footer-rule" />
              <div className="lu-footer-prefs">
                {themeMenu && <ThemeMenu theme={theme} labels={themeLabels} placement="top-start" onThemeChange={onThemeChange} />}
                {localeMenu && <LocaleMenu locale={locale} locales={locales} label={t('footer.language')} placement="top-start" onLocaleChange={onLocaleChange} />}
              </div>
            </>
          )}
        </div>

        <nav className="lu-footer-cols" aria-label={t('footer.navigation')}>
          {FOOTER_COLUMNS.map((column, index) => (
            <div key={index} className="lu-footer-col">
              {column.map(group => (
                <div key={group.id} className="lu-footer-group" data-footer-group={group.id} role="group" aria-label={t(group.labelKey)}>
                  <h2 className="lu-footer-col-title">{t(group.labelKey)}</h2>
                  <ul className="lu-footer-links">
                    {group.links.map(link => (
                      <li key={link.slug}>
                        {link.html
                          ? <Html as="a" href={link.href} className="lu-footer-link" html={t(link.labelKey)} />
                          : link.site
                            ? <Link {...to(link.href)} className="lu-footer-link">{t(link.labelKey)}</Link>
                            : <a href={link.href} className="lu-footer-link" data-brand={link.brand}>{t(link.labelKey)}</a>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="lu-footer-bottom">
        <Html as="p" html={t('footer.rights')} />
      </div>
    </footer>
  );
}

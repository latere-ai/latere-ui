// SiteFooter: the link columns, the lead block, the preference menus, link
// routing and the bundled translations.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { SiteFooter, type SiteFooterProps } from '../SiteFooter';
import { FOOTER_COLUMNS } from '../../components/footerNavigation';
import { en, zh, de } from '../../i18n/footer';

afterEach(cleanup);

function mount(props: Partial<SiteFooterProps> = {}) {
  return render(<SiteFooter theme="auto" locale="en" {...props} />);
}
const wired = { onThemeChange: () => undefined, onLocaleChange: () => undefined };

const hrefs = (c: Element) => Array.from(c.querySelectorAll('a')).map((a) => a.getAttribute('href'));
const DESTINATIONS = {
  applications: ['https://chat.latere.ai/', 'https://latere.site/'],
  research: ['https://replichai.latere.ai/'],
  platform: ['https://platform.latere.ai/console', 'https://auth.latere.ai/'],
  company: ['https://latere.ai/about', 'https://latere.ai/blog/why-latere', 'https://latere.ai/blog', 'https://latere.ai/open-source', 'mailto:contact@latere.ai'],
  legal: ['https://latere.ai/trust', 'https://latere.ai/legal/privacy', 'https://latere.ai/legal/terms', 'https://latere.ai/legal/impressum'],
};

describe('SiteFooter (React)', () => {
  for (const [locale, dict] of Object.entries({ en, zh, de })) {
    it(`lays five groups out in four columns in ${locale}`, () => {
      const { container } = mount({ locale });
      const columns = Array.from(container.querySelectorAll('.lu-footer-cols > .lu-footer-col'));
      expect(columns.map(c => Array.from(c.querySelectorAll('[data-footer-group]')).map(g => g.getAttribute('data-footer-group')))).toEqual([
        ['applications', 'research'], ['platform'], ['company'], ['legal'],
      ]);
      const groups = Array.from(container.querySelectorAll('[data-footer-group]'));
      expect(groups.map(g => g.getAttribute('role'))).toEqual(Array(5).fill('group'));
      expect(groups.map(g => g.querySelector('h2.lu-footer-col-title')!.textContent)).toEqual([
        dict['footer.applications'], dict['footer.research'], dict['footer.platform'], dict['footer.company'], dict['footer.legal'],
      ]);
      expect(groups.map(g => g.getAttribute('aria-label'))).toEqual(groups.map(g => g.querySelector('h2')!.textContent));
      expect(groups.map(g => Array.from(g.querySelectorAll('li > a.lu-footer-link')).map(a => a.getAttribute('href')))).toEqual(Object.values(DESTINATIONS));
      expect(container.querySelector('.lu-footer-cols')!.tagName).toBe('NAV');
      expect(container.querySelector('.lu-footer-cols')!.getAttribute('aria-label')).toBe(dict['footer.navigation']);
      expect(container.textContent).not.toMatch(/Topos|Cella|Lux/);
    });

    // The gallery of what people made follows the chat they made it in.
    it(`lists the gallery after the chat under Applications in ${locale}`, () => {
      const { container } = mount({ locale });
      const links = Array.from(container.querySelectorAll('[data-footer-group="applications"] a'));
      expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([
        [dict['footer.products.chat'], 'https://chat.latere.ai/'],
        [dict['footer.products.gallery'], 'https://latere.site/'],
      ]);
    });
  }

  it('names the gallery in each language', () => {
    expect([en, zh, de].map(d => d['footer.products.gallery'])).toEqual(['Gallery', '作品广场', 'Galerie']);
  });

  it('sets product names in the columns as plain links that carry their product for the hover gradient', () => {
    const { container } = mount();
    const links = Array.from(container.querySelectorAll('.lu-footer-cols a.lu-footer-link'));
    expect(links.filter(a => a.hasAttribute('data-brand')).map(a => [a.textContent, a.getAttribute('data-brand')])).toEqual([
      ['Latere', 'chat'], ['ReplicHAI', 'replichai'], ['Latere Platform', 'platform'],
    ]);
    expect(container.querySelector('.lu-footer-cols [class$="-brand"]')).toBeNull();
    for (const name of ['Identity', 'Gallery']) expect(links.find(a => a.textContent === name)!.hasAttribute('data-brand')).toBe(false);
  });

  it('leads with the lockup, the social row, a hairline and the preference menus, in that order', () => {
    const lead = mount(wired).container.querySelector('.lu-footer-lead')!;
    expect(Array.from(lead.children).map(el => el.className)).toEqual(['lu-footer-lockup', 'lu-footer-social', 'lu-footer-rule', 'lu-footer-prefs']);
    expect(lead.querySelector('.lu-footer-lockup .lu-footer-home')!.getAttribute('href')).toBe('https://latere.ai/');
    expect(lead.querySelector('.lu-footer-word')!.textContent).toBe('Latere AI');
    expect(lead.querySelector('.lu-footer-social')!.getAttribute('aria-label')).toBe('Social profiles');
    expect(Array.from(lead.querySelectorAll('.lu-footer-social a')).map(a => a.getAttribute('aria-label'))).toEqual(['Slack', 'LinkedIn', 'X', 'GitHub']);
    // The company site redirects /slack to the current invite, so a rotated invite needs no footer release.
    expect(lead.querySelector('.lu-footer-social a')!.getAttribute('href')).toBe('https://latere.ai/slack');
    expect(lead.querySelector('hr.lu-footer-rule')).not.toBeNull();
    expect(Array.from(lead.querySelectorAll('.lu-footer-prefs .lu-pref')).map(m => m.className)).toEqual([
      'lu-pop lu-pref lu-theme-menu', 'lu-pop lu-pref lu-locale-menu',
    ]);
  });

  it('takes the host lockup through the brand prop', () => {
    const { container } = mount({ brand: <a className="host-lockup" href="https://platform.latere.ai/">Latere Platform</a> });
    expect(container.querySelector('.lu-footer-lockup .host-lockup')!.getAttribute('href')).toBe('https://platform.latere.ai/');
    expect(container.querySelector('.lu-footer-lockup .lu-footer-home')).toBeNull();
  });

  // Every class the footer draws is in its own namespace, so a site's own
  // `.footer-*` or `.logo-*` rules never reach it, and a site that restyles
  // it is easy to find.
  it('draws only lu-footer classes outside the lockup a site passes and the shared menus', () => {
    const { container } = mount({ ...wired, brand: <span className="host-lockup">Latere</span> });
    const own = Array.from(container.querySelectorAll('footer, footer *'))
      .filter(el => !el.closest('.lu-footer-lockup') && !el.closest('.lu-pref') && !(el instanceof SVGElement))
      .flatMap(el => Array.from(el.classList));
    expect(own.length).toBeGreaterThan(0);
    expect(own.filter(name => !name.startsWith('lu-footer'))).toEqual([]);
  });

  it('closes with the copyright line, rendered as HTML rather than escaped text', () => {
    const { container } = mount();
    expect(container.querySelector('footer')!.lastElementChild!.className).toBe('lu-footer-bottom');
    expect(container.querySelector('.lu-footer-bottom p')!.textContent).toBe('© 2026 Latere AI. All rights reserved.');
    expect(container.innerHTML).not.toContain('&amp;copy;');
  });

  // The navigation module is the only sanctioned source of the footer's links.
  it('links to no site outside the navigation module', () => {
    const allowed = new Set(FOOTER_COLUMNS.flat().flatMap(group => group.links.map(p => p.href)));
    const { container } = mount();
    const found = hrefs(container).filter((h): h is string => !!h && /latere\.(ai|site)/.test(h) && !h.startsWith('mailto:'));
    const products = found.filter((h) => !h.startsWith('https://latere.ai'));
    expect(products.length).toBeGreaterThan(0);
    for (const h of products) expect(allowed).toContain(h);
  });

  it('renders internal links as absolute URLs against baseUrl by default', () => {
    const found = hrefs(mount({ baseUrl: 'https://example.test' }).container);
    expect(found).toEqual(expect.arrayContaining(['https://example.test/about', 'https://example.test/blog', 'https://example.test/legal/privacy']));
    expect(found).toContain('https://example.test/');
  });

  it('routes internal links through a provided routerLink component', () => {
    const Stub = ({ to, children, ...rest }: any) => <a data-to={to} {...rest}>{children}</a>;
    const { container } = mount({ routerLink: Stub });
    const tos = Array.from(container.querySelectorAll('[data-to]')).map((a) => a.getAttribute('data-to'));
    expect(tos).toEqual(expect.arrayContaining(['/about', '/blog', '/open-source', '/legal/terms']));
    expect(container.innerHTML).not.toContain('https://latere.ai/about');
  });

  it('reports the theme and the language picked from their menus', () => {
    const onThemeChange = vi.fn();
    const onLocaleChange = vi.fn();
    const { container } = mount({ onThemeChange, onLocaleChange });
    fireEvent.click(container.querySelector('.lu-theme-menu .lu-pref-trigger')!);
    expect(container.querySelector('.lu-theme-menu .lu-pop-panel')!.classList.contains('lu-pop-panel--top-start')).toBe(true);
    fireEvent.click(container.querySelectorAll('.lu-theme-menu [role="menuitemradio"]')[1]);
    fireEvent.click(container.querySelector('.lu-locale-menu .lu-pref-trigger')!);
    fireEvent.click(container.querySelectorAll('.lu-locale-menu [role="menuitemradio"]')[1]);
    expect(onThemeChange.mock.calls).toEqual([['dark']]);
    expect(onLocaleChange.mock.calls).toEqual([['zh']]);
  });

  it('checks the current theme and offers the default languages', () => {
    const { container } = mount({ ...wired, theme: 'dark' });
    expect(container.querySelector('.lu-theme-menu .lu-pref-trigger')!.getAttribute('aria-label')).toBe('Theme: Dark');
    fireEvent.click(container.querySelector('.lu-theme-menu .lu-pref-trigger')!);
    expect(Array.from(container.querySelectorAll('.lu-theme-menu [role="menuitemradio"]')).map(r => [r.textContent, r.getAttribute('aria-checked')])).toEqual([
      ['Light', 'false'], ['Dark', 'true'], ['System', 'false'],
    ]);
    fireEvent.click(container.querySelector('.lu-locale-menu .lu-pref-trigger')!);
    expect(Array.from(container.querySelectorAll('.lu-locale-menu [role="menuitemradio"]')).map(r => r.textContent)).toEqual(['English', '中文']);
  });

  it('checks the active language from a custom list', () => {
    const { container } = mount({
      ...wired,
      locale: 'de',
      locales: [
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'zh', label: '中', name: '中文' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
      ],
    });
    expect(container.querySelector('.lu-locale-menu .lu-pref-trigger')!.getAttribute('aria-label')).toBe('Sprache: Deutsch');
    fireEvent.click(container.querySelector('.lu-locale-menu .lu-pref-trigger')!);
    expect(Array.from(container.querySelectorAll('.lu-locale-menu [role="menuitemradio"]')).map(r => [r.textContent, r.getAttribute('aria-checked')])).toEqual([
      ['English', 'false'], ['中文', 'false'], ['Deutsch', 'true'],
    ]);
  });

  // A site in one language offers no other, and a menu whose pick changes
  // nothing is not offered: the site wires what it has.
  it('offers a language menu only for two languages or more and a handler', () => {
    const one = [{ code: 'en', label: 'EN', name: 'English' }];
    expect(mount({ onLocaleChange: () => undefined, locales: one }).container.querySelector('.lu-locale-menu')).toBeNull();
    cleanup();
    expect(mount({ locales: [...one, { code: 'zh', label: '中', name: '中文' }] }).container.querySelector('.lu-locale-menu')).toBeNull();
    cleanup();
    const theme = mount({ onThemeChange: () => undefined }).container;
    expect(theme.querySelector('.lu-theme-menu')).not.toBeNull();
    expect(theme.querySelector('.lu-locale-menu')).toBeNull();
    expect(theme.querySelector('hr.lu-footer-rule')).not.toBeNull();
  });

  it('draws no hairline or menus when the site wires neither', () => {
    const { container } = mount();
    expect(container.querySelector('.lu-pref')).toBeNull();
    expect(container.querySelector('.lu-footer-rule')).toBeNull();
    expect(container.querySelector('.lu-footer-prefs')).toBeNull();
  });

  it('localizes the headings and the theme menu from the locale prop', () => {
    const { container } = mount({ ...wired, locale: 'zh' });
    expect(Array.from(container.querySelectorAll('h2')).map(x => x.textContent)).toEqual(['应用', '研究', '平台', '公司', '法律']);
    expect(container.querySelector('.lu-theme-menu .lu-pref-trigger')!.getAttribute('aria-label')).toBe('主题: 跟随系统');
    fireEvent.click(container.querySelector('.lu-theme-menu .lu-pref-trigger')!);
    expect(Array.from(container.querySelectorAll('[role="menuitemradio"]')).map(r => r.textContent)).toEqual(['浅色', '深色', '跟随系统']);
    expect(container.querySelector('.lu-footer-bottom')!.textContent).toBe('© 2026 Latere AI. 保留所有权利。');
  });

  it('renders the brand mark as a painting SVG', () => {
    const svg = mount().container.querySelector('svg.latere-logo-mark')!;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.querySelectorAll('path').length).toBe(6);
  });

  // Drive shut down on 2026-09-19; durable storage is the platform's Storage
  // section, so the retired console must not come back.
  it('offers no retired Drive console', () => {
    const { container } = mount();
    expect(hrefs(container)).not.toContain('https://drive.latere.ai/');
    expect(container.textContent).not.toContain('Drive');
  });

  // The hosted Lectio service was retired on 2026-10-03, so the footer may
  // not link it, name it, or carry its hover gradient.
  it('offers no retired Lectio service', () => {
    const { container } = mount();
    expect(hrefs(container)).not.toContain('https://lectio.latere.ai/');
    expect(container.textContent).not.toContain('Lectio');
    expect(container.querySelector('[data-brand="lectio"], .lectio-brand')).toBeNull();
  });

  // Wallfacer left the lineup when the chat took the applications' place: its
  // pages stay up, but the footer leads no reader there.
  it('leads no reader to Wallfacer', () => {
    const { container } = mount();
    expect(hrefs(container).filter(h => h?.includes('wf.latere.ai'))).toEqual([]);
    expect(container.textContent).not.toContain('Wallfacer');
    expect(container.querySelector('[data-brand="wallfacer"], .wallfacer-brand')).toBeNull();
  });

  // The open source page is a company link, so it carries translated copy in
  // every bundled locale.
  it.each(Object.entries({ en, zh, de }))('links the open source page in %s', (locale, dict) => {
    const { container } = mount({ locale, locales: [{ code: locale, label: locale.toUpperCase() }] });
    const link = Array.from(container.querySelectorAll('a')).find((a) => a.getAttribute('href') === 'https://latere.ai/open-source');
    expect(link, `${locale}: open source link`).toBeTruthy();
    expect(link!.textContent).toBe(dict['footer.openSource']);
  });
});

describe('the footer social row', () => {
  // The glyphs live in one data module; the component draws no path of its own.
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
  it('is drawn from the shared data', () => {
    const src = read('src/react/SiteFooter.tsx');
    expect(Array.from(src.matchAll(/<path d="([^"]+)"/g))).toEqual([]);
    expect(src).toContain('FOOTER_SOCIALS');
  });
});

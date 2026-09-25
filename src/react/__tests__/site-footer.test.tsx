// React SiteFooter. The Vue suite in tests/footer.test.ts is the contract;
// this file asserts the same behaviors through the React adapter, plus the
// one thing only a two-adapter package can get wrong: two copies of the mark
// drifting apart.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { SiteFooter, type SiteFooterProps } from '../SiteFooter';
import { FOOTER_GROUPS } from '../../components/footerNavigation';
import { en, zh, de } from '../../i18n/footer';

afterEach(cleanup);

function mount(props: Partial<SiteFooterProps> = {}) {
  return render(<SiteFooter theme="auto" locale="en" {...props} />);
}

const hrefs = (c: Element) => Array.from(c.querySelectorAll('a')).map((a) => a.getAttribute('href'));
const DESTINATIONS = {
  applications: ['https://wf.latere.ai/', 'https://lectio.latere.ai/'],
  research: ['https://replichai.latere.ai/'],
  platform: ['https://platform.latere.ai/console', 'https://auth.latere.ai/'],
  company: ['https://latere.ai/about', 'https://latere.ai/blog/why-latere', 'https://latere.ai/blog', 'https://latere.ai/open-source', 'mailto:contact@latere.ai'],
  legal: ['https://latere.ai/legal/privacy', 'https://latere.ai/legal/terms', 'https://latere.ai/legal/impressum'],
};

describe('SiteFooter (React)', () => {
  for (const [locale, dict] of Object.entries({ en, zh, de })) {
    it(`lays five groups out in four columns in ${locale}`, () => {
      const { container } = mount({ locale });
      const columns = Array.from(container.querySelectorAll('.footer-cols > .footer-col'));
      expect(columns.map(c => Array.from(c.querySelectorAll('[data-footer-group]')).map(g => g.getAttribute('data-footer-group')))).toEqual([
        ['applications', 'research'], ['platform'], ['company'], ['legal'],
      ]);
      const groups = Array.from(container.querySelectorAll('[data-footer-group]'));
      expect(groups.map(g => g.getAttribute('role'))).toEqual(Array(5).fill('group'));
      expect(groups.map(g => g.querySelector('h2.footer-col-title')!.textContent)).toEqual([
        dict['footer.applications'], dict['footer.research'], dict['footer.platform'], dict['footer.company'], dict['footer.legal'],
      ]);
      expect(groups.map(g => g.getAttribute('aria-label'))).toEqual(groups.map(g => g.querySelector('h2')!.textContent));
      expect(groups.map(g => Array.from(g.querySelectorAll('li > a.footer-link')).map(a => a.getAttribute('href')))).toEqual(Object.values(DESTINATIONS));
      expect(container.querySelector('.footer-cols')!.tagName).toBe('NAV');
      expect(container.querySelector('.footer-cols')!.getAttribute('aria-label')).toBe(dict['footer.navigation']);
      expect(container.textContent).not.toMatch(/Topos|Cella|Lux/);
    });

    it(`keeps the three product groups in the compact strip in ${locale}`, () => {
      const { container } = mount({ locale, compact: true });
      const groups = Array.from(container.querySelectorAll('[data-footer-group]'));
      expect(groups.map(g => g.getAttribute('data-footer-group'))).toEqual(['applications', 'research', 'platform']);
      expect(groups.map(g => g.querySelector('.footer-group-title')!.textContent)).toEqual([dict['footer.applications'], dict['footer.research'], dict['footer.platform']]);
      expect(groups.map(g => hrefs(g))).toEqual([DESTINATIONS.applications, DESTINATIONS.research, DESTINATIONS.platform]);
    });
  }

  it('sets product names in the columns as plain links that carry their product for the hover gradient', () => {
    const { container } = mount();
    const links = Array.from(container.querySelectorAll('.footer-cols a.footer-link'));
    expect(links.filter(a => a.hasAttribute('data-brand')).map(a => [a.textContent, a.getAttribute('data-brand')])).toEqual([
      ['Wallfacer', 'wallfacer'], ['Lectio', 'lectio'], ['ReplicHAI', 'replichai'], ['Latere Platform', 'platform'],
    ]);
    expect(container.querySelector('.footer-cols [class$="-brand"]')).toBeNull();
    expect(links.find(a => a.textContent === 'Identity')!.hasAttribute('data-brand')).toBe(false);
  });

  it('leads with the lockup, the social row, a hairline and the preference menus, in that order', () => {
    const lead = mount().container.querySelector('.footer-lead')!;
    expect(Array.from(lead.children).map(el => el.className)).toEqual(['footer-lockup', 'footer-social', 'footer-rule', 'footer-prefs']);
    expect(lead.querySelector('.footer-lockup .logo-link')!.getAttribute('href')).toBe('https://latere.ai/');
    expect(lead.querySelector('.logo-text')!.textContent).toBe('Latere AI');
    expect(lead.querySelector('.footer-social')!.getAttribute('aria-label')).toBe('Social profiles');
    expect(Array.from(lead.querySelectorAll('.footer-social a')).map(a => a.getAttribute('aria-label'))).toEqual(['Discord', 'LinkedIn', 'X', 'GitHub']);
    expect(lead.querySelector('hr.footer-rule')).not.toBeNull();
    expect(Array.from(lead.querySelectorAll('.footer-prefs .lu-pref')).map(m => m.className)).toEqual([
      'lu-pop lu-pref lu-theme-menu', 'lu-pop lu-pref lu-locale-menu',
    ]);
  });

  it('takes the host lockup through the brand prop', () => {
    const { container } = mount({ brand: <a className="host-lockup" href="https://platform.latere.ai/">Latere Platform</a> });
    expect(container.querySelector('.footer-lockup .host-lockup')!.getAttribute('href')).toBe('https://platform.latere.ai/');
    expect(container.querySelector('.footer-lockup .logo-link')).toBeNull();
  });

  it('closes with the copyright line, rendered as HTML rather than escaped text', () => {
    const { container } = mount();
    expect(container.querySelector('footer')!.lastElementChild!.className).toBe('footer-bottom');
    expect(container.querySelector('.footer-bottom p')!.textContent).toBe('© 2026 Latere AI. All rights reserved.');
    expect(container.innerHTML).not.toContain('&amp;copy;');
  });

  // The registry is the only sanctioned source of product links. Both footer
  // variants are checked because they are mutually exclusive branches, so a
  // hardcoded link in either one is invisible to a single render.
  it.each([false, true])('links to no site outside the registry (compact=%s)', (compact) => {
    const allowed = new Set(FOOTER_GROUPS.flatMap(group => group.links.map(p => p.href)));
    const { container } = mount({ compact });
    const found = hrefs(container).filter((h): h is string => !!h && h.includes('latere.ai') && !h.startsWith('mailto:'));
    const products = found.filter((h) => !h.startsWith('https://latere.ai'));
    expect(products.length).toBeGreaterThan(0);
    for (const h of products) expect(allowed).toContain(h);
  });

  it.each([false, true])('renders internal links as absolute URLs against baseUrl by default (compact=%s)', (compact) => {
    const found = hrefs(mount({ baseUrl: 'https://example.test', compact }).container);
    expect(found).toEqual(expect.arrayContaining(['https://example.test/about', 'https://example.test/blog', 'https://example.test/legal/privacy']));
    if (!compact) expect(found).toContain('https://example.test/');
  });

  it.each([false, true])('routes internal links through a provided routerLink component (compact=%s)', (compact) => {
    const Stub = ({ to, children, ...rest }: any) => <a data-to={to} {...rest}>{children}</a>;
    const { container } = mount({ routerLink: Stub, compact });
    const tos = Array.from(container.querySelectorAll('[data-to]')).map((a) => a.getAttribute('data-to'));
    expect(tos).toEqual(expect.arrayContaining(['/about', '/blog', '/open-source', '/legal/terms']));
    expect(container.innerHTML).not.toContain('https://latere.ai/about');
  });

  it.each([false, true])('reports the theme and the language picked from their menus (compact=%s)', (compact) => {
    const onThemeChange = vi.fn();
    const onLocaleChange = vi.fn();
    const { container } = mount({ onThemeChange, onLocaleChange, compact });
    fireEvent.click(container.querySelector('.lu-theme-menu .lu-pref-trigger')!);
    expect(container.querySelector('.lu-theme-menu .lu-pop-panel')!.classList.contains(compact ? 'lu-pop-panel--top-end' : 'lu-pop-panel--top-start')).toBe(true);
    fireEvent.click(container.querySelectorAll('.lu-theme-menu [role="menuitemradio"]')[1]);
    fireEvent.click(container.querySelector('.lu-locale-menu .lu-pref-trigger')!);
    fireEvent.click(container.querySelectorAll('.lu-locale-menu [role="menuitemradio"]')[1]);
    expect(onThemeChange.mock.calls).toEqual([['dark']]);
    expect(onLocaleChange.mock.calls).toEqual([['zh']]);
  });

  it('checks the current theme and offers the default languages', () => {
    const { container } = mount({ theme: 'dark' });
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

  it('localizes the headings and the theme menu from the locale prop', () => {
    const { container } = mount({ locale: 'zh' });
    expect(Array.from(container.querySelectorAll('h2')).map(x => x.textContent)).toEqual(['应用', '研究', '平台', '公司', '法律']);
    expect(container.querySelector('.lu-theme-menu .lu-pref-trigger')!.getAttribute('aria-label')).toBe('主题: 跟随系统');
    fireEvent.click(container.querySelector('.lu-theme-menu .lu-pref-trigger')!);
    expect(Array.from(container.querySelectorAll('[role="menuitemradio"]')).map(r => r.textContent)).toEqual(['浅色', '深色', '跟随系统']);
    expect(container.querySelector('.footer-bottom')!.textContent).toBe('© 2026 Latere AI. 保留所有权利。');
  });

  it('applies host messages overrides over the bundled dictionary', () => {
    const { container } = mount({ locale: 'de', messages: { de: { 'footer.company': 'Firma' } } });
    expect(Array.from(container.querySelectorAll('h2')).map(x => x.textContent)).toEqual(['Anwendungen', 'Forschung', 'Plattform', 'Firma', 'Rechtliches']);
  });

  it('renders the compact variant as a single-line bar, no link columns', () => {
    const full = mount();
    expect(full.container.querySelector('.footer-cols')).not.toBeNull();
    expect(full.container.querySelector('.site-footer-compact')).toBeNull();
    full.unmount();

    const { container } = mount({ compact: true });
    expect(container.querySelector('.site-footer-compact')).not.toBeNull();
    expect(container.querySelector('.footer-cols')).toBeNull();
    expect(container.querySelector('.footer-bottom')).toBeNull(); // copyright lives inline
    expect(container.querySelector('.footer-compact-copy')).not.toBeNull();
    const links = container.querySelector('.footer-compact-links')!;
    for (const name of ['Wallfacer', 'Lectio', 'ReplicHAI', 'Latere Platform', 'Identity', 'Team', 'Impressum']) {
      expect(links.textContent).toContain(name);
    }
    expect(container.querySelectorAll('.footer-extra .lu-pref')).toHaveLength(2);
  });

  it('renders the brand mark as a painting SVG', () => {
    const svg = mount().container.querySelector('svg.latere-logo-mark')!;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.querySelectorAll('path').length).toBe(6);
  });

  // Drive shut down on 2026-09-19; durable storage is the platform's Storage
  // section, so the retired console must not survive in either variant.
  it.each([false, true])('offers no retired Drive console (compact=%s)', (compact) => {
    const { container } = mount({ compact });
    expect(hrefs(container)).not.toContain('https://drive.latere.ai/');
    expect(container.textContent).not.toContain('Drive');
  });

  // The open source page is a company link, so it carries translated copy in
  // every bundled locale and appears in both variants.
  for (const compact of [false, true]) {
    it.each(Object.entries({ en, zh, de }))(
      `links the open source page in %s (compact=${compact})`,
      (locale, dict) => {
        const { container } = mount({ locale, compact, locales: [{ code: locale, label: locale.toUpperCase() }] });
        const link = Array.from(container.querySelectorAll('a')).find((a) => a.getAttribute('href') === 'https://latere.ai/open-source');
        expect(link, `${locale}: open source link`).toBeTruthy();
        expect(link!.textContent).toBe(dict['footer.openSource']);
      },
    );
  }
});

describe('the two logo marks stay one mark', () => {
  // The only duplicated source in the package: an SVG cannot cross the
  // template/JSX boundary without a runtime. Compare the path data so an edit
  // to one adapter that skips the other fails here.
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
  const paths = (src: string) => Array.from(src.matchAll(/<path d="([^"]+)"/g)).map((m) => m[1]);

  it('LatereLogoMark.tsx carries the same paths as LatereLogoMark.vue', () => {
    const vue = paths(read('src/components/LatereLogoMark.vue'));
    const tsx = paths(read('src/react/LatereLogoMark.tsx'));
    expect(vue.length).toBe(6);
    expect(tsx).toEqual(vue);
  });

  it('both SiteFooter adapters draw the social row from the shared data', () => {
    for (const file of ['src/components/SiteFooter.vue', 'src/react/SiteFooter.tsx']) {
      const src = read(file);
      expect(paths(src), file).toEqual([]);
      expect(src, file).toContain('FOOTER_SOCIALS');
    }
  });
});

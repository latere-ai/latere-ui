import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { SiteFooter } from '../src';
import { FOOTER_GROUPS } from '../src/components/footerNavigation';
import { en, zh, de } from '../src/i18n/footer';

const mounted: VueWrapper[] = [];
function render(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const w = mount(SiteFooter, { props: { theme: 'auto', locale: 'en', ...props }, ...options });
  mounted.push(w);
  return w;
}
afterEach(() => { while (mounted.length) mounted.pop()!.unmount(); document.body.innerHTML = ''; });

const DESTINATIONS = {
  applications: ['https://wf.latere.ai/', 'https://lectio.latere.ai/'],
  research: ['https://replichai.latere.ai/'],
  platform: ['https://platform.latere.ai/console', 'https://auth.latere.ai/'],
  company: ['https://latere.ai/about', 'https://latere.ai/blog/why-latere', 'https://latere.ai/blog', 'https://latere.ai/open-source', 'mailto:contact@latere.ai'],
  legal: ['https://latere.ai/legal/privacy', 'https://latere.ai/legal/terms', 'https://latere.ai/legal/impressum'],
};

describe('footer dictionaries', () => {
  it.each(Object.entries({ zh, de }))('%s has the same keys as English', (_locale, dict) => {
    expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(Object.entries({ en, zh, de }))('%s has no blank translations', (locale, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      expect(value.trim(), `${locale}: ${key}`).not.toBe('');
    }
  });
});

describe('SiteFooter', () => {
  for (const [locale, dict] of Object.entries({ en, zh, de })) {
    it(`lays five groups out in four columns in ${locale}`, () => {
      const w = render({ locale });
      const columns = w.findAll('.footer-cols > .footer-col');
      expect(columns.map(c => c.findAll('[data-footer-group]').map(g => g.attributes('data-footer-group')))).toEqual([
        ['applications', 'research'], ['platform'], ['company'], ['legal'],
      ]);
      const groups = w.findAll('[data-footer-group]');
      expect(groups.map(g => g.attributes('role'))).toEqual(Array(5).fill('group'));
      expect(groups.map(g => g.get('h2.footer-col-title').text())).toEqual([
        dict['footer.applications'], dict['footer.research'], dict['footer.platform'], dict['footer.company'], dict['footer.legal'],
      ]);
      expect(groups.map(g => g.attributes('aria-label'))).toEqual(groups.map(g => g.get('h2').text()));
      expect(groups.map(g => g.findAll('li > a.footer-link').map(a => a.attributes('href')))).toEqual(Object.values(DESTINATIONS));
      expect(w.get('.footer-cols').element.tagName).toBe('NAV');
      expect(w.get('.footer-cols').attributes('aria-label')).toBe(dict['footer.navigation']);
      expect(w.text()).not.toMatch(/Topos|Cella|Lux/);
    });

    it(`keeps the three product groups in the compact strip in ${locale}`, () => {
      const w = render({ locale, compact: true });
      const groups = w.findAll('[data-footer-group]');
      expect(groups.map(g => g.attributes('data-footer-group'))).toEqual(['applications', 'research', 'platform']);
      expect(groups.map(g => g.get('.footer-group-title').text())).toEqual([dict['footer.applications'], dict['footer.research'], dict['footer.platform']]);
      expect(groups.map(g => g.findAll('a').map(a => a.attributes('href')))).toEqual([DESTINATIONS.applications, DESTINATIONS.research, DESTINATIONS.platform]);
    });
  }

  it('sets product names in the columns as plain links that carry their product for the hover gradient', () => {
    const links = render().findAll('.footer-cols a.footer-link');
    const products = links.filter(a => a.attributes('data-brand'));
    expect(products.map(a => [a.text(), a.attributes('data-brand')])).toEqual([
      ['Wallfacer', 'wallfacer'], ['Lectio', 'lectio'], ['ReplicHAI', 'replichai'], ['Latere Platform', 'platform'],
    ]);
    // No wordmark span: the column reads in one face.
    expect(render().find('.footer-cols [class$="-brand"]').exists()).toBe(false);
    expect(links.find(a => a.text() === 'Identity')!.attributes('data-brand')).toBeUndefined();
  });

  it('leads with the lockup, the social row, a hairline and the preference menus, in that order', () => {
    const lead = render().get('.footer-lead');
    expect(Array.from(lead.element.children).map(el => el.className)).toEqual(['footer-lockup', 'footer-social', 'footer-rule', 'footer-prefs']);
    expect(lead.get('.footer-lockup .logo-link').attributes('href')).toBe('https://latere.ai/');
    expect(lead.get('.logo-text').text()).toBe('Latere AI');
    expect(lead.get('.footer-social').attributes('aria-label')).toBe('Social profiles');
    expect(lead.findAll('.footer-social a').map(a => a.attributes('aria-label'))).toEqual(['Discord', 'LinkedIn', 'X', 'GitHub']);
    expect(lead.find('hr.footer-rule').exists()).toBe(true);
    expect(lead.findAll('.footer-prefs .lu-pref').map(m => m.classes())).toEqual([
      ['lu-pop', 'lu-pref', 'lu-theme-menu'], ['lu-pop', 'lu-pref', 'lu-locale-menu'],
    ]);
  });

  it('takes the host lockup through the brand slot', () => {
    const w = render({}, { slots: { brand: '<a class="host-lockup" href="https://platform.latere.ai/">Latere Platform</a>' } });
    expect(w.get('.footer-lockup .host-lockup').attributes('href')).toBe('https://platform.latere.ai/');
    expect(w.find('.footer-lockup .logo-link').exists()).toBe(false);
  });

  it('closes with the copyright line', () => {
    const w = render();
    const footer = w.get('footer').element;
    expect(footer.lastElementChild!.className).toBe('footer-bottom');
    expect(w.get('.footer-bottom p').text()).toBe('© 2026 Latere AI. All rights reserved.');
  });

  // The registry is the only sanctioned source of product links. Both footer
  // variants are checked because they are mutually exclusive template branches,
  // so a hardcoded link in either one is invisible to a single render.
  it.each([false, true])('links to no site outside the registry (compact=%s)', (compact) => {
    const allowed = new Set(FOOTER_GROUPS.flatMap(group => group.links.map(p => p.href)));
    const hrefs = render({ compact })
      .findAll('a')
      .map((a) => a.attributes('href'))
      .filter((h): h is string => !!h && h.includes('latere.ai') && !h.startsWith('mailto:'));
    const products = hrefs.filter((h) => !h.startsWith('https://latere.ai'));
    expect(products.length).toBeGreaterThan(0);
    for (const h of products) expect(allowed).toContain(h);
  });

  it.each([false, true])('renders internal links as absolute URLs against baseUrl by default (compact=%s)', (compact) => {
    const hrefs = render({ baseUrl: 'https://example.test', compact }).findAll('a').map((a) => a.attributes('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['https://example.test/about', 'https://example.test/blog', 'https://example.test/legal/privacy']));
    if (!compact) expect(hrefs).toContain('https://example.test/');
  });

  it.each([false, true])('routes internal links through a provided routerLink component (compact=%s)', (compact) => {
    const RouterLinkStub = defineComponent({
      props: { to: { type: String, required: true } },
      setup: (p, { slots }) => () => h('a', { 'data-to': p.to }, slots.default?.()),
    });
    const w = render({ routerLink: RouterLinkStub, compact });
    const tos = w.findAll('[data-to]').map((a) => a.attributes('data-to'));
    expect(tos).toEqual(expect.arrayContaining(['/about', '/blog', '/open-source', '/legal/terms']));
    // Should not have rewritten internal links to absolute URLs.
    expect(w.html()).not.toContain('https://latere.ai/about');
  });

  it.each([false, true])('reports the theme and the language picked from their menus (compact=%s)', async (compact) => {
    const w = render({ theme: 'auto', locale: 'en', compact }, { attachTo: document.body });
    await w.get('.lu-theme-menu .lu-pref-trigger').trigger('click');
    const panel = w.get('.lu-theme-menu .lu-pop-panel');
    expect(panel.classes()).toContain(compact ? 'lu-pop-panel--top-end' : 'lu-pop-panel--top-start');
    await w.findAll('.lu-theme-menu [role="menuitemradio"]')[1].trigger('click');
    await w.get('.lu-locale-menu .lu-pref-trigger').trigger('click');
    await w.findAll('.lu-locale-menu [role="menuitemradio"]')[1].trigger('click');
    expect(w.emitted('update:theme')).toEqual([['dark']]);
    expect(w.emitted('update:locale')).toEqual([['zh']]);
  });

  it('checks the current theme and offers the default languages', async () => {
    const w = render({ theme: 'dark' }, { attachTo: document.body });
    expect(w.get('.lu-theme-menu .lu-pref-trigger').attributes('aria-label')).toBe('Theme: Dark');
    await w.get('.lu-theme-menu .lu-pref-trigger').trigger('click');
    const themes = w.findAll('.lu-theme-menu [role="menuitemradio"]');
    expect(themes.map(r => [r.text(), r.attributes('aria-checked')])).toEqual([['Light', 'false'], ['Dark', 'true'], ['System', 'false']]);
    await w.get('.lu-locale-menu .lu-pref-trigger').trigger('click');
    expect(w.findAll('.lu-locale-menu [role="menuitemradio"]').map(r => r.text())).toEqual(['English', '中文']);
  });

  it('checks the active language from a custom list', async () => {
    const w = render({
      locale: 'de',
      locales: [
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'zh', label: '中', name: '中文' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
      ],
    }, { attachTo: document.body });
    expect(w.get('.lu-locale-menu .lu-pref-trigger').attributes('aria-label')).toBe('Sprache: Deutsch');
    await w.get('.lu-locale-menu .lu-pref-trigger').trigger('click');
    expect(w.findAll('.lu-locale-menu [role="menuitemradio"]').map(r => [r.text(), r.attributes('aria-checked')])).toEqual([
      ['English', 'false'], ['中文', 'false'], ['Deutsch', 'true'],
    ]);
  });

  it('localizes the headings and the theme menu from the locale prop', async () => {
    const w = render({ locale: 'zh' }, { attachTo: document.body });
    expect(w.findAll('h2').map(x => x.text())).toEqual(['应用', '研究', '平台', '公司', '法律']);
    expect(w.get('.lu-theme-menu .lu-pref-trigger').attributes('aria-label')).toBe('主题: 跟随系统');
    await w.get('.lu-theme-menu .lu-pref-trigger').trigger('click');
    expect(w.findAll('[role="menuitemradio"]').map(r => r.text())).toEqual(['浅色', '深色', '跟随系统']);
    expect(w.get('.footer-bottom').text()).toBe('© 2026 Latere AI. 保留所有权利。');
  });

  it('applies host messages overrides over the bundled dictionary', () => {
    const w = render({ locale: 'de', messages: { de: { 'footer.company': 'Firma' } } });
    expect(w.findAll('h2').map(x => x.text())).toEqual(['Anwendungen', 'Forschung', 'Plattform', 'Firma', 'Rechtliches']);
  });

  it('renders the compact variant as a single-line bar, no link columns', () => {
    const full = render();
    expect(full.find('.footer-cols').exists()).toBe(true);
    expect(full.find('.site-footer-compact').exists()).toBe(false);

    const w = render({ compact: true });
    expect(w.find('.site-footer-compact').exists()).toBe(true);
    expect(w.find('.footer-cols').exists()).toBe(false);
    expect(w.find('.footer-bottom').exists()).toBe(false); // copyright lives inline in the bar
    expect(w.find('.footer-compact-copy').exists()).toBe(true);
    const links = w.get('.footer-compact-links');
    for (const name of ['Wallfacer', 'Lectio', 'ReplicHAI', 'Latere Platform', 'Identity', 'Team', 'Impressum']) {
      expect(links.text()).toContain(name);
    }
    expect(w.findAll('.footer-extra .lu-pref')).toHaveLength(2);
  });

  // Drive shut down on 2026-09-19; durable storage is the platform's Storage
  // section, so the retired console must not survive in either variant.
  it.each([false, true])('offers no retired Drive console (compact=%s)', (compact) => {
    const w = render({ compact });
    const urls = w.findAll('a').map((a) => a.attributes('href') ?? '');
    expect(urls).not.toContain('https://drive.latere.ai/');
    expect(w.text()).not.toContain('Drive');
  });

  // The open source page is a company link, so it carries translated copy in
  // every bundled locale and appears in both variants.
  for (const compact of [false, true]) {
    it.each(Object.entries({ en, zh, de }))(
      `links the open source page in %s (compact=${compact})`,
      (locale, dict) => {
        const w = render({ locale, compact, locales: [{ code: locale, label: locale.toUpperCase() }] });
        const link = w.findAll('a').find((a) => a.attributes('href') === 'https://latere.ai/open-source');
        expect(link, `${locale}: open source link`).toBeTruthy();
        expect(link!.text()).toBe(dict['footer.openSource']);
      },
    );
  }
});

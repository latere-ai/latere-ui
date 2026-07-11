import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SiteFooter } from '../src';

function render(props: Record<string, unknown> = {}) {
  return mount(SiteFooter, {
    props: { theme: 'auto', locale: 'en', ...props },
  });
}

describe('SiteFooter', () => {
  it('renders every product name and cross-product link', () => {
    const w = render();
    const html = w.html();
    for (const name of ['Wallfacer', 'Topos', 'Cella', 'Lux', 'Lectio', 'Drive']) {
      expect(html).toContain(name);
    }
    expect(html).toContain('https://wf.latere.ai/');
    expect(html).toContain('https://drive.latere.ai/');
    expect(html).toContain('https://auth.latere.ai/');
    // Agon was retired: neither the name nor its site may reappear in the footer.
    expect(html).not.toContain('Agon');
    expect(html).not.toContain('agon.latere.ai');
  });

  it('renders internal links as absolute URLs against baseUrl by default', () => {
    const w = render({ baseUrl: 'https://example.test' });
    const hrefs = w.findAll('a').map((a) => a.attributes('href'));
    expect(hrefs).toContain('https://example.test/about');
    expect(hrefs).toContain('https://example.test/blog');
    expect(hrefs).toContain('https://example.test/legal/privacy');
  });

  it('routes internal links through a provided routerLink component', () => {
    const RouterLinkStub = defineComponent({
      props: { to: { type: String, required: true } },
      setup: (p, { slots }) => () => h('a', { 'data-to': p.to }, slots.default?.()),
    });
    const w = render({ routerLink: RouterLinkStub });
    const tos = w.findAll('[data-to]').map((a) => a.attributes('data-to'));
    expect(tos).toContain('/about');
    expect(tos).toContain('/legal/terms');
    // Should not have rewritten internal links to absolute URLs.
    expect(w.html()).not.toContain('https://latere.ai/about');
  });

  it('emits update:theme from the theme toggle and update:locale from the dropdown', async () => {
    const w = render({ theme: 'auto', locale: 'en' });
    await w.findAll('.footer-seg-btn').find((b) => b.text() === '☾')!.trigger('click');
    await w.find('.footer-lang-select').setValue('zh');
    expect(w.emitted('update:theme')?.[0]).toEqual(['dark']);
    expect(w.emitted('update:locale')?.[0]).toEqual(['zh']);
  });

  it('renders a locale dropdown from the default locales (en, zh)', () => {
    const opts = render().findAll('.footer-lang-select option');
    expect(opts.map((o) => o.attributes('value'))).toEqual(['en', 'zh']);
    expect(opts.map((o) => o.text())).toEqual(['English', '中文']);
  });

  it('renders a custom locales list (e.g. adding de) and selects the active one', () => {
    const w = render({
      locale: 'de',
      locales: [
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'zh', label: '中', name: '中文' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
      ],
    });
    const select = w.find('.footer-lang-select');
    expect((select.element as HTMLSelectElement).value).toBe('de');
    expect(w.findAll('.footer-lang-select option').map((o) => o.text())).toContain('Deutsch');
  });

  it('localizes copy from the locale prop', () => {
    expect(render({ locale: 'en' }).html()).toContain('Human intelligence in the loop.');
    expect(render({ locale: 'zh' }).html()).toContain('人类智慧始终在回路中。');
  });

  it('renders bundled German copy without any host messages', () => {
    const w = render({
      locale: 'de',
      locales: [{ code: 'de', label: 'DE', name: 'Deutsch' }],
    });
    expect(w.html()).toContain('Menschliche Intelligenz im Loop.'); // footer.tagline (de)
    expect(w.html()).toContain('Rechtliches'); // footer.legal (de)
  });

  it('applies host messages overrides over the bundled dictionary', () => {
    const w = render({
      locale: 'de',
      messages: { de: { 'footer.tagline': 'Überschrieben.' } },
    });
    expect(w.html()).toContain('Überschrieben.');
    expect(w.html()).not.toContain('Menschliche Intelligenz im Loop.');
  });

  it('renders the compact variant as a single-line bar, no product columns', () => {
    const full = render();
    expect(full.find('.footer-cols').exists()).toBe(true);
    expect(full.find('.site-footer-compact').exists()).toBe(false);

    const w = render({ compact: true });
    expect(w.find('.site-footer-compact').exists()).toBe(true);
    expect(w.find('.footer-cols').exists()).toBe(false);
    expect(w.find('.footer-bottom').exists()).toBe(false); // copyright lives inline in the bar
    expect(w.find('.footer-compact-copy').exists()).toBe(true);
    const links = w.find('.footer-compact-links');
    expect(links.exists()).toBe(true);
    const html = links.html();
    for (const name of ['Wallfacer', 'Topos', 'Cella', 'Lux']) {
      expect(html).toContain(name);
    }
    // still has the theme toggle + locale dropdown
    expect(w.find('.footer-lang-select').exists()).toBe(true);
    expect(w.findAll('.footer-seg-btn').length).toBe(3);
  });

  it('marks the active theme in the segmented control', () => {
    const active = render({ theme: 'dark', locale: 'zh' })
      .findAll('.footer-seg-btn.is-active').map((b) => b.text());
    expect(active).toContain('☾');
  });
});

describe('brand wordmark styles', () => {
  // The footer is self-contained (no @import) so `latere-ui/styles` stays one
  // resolvable file for SSG consumers; console.css uses brand.css for the same
  // values. Guard the background-image rule in BOTH so neither regresses.
  for (const file of ['src/styles/footer.css', 'src/styles/brand.css']) {
    it(`${file} uses background-image so background-clip:text is not reset by the shorthand`, () => {
      const css = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(css).not.toMatch(/-brand\s*\{\s*background:\s*linear-gradient/);
      expect(css).toMatch(/\.wallfacer-brand\s*\{\s*background-image:/);
    });
  }

  it('footer.css has no @import rule (keeps a single resolvable stylesheet)', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/footer.css'), 'utf8');
    expect(css).not.toMatch(/@import\s+['"]/);
  });
});

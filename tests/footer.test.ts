import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
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
    for (const name of ['Wallfacer', 'Topos', 'Agon', 'Cella', 'Lux']) {
      expect(html).toContain(name);
    }
    expect(html).toContain('https://wf.latere.ai/');
    expect(html).toContain('https://auth.latere.ai/');
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

  it('emits update:theme and update:locale when toggles are clicked', async () => {
    const w = render({ theme: 'auto', locale: 'en' });
    const buttons = w.findAll('.footer-seg-btn');
    // Theme buttons: ☀ ☾ ◐ ; locale buttons: EN 中
    await buttons.find((b) => b.text() === '☾')!.trigger('click');
    await buttons.find((b) => b.text() === '中')!.trigger('click');
    expect(w.emitted('update:theme')?.[0]).toEqual(['dark']);
    expect(w.emitted('update:locale')?.[0]).toEqual(['zh']);
  });

  it('localizes copy from the locale prop', () => {
    expect(render({ locale: 'en' }).html()).toContain('Human intelligence in the loop.');
    expect(render({ locale: 'zh' }).html()).toContain('人类智慧始终在回路中。');
  });

  it('marks the active theme and locale', () => {
    const w = render({ theme: 'dark', locale: 'zh' });
    const active = w.findAll('.footer-seg-btn.is-active').map((b) => b.text());
    expect(active).toContain('☾');
    expect(active).toContain('中');
  });
});

// React SiteFooter (v1.28). The Vue suite in tests/footer.test.ts is the
// contract; this file asserts the same behaviours through the React adapter,
// plus the one thing only a two-adapter package can get wrong — two copies of
// the mark drifting apart.
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { SiteFooter, type SiteFooterProps } from '../SiteFooter';

function mount(props: Partial<SiteFooterProps> = {}) {
  return render(<SiteFooter theme="auto" locale="en" {...props} />);
}

const hrefs = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('a')).map((a) => a.getAttribute('href'));

describe('SiteFooter (React)', () => {
  it('renders every product name and cross-product link', () => {
    const { container } = mount();
    for (const name of ['Wallfacer', 'Topos', 'Cella', 'Lux', 'Lectio', 'Drive']) {
      expect(container.textContent).toContain(name);
    }
    expect(hrefs(container)).toContain('https://wf.latere.ai/');
    expect(hrefs(container)).toContain('https://drive.latere.ai/');
    expect(hrefs(container)).toContain('https://auth.latere.ai/');
    // Agon was retired: neither the name nor its site may reappear.
    expect(container.innerHTML).not.toContain('Agon');
    expect(container.innerHTML).not.toContain('agon.latere.ai');
  });

  it('renders internal links as absolute URLs against baseUrl by default', () => {
    const { container } = mount({ baseUrl: 'https://example.test' });
    expect(hrefs(container)).toEqual(
      expect.arrayContaining([
        'https://example.test/',
        'https://example.test/about',
        'https://example.test/blog',
        'https://example.test/legal/privacy',
      ]),
    );
  });

  it('routes internal links through a provided routerLink component', () => {
    const Stub = ({ to, children, ...rest }: any) => (
      <a data-to={to} {...rest}>
        {children}
      </a>
    );
    const { container } = mount({ routerLink: Stub });
    const tos = Array.from(container.querySelectorAll('[data-to]')).map((a) => a.getAttribute('to') ?? a.getAttribute('data-to'));
    expect(tos).toContain('/about');
    expect(tos).toContain('/legal/terms');
    expect(container.innerHTML).not.toContain('https://latere.ai/about');
  });

  it('reports the theme picked and the locale picked', () => {
    const onThemeChange = vi.fn();
    const onLocaleChange = vi.fn();
    const { container } = mount({ onThemeChange, onLocaleChange });
    const dark = Array.from(container.querySelectorAll('.footer-seg-btn')).find((b) => b.textContent === '☾')!;
    fireEvent.click(dark);
    fireEvent.change(container.querySelector('.footer-lang-select')!, { target: { value: 'zh' } });
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(onLocaleChange).toHaveBeenCalledWith('zh');
  });

  it('renders a locale dropdown from the default locales (en, zh)', () => {
    const { container } = mount();
    const opts = Array.from(container.querySelectorAll<HTMLOptionElement>('.footer-lang-select option'));
    expect(opts.map((o) => o.value)).toEqual(['en', 'zh']);
    expect(opts.map((o) => o.textContent)).toEqual(['English', '中文']);
  });

  it('renders a custom locales list and selects the active one', () => {
    const { container } = mount({
      locale: 'de',
      locales: [
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'zh', label: '中', name: '中文' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
      ],
    });
    expect(container.querySelector<HTMLSelectElement>('.footer-lang-select')!.value).toBe('de');
    expect(container.textContent).toContain('Deutsch');
  });

  it('localizes copy from the locale prop, bundled dictionaries included', () => {
    expect(mount({ locale: 'en' }).container.textContent).toContain('Human intelligence in the loop.');
    expect(mount({ locale: 'zh' }).container.textContent).toContain('人类智慧始终在回路中。');
    const de = mount({ locale: 'de', locales: [{ code: 'de', label: 'DE', name: 'Deutsch' }] });
    expect(de.container.textContent).toContain('Menschliche Intelligenz im Loop.');
    expect(de.container.textContent).toContain('Rechtliches');
  });

  it('applies host messages overrides over the bundled dictionary', () => {
    const { container } = mount({ locale: 'de', messages: { de: { 'footer.tagline': 'Überschrieben.' } } });
    expect(container.textContent).toContain('Überschrieben.');
    expect(container.textContent).not.toContain('Menschliche Intelligenz im Loop.');
  });

  it('renders entity-carrying copy as HTML, not as escaped text', () => {
    const { container } = mount();
    expect(container.querySelector('.footer-bottom p')!.textContent).toContain('©');
    expect(container.innerHTML).not.toContain('&amp;copy;');
  });

  it('renders the compact variant as a single-line bar, no product columns', () => {
    const full = mount();
    expect(full.container.querySelector('.footer-cols')).not.toBeNull();
    expect(full.container.querySelector('.site-footer-compact')).toBeNull();

    const { container } = mount({ compact: true });
    expect(container.querySelector('.site-footer-compact')).not.toBeNull();
    expect(container.querySelector('.footer-cols')).toBeNull();
    expect(container.querySelector('.footer-bottom')).toBeNull(); // copyright lives inline
    expect(container.querySelector('.footer-compact-copy')).not.toBeNull();
    const links = container.querySelector('.footer-compact-links')!;
    for (const name of ['Wallfacer', 'Topos', 'Cella', 'Lux']) {
      expect(links.textContent).toContain(name);
    }
    expect(container.querySelector('.footer-lang-select')).not.toBeNull();
    expect(container.querySelectorAll('.footer-seg-btn').length).toBe(3);
  });

  it('marks the active theme in the segmented control', () => {
    const { container } = mount({ theme: 'dark' });
    const active = Array.from(container.querySelectorAll('.footer-seg-btn.is-active')).map((b) => b.textContent);
    expect(active).toEqual(['☾']);
  });

  it('renders the brand mark as a painting SVG', () => {
    const svg = mount().container.querySelector('svg.latere-logo-mark')!;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.querySelectorAll('path').length).toBe(6);
  });
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

  it('SiteFooter.tsx carries the same social icon paths as SiteFooter.vue', () => {
    const vue = new Set(paths(read('src/components/SiteFooter.vue')));
    const tsx = paths(read('src/react/SiteFooter.tsx'));
    expect(tsx.length).toBe(0); // the tsx holds them as data, not markup
    for (const d of Array.from(vue)) {
      expect(read('src/react/SiteFooter.tsx')).toContain(d);
    }
  });
});

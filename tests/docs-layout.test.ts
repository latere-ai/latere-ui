import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

import DocsLayout from '../src/components/DocsLayout.vue';
import type { DocGroup } from '../src/docs/model';

const groups: DocGroup[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    pages: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'quick-start', title: 'Quick start' },
    ],
  },
  {
    id: 'internals',
    label: 'Internals',
    advanced: true,
    pages: [{ slug: 'architecture', title: 'Architecture', badge: 3 }],
  },
];

const RouterLinkStub = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (p, { slots }) => () => h('a', { 'data-rl': p.to }, slots.default?.()),
});

function render(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  return mount(DocsLayout, {
    props: { groups, activeSlug: 'overview', ...props },
    slots,
  });
}

describe('<DocsLayout />', () => {
  it('renders the grouped index with labels and badges', () => {
    const w = render();
    expect(w.findAll('.lu-docs-group-label').map((g) => g.text())).toEqual([
      'Getting started',
      'Internals',
    ]);
    expect(w.findAll('.lu-docs-link').length).toBe(3);
    expect(w.find('.lu-docs-link-badge').text()).toBe('3');
  });

  it('flags the active page and advanced group', () => {
    const w = render({ activeSlug: 'architecture' });
    const active = w.findAll('.lu-docs-link').filter((l) => l.attributes('data-active') === 'true');
    expect(active.length).toBe(1);
    expect(active[0].text()).toContain('Architecture');
    expect(active[0].attributes('aria-current')).toBe('page');
    const advGroup = w.findAll('.lu-docs-group').find((g) => g.text().includes('Internals'))!;
    expect(advGroup.attributes('data-advanced')).toBe('true');
  });

  it('shows the page title and renders articleHtml as the body', () => {
    const w = render({ articleHtml: '<h2>Intro</h2><p>Hello world</p>' });
    expect(w.find('.lu-docs-title').text()).toBe('Overview');
    expect(w.find('.lu-docs-body').html()).toContain('Hello world');
  });

  it('lets the #article slot override the body (component-driven docs)', () => {
    const w = render({}, { article: () => h('section', { class: 'custom' }, 'COMPONENT DOC') });
    expect(w.find('.custom').text()).toBe('COMPONENT DOC');
    expect(w.find('.lu-docs-body').exists()).toBe(false);
  });

  it('builds prev/next across group boundaries and emits navigate', async () => {
    const w = render({ activeSlug: 'quick-start' });
    const pager = w.find('.lu-docs-pager');
    expect(pager.find('.lu-docs-pager-prev').text()).toContain('Overview');
    expect(pager.find('.lu-docs-pager-next').text()).toContain('Architecture');
    await pager.find('.lu-docs-pager-next').trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ slug: 'architecture', groupId: 'internals' });
  });

  it('omits the pager at the very last page boundary correctly', () => {
    const w = render({ activeSlug: 'architecture' });
    expect(w.find('.lu-docs-pager-next').exists()).toBe(false);
    expect(w.find('.lu-docs-pager-prev').text()).toContain('Quick start');
  });

  it('emits navigate with the FlatDoc when a nav row is clicked', async () => {
    const w = render();
    const row = w.findAll('.lu-docs-link').find((l) => l.text().includes('Quick start'))!;
    await row.trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ slug: 'quick-start' });
  });

  it('routes through an injected routerLink with <base>/<group>/<slug> paths', () => {
    const w = render({ routerLink: RouterLinkStub, base: '/docs' });
    const tos = w.findAll('[data-rl]').map((a) => a.attributes('data-rl'));
    expect(tos).toContain('/docs/getting-started/overview');
    expect(tos).toContain('/docs/internals/architecture');
  });

  it('scans the article into a TOC after render', async () => {
    const w = render({ articleHtml: '<h2>First</h2><p>x</p><h3>Sub</h3><h2>Second</h2>' });
    await nextTick();
    await nextTick();
    const links = w.findAll('.lu-docs-toc-link');
    expect(links.map((l) => l.text())).toEqual(['First', 'Sub', 'Second']);
    expect(links[0].attributes('data-active')).toBe('true');
  });

  it('calls the enhance hook with the article element after render', async () => {
    const enhance = vi.fn();
    render({ articleHtml: '<p>x</p>', enhance });
    await nextTick();
    await nextTick();
    expect(enhance).toHaveBeenCalledTimes(1);
    expect(enhance.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it('hides the TOC column when showToc is false', () => {
    expect(render({ showToc: false }).find('.lu-docs-toc').exists()).toBe(false);
  });
});

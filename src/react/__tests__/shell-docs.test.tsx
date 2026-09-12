import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocsLayout, type DocsLayoutHandle } from '../DocsLayout';
import { createTocCore } from '../../docs/tocCore';

const groups = [{ id: 'guide', label: 'Guide', pages: [{ slug: 'intro', title: 'Introduction' }, { slug: 'next', title: 'Next page' }] }, { id: 'advanced', label: 'Advanced', advanced: true, pages: [{ slug: 'intro', title: 'Architecture', badge: 3, advanced: true }] }];
afterEach(() => { vi.unstubAllGlobals(); });

describe('React DocsLayout', () => {
  it('renders routes, active groups, badges and pager callbacks across boundaries', () => {
    const onNavigate = vi.fn();
    const view = render(<DocsLayout groups={groups} activeSlug="next" base="/docs" onNavigate={onNavigate} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Next page');
    const next = view.container.querySelector('.lu-docs-pager-next')!;
    expect(next.getAttribute('href')).toBe('/docs/advanced/intro'); fireEvent.click(next);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ slug: 'intro', groupId: 'advanced' }));
    fireEvent.click(view.container.querySelector('.lu-docs-link')!);
    expect(onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ groupId: 'guide', slug: 'intro' }));
    view.rerender(<DocsLayout groups={groups} activeSlug="intro" activeGroupId="advanced" routerLink={props => <a {...props} href={props.to} />} />);
    expect(view.container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(view.container.querySelector('[aria-current="page"]')?.textContent).toBe('Architecture3');
    expect(view.container.querySelector('.lu-docs-pager-next')).toBeNull();
    expect(view.container.querySelector('.lu-docs-group[data-advanced="true"]')).toBeTruthy();
    view.rerender(<DocsLayout groups={[]} activeSlug="missing" />); expect(view.container.querySelector('.lu-docs-pager')).toBeNull();
  });
  it('enhances before scanning, handles prop changes and exposes refresh and slots', () => {
    const ref = createRef<DocsLayoutHandle>(); const onTocSelect = vi.fn();
    const enhance = vi.fn((element: HTMLElement) => { element.querySelector('h2')!.textContent = 'Enhanced'; });
    const view = render(<DocsLayout ref={ref} groups={groups} activeSlug="intro" articleHtml="<h2>Original</h2><h3>Child</h3>" enhance={enhance} onTocSelect={onTocSelect} />);
    expect(view.container.querySelectorAll('.lu-docs-toc-link')).toHaveLength(2);
    const first = view.container.querySelector('.lu-docs-toc-link')!; expect(first.textContent).toBe('Enhanced');
    fireEvent.click(first); expect(onTocSelect).toHaveBeenCalledWith('enhanced');
    act(() => ref.current!.refresh()); expect(enhance).toHaveBeenCalledTimes(2);
    view.rerender(<DocsLayout groups={groups} activeSlug="intro" showToc={false} articleHtml="<h2>New</h2>" />);
    expect(view.container.querySelector('.lu-docs-toc')).toBeNull();
    view.rerender(<DocsLayout groups={groups} activeSlug="intro" tocLevels={[3]} article={<section><h2>Skip</h2><h3>Custom</h3></section>} sidebarHead={<b>Index</b>} renderGroupIcon={group => <i>{group.id}</i>} renderToc={state => <div data-testid="toc">{state.items.map(item => item.text).join(',')}</div>} />);
    expect(screen.getByTestId('toc').textContent).toBe('Custom'); expect(screen.getByText('Index')).toBeTruthy(); expect(view.container.querySelector('.lu-docs-body')).toBeNull();
    view.rerender(<DocsLayout groups={groups} activeSlug="intro" articleTitle="Updated" articleHtml="<h2>Replacement</h2>" />);
    expect(view.container.querySelector('.lu-docs-toc-link')?.textContent).toBe('Replacement');
  });
  it('tracks observer selection and disconnects on rescan, hide and unmount', () => {
    let callback: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn(); const observe = vi.fn();
    vi.stubGlobal('IntersectionObserver', class { constructor(cb: IntersectionObserverCallback) { callback = cb; } observe = observe; disconnect = disconnect; });
    const view = render(<DocsLayout groups={groups} activeSlug="intro" articleHtml="<h2>One</h2><h2>Two</h2>" />);
    expect(observe).toHaveBeenCalledTimes(2);
    act(() => callback([{ isIntersecting: true, target: view.container.querySelector('#two')! } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(view.container.querySelector('.lu-docs-toc-link[data-active="true"]')?.textContent).toBe('Two');
    view.rerender(<DocsLayout groups={groups} activeSlug="next" articleHtml="<h2>Three</h2>" />); expect(disconnect).toHaveBeenCalled();
    view.unmount(); expect(disconnect.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  it('handles null containers and empty levels in the shared controller', () => {
    const toc = createTocCore({ levels: [] }); expect(toc.scan(document.createElement('article'))).toEqual([]);
    expect(toc.scan(null)).toEqual([]); expect(toc.getSnapshot()).toEqual({ items: [], activeId: '' });
  });
});

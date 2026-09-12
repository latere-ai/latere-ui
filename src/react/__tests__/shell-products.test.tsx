import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductSwitcher } from '../ProductSwitcher';
import { ConsoleSidebar } from '../ConsoleSidebar';
import { productPlacement } from '../../components/productPlacement';
import { LATERE_PRODUCTS } from '../../components/productSwitcher';

afterEach(() => vi.restoreAllMocks());

describe('React ProductSwitcher', () => {
  it('renders registry marks, current non-link tile, labels, overrides and dismissal', () => {
    const view = render(<ProductSwitcher current="drive" />);
    const trigger = screen.getByRole('button'); expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger); expect(screen.getAllByRole('link')).toHaveLength(6);
    expect(view.container.querySelector('.is-current')?.tagName).toBe('SPAN');
    expect(view.container.querySelector('.is-current')?.getAttribute('aria-current')).toBe('true');
    expect(view.container.querySelectorAll('.lu-ps-ic svg')).toHaveLength(7);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('navigation')).toBeNull();
    fireEvent.click(trigger); fireEvent.mouseDown(document.body); expect(screen.queryByRole('navigation')).toBeNull();
    view.rerender(<ProductSwitcher current="drive" products={LATERE_PRODUCTS.filter(p => ['drive', 'identity'].includes(p.slug))} labels={{ switchProduct: 'Apps', products: 'Tools', current: 'Here' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Apps' })); expect(screen.getByRole('navigation', { name: 'Tools' })).toBeTruthy(); expect(screen.getByText('Here')).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(1); fireEvent.click(screen.getByRole('link')); expect(screen.queryByRole('navigation')).toBeNull();
    fireEvent.click(screen.getByRole('button')); fireEvent.click(screen.getByRole('button')); expect(screen.queryByRole('navigation')).toBeNull();
  });
  it('repositions on resize/scroll, updates panel content, and cleans up listeners', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    let nearEdge = true;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return (this.classList.contains('lu-ps-panel') ? { width: 280, height: 240 } : nearEdge ? { left: window.innerWidth - 50, right: window.innerWidth - 20, top: window.innerHeight - 80, bottom: window.innerHeight - 50 } : { left: 20, right: 50, top: 20, bottom: 50 }) as unknown as DOMRect;
    });
    const view = render(<ProductSwitcher current="" />); fireEvent.click(screen.getByRole('button'));
    const panel = view.container.querySelector('.lu-ps-panel')!;
    expect(panel.getAttribute('data-side')).toBe('top'); expect(panel.getAttribute('data-align')).toBe('end');
    nearEdge = false; fireEvent.resize(window); expect(panel.getAttribute('data-side')).toBe('bottom'); expect(panel.getAttribute('data-align')).toBe('start');
    nearEdge = true; fireEvent.scroll(window); expect(panel.getAttribute('data-side')).toBe('top');
    view.rerender(<ProductSwitcher current="" products={[]} />); expect(view.container.querySelectorAll('.lu-ps-tile')).toHaveLength(0);
    view.unmount(); expect(remove).toHaveBeenCalledWith('resize', expect.any(Function)); expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });
  it('clamps when neither alignment fits and integrates into expanded sidebar only', () => {
    expect(productPlacement({ left: 100, right: 130, top: 100, bottom: 130 }, { width: 280, height: 240 }, { width: 300, height: 300 })).toEqual({ side: 'bottom', align: 'start', shiftX: -88, shiftY: -86 });
    const view = render(<ConsoleSidebar model={{ groups: [] }} product="drive" productLabels={{ switchProduct: 'Other apps' }} />);
    expect(view.container.querySelector('.lu-cs-switch .lu-iconbtn-sm')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Other apps' })); expect(screen.getByRole('navigation', { name: 'Latere products' })).toBeTruthy();
    view.rerender(<ConsoleSidebar model={{ groups: [] }} product="drive" collapsed />); expect(screen.queryByRole('button', { name: 'Other apps' })).toBeNull();
  });
});

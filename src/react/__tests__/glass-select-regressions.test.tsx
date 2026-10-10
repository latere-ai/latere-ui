import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { GlassSelect } from '../GlassSelect';

afterEach(() => vi.restoreAllMocks());

describe('GlassSelect keyboard regressions', () => {
  it('ignores empty options and options removed while open', () => {
    const onChange = vi.fn();
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => { errors.push(event.error); event.preventDefault(); };
    window.addEventListener('error', onError);
    try {
      const w = render(<GlassSelect value="" options={[]} onChange={onChange} />);
      const button = w.getByRole('combobox');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(errors).toEqual([]);
      expect(onChange).not.toHaveBeenCalled();
      w.rerender(<GlassSelect value="" options={[{ value: 'a', label: 'A' }]} onChange={onChange} />);
      w.rerender(<GlassSelect value="" options={[]} onChange={onChange} />);
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(errors).toEqual([]);
    } finally { window.removeEventListener('error', onError); }
  });

  it('skips disabled choices in both directions and never activates all-disabled choices', () => {
    const onChange = vi.fn();
    const w = render(<GlassSelect value="" onChange={onChange} options={[
      { value: 'a', label: 'Disabled', disabled: true }, { value: 'b', label: 'B' },
      { value: 'c', label: 'Disabled too', disabled: true }, { value: 'd', label: 'D' },
    ]} />);
    const button = w.getByRole('combobox');
    fireEvent.click(button);
    expect(w.container.querySelector('.is-active')?.textContent).toBe('B');
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(w.container.querySelector('.is-active')?.textContent).toBe('D');
    fireEvent.keyDown(button, { key: 'ArrowUp' });
    expect(w.container.querySelector('.is-active')?.textContent).toBe('B');
    fireEvent.keyDown(button, { key: 'ArrowUp' });
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('d');
    w.rerender(<GlassSelect value="" options={[{ value: 'a', label: 'Disabled', disabled: true }]} />);
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(w.container.querySelector('.is-active')).toBeNull();
  });

  for (const searchable of [false, true]) it(`scrolls the initial and keyboard-active options into view, inside the ${searchable ? 'searchable list' : 'menu'} only`, () => {
    // The scroller (the plain menu, or a searchable menu's list under its
    // field) shows 236px from y 106, its options 32px apart from 6px down.
    const scroller = searchable ? 'lu-select-options' : 'lu-select-list';
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains(scroller) ? 236 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const box = this.closest<HTMLElement>(`.${scroller}`);
      if (this.classList.contains('lu-select-option') && box) {
        const index = [...box.querySelectorAll('.lu-select-option')].indexOf(this);
        const top = 106 + 6 + index * 32 - box.scrollTop;
        return { top, bottom: top + 32, left: 0, right: 200, width: 200, height: 32 } as DOMRect;
      }
      if (this.classList.contains(scroller)) return { top: 106, bottom: 342, left: 0, right: 200, width: 200, height: 236 } as DOMRect;
      return { top: 60, bottom: 92, left: 0, right: 200, width: 200, height: 32 } as DOMRect;
    });
    const w = render(<GlassSelect value="15" searchable={searchable} options={Array.from({ length: 30 }, (_, i) => ({ value: String(i), label: `Option ${i}` }))} />);
    const button = w.getByRole('combobox');
    fireEvent.click(button);
    const box = document.querySelector<HTMLElement>(`.${scroller}`)!;
    // Option 15 spans 592-624 against a scrollport ending at 342.
    expect(box.scrollTop).toBe(624 - 342);
    fireEvent.keyDown(searchable ? document.querySelector('.lu-select-search')! : button, { key: 'ArrowDown' });
    expect(box.scrollTop).toBe(624 - 342 + 32);
    fireEvent.keyDown(searchable ? document.querySelector('.lu-select-search')! : button, { key: 'Home' });
    for (let i = 0; i < 16; i++) fireEvent.keyDown(searchable ? document.querySelector('.lu-select-search')! : button, { key: 'ArrowUp' });
    // Back at option 0, above the scrollport: it scrolls up to show it whole.
    expect(document.querySelector('.is-active')?.textContent).toBe('Option 0');
    expect(box.scrollTop).toBe(6);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

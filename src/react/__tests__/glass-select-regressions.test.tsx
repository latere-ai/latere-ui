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

  it('scrolls the initial and keyboard-active options into view', () => {
    const scrolled: Element[] = [];
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) { scrolled.push(this); });
    const w = render(<GlassSelect value="15" options={Array.from({ length: 30 }, (_, i) => ({ value: String(i), label: `Option ${i}` }))} />);
    const button = w.getByRole('combobox');
    fireEvent.click(button);
    expect(scrolled.at(-1)?.textContent).toBe('Option 15');
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(scrolled.at(-1)?.textContent).toBe('Option 16');
  });
});

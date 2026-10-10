import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { GlassSelect } from '../GlassSelect';
import { GlassModal } from '../GlassModal';
import { SELECT_SEARCH_THRESHOLD } from '../../glass/selectSearch';
import type { SelectOption } from '../../glass/types';

const zones: SelectOption[] = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Europe/London', label: 'Europe/London', disabled: true },
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
];
const count = (n: number) => Array.from({ length: n }, (_, i) => ({ value: String(i), label: `Option ${i}` }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const field = () => document.querySelector<HTMLInputElement>('.lu-select-search');
const labels = () => [...document.querySelectorAll('.lu-select-option')].map((li) => li.textContent);
const activeLabel = () => document.querySelector('.lu-select-option.is-active')?.textContent;
const typeInto = (text: string) => fireEvent.change(field()!, { target: { value: text } });

describe('GlassSelect search (react)', () => {
  it('shows the field above the threshold, and the prop overrides the count', () => {
    const w = render(<GlassSelect value="" options={count(SELECT_SEARCH_THRESHOLD)} />);
    const trigger = w.getByRole('combobox');
    fireEvent.click(trigger);
    expect(field()).toBeNull();
    fireEvent.click(trigger);
    w.rerender(<GlassSelect value="" options={count(SELECT_SEARCH_THRESHOLD + 1)} />);
    fireEvent.click(trigger);
    expect(field()).not.toBeNull();
    fireEvent.click(trigger);
    w.rerender(<GlassSelect value="" options={count(SELECT_SEARCH_THRESHOLD + 1)} searchable={false} />);
    fireEvent.click(trigger);
    expect(field()).toBeNull();
    fireEvent.click(trigger);
    w.rerender(<GlassSelect value="" options={count(2)} searchable />);
    fireEvent.click(trigger);
    expect(field()).not.toBeNull();
  });

  it('focuses a combobox field that controls the listbox and names the active option', () => {
    const w = render(<GlassSelect value="Asia/Tokyo" options={zones} ariaLabel="Time zone" searchPlaceholder="Find a time zone" />);
    const trigger = w.getByRole('combobox', { name: 'Time zone' });
    fireEvent.click(trigger);
    const input = w.getByRole('combobox', { name: 'Find a time zone' }) as HTMLInputElement;
    expect(input).toBe(field());
    expect(document.activeElement).toBe(input);
    expect(input.placeholder).toBe('Find a time zone');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const list = document.getElementById(input.getAttribute('aria-controls')!)!;
    expect(list.getAttribute('role')).toBe('listbox');
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)!.textContent).toBe('Asia/Tokyo');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    expect(w.getByRole('option', { name: 'Asia/Tokyo' }).getAttribute('aria-selected')).toBe('true');
  });

  it('filters by label or value, ignoring case, and marks the matched text', () => {
    const w = render(<GlassSelect value="" options={zones} />);
    fireEvent.click(w.getByRole('combobox'));
    typeInto('EUROPE');
    expect(labels()).toEqual(['Europe/Berlin', 'Europe/London', 'Europe/Paris']);
    expect([...document.querySelectorAll('.lu-select-match')].map((m) => m.textContent)).toEqual(['Europe', 'Europe', 'Europe']);
    // A highlighted row keeps its whole label as its accessible name.
    expect(w.getByRole('option', { name: 'Europe/Berlin' }).textContent).toBe('Europe/Berlin');
    typeInto('new_york');
    expect(labels()).toEqual(['America/New York']);
    expect(document.querySelector('.lu-select-match')).toBeNull();
    typeInto('');
    expect(labels()).toHaveLength(zones.length);
  });

  it('moves through the filtered list with the arrows and chooses with Enter', () => {
    const onChange = vi.fn();
    const w = render(<GlassSelect value="Asia/Tokyo" options={zones} onChange={onChange} />);
    const trigger = w.getByRole('combobox');
    fireEvent.click(trigger);
    expect(activeLabel()).toBe('Asia/Tokyo');
    typeInto('europe');
    expect(activeLabel()).toBe('Europe/Berlin');
    fireEvent.keyDown(field()!, { key: 'ArrowDown' });
    expect(activeLabel()).toBe('Europe/Paris');
    fireEvent.keyDown(field()!, { key: 'ArrowDown' });
    expect(activeLabel()).toBe('Europe/Berlin');
    fireEvent.keyDown(field()!, { key: 'ArrowUp' });
    expect(activeLabel()).toBe('Europe/Paris');
    expect(document.getElementById(field()!.getAttribute('aria-activedescendant')!)!.textContent).toBe('Europe/Paris');
    fireEvent.keyDown(field()!, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('Europe/Paris');
    expect(field()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('clears the search on the first Escape and closes on the second', () => {
    const onChange = vi.fn();
    const w = render(<GlassSelect value="" options={zones} onChange={onChange} />);
    const trigger = w.getByRole('combobox');
    fireEvent.click(trigger);
    typeInto('asia');
    fireEvent.keyDown(field()!, { key: 'Escape' });
    expect(field()!.value).toBe('');
    expect(labels()).toHaveLength(zones.length);
    fireEvent.keyDown(field()!, { key: 'Escape' });
    expect(w.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens with the typed character from a focused, closed trigger', () => {
    const w = render(<GlassSelect value="" options={zones} />);
    const trigger = w.getByRole('combobox');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'k' });
    expect(field()!.value).toBe('k');
    expect(document.activeElement).toBe(field());
    expect(labels()).toEqual(['America/New York', 'Asia/Tokyo', 'Asia/Kolkata']);
    expect(activeLabel()).toBe('America/New York');
  });

  it('ignores modified keys, and typing on a select without a field', () => {
    const w = render(<GlassSelect value="" options={zones} />);
    const trigger = w.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(trigger, { key: 'k', metaKey: true });
    expect(w.queryByRole('listbox')).toBeNull();
    w.rerender(<GlassSelect value="" options={zones} searchable={false} />);
    fireEvent.keyDown(trigger, { key: 'k' });
    expect(w.queryByRole('listbox')).toBeNull();
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(w.queryByRole('listbox')).not.toBeNull();
  });

  it('moves typing on the open trigger into the field', () => {
    const w = render(<GlassSelect value="" options={zones} />);
    const trigger = w.getByRole('combobox');
    fireEvent.click(trigger);
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 't' });
    fireEvent.keyDown(trigger, { key: 'o' });
    expect(field()!.value).toBe('to');
    expect(document.activeElement).toBe(field());
    expect(labels()).toEqual(['Asia/Tokyo']);
  });

  it('says so in one line when nothing matches, and Enter does nothing', () => {
    const onChange = vi.fn();
    const w = render(<GlassSelect value="" options={zones} noMatchLabel="No time zone matches" onChange={onChange} />);
    fireEvent.click(w.getByRole('combobox'));
    typeInto('mars');
    expect(labels()).toEqual([]);
    expect(document.querySelector('.lu-select-empty')!.textContent).toBe('No time zone matches');
    expect(field()!.hasAttribute('aria-activedescendant')).toBe(false);
    fireEvent.keyDown(field()!, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    typeInto('   ');
    expect(document.querySelector('.lu-select-empty')).toBeNull();
  });

  it('chooses with the pointer without taking focus from the field, and titles each row', () => {
    const onChange = vi.fn();
    const w = render(<GlassSelect value="" options={zones} onChange={onChange} />);
    fireEvent.click(w.getByRole('combobox'));
    const row = w.getByRole('option', { name: 'Africa/Cairo' });
    expect(row.title).toBe('Africa/Cairo');
    expect(fireEvent.mouseDown(row)).toBe(false);
    expect(fireEvent.mouseDown(field()!)).toBe(true);
    fireEvent.click(row);
    expect(onChange).toHaveBeenCalledWith('Africa/Cairo');
    expect(document.activeElement).toBe(w.getByRole('combobox'));
  });

  it('makes the hovered enabled row of a filtered list active', () => {
    const w = render(<GlassSelect value="" options={zones} />);
    fireEvent.click(w.getByRole('combobox'));
    typeInto('europe');
    fireEvent.mouseEnter(w.getByRole('option', { name: 'Europe/Paris' }));
    expect(activeLabel()).toBe('Europe/Paris');
    fireEvent.mouseEnter(w.getByRole('option', { name: 'Europe/London' }));
    expect(activeLabel()).toBe('Europe/Paris');
  });

  it('closes when focus leaves the control, and stays open when it moves inside', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    try {
      const w = render(<GlassSelect value="" options={zones} />);
      const trigger = w.getByRole('combobox');
      fireEvent.click(trigger);
      fireEvent.blur(field()!, { relatedTarget: trigger });
      expect(field()).not.toBeNull();
      fireEvent.blur(field()!, { relatedTarget: outside });
      expect(w.queryByRole('listbox')).toBeNull();
    } finally { outside.remove(); }
  });

  it('holds its widest width and moves left to stay inside the viewport', () => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('lu-select')) return { top: 100, bottom: 132, left: 800, right: 960, width: 160, height: 32 } as DOMRect;
      return { width: this.querySelector('.lu-select-match') ? 180 : 300, height: 200 } as DOMRect;
    });
    const w = render(<GlassSelect value="" options={zones} />);
    fireEvent.click(w.getByRole('combobox'));
    const panel = document.querySelector<HTMLElement>('.lu-select-list')!;
    expect(panel.classList.contains('is-searchable')).toBe(true);
    expect(panel.style.minWidth).toBe('300px');
    // The trigger starts at 800; a 300px menu ends 16px inside the 1000px viewport at 684.
    expect(panel.style.left).toBe('684px');
    expect(panel.style.top).toBe('136px');
    expect(panel.style.getPropertyValue('--lu-anchor-width')).toBe('160px');
    typeInto('asia');
    expect(panel.style.minWidth).toBe('300px');
    expect(rect).toHaveBeenCalled();
  });
});

describe('GlassSelect inside a modal (react)', () => {
  it('takes Escape for its own menu and leaves the dialog open', () => {
    const onClose = vi.fn();
    function Host() {
      const [value, setValue] = useState('');
      return <GlassModal open title="Schedule" onClose={onClose}>
        <GlassSelect value={value} options={zones} ariaLabel="Time zone" onChange={setValue} />
      </GlassModal>;
    }
    const w = render(<Host />);
    const trigger = w.getByRole('combobox', { name: 'Time zone' });
    fireEvent.click(trigger);
    typeInto('asia');
    fireEvent.keyDown(field()!, { key: 'Escape' });
    expect(field()!.value).toBe('');
    fireEvent.keyDown(field()!, { key: 'Escape' });
    expect(w.queryByRole('listbox')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

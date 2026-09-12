import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GlassIconButton } from '../GlassIconButton';
import { GlassSwitch } from '../GlassSwitch';
import { GlassRadio } from '../GlassRadio';
import { GlassTabs } from '../GlassTabs';

describe('GlassIconButton', () => {
  it('forwards popup semantics and caller styling without losing button classes', () => {
    const { getByRole, rerender } = render(<GlassIconButton label="Products" aria-expanded={false}
      aria-haspopup="menu" aria-controls="products" className="toolbar-action" style={{ margin: 4 }} />);
    const button = getByRole('button', { name: 'Products' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-controls')).toBe('products');
    expect(button.classList.contains('lu-iconbtn')).toBe(true);
    expect(button.classList.contains('toolbar-action')).toBe(true);
    expect(button.style.margin).toBe('4px');
    rerender(<GlassIconButton label="Products" aria-expanded />);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps label, icon and toggle state on a non-submitting button', () => {
    const click = vi.fn();
    const { getByRole, rerender } = render(<GlassIconButton label="Pin" onClick={click}><svg /></GlassIconButton>);
    const button = getByRole('button', { name: 'Pin' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toBe('lu-iconbtn lu-glass-ultrathin lu-iconbtn-md');
    expect(button.hasAttribute('aria-pressed')).toBe(false);
    expect(button.querySelector('svg')).not.toBeNull();
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    rerender(<GlassIconButton label="Pinned" size="sm" pressed disabled onClick={click}>★</GlassIconButton>);
    expect(button.classList.contains('lu-iconbtn-sm')).toBe(true);
    expect(button.classList.contains('is-pressed')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });
});

describe('GlassSwitch', () => {
  it('reports both transitions and reflects controlled updates', () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState(false);
      return <GlassSwitch value={value} label="Notifications" onChange={next => { change(next); setValue(next); }} />;
    }
    const { getByRole, container } = render(<Example />);
    const control = getByRole('switch', { name: 'Notifications' });
    expect(control.getAttribute('type')).toBe('button');
    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(container.querySelector('.lu-switch-track')?.classList.contains('lu-glass-ultrathin')).toBe(true);
    fireEvent.click(control);
    expect(change).toHaveBeenLastCalledWith(true);
    expect(control.getAttribute('aria-checked')).toBe('true');
    expect(control.classList.contains('is-on')).toBe(true);
    expect(container.querySelector('.lu-switch-track')?.classList.contains('lu-glass-ultrathin')).toBe(false);
    fireEvent.click(control);
    expect(change).toHaveBeenLastCalledWith(false);
    expect(control.getAttribute('aria-checked')).toBe('false');
  });

  it('blocks disabled changes and permits an omitted callback and label', () => {
    const change = vi.fn();
    const { getByRole, container, rerender } = render(<GlassSwitch value disabled onChange={change} />);
    const control = getByRole('switch');
    fireEvent.click(control);
    expect(change).not.toHaveBeenCalled();
    expect(container.querySelector('.lu-switch-label')).toBeNull();
    rerender(<GlassSwitch value={false} />);
    fireEvent.click(control);
    expect(control.getAttribute('aria-checked')).toBe('false');
  });
});

describe('GlassRadio', () => {
  it('binds a native group with unique label IDs and emits the option identity', () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState('daily');
      return <>{['daily', 'weekly'].map(option => <GlassRadio key={option} value={value}
        optionValue={option} name="schedule" label={option}
        onChange={next => { change(next); setValue(next); }} />)}</>;
    }
    const { getByLabelText, container } = render(<Example />);
    const daily = getByLabelText('daily') as HTMLInputElement;
    const weekly = getByLabelText('weekly') as HTMLInputElement;
    expect(daily.id).not.toBe(weekly.id);
    expect(daily.name).toBe('schedule');
    expect(weekly.value).toBe('weekly');
    expect(daily.checked).toBe(true);
    expect(weekly.checked).toBe(false);
    fireEvent.click(weekly);
    expect(change).toHaveBeenCalledWith('weekly');
    expect(weekly.checked).toBe(true);
    expect(daily.checked).toBe(false);
    expect(container.querySelectorAll('.lu-radio-dot[aria-hidden="true"]')).toHaveLength(2);
  });

  it('renders disabled options without a label and supports omitted callbacks', () => {
    const change = vi.fn();
    const { getByRole, container, rerender } = render(<GlassRadio value="a" optionValue="b" name="g" disabled onChange={change} />);
    const input = getByRole('radio') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(container.querySelector('label')?.classList.contains('is-disabled')).toBe(true);
    expect(container.querySelector('.lu-radio-label')).toBeNull();
    fireEvent.click(input);
    expect(change).not.toHaveBeenCalled();
    rerender(<GlassRadio value="a" optionValue="b" name="g" />);
    fireEvent.click(input);
    expect(input.checked).toBe(false);
  });
});

describe('GlassTabs', () => {
  const tabs = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }];

  it('selects by click and moves selection and focus with wrapping arrow keys', () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState('a');
      return <GlassTabs value={value} tabs={tabs} ariaLabel="Views" onChange={next => { change(next); setValue(next); }} />;
    }
    const { getByRole, getAllByRole, container } = render(<Example />);
    expect(getByRole('tablist', { name: 'Views' })).not.toBeNull();
    const [a, b, c] = getAllByRole('tab');
    expect(a.getAttribute('tabindex')).toBe('0');
    expect(b.getAttribute('tabindex')).toBe('-1');
    fireEvent.click(a);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(b);
    expect(b.getAttribute('aria-selected')).toBe('true');
    expect(a.getAttribute('aria-selected')).toBe('false');
    expect(container.querySelectorAll('.lu-tab-ind')).toHaveLength(1);
    fireEvent.keyDown(b, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(c);
    expect(change).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(c);
    const calls = change.mock.calls.length;
    fireEvent.keyDown(c, { key: 'Escape' });
    expect(change).toHaveBeenCalledTimes(calls);
  });

  it('handles empty, single and replaced lists without stale focus references', () => {
    const { getAllByRole, queryAllByRole, rerender } = render(<GlassTabs value="" tabs={[]} />);
    expect(queryAllByRole('tab')).toHaveLength(0);
    rerender(<GlassTabs value="a" tabs={[tabs[0]]} />);
    fireEvent.keyDown(getAllByRole('tab')[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(getAllByRole('tab')[0]);
    rerender(<GlassTabs value="c" tabs={[tabs[2], tabs[1]]} />);
    const [c, b] = getAllByRole('tab');
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(b);
    fireEvent.click(b);
    expect(c.getAttribute('aria-selected')).toBe('true');
  });
});

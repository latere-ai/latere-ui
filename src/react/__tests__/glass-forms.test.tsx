import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { GlassField } from '../GlassField';
import { GlassCheckbox } from '../GlassCheckbox';
import { GlassSegmented } from '../GlassSegmented';

describe('GlassField (react)', () => {
  it('links label and control and reports input through onChange', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(<GlassField label="Name" value="v" onChange={onChange} />);
    const input = getByLabelText('Name') as HTMLInputElement;
    expect(input.className).toBe('lu-field-control lu-glass-ultrathin');
    expect(input.value).toBe('v');
    fireEvent.change(input, { target: { value: 'vv' } });
    expect(onChange).toHaveBeenCalledWith('vv');
  });

  it('error flags the field invalid and wires aria-describedby', () => {
    const { container } = render(<GlassField label="Name" error="bad" />);
    expect(container.firstElementChild!.className).toBe('lu-field is-invalid');
    const input = container.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const err = container.querySelector('.lu-field-error')!;
    expect(err.textContent).toBe('bad');
    expect(input.getAttribute('aria-describedby')).toBe(err.id);
  });

  it('multiline renders a textarea with rows, disabled passes through', () => {
    const { container } = render(<GlassField multiline rows={5} disabled />);
    const ta = container.querySelector('textarea')!;
    expect(ta.getAttribute('rows')).toBe('5');
    expect(ta.disabled).toBe(true);
  });
});

describe('GlassCheckbox (react)', () => {
  it('keeps the native input for a11y and reports toggles', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(<GlassCheckbox value={false} label="ok" onChange={onChange} />);
    const input = getByLabelText('ok') as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(false);
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disabled styles the shell and blocks the input', () => {
    const { container } = render(<GlassCheckbox value disabled label="ok" />);
    expect(container.querySelector('label')!.className).toBe('lu-check is-disabled');
    expect(container.querySelector('input')!.disabled).toBe(true);
  });
});

describe('GlassSegmented (react)', () => {
  const options = [
    { value: 'x', label: 'X' },
    { value: 'y', label: 'Y' },
  ];

  it('renders a radiogroup with the active segment checked and focusable', () => {
    const { container } = render(<GlassSegmented value="x" options={options} ariaLabel="view" />);
    const group = container.firstElementChild!;
    expect(group.className).toBe('lu-seg lu-glass-thin');
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('view');
    const items = container.querySelectorAll('[role="radio"]');
    expect(items[0].className).toBe('lu-seg-item is-active');
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
  });

  it('click and arrow keys select the next segment', () => {
    const onChange = vi.fn();
    const { container } = render(<GlassSegmented value="x" options={options} onChange={onChange} />);
    const items = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    fireEvent.click(items[1]);
    expect(onChange).toHaveBeenLastCalledWith('y');
    fireEvent.keyDown(items[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('y');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

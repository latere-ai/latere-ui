import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { GlassSelect } from '../GlassSelect';
import { GlassModal } from '../GlassModal';

describe('GlassSelect (react)', () => {
  const options = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
  ];

  it('shows placeholder until a value is chosen and opens a listbox', () => {
    const onChange = vi.fn();
    const { container } = render(
      <GlassSelect value="" options={options} placeholder="Pick" onChange={onChange} />,
    );
    const trigger = container.querySelector('.lu-select-trigger')!;
    expect(container.querySelector('.lu-select-value')!.textContent).toBe('Pick');
    expect(container.querySelector('.lu-select-value')!.className).toBe('lu-select-value is-placeholder');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    fireEvent.click(container.querySelectorAll('[role="option"]')[1]);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(container.querySelector('[role="listbox"]')).toBeNull(); // closed after choose
  });

  it('opens and moves the active option with the keyboard', () => {
    const onChange = vi.fn();
    const { container } = render(<GlassSelect value="a" options={options} onChange={onChange} />);
    const trigger = container.querySelector('.lu-select-trigger')!;
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // opens
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // move to b
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('disabled options and a disabled trigger never fire onChange', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <GlassSelect
        value="a"
        options={[...options, { value: 'c', label: 'C', disabled: true }]}
        onChange={onChange}
      />,
    );
    fireEvent.click(container.querySelector('.lu-select-trigger')!);
    const disabledOpt = container.querySelectorAll('[role="option"]')[2];
    expect(disabledOpt.className).toContain('is-disabled');
    fireEvent.click(disabledOpt);
    expect(onChange).not.toHaveBeenCalled();

    rerender(<GlassSelect value="a" options={options} disabled onChange={onChange} />);
    const trigger = container.querySelector('.lu-select-trigger') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });
});

describe('GlassModal (react)', () => {
  it('portals a labeled thick-glass dialog to <body> when open', () => {
    render(
      <GlassModal open title="M" footer={<b>f</b>}>
        body
      </GlassModal>,
    );
    const scrim = document.body.querySelector('.lu-modal-scrim')!;
    expect(scrim.className).toBe('lu-modal-scrim lu-modal-scrim--modal');
    const dialog = scrim.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.className).toBe('lu-modal lu-glass-thick');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('M');
    expect(dialog.querySelector('.lu-modal-body')!.textContent).toBe('body');
    expect(dialog.querySelector('.lu-modal-foot')!.textContent).toBe('f');
  });

  it('renders nothing when closed and stacks confirms on the confirm layer', () => {
    const { rerender } = render(<GlassModal open={false}>x</GlassModal>);
    expect(document.body.querySelector('.lu-modal-scrim')).toBeNull();
    rerender(
      <GlassModal open layer="confirm">
        x
      </GlassModal>,
    );
    expect(document.body.querySelector('.lu-modal-scrim--confirm')).not.toBeNull();
  });

  it('closes on scrim click and Escape, but not on panel clicks', () => {
    const onClose = vi.fn();
    render(
      <GlassModal open title="M" onClose={onClose}>
        body
      </GlassModal>,
    );
    const scrim = document.body.querySelector('.lu-modal-scrim') as HTMLElement;
    fireEvent.click(scrim.querySelector('.lu-modal')!);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closeOnScrim=false keeps scrim clicks inert', () => {
    const onClose = vi.fn();
    render(
      <GlassModal open closeOnScrim={false} onClose={onClose}>
        body
      </GlassModal>,
    );
    fireEvent.click(document.body.querySelector('.lu-modal-scrim')!);
    expect(onClose).not.toHaveBeenCalled();
  });
});

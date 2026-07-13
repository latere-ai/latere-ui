import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { GlassBadge } from '../GlassBadge';
import { GlassAlert } from '../GlassAlert';
import { GlassSpinner } from '../GlassSpinner';

describe('GlassBadge (react)', () => {
  it('renders an ultrathin glass pill carrying the tone variable', () => {
    const { container } = render(
      <GlassBadge tone="running" dot>
        run
      </GlassBadge>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe('lu-badge lu-glass-ultrathin');
    expect(el.style.getPropertyValue('--tone')).toBe('var(--state-running, #4a7558)');
    expect(el.querySelector('.lu-badge-dot')).not.toBeNull();
  });

  it('solid switches the fill class and drops the glass', () => {
    const { container } = render(<GlassBadge solid>s</GlassBadge>);
    expect((container.firstElementChild as HTMLElement).className).toBe('lu-badge is-solid');
  });
});

describe('GlassAlert (react)', () => {
  it('is role=status by default and role=alert for errors', () => {
    const { container: a } = render(<GlassAlert title="T">body</GlassAlert>);
    const el = a.firstElementChild as HTMLElement;
    expect(el.className).toBe('lu-alert lu-glass');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.querySelector('.lu-alert-title')!.textContent).toBe('T');
    expect(el.querySelector('.lu-alert-text')!.textContent).toBe('body');

    const { container: b } = render(<GlassAlert tone="error">x</GlassAlert>);
    expect((b.firstElementChild as HTMLElement).getAttribute('role')).toBe('alert');
  });

  it('dismissible shows the labeled close button and calls onDismiss', () => {
    const onDismiss = vi.fn();
    const { getByLabelText } = render(
      <GlassAlert dismissible onDismiss={onDismiss}>
        x
      </GlassAlert>,
    );
    fireEvent.click(getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('GlassSpinner (react)', () => {
  it('announces itself and sizes via inline style', () => {
    const { getByRole } = render(<GlassSpinner size={32} label="Working" />);
    const el = getByRole('status') as HTMLElement;
    expect(el.className).toBe('lu-spinner');
    expect(el.getAttribute('aria-label')).toBe('Working');
    expect(el.style.width).toBe('32px');
    expect(el.style.height).toBe('32px');
  });
});

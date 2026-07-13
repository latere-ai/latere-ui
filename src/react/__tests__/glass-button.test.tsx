import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { GlassButton } from '../GlassButton';

describe('GlassButton (react)', () => {
  it('renders a capsule button with the Vue-identical classes and fires onClick', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<GlassButton onClick={onClick}>Go</GlassButton>);
    const btn = getByRole('button');
    expect(btn.className).toBe('lu-btn lu-btn-glass lu-btn-md lu-glass-thin');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.querySelector('.lu-btn-label')!.textContent).toBe('Go');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('variant/size drop the glass class and switch the modifier classes', () => {
    const { getByRole } = render(
      <GlassButton variant="primary" size="sm">
        Save
      </GlassButton>,
    );
    expect(getByRole('button').className).toBe('lu-btn lu-btn-primary lu-btn-sm');
  });

  it('loading shows the spinner, sets aria-busy, and blocks interaction', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <GlassButton loading onClick={onClick}>
        Go
      </GlassButton>,
    );
    const btn = getByRole('button');
    expect(btn.className).toBe('lu-btn lu-btn-glass lu-btn-md lu-glass-thin is-loading');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(btn.querySelector('.lu-btn-spin')).not.toBeNull();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the icon prop before the label (the Vue icon slot)', () => {
    const { getByRole } = render(<GlassButton icon={<i data-testid="ic" />}>Go</GlassButton>);
    const btn = getByRole('button');
    expect(btn.querySelector('[data-testid="ic"] + .lu-btn-label')).not.toBeNull();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { GlassButton } from '../GlassButton';

describe('GlassButton (react)', () => {
  it('renders a capsule button on thin glass, of type button, and fires onClick', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<GlassButton onClick={onClick}>Go</GlassButton>);
    const btn = getByRole('button');
    expect(btn.className).toBe('lu-btn lu-btn-glass lu-btn-md');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.querySelector('.lu-btn-label')!.textContent).toBe('Go');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('variant/size switch the modifier classes', () => {
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
    expect(btn.className).toBe('lu-btn lu-btn-glass lu-btn-md is-loading');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(btn.querySelector('.lu-btn-spin')).not.toBeNull();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('carries no glass material class on any variant', () => {
    for (const variant of ['glass', 'primary', 'ghost', 'danger', 'danger-ghost'] as const) {
      const { getByRole, unmount } = render(<GlassButton variant={variant}>Go</GlassButton>);
      const classes = Array.from(getByRole('button').classList);
      expect(classes).toContain(`lu-btn-${variant}`);
      expect(classes.filter(name => name.startsWith('lu-glass'))).toEqual([]);
      unmount();
    }
  });

  it('disabled blocks interaction', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<GlassButton disabled onClick={onClick}>Go</GlassButton>);
    fireEvent.click(getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('renders the icon prop before the label', () => {
    const { getByRole } = render(<GlassButton icon={<i data-testid="ic" />}>Go</GlassButton>);
    const btn = getByRole('button');
    expect(btn.querySelector('[data-testid="ic"] + .lu-btn-label')).not.toBeNull();
  });
});

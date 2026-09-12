import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GlassProgress } from '../GlassProgress';
import { GlassSkeleton } from '../GlassSkeleton';

describe('GlassProgress', () => {
  it.each([
    { value: 150, max: 100, now: 100, width: '100%' },
    { value: -10, max: 100, now: 0, width: '0%' },
    { value: 0, max: 100, now: 0, width: '0%' },
    { value: 100, max: 100, now: 100, width: '100%' },
    { value: 2.5, max: 10, now: 2.5, width: '25%' },
    { value: 15, max: 10, now: 10, width: '100%' },
    { value: 5, max: 0, now: 0, width: '0%' },
  ])('keeps ARIA and fill consistent for value=$value, max=$max', ({ value, max, now, width }) => {
    const { getByRole } = render(<GlassProgress value={value} max={max} label="Upload" />);
    const bar = getByRole('progressbar', { name: 'Upload' });
    expect(bar.className).toBe('lu-progress lu-glass-ultrathin');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe(String(max));
    expect(bar.getAttribute('aria-valuenow')).toBe(String(now));
    expect(bar.querySelector<HTMLElement>('.lu-progress-fill')?.style.width).toBe(width);
  });

  it('uses the default maximum and updates label, value and maximum together', () => {
    const { getByRole, rerender } = render(<GlassProgress value={150} />);
    const bar = getByRole('progressbar');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(bar.hasAttribute('aria-label')).toBe(false);
    rerender(<GlassProgress value={150} max={200} label="Download" />);
    expect(getByRole('progressbar', { name: 'Download' })).toBe(bar);
    expect(bar.getAttribute('aria-valuemax')).toBe('200');
    expect(bar.getAttribute('aria-valuenow')).toBe('150');
    expect(bar.querySelector<HTMLElement>('.lu-progress-fill')?.style.width).toBe('75%');
  });
});

describe('GlassSkeleton', () => {
  it('hides the default placeholder from assistive technology', () => {
    const { container } = render(<GlassSkeleton />);
    const skeleton = container.firstElementChild as HTMLElement;
    expect(skeleton.tagName).toBe('SPAN');
    expect(skeleton.className).toBe('lu-skeleton');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('1em');
    // happy-dom drops CSS variables in this shorthand; verify the emitted style.
    expect(renderToStaticMarkup(<GlassSkeleton />)).toContain('border-radius:var(--radius-sm, 6px)');
  });

  it('updates dimensions and gives circle precedence over a custom radius', () => {
    const { container, rerender } = render(<GlassSkeleton width="40px" height="12px" radius="4px" />);
    const skeleton = container.firstElementChild as HTMLElement;
    expect(skeleton.style.width).toBe('40px');
    expect(skeleton.style.height).toBe('12px');
    expect(skeleton.style.borderRadius).toBe('4px');
    rerender(<GlassSkeleton width="48px" height="48px" radius="8px" circle />);
    expect(skeleton.style.width).toBe('48px');
    expect(skeleton.style.height).toBe('48px');
    expect(skeleton.style.borderRadius).toBe('50%');
    rerender(<GlassSkeleton radius="8px" />);
    expect(skeleton.style.borderRadius).toBe('8px');
  });
});

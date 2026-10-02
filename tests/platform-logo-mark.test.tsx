import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import * as reactUI from '../src/react/index';

describe('PlatformLogoMark public component', () => {
  it('preserves the canonical platform geometry', () => {
    const svg = render(<reactUI.PlatformLogoMark />).container.firstElementChild!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    const corporateMark = svg.querySelector('svg')!;
    expect(['x', 'y', 'width', 'height'].map((key) => corporateMark.getAttribute(key)))
      .toEqual(['3', '2', '26', '15']);
    expect(corporateMark.querySelectorAll('path')).toHaveLength(6);
    const layers = svg.lastElementChild!;
    expect(layers.getAttribute('d')).toBe('m4 20 12 6 12-6M4 25l12 6 12-6');
    expect(layers.getAttribute('stroke')).toBe('currentColor');
    expect(layers.getAttribute('stroke-width')).toBe('1.6');
    expect(layers.getAttribute('stroke-linecap')).toBe('round');
    expect(layers.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('forwards SVG attributes, classes, events, and accessibility overrides', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<reactUI.PlatformLogoMark className="header-mark"
      width={40} height={40} aria-hidden={false} aria-label="Latere Platform"
      role="img" focusable="true" onClick={onClick} />);
    const svg = getByRole('img', { name: 'Latere Platform' });
    expect(svg.getAttribute('class')).toBe('platform-logo-mark header-mark');
    expect(['width', 'height', 'aria-hidden', 'focusable'].map((key) => svg.getAttribute(key)))
      .toEqual(['40', '40', 'false', 'true']);
    fireEvent.click(svg);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

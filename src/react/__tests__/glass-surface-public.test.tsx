import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GlassSurface, glassClass } from '../GlassSurface';

describe('GlassSurface public attributes', () => {
  it('forwards optical-effect attributes, style, ARIA and events to the selected element', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<GlassSurface as="button" type="button" interactive
      className="custom" style={{ padding: 12 }} aria-label="Reflect" data-lg-refract="off"
      data-lg-sheen="" onClick={onClick}>Surface</GlassSurface>);
    const surface = getByRole('button', { name: 'Reflect' });
    expect(surface.getAttribute('type')).toBe('button');
    expect(surface.getAttribute('data-lg-refract')).toBe('off');
    expect(surface.hasAttribute('data-lg-sheen')).toBe(true);
    expect(surface.style.padding).toBe('12px');
    expect(surface.className).toBe('lu-gs lu-glass lu-gs-interactive custom');
    expect(surface.textContent).toBe('Surface');
    fireEvent.click(surface);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    ['ultrathin', 'lu-glass-ultrathin'], ['thin', 'lu-glass-thin'],
    ['regular', 'lu-glass'], ['thick', 'lu-glass-thick'], ['smoke', 'lu-glass-smoke'],
  ] as const)('renders the %s tier', (tier, expected) => {
    const { container } = render(<GlassSurface tier={tier} />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.firstElementChild?.className).toBe(`lu-gs ${expected}`);
  });

  it('updates material and native attributes without losing children', () => {
    const { container, rerender } = render(<GlassSurface id="before">Content</GlassSurface>);
    expect(glassClass()).toBe('lu-glass');
    rerender(<GlassSurface as="a" href="#after" id="after" tier="smoke">Content</GlassSurface>);
    const surface = container.firstElementChild!;
    expect(surface.tagName).toBe('A');
    expect(surface.getAttribute('href')).toBe('#after');
    expect(surface.id).toBe('after');
    expect(surface.className).toBe('lu-gs lu-glass-smoke');
    expect(surface.textContent).toBe('Content');
  });
});

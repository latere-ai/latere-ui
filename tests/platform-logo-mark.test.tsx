import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { fireEvent, render } from '@testing-library/react';
import * as vueUI from '../src/index';
import * as reactUI from '../src/react/index';

function geometry(svg: Element) {
  return Array.from(svg.querySelectorAll('svg, g, path')).map((element) => ({
    tag: element.tagName,
    attributes: Object.fromEntries(Array.from(element.attributes)
      .filter(({ name }) => name !== 'data-v-inspector')
      .map(({ name, value }) => [name, value])),
  }));
}

describe('PlatformLogoMark public adapters', () => {
  it.each(['Vue', 'React'])('%s preserves the canonical platform geometry', (adapter) => {
    const svg = adapter === 'Vue'
      ? mount(vueUI.PlatformLogoMark).element
      : render(<reactUI.PlatformLogoMark />).container.firstElementChild!;
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

  it('renders identical geometry in Vue and React', () => {
    const vue = mount(vueUI.PlatformLogoMark);
    const react = render(<reactUI.PlatformLogoMark />);
    expect(geometry(vue.element)).toEqual(geometry(react.container.firstElementChild!));
    vue.unmount();
  });

  it('forwards Vue SVG attributes, classes, events, and accessibility overrides', async () => {
    const onClick = vi.fn();
    const wrapper = mount(vueUI.PlatformLogoMark, { attrs: {
      class: 'header-mark', width: 40, height: 40, 'aria-hidden': 'false',
      'aria-label': 'Latere Platform', role: 'img', focusable: 'true', onClick,
    } });
    expect(wrapper.classes()).toEqual(['platform-logo-mark', 'header-mark']);
    expect(wrapper.attributes()).toMatchObject({ width: '40', height: '40',
      'aria-hidden': 'false', 'aria-label': 'Latere Platform', role: 'img', focusable: 'true' });
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('forwards React SVG attributes, classes, events, and accessibility overrides', () => {
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

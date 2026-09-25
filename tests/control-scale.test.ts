import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mount } from '@vue/test-utils';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import GlassButton from '../src/components/GlassButton.vue';
import { GlassButton as ReactGlassButton } from '../src/react/GlassButton';

const read = (name: string) => readFileSync(resolve(process.cwd(), `src/styles/components/${name}.css`), 'utf8');
const rule = (css: string, selector: string) => {
  const at = css.indexOf(`${selector} {`);
  expect(at, selector).toBeGreaterThanOrEqual(0);
  return css.slice(at, css.indexOf('}', at));
};

describe('the control scale', () => {
  it('sizes buttons, icon buttons, fields and selects from one pair of heights', () => {
    expect(rule(read('glass-button'), '.lu-btn-md')).toMatch(/min-height:\s*var\(--lu-control-height, 32px\)/);
    expect(rule(read('glass-button'), '.lu-btn-sm')).toMatch(/min-height:\s*var\(--lu-control-height-sm, 28px\)/);
    expect(read('glass-icon-button')).toMatch(/\.lu-iconbtn-md \{ width: var\(--lu-control-height, 36px\); height: var\(--lu-control-height, 36px\); \}/);
    expect(read('glass-icon-button')).toMatch(/\.lu-iconbtn-sm \{ width: var\(--lu-control-height-sm, 28px\); height: var\(--lu-control-height-sm, 28px\); \}/);
    expect(rule(read('glass-field'), '.lu-field-control')).toMatch(/min-height:\s*var\(--lu-control-height, 32px\)/);
    expect(rule(read('glass-select'), '.lu-select-trigger')).toMatch(/min-height:\s*var\(--lu-control-height, 32px\)/);
  });

  it('rounds every control from one radius token, keeping each default', () => {
    expect(rule(read('glass-button'), '.lu-btn')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-pill, 999px\)\)/);
    expect(rule(read('glass-icon-button'), '.lu-iconbtn')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-pill, 999px\)\)/);
    expect(rule(read('glass-field'), '.lu-field-control')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-md, 8px\)\)/);
    expect(rule(read('glass-select'), '.lu-select-trigger')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-md, 8px\)\)/);
  });

  it('offers danger as text for an action among others, in both adapters', () => {
    expect(rule(read('glass-button'), '.lu-btn-danger-ghost')).toMatch(/background:\s*transparent;\s*color:\s*var\(--state-error/);
    const vue = mount(GlassButton, { props: { variant: 'danger-ghost' }, slots: { default: 'Delete' } });
    expect(vue.classes()).toEqual(['lu-btn', 'lu-btn-danger-ghost', 'lu-btn-md']);
    const react = render(createElement(ReactGlassButton, { variant: 'danger-ghost' }, 'Delete'));
    expect(react.container.querySelector('button')!.className).toBe('lu-btn lu-btn-danger-ghost lu-btn-md');
  });
});

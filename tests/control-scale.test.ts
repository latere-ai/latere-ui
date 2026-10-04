import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mount } from '@vue/test-utils';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import GlassButton from '../src/components/GlassButton.vue';
import { GlassButton as ReactGlassButton } from '../src/react/GlassButton';

const read = (name: string) => readFileSync(resolve(process.cwd(), `src/styles/components/${name}.css`), 'utf8');
const readStyle = (path: string) => readFileSync(resolve(process.cwd(), `src/styles/${path}`), 'utf8');
// Declarations only: the file headers name both tokens to explain the split.
const declarations = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
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

  it('rounds buttons from the button corner, a capsule by default, and fields from the control corner', () => {
    const capsule = /border-radius:\s*var\(--lu-button-radius, var\(--radius-pill, 999px\)\)/;
    expect(rule(read('glass-button'), '.lu-btn')).toMatch(capsule);
    expect(rule(read('glass-icon-button'), '.lu-iconbtn')).toMatch(capsule);
    expect(rule(read('preference-menu'), '.lu-pref-trigger')).toMatch(capsule);
    expect(rule(read('glass-field'), '.lu-field-control')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-md, 8px\)\)/);
    expect(rule(read('glass-select'), '.lu-select-trigger')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-md, 8px\)\)/);
  });

  // A capsule set through --lu-control-radius once turned the footer's theme
  // menu panel into a pill, because panels, menu rows and fields round from
  // that token. The capsule belongs to the button token alone.
  it('keeps the button corner out of panels, menu rows and fields', () => {
    for (const name of ['glass-button', 'glass-icon-button', 'preference-menu']) {
      expect(declarations(read(name)), name).not.toMatch(/--lu-control-radius/);
    }
    const readers = ['glass-button.css', 'glass-icon-button.css', 'preference-menu.css'];
    const components = readdirSync(resolve(process.cwd(), 'src/styles/components')).map(name => `components/${name}`);
    const sheets = ['footer.css', 'console.css', 'docs.css', 'glass.css', 'presets.css', 'tokens.css', 'brand.css', ...components];
    for (const sheet of sheets.filter(path => !readers.some(reader => path.endsWith(`/${reader}`)))) {
      expect(declarations(readStyle(sheet)), sheet).not.toMatch(/--lu-button-radius/);
    }
    expect(rule(read('glass-popover'), '.lu-pop-panel--solid')).toMatch(/border-radius:\s*calc\(var\(--lu-control-radius, var\(--radius-sm, 6px\)\) \+ var\(--lu-menu-padding\)\)/);
    expect(rule(read('glass-menu'), '.lu-menu--checkable .lu-menu-item')).toMatch(/border-radius:\s*var\(--lu-control-radius, var\(--radius-sm, 6px\)\)/);
  });

  it('draws buttons flat: no glass material, blur or shadow', () => {
    for (const [name, selector] of [['glass-button', '.lu-btn.lu-btn'], ['glass-icon-button', '.lu-iconbtn.lu-iconbtn']] as const) {
      const flat = rule(read(name), selector);
      expect(flat).toMatch(/box-shadow:\s*none/);
      expect(flat).toMatch(/-webkit-backdrop-filter:\s*none/);
      expect(flat).toMatch(/(?<!-webkit-)backdrop-filter:\s*none/);
      expect(declarations(read(name)), name).not.toMatch(/backdrop-filter:\s*blur|--glass-|box-shadow:(?!\s*none)/);
    }
    expect(declarations(read('glass-bar'))).not.toMatch(/\.lu-btn/);
  });

  it('offers danger as text for an action among others, in both adapters', () => {
    expect(rule(read('glass-button'), '.lu-btn-danger-ghost')).toMatch(/background:\s*transparent;\s*color:\s*var\(--state-error/);
    const vue = mount(GlassButton, { props: { variant: 'danger-ghost' }, slots: { default: 'Delete' } });
    expect(vue.classes()).toEqual(['lu-btn', 'lu-btn-danger-ghost', 'lu-btn-md']);
    const react = render(createElement(ReactGlassButton, { variant: 'danger-ghost' }, 'Delete'));
    expect(react.container.querySelector('button')!.className).toBe('lu-btn lu-btn-danger-ghost lu-btn-md');
  });
});

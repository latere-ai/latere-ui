import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { GlassAlert } from '../src/react/GlassAlert';
import { ALERT_TONE_ICON, ALERT_TONE_VAR, alertRole, alertTone } from '../src/components/glassAlert';

const css = readFileSync(resolve(process.cwd(), 'src/styles/components/glass-alert.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('GlassAlert anatomy', () => {
  it('frames the notice with an even hairline, never a heavier edge', () => {
    expect(css).not.toMatch(/border-(?:left|right|top|bottom|inline|block)[\w-]*\s*:/);
    expect(css).not.toMatch(/box-shadow:\s*inset/);
    const frame = css.slice(css.indexOf('.lu-alert.lu-alert {'), css.indexOf('}', css.indexOf('.lu-alert.lu-alert {')));
    expect(frame).toMatch(/border:\s*1px solid color-mix\(in srgb, var\(--tone\)/);
    expect(frame).toMatch(/background-image:\s*linear-gradient\(\s*color-mix\(in srgb, var\(--tone\) 6%/);
    expect(frame).toMatch(/box-shadow:\s*none/);
  });

  it('sets the icon, the text column and the dismiss on one grid', () => {
    expect(css).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\) auto/);
  });

  it('leads each tone with its own icon in the tone color', () => {
    for (const tone of ['info', 'success', 'warning', 'error'] as const) {
      const { container, unmount } = render(createElement(GlassAlert, { tone, title: 'Title' }, 'Body'));
      const root = container.firstElementChild as HTMLElement;
      const [icon, body] = root.children;
      expect(icon.className).toBe('lu-alert-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.querySelector('svg')?.getAttribute('data-icon')).toBe(ALERT_TONE_ICON[tone]);
      expect(body.className).toBe('lu-alert-body');
      expect(body.querySelector('.lu-alert-title')?.textContent).toBe('Title');
      expect(body.querySelector('.lu-alert-text')?.textContent).toBe('Body');
      expect(root.getAttribute('data-tone')).toBe(tone);
      expect(root.style.getPropertyValue('--tone')).toBe(ALERT_TONE_VAR[tone]);
      unmount();
    }
  });

  it('reads an unknown tone as info', () => {
    expect(alertTone('loud')).toBe('info');
    expect(alertTone(undefined)).toBe('info');
    expect(alertRole('error')).toBe('alert');
    expect(alertRole('warning')).toBe('status');
    const root = render(createElement(GlassAlert, { tone: 'loud' as never })).container.firstElementChild!;
    expect(root.getAttribute('data-tone')).toBe('info');
    expect(root.getAttribute('role')).toBe('status');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';

import { ThemeMenu, LocaleMenu, type Theme } from '..';
import { THEME_ICONS, GLOBE_ICON } from '../../components/preferenceMenus';

afterEach(cleanup);

// The DOM serializes self-closing SVG children with end tags.
const markup = (html: string) => { const box = document.createElement('div'); box.innerHTML = html; return box.innerHTML; };
function ControlledTheme({ initial, onChange }: { initial: Theme; onChange?: (theme: Theme) => void }) {
  const [theme, setTheme] = useState<Theme>(initial);
  return <><ThemeMenu theme={theme} onThemeChange={next => { setTheme(next); onChange?.(next); }} /><button>After</button></>;
}

describe('React ThemeMenu', () => {
  it('shows the current preference as a sun, a moon, or a monitor, and names it', () => {
    const view = render(<ThemeMenu theme="auto" />);
    const trigger = view.getByRole('button', { name: 'Theme: System' });
    expect(trigger.getAttribute('title')).toBe('Theme');
    expect(trigger.querySelector('.lu-pref-icon')!.innerHTML).toBe(markup(THEME_ICONS.auto));
    view.rerender(<ThemeMenu theme="dark" />);
    expect(view.getByRole('button', { name: 'Theme: Dark' }).querySelector('.lu-pref-icon')!.innerHTML).toBe(markup(THEME_ICONS.dark));
    view.rerender(<ThemeMenu theme="light" />);
    expect(view.getByRole('button', { name: 'Theme: Light' }).querySelector('.lu-pref-icon')!.innerHTML).toBe(markup(THEME_ICONS.light));
  });

  it('is a menu button: expanded state, controlled menu, checked current preference, focus on open', () => {
    const view = render(<ThemeMenu theme="dark" className="host-slot" />);
    expect(view.container.firstElementChild!.className).toBe('lu-pop lu-pref lu-theme-menu host-slot');
    const trigger = view.getByRole('button', { name: 'Theme: Dark' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = view.container.querySelector('.lu-pop-panel')!;
    expect(panel.className).toBe('lu-pop-panel lu-pop-panel--solid lu-pop-panel--bottom-end');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    const rows = view.getAllByRole('menuitemradio');
    expect(view.getByRole('menu', { name: 'Theme' })).toBeTruthy();
    expect(rows.map(r => r.textContent)).toEqual(['Light', 'Dark', 'System']);
    expect(rows.map(r => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(document.activeElement).toBe(rows[1]);
  });

  it('opens from the keyboard with ArrowDown and returns focus to the trigger after a choice', () => {
    const changed = vi.fn();
    const view = render(<ControlledTheme initial="light" onChange={changed} />);
    const trigger = view.getByRole('button', { name: 'Theme: Light' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const rows = view.getAllByRole('menuitemradio');
    expect(document.activeElement).toBe(rows[0]);
    fireEvent.keyDown(view.getByRole('menu'), { key: 'ArrowDown' });
    fireEvent.keyDown(view.getByRole('menu'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[2]);
    fireEvent.click(rows[2]);
    expect(changed.mock.calls).toEqual([['auto']]);
    expect(view.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-label')).toBe('Theme: System');
  });

  it('closes on Escape and on Shift+Tab, returning focus to the trigger each time', () => {
    const changed = vi.fn();
    const view = render(<ControlledTheme initial="light" onChange={changed} />);
    const trigger = view.getByRole('button', { name: 'Theme: Light' });
    for (const [key, shiftKey] of [['Escape', false], ['Tab', true]] as const) {
      fireEvent.click(trigger);
      const row = view.getAllByRole('menuitemradio')[0];
      expect(document.activeElement).toBe(row);
      fireEvent.keyDown(row, { key, shiftKey });
      expect(view.queryByRole('menu'), key).toBeNull();
      expect(document.activeElement, key).toBe(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
    expect(changed).not.toHaveBeenCalled();
  });

  it('closes when focus moves past the menu, and stays open when it falls to the document', () => {
    const view = render(<ControlledTheme initial="light" />);
    fireEvent.click(view.getByRole('button', { name: 'Theme: Light' }));
    const row = view.getAllByRole('menuitemradio')[0];
    fireEvent.blur(row, { relatedTarget: null });
    expect(view.queryByRole('menu')).not.toBeNull();
    fireEvent.blur(row, { relatedTarget: view.getByText('After') });
    expect(view.queryByRole('menu')).toBeNull();
  });

  it('takes translated labels and the placement', () => {
    const view = render(<ThemeMenu theme="auto" placement="top-start" labels={{ theme: '主题', light: '浅色', dark: '深色', system: '跟随系统' }} />);
    fireEvent.click(view.getByRole('button', { name: '主题: 跟随系统' }));
    expect(view.container.querySelector('.lu-pop-panel')!.classList.contains('lu-pop-panel--top-start')).toBe(true);
    expect(view.getAllByRole('menuitemradio').map(r => r.textContent)).toEqual(['浅色', '深色', '跟随系统']);
  });
});

describe('React LocaleMenu', () => {
  it('offers English and Chinese by default behind a globe, each named in its own language', () => {
    const view = render(<LocaleMenu locale="zh" />);
    const trigger = view.getByRole('button', { name: 'Language: 中文' });
    expect(trigger.querySelector('.lu-pref-icon')!.innerHTML).toBe(markup(GLOBE_ICON));
    fireEvent.click(trigger);
    const rows = view.getAllByRole('menuitemradio');
    expect(rows.map(r => r.textContent)).toEqual(['English', '中文']);
    expect(rows.map(r => r.getAttribute('aria-checked'))).toEqual(['false', 'true']);
    expect(document.activeElement).toBe(rows[1]);
    expect(view.getByRole('menu', { name: 'Language' })).toBeTruthy();
  });

  it('reports the chosen code from a custom list and closes', () => {
    const changed = vi.fn();
    const locales = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'de', label: 'DE', name: 'Deutsch' }, { code: 'fr', label: 'FR' }];
    const view = render(<LocaleMenu locale="en" locales={locales} label="Sprache" onLocaleChange={changed} />);
    fireEvent.click(view.getByRole('button', { name: 'Sprache: English' }));
    const rows = view.getAllByRole('menuitemradio');
    expect(rows.map(r => r.textContent)).toEqual(['English', 'Deutsch', 'FR']);
    fireEvent.click(rows[1]);
    expect(changed.mock.calls).toEqual([['de']]);
    expect(view.queryByRole('menu')).toBeNull();
  });
});

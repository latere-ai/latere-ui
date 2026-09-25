import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { GlassMenu } from '..';

afterEach(cleanup);

const choices = [
  { value: 'a', label: 'Alpha', checked: false },
  { value: 'b', label: 'Beta', checked: true },
  { value: 'x', label: 'Unavailable', checked: false, disabled: true },
  { value: 'c', label: 'Gamma', checked: false },
];

describe('React GlassMenu as a choice menu', () => {
  it('renders menuitemradio rows with aria-checked, a check column and one tab stop', () => {
    const view = render(<GlassMenu items={choices} label="Choice" />);
    const menu = view.getByRole('menu', { name: 'Choice' });
    expect(menu.className).toBe('lu-menu lu-menu--checkable');
    const rows = view.getAllByRole('menuitemradio');
    expect(rows.map(r => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(rows.map(r => !!r.querySelector('.lu-menu-check'))).toEqual([true, true, true, true]);
    expect(rows.map(r => !!r.querySelector('.lu-menu-check svg'))).toEqual([false, true, false, false]);
    expect(rows.map(r => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
  });

  it('moves focus with the arrows, wrapping and skipping disabled rows, and jumps with Home and End', () => {
    const view = render(<GlassMenu items={choices} autofocus />);
    const menu = view.getByRole('menu');
    const rows = view.getAllByRole('menuitemradio');
    expect(document.activeElement).toBe(rows[1]);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[3]);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[0]);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(rows[3]);
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement).toBe(rows[0]);
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(rows[3]);
    expect(rows.map(r => r.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '0']);
  });

  it('moves focus under a mouse pointer but not under touch', () => {
    const view = render(<GlassMenu items={choices} autofocus />);
    const rows = view.getAllByRole('menuitemradio');
    fireEvent.pointerMove(rows[3], { pointerType: 'mouse' });
    expect(document.activeElement).toBe(rows[3]);
    fireEvent.pointerMove(rows[0], { pointerType: 'touch' });
    expect(document.activeElement).toBe(rows[3]);
  });

  it('stays an action menu when no item carries a selection state', () => {
    const view = render(<GlassMenu items={[{ value: 'copy', label: 'Copy' }]} />);
    expect(view.getByRole('menu').className).toBe('lu-menu');
    expect(view.getAllByRole('menuitem')[0].hasAttribute('aria-checked')).toBe(false);
    expect(view.container.querySelector('.lu-menu-check')).toBeNull();
  });
});

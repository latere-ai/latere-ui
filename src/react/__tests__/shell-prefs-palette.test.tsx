import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountPrefs } from '../AccountPrefs';
import { ConsolePalette } from '../ConsolePalette';
import type { ConsoleNavModel } from '../../console/nav';

const model = { groups: [{ label: 'Pages', items: [{ id: 'a', label: 'Alpha', to: '/a' }, { id: 'b', label: 'Beta', to: '/b' }, { id: 'off', label: 'Hidden', to: '/off', disabled: true }, { id: 'action', label: 'Action' }] }] };
beforeEach(() => { Element.prototype.scrollIntoView = vi.fn(); });

describe('React AccountPrefs', () => {
  it('uses controlled locale/theme, localizes labels and emits selected values', () => {
    const onSetLocale = vi.fn(); const onSetTheme = vi.fn();
    const props = { theme: 'auto' as const, locale: 'en', localeOptions: [{ code: 'en', label: 'EN', name: 'English' }, { code: 'de', label: 'DE' }], onSetLocale, onSetTheme };
    const view = render(<AccountPrefs {...props} />);
    expect(screen.getByTitle('English').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByTitle('DE')); fireEvent.click(screen.getByTitle('Dark'));
    expect(onSetLocale).toHaveBeenCalledWith('de'); expect(onSetTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByTitle('Auto').getAttribute('aria-pressed')).toBe('true');
    view.rerender(<AccountPrefs {...props} theme="dark" locale="de" labels={{ language: 'Sprache', dark: 'Dunkel' }} />);
    expect(screen.getByRole('group', { name: 'Sprache' })).toBeTruthy();
    expect(screen.getByTitle('Dunkel').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTitle('DE').getAttribute('aria-pressed')).toBe('true');
  });
});

describe('React AccountPrefs locales', () => {
  it('renders one language pill per host locale, past two, and marks one locale and one theme active', () => {
    const localeOptions = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'zh', label: '中文', name: 'Chinese' }, { code: 'de', label: 'DE', name: 'Deutsch' }];
    const view = render(<AccountPrefs theme="auto" locale="zh" localeOptions={localeOptions} />);
    const language = view.container.querySelectorAll('[role="group"]')[0];
    expect(Array.from(language.querySelectorAll('.lu-ap-pill')).map(b => b.textContent)).toEqual(['EN', '中文', 'DE']);
    const active = Array.from(view.container.querySelectorAll('.lu-ap-pill.is-active')).map(b => b.textContent);
    expect(active).toHaveLength(2);
    expect(active).toEqual(expect.arrayContaining(['中文', 'Auto']));
  });
});

describe('React ConsolePalette', () => {
  it('filters routable enabled rows, bounds selection, navigates and resets on reopen/model change', () => {
    const onNavigate = vi.fn(); const onClose = vi.fn();
    const view = render(<ConsolePalette open model={model} onNavigate={onNavigate} onClose={onClose} />);
    const input = screen.getByRole('combobox');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: 'Alpha Pages' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'ArrowDown' }); fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' })); expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: '  ALP  ' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.mouseEnter(screen.getByRole('option')); fireEvent.click(screen.getByRole('option'));
    expect(onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'a' }));
    fireEvent.change(input, { target: { value: 'absent' } });
    expect(screen.getByText('No matches')).toBeTruthy(); expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    fireEvent.keyDown(input, { key: 'ArrowDown' }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledTimes(2);
    view.rerender(<ConsolePalette open={false} model={model} />); expect(screen.queryByRole('dialog')).toBeNull();
    view.rerender(<ConsolePalette open model={model} />); expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
    view.rerender(<ConsolePalette open model={{ groups: [] }} emptyLabel="Nothing here" />); expect(screen.getByText('Nothing here')).toBeTruthy();
  });
  it('focuses/traps/restores focus and distinguishes panel and backdrop dismissal', () => {
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
    const onClose = vi.fn();
    const view = render(<ConsolePalette open model={model} onClose={onClose} />);
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
    fireEvent.keyDown(document, { key: 'Tab' }); expect(document.activeElement).toBe(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getByRole('dialog')); expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(document.querySelector('.lu-cp-backdrop')!); expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(onClose).toHaveBeenCalledTimes(2);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    view.unmount(); expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(onClose).toHaveBeenCalledTimes(2); trigger.remove();
  });
});

describe('ConsolePalette input method composition', () => {
  it('does not navigate on the Enter that commits a composition', () => {
    const onNavigate = vi.fn();
    render(<ConsolePalette open model={model} onNavigate={onNavigate} />);
    const input = document.querySelector<HTMLInputElement>('.lu-cp-input')!;
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 });
    expect(onNavigate).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledOnce();
  });
});

describe('ConsolePalette highlight', () => {
  const keys: ConsoleNavModel = { groups: [{ items: [
    { id: 'home', label: 'Home', to: '/' },
    { id: 'keys', label: 'Keys', to: '/keys' },
    { id: 'billing', label: 'Billing', to: '/billing' },
  ] }] };

  it('keeps the highlighted row when the host re-renders with an equal inline items list', () => {
    const onNavigate = vi.fn();
    const view = render(<ConsolePalette open model={keys} items={[{ id: 'new-key', label: 'Create a key', action: true }]} onNavigate={onNavigate} />);
    const input = document.querySelector<HTMLInputElement>('.lu-cp-input')!;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(document.querySelector('[data-active="true"]')?.textContent).toContain('Billing');
    view.rerender(<ConsolePalette open model={keys} items={[{ id: 'new-key', label: 'Create a key', action: true }]} onNavigate={onNavigate} />);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'billing' }));
  });

  it('returns to the first row when the query changes or the row leaves the results', () => {
    const view = render(<ConsolePalette open model={keys} />);
    const input = document.querySelector<HTMLInputElement>('.lu-cp-input')!;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.change(input, { target: { value: 'o' } });
    expect(document.querySelector('[data-active="true"]')?.textContent).toContain('Home');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    view.rerender(<ConsolePalette open model={{ groups: [{ items: keys.groups[0].items.slice(0, 2) }] }} />);
    expect(document.querySelector('[data-active="true"]')?.textContent).toContain('Home');
  });
});

describe('ConsolePalette empty results', () => {
  it('announces the empty line in a status region outside the listbox', () => {
    render(<ConsolePalette open model={model} emptyLabel="Nothing here" />);
    expect(screen.getByRole('status').textContent).toBe('');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'absent' } });
    expect(screen.getByRole('status').textContent).toBe('Nothing here');
    const listbox = screen.getByRole('listbox');
    expect(listbox.contains(screen.getByText('Nothing here'))).toBe(false);
    expect(listbox.children).toHaveLength(0);
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

import ThemeMenu from '../src/components/ThemeMenu.vue';
import LocaleMenu from '../src/components/LocaleMenu.vue';
import { THEME_ICONS, GLOBE_ICON } from '../src/components/preferenceMenus';

// The DOM serializes self-closing SVG children with end tags.
const markup = (html: string) => { const box = document.createElement('div'); box.innerHTML = html; return box.innerHTML; };
const mounted: VueWrapper[] = [];
function attach<T extends VueWrapper>(w: T): T { mounted.push(w); return w; }
afterEach(() => { while (mounted.length) mounted.pop()!.unmount(); document.body.innerHTML = ''; });

describe('ThemeMenu', () => {
  it('shows the current preference as a sun, a moon, or a monitor, and names it', async () => {
    const w = attach(mount(ThemeMenu, { props: { theme: 'auto' } }));
    const trigger = w.get('.lu-pref-trigger');
    expect(trigger.attributes('aria-label')).toBe('Theme: System');
    expect(trigger.attributes('title')).toBe('Theme');
    expect(trigger.get('.lu-pref-icon').element.innerHTML).toBe(markup(THEME_ICONS.auto));
    await w.setProps({ theme: 'dark' });
    expect(trigger.attributes('aria-label')).toBe('Theme: Dark');
    expect(trigger.get('.lu-pref-icon').element.innerHTML).toBe(markup(THEME_ICONS.dark));
    await w.setProps({ theme: 'light' });
    expect(trigger.get('.lu-pref-icon').element.innerHTML).toBe(markup(THEME_ICONS.light));
  });

  it('is a menu button: expanded state, controlled menu, checked current preference, focus on open', async () => {
    const w = attach(mount(ThemeMenu, { props: { theme: 'dark' }, attachTo: document.body }));
    const trigger = w.get('.lu-pref-trigger');
    expect(trigger.attributes('aria-haspopup')).toBe('menu');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.attributes('aria-controls')).toBeUndefined();
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');
    const panel = w.get('.lu-pop-panel');
    expect(panel.classes()).toContain('lu-pop-panel--solid');
    expect(panel.classes()).not.toContain('lu-glass-thick');
    expect(trigger.attributes('aria-controls')).toBe(panel.attributes('id'));
    const menu = panel.get('[role="menu"]');
    expect(menu.attributes('aria-label')).toBe('Theme');
    const rows = menu.findAll('[role="menuitemradio"]');
    expect(rows.map(r => r.text())).toEqual(['Light', 'Dark', 'System']);
    expect(rows.map(r => r.attributes('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(document.activeElement).toBe(rows[1].element);
  });

  it('opens from the keyboard with ArrowDown and returns focus to the trigger after a choice', async () => {
    const w = attach(mount(ThemeMenu, { props: { theme: 'light' }, attachTo: document.body }));
    const trigger = w.get('.lu-pref-trigger');
    (trigger.element as HTMLElement).focus();
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const rows = w.findAll('[role="menuitemradio"]');
    expect(document.activeElement).toBe(rows[0].element);
    await w.get('[role="menu"]').trigger('keydown', { key: 'ArrowDown' });
    await w.get('[role="menu"]').trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[2].element);
    await rows[2].trigger('click');
    expect(w.emitted('update:theme')).toEqual([['auto']]);
    expect(w.find('.lu-pop-panel').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
  });

  it('closes on Escape and on Shift+Tab, returning focus to the trigger each time', async () => {
    const w = attach(mount(ThemeMenu, { props: { theme: 'light' }, attachTo: document.body }));
    const trigger = w.get('.lu-pref-trigger');
    for (const [key, shiftKey] of [['Escape', false], ['Tab', true]] as const) {
      await trigger.trigger('click');
      const row = w.get('[role="menuitemradio"]');
      expect(document.activeElement).toBe(row.element);
      await row.trigger('keydown', { key, shiftKey });
      expect(w.find('.lu-pop-panel').exists(), key).toBe(false);
      expect(document.activeElement, key).toBe(trigger.element);
      expect(trigger.attributes('aria-expanded')).toBe('false');
    }
    expect(w.emitted('update:theme')).toBeUndefined();
  });

  it('closes when focus moves past the menu, and stays open when it falls to the document', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const w = attach(mount(ThemeMenu, { props: { theme: 'light' }, attachTo: document.body }));
    await w.get('.lu-pref-trigger').trigger('click');
    const row = w.get('[role="menuitemradio"]');
    row.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await nextTick();
    expect(w.find('.lu-pop-panel').exists()).toBe(true);
    row.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
    await nextTick();
    expect(w.find('.lu-pop-panel').exists()).toBe(false);
  });

  it('takes translated labels and the placement', async () => {
    const w = attach(mount(ThemeMenu, {
      props: { theme: 'auto', placement: 'top-start', labels: { theme: '主题', light: '浅色', dark: '深色', system: '跟随系统' } },
      attachTo: document.body,
    }));
    expect(w.get('.lu-pref-trigger').attributes('aria-label')).toBe('主题: 跟随系统');
    await w.get('.lu-pref-trigger').trigger('click');
    expect(w.get('.lu-pop-panel').classes()).toContain('lu-pop-panel--top-start');
    expect(w.findAll('[role="menuitemradio"]').map(r => r.text())).toEqual(['浅色', '深色', '跟随系统']);
  });
});

describe('LocaleMenu', () => {
  it('offers English and Chinese by default behind a globe, each named in its own language', async () => {
    const w = attach(mount(LocaleMenu, { props: { locale: 'zh' }, attachTo: document.body }));
    const trigger = w.get('.lu-pref-trigger');
    expect(trigger.attributes('aria-label')).toBe('Language: 中文');
    expect(trigger.get('.lu-pref-icon').element.innerHTML).toBe(markup(GLOBE_ICON));
    await trigger.trigger('click');
    const rows = w.findAll('[role="menuitemradio"]');
    expect(rows.map(r => r.text())).toEqual(['English', '中文']);
    expect(rows.map(r => r.attributes('aria-checked'))).toEqual(['false', 'true']);
    expect(document.activeElement).toBe(rows[1].element);
    expect(w.get('[role="menu"]').attributes('aria-label')).toBe('Language');
  });

  it('emits the chosen code from a custom list and closes', async () => {
    const locales = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'de', label: 'DE', name: 'Deutsch' }, { code: 'fr', label: 'FR' }];
    const w = attach(mount(LocaleMenu, { props: { locale: 'en', locales, label: 'Sprache' }, attachTo: document.body }));
    expect(w.get('.lu-pref-trigger').attributes('aria-label')).toBe('Sprache: English');
    await w.get('.lu-pref-trigger').trigger('click');
    const rows = w.findAll('[role="menuitemradio"]');
    expect(rows.map(r => r.text())).toEqual(['English', 'Deutsch', 'FR']);
    await rows[1].trigger('click');
    expect(w.emitted('update:locale')).toEqual([['de']]);
    expect(w.find('.lu-pop-panel').exists()).toBe(false);
  });
});

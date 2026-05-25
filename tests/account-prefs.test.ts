import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import { AccountPrefs } from '../src';
import type { LocaleOption } from '../src';

const locales: LocaleOption[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中文', name: 'Chinese' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
];

describe('AccountPrefs', () => {
  it('renders one language pill per host locale (scales past two)', () => {
    const w = mount(AccountPrefs, {
      props: { theme: 'dark', locale: 'en', localeOptions: locales },
    });
    const labels = w
      .findAll('[role="group"]')[0]
      .findAll('.lu-ap-pill')
      .map((b) => b.text());
    expect(labels).toEqual(['EN', '中文', 'DE']);
  });

  it('marks the active locale and theme', () => {
    const w = mount(AccountPrefs, {
      props: { theme: 'auto', locale: 'zh', localeOptions: locales },
    });
    const active = w.findAll('.lu-ap-pill.is-active').map((b) => b.text());
    expect(active).toContain('中文'); // active locale
    expect(active).toContain('Auto'); // active theme
    expect(active).toHaveLength(2);
  });

  it('emits set-locale / set-theme with the chosen value', async () => {
    const w = mount(AccountPrefs, {
      props: { theme: 'light', locale: 'en', localeOptions: locales },
    });
    const pills = w.findAll('.lu-ap-pill');
    await pills.find((b) => b.text() === 'DE')!.trigger('click');
    await pills.find((b) => b.text() === 'Dark')!.trigger('click');
    expect(w.emitted('set-locale')?.[0]).toEqual(['de']);
    expect(w.emitted('set-theme')?.[0]).toEqual(['dark']);
  });

  it('localizes the section + theme labels', () => {
    const w = mount(AccountPrefs, {
      props: {
        theme: 'light',
        locale: 'en',
        localeOptions: locales,
        labels: { language: '语言', theme: '主题', light: '浅色' },
      },
    });
    expect(w.text()).toContain('语言');
    expect(w.text()).toContain('主题');
    expect(w.text()).toContain('浅色');
  });
});

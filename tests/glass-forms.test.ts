import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import GlassIconButton from '../src/components/GlassIconButton.vue';
import GlassSwitch from '../src/components/GlassSwitch.vue';
import GlassSegmented from '../src/components/GlassSegmented.vue';
import GlassCheckbox from '../src/components/GlassCheckbox.vue';
import GlassRadio from '../src/components/GlassRadio.vue';
import GlassTabs from '../src/components/GlassTabs.vue';

describe('GlassIconButton', () => {
  it('exposes its accessible label and pressed state', async () => {
    const w = mount(GlassIconButton, { props: { label: 'Search', pressed: true } });
    expect(w.attributes('aria-label')).toBe('Search');
    expect(w.attributes('aria-pressed')).toBe('true');
    await w.trigger('click');
    expect(w.emitted('click')).toHaveLength(1);
  });
});

describe('GlassSwitch', () => {
  it('has role=switch, reflects aria-checked, and toggles', async () => {
    const w = mount(GlassSwitch, { props: { modelValue: false, label: 'Dark' } });
    expect(w.attributes('role')).toBe('switch');
    expect(w.attributes('aria-checked')).toBe('false');
    await w.trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('does not toggle when disabled', async () => {
    const w = mount(GlassSwitch, { props: { modelValue: false, disabled: true } });
    await w.trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('GlassSegmented', () => {
  const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }];

  it('is a radiogroup, marks the active option, and selects on click', async () => {
    const w = mount(GlassSegmented, { props: { modelValue: 'a', options } });
    expect(w.attributes('role')).toBe('radiogroup');
    const items = w.findAll('[role="radio"]');
    expect(items[0].attributes('aria-checked')).toBe('true');
    expect(items[0].attributes('tabindex')).toBe('0');
    expect(items[1].attributes('tabindex')).toBe('-1');
    await items[1].trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual(['b']);
  });

  it('moves selection with arrow keys (roving)', async () => {
    const w = mount(GlassSegmented, { props: { modelValue: 'a', options } });
    await w.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowRight' });
    expect(w.emitted('update:modelValue')![0]).toEqual(['b']);
    // wraps from first going left → last
    await w.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowLeft' });
    expect(w.emitted('update:modelValue')![1]).toEqual(['c']);
  });
});

describe('GlassCheckbox', () => {
  it('binds the boolean via the native input', async () => {
    const w = mount(GlassCheckbox, { props: { modelValue: false, label: 'Agree' } });
    await w.get('input').setValue(true);
    expect(w.emitted('update:modelValue')![0]).toEqual([true]);
  });
});

describe('GlassRadio', () => {
  it('checks only when value matches modelValue and emits its value', async () => {
    const w = mount(GlassRadio, { props: { modelValue: 'x', value: 'y', name: 'g' } });
    expect((w.get('input').element as HTMLInputElement).checked).toBe(false);
    await w.get('input').trigger('change');
    expect(w.emitted('update:modelValue')![0]).toEqual(['y']);
  });
});

describe('GlassTabs', () => {
  const tabs = [{ value: 't1', label: 'One' }, { value: 't2', label: 'Two' }];

  it('is a tablist, marks the selected tab, and arrow-navigates', async () => {
    const w = mount(GlassTabs, { props: { modelValue: 't1', tabs } });
    expect(w.attributes('role')).toBe('tablist');
    const items = w.findAll('[role="tab"]');
    expect(items[0].attributes('aria-selected')).toBe('true');
    await items[0].trigger('keydown', { key: 'ArrowRight' });
    expect(w.emitted('update:modelValue')![0]).toEqual(['t2']);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GlassSelect from '../src/components/GlassSelect.vue';

afterEach(() => vi.restoreAllMocks());

describe('GlassSelect keyboard regressions', () => {
  it('ignores selection when options are empty or removed while open', async () => {
    const errors = vi.fn();
    const w = mount(GlassSelect, {
      props: { modelValue: '', options: [] },
      global: { config: { errorHandler: errors } },
    });
    try {
      await w.get('button').trigger('keydown', { key: 'Enter' });
      await w.get('button').trigger('keydown', { key: 'ArrowDown' });
      await w.get('button').trigger('keydown', { key: 'Enter' });
      expect(errors).not.toHaveBeenCalled();
      expect(w.emitted('update:modelValue')).toBeUndefined();
      await w.setProps({ options: [{ value: 'a', label: 'A' }] });
      await w.setProps({ options: [] });
      await w.get('button').trigger('keydown', { key: 'Enter' });
      expect(errors).not.toHaveBeenCalled();
    } finally { w.unmount(); }
  });

  it('skips disabled options on opening and in both arrow directions', async () => {
    const w = mount(GlassSelect, { props: { modelValue: '', options: [
      { value: 'a', label: 'Unavailable', disabled: true },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'Unavailable too', disabled: true },
      { value: 'd', label: 'D' },
    ] } });
    try {
      await w.get('button').trigger('keydown', { key: 'Enter' });
      expect(w.get('.is-active').text()).toBe('B');
      await w.get('button').trigger('keydown', { key: 'ArrowDown' });
      expect(w.get('.is-active').text()).toBe('D');
      await w.get('button').trigger('keydown', { key: 'ArrowUp' });
      expect(w.get('.is-active').text()).toBe('B');
      await w.get('button').trigger('keydown', { key: 'ArrowUp' });
      expect(w.get('.is-active').text()).toBe('D');
      await w.get('button').trigger('keydown', { key: 'Enter' });
      expect(w.emitted('update:modelValue')).toEqual([['d']]);
    } finally { w.unmount(); }
  });

  it('keeps the keyboard-active option visible, including initial selection', async () => {
    const scrolled: Element[] = [];
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) { scrolled.push(this); });
    const w = mount(GlassSelect, { props: {
      modelValue: '15', options: Array.from({ length: 30 }, (_, i) => ({ value: String(i), label: `Option ${i}` })),
    } });
    try {
      await w.get('button').trigger('click');
      await nextTick();
      expect(scrolled.at(-1)?.textContent).toBe('Option 15');
      await w.get('button').trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(scrolled.at(-1)?.textContent).toBe('Option 16');
    } finally { w.unmount(); }
  });

  it('has no active option when every option is disabled', async () => {
    const w = mount(GlassSelect, { props: { modelValue: '', options: [{ value: 'a', label: 'A', disabled: true }] } });
    try {
      await w.get('button').trigger('click');
      await w.get('button').trigger('keydown', { key: 'ArrowDown' });
      await w.get('button').trigger('keydown', { key: 'Enter' });
      expect(w.find('.is-active').exists()).toBe(false);
      expect(w.emitted('update:modelValue')).toBeUndefined();
    } finally { w.unmount(); }
  });
});

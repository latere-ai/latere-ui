import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ConsolePalette from '../src/components/ConsolePalette.vue';

const model = { groups: [{ items: Array.from({ length: 30 }, (_, i) => ({ id: String(i), label: `Page ${i}`, to: `/page/${i}` })) }] };
afterEach(() => vi.restoreAllMocks());

describe('ConsolePalette keyboard regressions', () => {
  it('focuses on initial open, traps Tab and restores focus on close', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const w = mount(ConsolePalette, { props: { open: true, model }, attachTo: document.body });
    try {
      await nextTick();
      const input = document.querySelector<HTMLInputElement>('.lu-cp-input')!;
      expect(document.activeElement).toBe(input);
      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      input.dispatchEvent(tab);
      expect(tab.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(input);
      await w.setProps({ open: false });
      expect(document.activeElement).toBe(trigger);
    } finally { w.unmount(); trigger.remove(); }
  });

  it('scrolls keyboard selection into view', async () => {
    const scrolled: Element[] = [];
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) { scrolled.push(this); });
    const w = mount(ConsolePalette, { props: { open: true, model }, global: { stubs: { teleport: true } } });
    try {
      for (let i = 0; i < 20; i++) await w.get('input').trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(scrolled.at(-1)?.textContent).toContain('Page 20');
    } finally { w.unmount(); }
  });
});

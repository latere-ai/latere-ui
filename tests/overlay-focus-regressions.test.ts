import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GlassModal from '../src/components/GlassModal.vue';
import GlassDrawer from '../src/components/GlassDrawer.vue';

afterEach(() => vi.restoreAllMocks());

describe('modal focus ownership', () => {
  it('closes only the topmost dialog on Escape and restores the underlying dialog focus', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const lower = mount(GlassModal, { props: { open: true, title: 'Editor' }, slots: { default: '<button class="editor-action">Delete</button>' }, attachTo: document.body });
    await nextTick();
    const editorAction = document.querySelector<HTMLElement>('.editor-action')!;
    editorAction.focus();
    const upper = mount(GlassModal, { props: { open: true, title: 'Confirm', layer: 'confirm' }, slots: { default: '<button class="cancel-action">Cancel</button>' }, attachTo: document.body });
    try {
      await nextTick();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(upper.emitted('close')).toHaveLength(1);
      expect(lower.emitted('close')).toBeUndefined();
      await upper.setProps({ open: false });
      expect(document.activeElement).toBe(editorAction);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(lower.emitted('close')).toHaveLength(1);
      await lower.setProps({ open: false });
      expect(document.activeElement).toBe(trigger);
    } finally { upper.unmount(); lower.unmount(); trigger.remove(); }
  });

  it('recovers escaped focus into the topmost dialog on Tab', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const w = mount(GlassModal, { props: { open: true }, slots: { default: '<button class="first-action">First</button><button class="last-action">Last</button>' }, attachTo: document.body });
    try {
      await nextTick();
      outside.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(document.querySelector('.first-action'));
      outside.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(document.querySelector('.last-action'));
    } finally { w.unmount(); outside.remove(); }
  });

  it.each([GlassModal, GlassDrawer])('focuses a dialog with no interactive children', async (component) => {
    const w = mount(component, { props: { open: true, title: 'Notice' }, slots: { default: 'Read this notice' }, attachTo: document.body });
    try {
      await nextTick();
      expect(document.activeElement).toBe(document.querySelector('[role="dialog"]'));
    } finally { w.unmount(); }
  });
});

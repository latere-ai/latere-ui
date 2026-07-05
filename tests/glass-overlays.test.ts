import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import GlassModal from '../src/components/GlassModal.vue';
import GlassPopover from '../src/components/GlassPopover.vue';
import GlassToaster from '../src/components/GlassToaster.vue';
import { message, toasts, dismissToast } from '../src/glass/message';
import { confirm, currentConfirm, resolveConfirm } from '../src/glass/confirm';

describe('GlassModal', () => {
  it('renders only when open, teleported, on thick glass with dialog semantics', async () => {
    const w = mount(GlassModal, {
      props: { open: false, title: 'Delete?' },
      attachTo: document.body,
    });
    expect(document.querySelector('.lu-modal')).toBeNull();
    await w.setProps({ open: true });
    const panel = document.querySelector('.lu-modal')!;
    expect(panel).not.toBeNull();
    expect(panel.classList.contains('lu-glass-thick')).toBe(true);
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(panel.getAttribute('aria-labelledby')!)!.textContent).toBe('Delete?');
    w.unmount();
  });

  it('emits close+update:open when the scrim is clicked', async () => {
    const w = mount(GlassModal, { props: { open: true }, attachTo: document.body });
    await nextTick();
    (document.querySelector('.lu-modal-scrim') as HTMLElement).click();
    expect(w.emitted('update:open')![0]).toEqual([false]);
    expect(w.emitted('close')).toHaveLength(1);
    w.unmount();
  });

  it('does not close on scrim when closeOnScrim is false', async () => {
    const w = mount(GlassModal, { props: { open: true, closeOnScrim: false }, attachTo: document.body });
    await nextTick();
    (document.querySelector('.lu-modal-scrim') as HTMLElement).click();
    expect(w.emitted('update:open')).toBeUndefined();
    w.unmount();
  });
});

describe('GlassPopover', () => {
  it('toggles its panel and exposes trigger scope', async () => {
    const w = mount(GlassPopover, {
      slots: {
        trigger: '<button class="t">open</button>',
        default: '<div class="item">row</div>',
      },
    });
    expect(w.find('.lu-pop-panel').exists()).toBe(false);
    await w.get('.lu-pop-trigger').trigger('click');
    expect(w.find('.lu-pop-panel').exists()).toBe(true);
    expect(w.get('.lu-pop-panel').classes()).toContain('lu-glass-thick');
    expect(w.get('.lu-pop-panel').attributes('role')).toBe('menu');
  });
});

describe('message() service', () => {
  beforeEach(() => message.clear());

  it('pushes typed toasts and auto-dismisses after duration', () => {
    vi.useFakeTimers();
    message.success('Saved', { duration: 1000 });
    expect(toasts).toHaveLength(1);
    expect(toasts[0].tone).toBe('success');
    vi.advanceTimersByTime(1000);
    expect(toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('keeps sticky toasts (duration 0) until dismissed', () => {
    const close = message.error('Boom', { duration: 0 });
    expect(toasts).toHaveLength(1);
    close();
    expect(toasts).toHaveLength(0);
  });

  it('GlassToaster renders queued toasts with the right role', async () => {
    const w = mount(GlassToaster, { attachTo: document.body });
    message.error('Failed', { duration: 0 });
    await nextTick();
    const el = document.querySelector('.lu-toast')!;
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.textContent).toContain('Failed');
    dismissToast(toasts[0].id);
    w.unmount();
  });
});

describe('confirm() service', () => {
  it('resolves true on confirm and false on cancel, queueing concurrent calls', async () => {
    const p1 = confirm({ message: 'First?' });
    const p2 = confirm({ message: 'Second?' });
    expect(currentConfirm.current!.message).toBe('First?');

    resolveConfirm(true);
    await expect(p1).resolves.toBe(true);
    // queue advances to the second
    expect(currentConfirm.current!.message).toBe('Second?');

    resolveConfirm(false);
    await expect(p2).resolves.toBe(false);
    expect(currentConfirm.current).toBeNull();
  });
});

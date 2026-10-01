import { afterEach, describe, expect, it, vi } from 'vitest';
import { createExternalStore } from '../src/glass/externalStore';
import { message, dismissToast, toastStore, getServerToasts } from '../src/glass/messageCore';
import { confirm, resolveConfirm, confirmStore, getServerConfirm } from '../src/glass/confirmCore';
import { activateFocusTrap } from '../src/glass/focusTrap';

afterEach(() => {
  message.clear();
  while (confirmStore.getSnapshot().current) resolveConfirm(false);
  vi.useRealTimers();
});

describe('external snapshots', () => {
  it('keeps snapshots stable and unsubscribes listeners', () => {
    const initial = Object.freeze({ value: 1 });
    const store = createExternalStore<Readonly<{ value: number }>>(initial);
    const changed = vi.fn();
    const unsubscribe = store.subscribe(changed);
    store.publish(initial);
    expect(changed).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(initial);
    const next = Object.freeze({ value: 2 });
    store.publish(next);
    expect(changed).toHaveBeenCalledOnce();
    expect(store.getSnapshot()).toBe(next);
    unsubscribe();
    store.publish(initial);
    expect(changed).toHaveBeenCalledOnce();
  });
});

describe('framework-free message service', () => {
  it('preserves old immutable snapshots', () => {
    const old = toastStore.getSnapshot();
    const changed = vi.fn();
    const unsubscribe = toastStore.subscribe(changed);
    message('info', 'Information', { duration: 0 });
    const next = toastStore.getSnapshot();
    expect(old).toHaveLength(0);
    expect(next).toHaveLength(1);
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(next[0])).toBe(true);
    expect(next[0].text).toBe('Information');
    expect(getServerToasts()).toEqual([]);
    dismissToast(-1);
    expect(changed).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('handles all tones, default/custom timers, sticky closers and clear', () => {
    vi.useFakeTimers();
    message.info('Default');
    message.success('Timed', { duration: 1000 });
    message.warning('Warning', { duration: 0 });
    const close = message.error('Error', { duration: 0 });
    expect(toastStore.getSnapshot().map(t => t.tone)).toEqual(['info', 'success', 'warning', 'error']);
    vi.advanceTimersByTime(1000);
    expect(toastStore.getSnapshot().map(t => t.text)).toEqual(['Default', 'Warning', 'Error']);
    close(); close();
    vi.advanceTimersByTime(3000);
    expect(toastStore.getSnapshot().map(t => t.text)).toEqual(['Warning']);
    message.info('Another timer');
    expect(vi.getTimerCount()).toBe(1);
    message.clear();
    expect(vi.getTimerCount()).toBe(0);
    expect(toastStore.getSnapshot()).toHaveLength(0);
  });

  it('cancels a scheduled timer when dismissed manually', () => {
    vi.useFakeTimers();
    const close = message.success('Saved');
    expect(vi.getTimerCount()).toBe(1);
    close();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('framework-free confirm service', () => {
  it('queues requests, snapshots options and resolves each request once', async () => {
    const options = { message: 'First?', danger: true };
    const first = confirm(options);
    const firstSnapshot = confirmStore.getSnapshot();
    options.message = 'Changed caller object';
    const second = confirm({ message: 'Second?', title: 'Question' });
    expect(confirmStore.getSnapshot()).toBe(firstSnapshot);
    expect(firstSnapshot.current?.message).toBe('First?');
    expect(Object.isFrozen(firstSnapshot.current)).toBe(true);
    expect(firstSnapshot.current).not.toHaveProperty('resolve');
    resolveConfirm(true);
    await expect(first).resolves.toBe(true);
    expect(confirmStore.getSnapshot().current?.message).toBe('Second?');
    expect(firstSnapshot.current?.message).toBe('First?');
    resolveConfirm(false);
    resolveConfirm(true);
    await expect(second).resolves.toBe(false);
    expect(confirmStore.getSnapshot().current).toBeNull();
    expect(getServerConfirm()).toEqual({ current: null });
  });
});

describe('focus trap', () => {
  it('focuses initialFocus on open instead of the first focusable element', () => {
    const container = document.createElement('div');
    // The button is the first focusable in DOM order, but the input is the
    // requested initial focus.
    container.innerHTML = '<button class="first">x</button><input class="field">';
    document.body.append(container);
    const input = container.querySelector<HTMLInputElement>('input')!;
    const trap = activateFocusTrap(() => container, undefined, () => input);
    try {
      trap.focus();
      expect(document.activeElement).toBe(input);
    } finally { trap.dispose(); container.remove(); }
  });
});

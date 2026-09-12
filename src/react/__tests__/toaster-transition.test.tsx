import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { GlassToaster, message } from '../overlays';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(0), 16));
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
  vi.stubGlobal('getComputedStyle', () => ({ transitionDuration: '0.2s, 0.2s', transitionDelay: '0s, 0s' }));
});
afterEach(() => { cleanup(); message.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('animates added toasts and retains dismissed items through the shared CSS leave transition', () => {
  const view = render(<GlassToaster />);
  let dismiss!: () => void;
  act(() => { dismiss = message.success('Saved', { duration: 0 }); message.info('Other', { duration: 0 }); });
  const toast = view.getByText('Saved').parentElement!;
  expect(toast.classList.contains('lu-toast-enter-from')).toBe(true);
  act(() => vi.advanceTimersByTime(32));
  expect(toast.classList.contains('lu-toast-enter-to')).toBe(true);
  act(() => vi.advanceTimersByTime(201));
  expect(toast.className).toBe('lu-toast lu-glass-thick');
  act(() => dismiss());
  expect(view.getByText('Saved').parentElement).toBe(toast);
  expect(toast.classList.contains('lu-toast-leave-from')).toBe(true);
  expect(view.getByText('Other')).toBeTruthy();
  act(() => vi.advanceTimersByTime(233));
  expect(view.queryByText('Saved')).toBeNull();
  expect(view.getByText('Other')).toBeTruthy();
  act(() => message.clear());
  act(() => vi.advanceTimersByTime(233));
  expect(view.queryAllByRole('status')).toHaveLength(0);
});

it('renders existing messages immediately when the host mounts and cancels work on unmount', () => {
  message.info('Existing', { duration: 0 });
  const view = render(<GlassToaster />);
  expect(view.getByText('Existing').parentElement!.className).toBe('lu-toast lu-glass-thick');
  act(() => { message.success('New', { duration: 0 }); });
  expect(view.getByText('New').parentElement!.className).toContain('lu-toast-enter-from');
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('provides a native dismiss button and preserves sibling notification roles and click-anywhere dismissal', () => {
  message.info('Saved', { duration: 0 });
  message.error('Failed', { duration: 0 });
  const view = render(<GlassToaster />);
  const button = view.getByRole('status').querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]');
  expect(button).not.toBeNull();
  expect(button!.type).toBe('button');
  button!.focus();
  expect(document.activeElement).toBe(button);
  act(() => button!.click());
  act(() => vi.advanceTimersByTime(233));
  expect(view.queryByText('Saved')).toBeNull();
  expect(view.getByRole('alert').textContent).toContain('Failed');
  act(() => view.getByText('Failed').click());
  act(() => vi.advanceTimersByTime(233));
  expect(view.queryByRole('alert')).toBeNull();
});

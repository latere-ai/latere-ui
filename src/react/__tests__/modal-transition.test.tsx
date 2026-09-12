import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { GlassModal } from '../GlassModal';
import { useRef } from 'react';
import { useCssTransition } from '../useCssTransition';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(0), 16));
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
  vi.stubGlobal('getComputedStyle', () => ({ transitionDuration: '0.18s', transitionDelay: '0s' }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('enters with the Vue classes and retains the modal until its leave transition finishes', () => {
  const view = render(<GlassModal open={false}>Message</GlassModal>);
  view.rerender(<GlassModal open>Message</GlassModal>);
  const scrim = document.querySelector('.lu-modal-scrim')!;
  expect(scrim.classList.contains('lu-modal-enter-from')).toBe(true);
  expect(scrim.classList.contains('lu-modal-enter-active')).toBe(true);
  act(() => vi.advanceTimersByTime(32));
  expect(scrim.classList.contains('lu-modal-enter-from')).toBe(false);
  expect(scrim.classList.contains('lu-modal-enter-to')).toBe(true);
  act(() => vi.advanceTimersByTime(181));
  expect(scrim.className).toBe('lu-modal-scrim lu-modal-scrim--modal');
  view.rerender(<GlassModal open={false}>Message</GlassModal>);
  expect(document.querySelector('.lu-modal-scrim')).toBe(scrim);
  expect(scrim.classList.contains('lu-modal-leave-from')).toBe(true);
  act(() => vi.advanceTimersByTime(32));
  expect(scrim.classList.contains('lu-modal-leave-to')).toBe(true);
  act(() => vi.advanceTimersByTime(181));
  expect(document.querySelector('.lu-modal-scrim')).toBeNull();
});

it('cancels an interrupted leave when reopened and cleans up on unmount', () => {
  const view = render(<GlassModal open>Message</GlassModal>);
  view.rerender(<GlassModal open={false}>Message</GlassModal>);
  act(() => vi.advanceTimersByTime(32));
  view.rerender(<GlassModal open>Message</GlassModal>);
  const scrim = document.querySelector('.lu-modal-scrim')!;
  expect(scrim.classList.contains('lu-modal-leave-to')).toBe(false);
  expect(scrim.classList.contains('lu-modal-enter-from')).toBe(true);
  act(() => vi.advanceTimersByTime(213));
  expect(document.querySelector('.lu-modal-scrim')).toBe(scrim);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('finishes without animation when computed transition duration is zero', () => {
  vi.stubGlobal('getComputedStyle', () => ({ transitionDuration: '0s', transitionDelay: '0s' }));
  const view = render(<GlassModal open>Message</GlassModal>);
  view.rerender(<GlassModal open={false}>Message</GlassModal>);
  act(() => vi.advanceTimersByTime(32));
  expect(document.querySelector('.lu-modal-scrim')).toBeNull();
});

it('finishes on the root transition event, ignoring bubbled child transitions', () => {
  const view = render(<GlassModal open>Message</GlassModal>);
  expect(document.querySelector('.lu-modal-scrim')!.className).toBe('lu-modal-scrim lu-modal-scrim--modal');
  view.rerender(<GlassModal open={false}>Message</GlassModal>);
  act(() => vi.advanceTimersByTime(32));
  const scrim = document.querySelector('.lu-modal-scrim')!;
  act(() => { scrim.firstElementChild!.dispatchEvent(new Event('transitionend', { bubbles: true })); });
  expect(document.querySelector('.lu-modal-scrim')).toBe(scrim);
  act(() => { scrim.dispatchEvent(new Event('transitionend')); });
  expect(document.querySelector('.lu-modal-scrim')).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});


it('supports millisecond duration and delay values', () => {
  vi.stubGlobal('getComputedStyle', () => ({ transitionDuration: '100ms', transitionDelay: '25ms' }));
  const view = render(<GlassModal open>Message</GlassModal>);
  view.rerender(<GlassModal open={false}>Message</GlassModal>);
  act(() => vi.advanceTimersByTime(157));
  expect(document.querySelector('.lu-modal-scrim')).not.toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(document.querySelector('.lu-modal-scrim')).toBeNull();
});

it('does not schedule work when a transition target is absent', () => {
  function MissingTarget({ open }: { open: boolean }) {
    useCssTransition(open, 'missing', useRef<HTMLElement>(null));
    return null;
  }
  const view = render(<MissingTarget open={false} />);
  view.rerender(<MissingTarget open />);
  expect(vi.getTimerCount()).toBe(0);
});

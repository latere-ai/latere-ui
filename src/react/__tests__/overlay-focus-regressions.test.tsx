import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { GlassModal } from '../GlassModal';
import { GlassDrawer } from '../GlassDrawer';

afterEach(cleanup);

it('only the topmost modal handles Escape and focus returns to its parent, then to the opener', () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const lowerClose = vi.fn();
  const upperClose = vi.fn();
  const lower = render(<GlassModal open onClose={lowerClose}><button>Editor action</button></GlassModal>);
  const editor = lower.getByRole('button', { name: 'Editor action' });
  editor.focus();
  const upper = render(<GlassModal open layer="confirm" onClose={upperClose}><button>Cancel</button></GlassModal>);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(upperClose).toHaveBeenCalledOnce();
  expect(lowerClose).not.toHaveBeenCalled();
  upper.unmount();
  expect(document.activeElement).toBe(editor);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(lowerClose).toHaveBeenCalledOnce();
  lower.unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});

it('leaves Escape to an open control inside the dialog that owns it', () => {
  const close = vi.fn();
  const view = render(<GlassModal open title="Editor" onClose={close}><div data-lu-owns-escape><input className="inner" /></div><button className="plain">Save</button></GlassModal>);
  const owned = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  document.querySelector('.inner')!.dispatchEvent(owned);
  expect(owned.defaultPrevented).toBe(false);
  expect(close).not.toHaveBeenCalled();
  document.querySelector('.plain')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  expect(close).toHaveBeenCalledOnce();
  view.unmount();
});

it('recovers escaped focus into the topmost dialog on Tab', () => {
  const outside = document.createElement('button');
  document.body.append(outside);
  const view = render(<GlassModal open><button className="first-action">First</button><button className="last-action">Last</button></GlassModal>);
  outside.focus();
  const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(document.querySelector('.first-action'));
  outside.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
  expect(document.activeElement).toBe(document.querySelector('.last-action'));
  view.unmount();
  outside.remove();
});

it.each([
  ['modal', () => <GlassModal open title="Notice">Read this notice</GlassModal>],
  ['drawer', () => <GlassDrawer open title="Notice">Read this notice</GlassDrawer>],
] as const)('focuses a %s with no interactive children', (_, element) => {
  const view = render(element());
  expect(document.activeElement).toBe(document.querySelector('[role="dialog"]'));
  view.unmount();
});

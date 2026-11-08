import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { GlassPopover } from '../GlassPopover';

afterEach(cleanup);

it('popover restores its opener after Escape inside the panel, without stealing outside-click focus', () => {
  const view = render(<><GlassPopover trigger={<button>Open</button>}><button>Action</button></GlassPopover><button>Outside</button></>);
  const opener = view.getByText('Open');
  fireEvent.click(opener);
  view.getByText('Action').focus();
  fireEvent.keyDown(view.getByText('Action'), { key: 'Escape' });
  expect(view.queryByText('Action')).toBeNull();
  expect(document.activeElement).toBe(opener);
  fireEvent.click(opener);
  view.getByText('Action').focus();
  const restored = vi.spyOn(opener, 'focus');
  fireEvent.mouseDown(view.getByText('Outside'));
  expect(restored).not.toHaveBeenCalled();
  expect(view.queryByText('Action')).toBeNull();
  view.getByText('Outside').focus();
  expect(document.activeElement).toBe(view.getByText('Outside'));
});

function panelWithTwoFields() {
  return render(
    <>
      <button>Before</button>
      <GlassPopover trigger={<button>Filters</button>}>
        <input aria-label="From" />
        <input aria-label="To" />
      </GlassPopover>
    </>,
  );
}

it('popover moves back within the panel on Shift+Tab without closing', () => {
  const view = panelWithTwoFields();
  fireEvent.click(view.getByText('Filters'));
  const to = view.getByLabelText('To');
  to.focus();
  // The browser moves focus to "From"; the panel must still be open for it.
  const notPrevented = fireEvent.keyDown(to, { key: 'Tab', shiftKey: true });
  expect(notPrevented).toBe(true);
  expect(view.queryByLabelText('From')).not.toBeNull();
});

it('popover leaves focus on the trigger, not before it, when Shift+Tab leaves the panel', () => {
  const view = panelWithTwoFields();
  const trigger = view.getByText('Filters');
  fireEvent.click(trigger);
  const from = view.getByLabelText('From');
  from.focus();
  // Left to the browser, the key would move focus on from the trigger to "Before".
  const notPrevented = fireEvent.keyDown(from, { key: 'Tab', shiftKey: true });
  expect(notPrevented).toBe(false);
  expect(view.queryByLabelText('From')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

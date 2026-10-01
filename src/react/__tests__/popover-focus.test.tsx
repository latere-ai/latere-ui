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

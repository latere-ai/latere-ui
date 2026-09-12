import { expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { GlassModal } from '../GlassModal';

it('only the topmost React modal handles Escape and focus returns to its parent', () => {
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
});

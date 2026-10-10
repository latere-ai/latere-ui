import { describe, expect, it } from 'vitest';
import { anchoredPlacement } from '../src/glass/anchoredPlacement';
import { SELECT_MENU_GAP, SELECT_MENU_VIEWPORT_GUTTER } from '../src/glass/selectSearch';

// A 1000 x 800 viewport; a 32px control 200px wide.
const viewport = { width: 1000, height: 800 };
const control = (top: number, left = 100, width = 200) => ({ top, bottom: top + 32, left, right: left + width });
const menu = { width: 240, height: 200 };

describe('anchoredPlacement', () => {
  it('opens under the control, its left edge on the control, where the panel fits', () => {
    expect(anchoredPlacement(control(100), menu, viewport, { gap: 4, gutter: 16 }))
      .toEqual({ top: 136, left: 100, side: 'bottom', maxHeight: 800 - 16 - 136 });
  });

  it('flips above the control when only that side has the room', () => {
    // Under a control at 600 there are 148px; above it 580.
    const spot = anchoredPlacement(control(600), menu, viewport, { gap: 4, gutter: 16 });
    expect(spot).toEqual({ top: 600 - 4 - 200, left: 100, side: 'top', maxHeight: 580 });
  });

  it('flips back under the control when the preferred top has no room', () => {
    const spot = anchoredPlacement(control(60), menu, viewport, { side: 'top', gap: 6, gutter: 8 });
    expect(spot.side).toBe('bottom');
    expect(spot.top).toBe(98);
  });

  it('keeps the preferred side when it fits, even with more room on the other', () => {
    expect(anchoredPlacement(control(500), menu, viewport, { side: 'top', gap: 6, gutter: 8 }).side).toBe('top');
    expect(anchoredPlacement(control(500), menu, viewport, { gap: 4, gutter: 16 }).side).toBe('bottom');
  });

  it('takes the roomier side and shrinks to its room when neither side fits', () => {
    const tall = { width: 240, height: 700 };
    const low = anchoredPlacement(control(500), tall, viewport, { gap: 4, gutter: 16 });
    expect(low).toEqual({ top: 500 - 4 - 480, left: 100, side: 'top', maxHeight: 480 });
    const high = anchoredPlacement(control(200), tall, viewport, { gap: 4, gutter: 16 });
    expect(high).toEqual({ top: 236, left: 100, side: 'bottom', maxHeight: 800 - 16 - 236 });
  });

  it('never reports negative room for a control at the viewport edge', () => {
    const spot = anchoredPlacement({ top: 790, bottom: 822, left: 100, right: 300 }, menu, viewport, { gap: 4, gutter: 16 });
    expect(spot.side).toBe('top');
    expect(anchoredPlacement({ top: 10, bottom: 42, left: 100, right: 300 }, menu, { width: 1000, height: 20 }, { gap: 4, gutter: 16 }).maxHeight).toBe(0);
  });

  it('lines up right edges for an end-aligned panel', () => {
    expect(anchoredPlacement(control(100, 500), menu, viewport, { align: 'end' }).left).toBe(700 - 240);
  });

  it('moves a panel left so its right edge keeps the gutter', () => {
    expect(SELECT_MENU_VIEWPORT_GUTTER).toBe(16);
    expect(SELECT_MENU_GAP).toBe(4);
    const options = { gap: SELECT_MENU_GAP, gutter: SELECT_MENU_VIEWPORT_GUTTER };
    expect(anchoredPlacement(control(100, 684), { width: 300, height: 100 }, viewport, options).left).toBe(684);
    expect(anchoredPlacement(control(100, 800), { width: 300, height: 100 }, viewport, options).left).toBe(684);
  });

  it('never moves the left edge past the gutter, or past a control that starts inside it', () => {
    const wide = { width: 990, height: 100 };
    const options = { gutter: SELECT_MENU_VIEWPORT_GUTTER };
    expect(anchoredPlacement(control(100, 40), wide, viewport, options).left).toBe(16);
    expect(anchoredPlacement(control(100, 10), wide, viewport, options).left).toBe(10);
    expect(anchoredPlacement(control(100, -30), wide, viewport, options).left).toBe(0);
    expect(anchoredPlacement(control(100, 900, 60), wide, viewport, { ...options, align: 'end' }).left).toBe(16);
  });

  it('uses a 4px gap and an 8px gutter when none is given', () => {
    expect(anchoredPlacement(control(100), menu, viewport)).toEqual({ top: 136, left: 100, side: 'bottom', maxHeight: 800 - 8 - 136 });
  });
});

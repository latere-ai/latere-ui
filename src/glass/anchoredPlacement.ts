// Where a floating panel (a select's menu, a popover) lands against the
// control that opened it, in viewport coordinates for a `position: fixed`
// panel. Kept apart from the components so the geometry is tested alone.

/** The sides of the control a panel can open on. */
export type AnchoredSide = 'bottom' | 'top';
/** Which edge of the panel lines up with the same edge of the control. */
export type AnchoredAlign = 'start' | 'end';

/** The part of a DOMRect the placement reads. */
export interface AnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AnchoredPlacementOptions {
  /** The side to open on when the panel fits there. Default `bottom`. */
  side?: AnchoredSide;
  /** `start` lines up the left edges, `end` the right edges. Default `start`. */
  align?: AnchoredAlign;
  /** Space between the control and the panel, in CSS pixels. */
  gap?: number;
  /** Space the panel keeps from every edge of the viewport, in CSS pixels. */
  gutter?: number;
}

export interface AnchoredPlacement {
  /** Viewport coordinates of the panel's top-left corner. */
  top: number;
  left: number;
  /** The side the panel opened on: the preferred one, or the other after a flip. */
  side: AnchoredSide;
  /** The room on that side, which the panel's height must not exceed. */
  maxHeight: number;
}

/**
 * Place a panel of `size` against `anchor` inside a viewport of `viewport`.
 *
 * The panel opens on the preferred side when its whole height fits there.
 * Otherwise it opens on the other side when it fits there or that side has
 * more room, and on the side it takes it is never taller than the room, so
 * it scrolls rather than leaving the viewport. Horizontally it lines up with
 * the control, then moves left to keep its right edge `gutter` pixels inside
 * the viewport, but never left of the gutter, or of the control where the
 * control itself starts inside the gutter.
 */
export function anchoredPlacement(
  anchor: AnchorRect,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  { side = 'bottom', align = 'start', gap = 4, gutter = 8 }: AnchoredPlacementOptions = {},
): AnchoredPlacement {
  const below = viewport.height - gutter - (anchor.bottom + gap);
  const above = anchor.top - gap - gutter;
  const preferred = side === 'bottom' ? below : above;
  const other = side === 'bottom' ? above : below;
  const flip = size.height > preferred && (size.height <= other || other > preferred);
  const chosen: AnchoredSide = flip ? (side === 'bottom' ? 'top' : 'bottom') : side;
  const room = Math.max(0, chosen === 'bottom' ? below : above);
  const height = Math.min(size.height, room);
  const top = chosen === 'bottom' ? anchor.bottom + gap : anchor.top - gap - height;
  const start = align === 'start' ? anchor.left : anchor.right - size.width;
  const floor = Math.min(gutter, Math.max(0, anchor.left));
  const left = Math.max(floor, Math.min(start, viewport.width - gutter - size.width));
  return { top, left, side: chosen, maxHeight: room };
}

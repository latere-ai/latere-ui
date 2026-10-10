// A floating panel shown in the browser's top layer and placed against the
// control that opened it, for GlassSelect's menu and GlassPopover's panel.
//
// The top layer draws the panel over the whole page, so neither a dialog
// that scrolls its body nor a glass ancestor (whose backdrop-filter would
// otherwise become the containing block of a fixed panel) can clip it. The
// panel stays where the component renders it in the DOM, so outside-press
// checks, focus-out checks, a dialog's focus trap and descendant selectors in
// host stylesheets see it inside its component as before. An engine without
// the Popover API ignores the `popover` attribute and draws the same fixed
// panel in place, over the page wherever no ancestor clips or transforms it.
//
// The panel opens on its preferred side, flips to the other when only that
// one has the room, shrinks to the room it has (the host's CSS reads it as
// `--lu-layer-max-height`) and moves sideways to stay inside the viewport.
// It follows its control as the page, a dialog or any other scroller moves
// it, and closes through `onHidden` once the control has scrolled out of
// sight.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { anchoredPlacement, type AnchoredAlign, type AnchoredSide } from '../glass/anchoredPlacement';

export interface AnchoredLayerOptions {
  open: boolean;
  /** The control the panel opens from. Its width is set on the panel as `--lu-anchor-width`. */
  anchor: RefObject<HTMLElement | null>;
  /** The panel, rendered with `popover="manual"` and `data-lu-layer` while open. */
  panel: RefObject<HTMLElement | null>;
  side?: AnchoredSide;
  align?: AnchoredAlign;
  /** Space between the control and the panel, in CSS pixels. */
  gap: number;
  /** Space kept from every edge of the viewport, in CSS pixels. */
  gutter: number;
  /** Called when the control scrolls out of sight while the panel is open. */
  onHidden?: () => void;
}

/** A max-height no panel reaches, set while the panel's natural height is measured. */
const UNBOUNDED = 100000;

/** The viewport the fixed panel is placed in, without scrollbars. */
function viewportSize(): { width: number; height: number } {
  const root = document.documentElement;
  return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight };
}

/** Show the panel in the top layer where the browser has one. */
function raise(panel: HTMLElement): void {
  if (typeof panel.showPopover !== 'function' || !panel.hasAttribute('popover')) return;
  try {
    if (!panel.matches(':popover-open')) panel.showPopover();
  } catch {
    // A popover the browser refuses to show stays display:none; without the
    // attribute it is drawn in place instead of not at all.
    panel.removeAttribute('popover');
  }
}

/** Whether a computed overflow value clips; an engine without layout reports none. */
const clips = (overflow: string) => overflow !== '' && overflow !== 'visible';

/**
 * Whether some of the control can still be seen: inside the viewport and
 * inside every ancestor that clips its overflow, such as a dialog's
 * scrolling body. A control without a box of its own (display: contents)
 * cannot be judged, so it counts as visible.
 */
export function anchorInView(anchor: HTMLElement): boolean {
  const rect = anchor.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return true;
  let { top, bottom, left, right } = rect;
  for (let el = anchor.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (!clips(overflowX) && !clips(overflowY)) continue;
    const clip = el.getBoundingClientRect();
    top = Math.max(top, clip.top);
    bottom = Math.min(bottom, clip.bottom);
    left = Math.max(left, clip.left);
    right = Math.min(right, clip.right);
  }
  const view = viewportSize();
  return Math.min(bottom, view.height) > Math.max(top, 0) && Math.min(right, view.width) > Math.max(left, 0);
}

/**
 * Scroll `scroller` just enough to show `item` whole. Unlike
 * scrollIntoView, it moves nothing outside the list: a panel in the top
 * layer still has the dialog around it as a DOM ancestor, and that must not
 * scroll as the arrow keys move through the options.
 */
export function scrollIntoList(scroller: HTMLElement | null, item: Element | null | undefined): void {
  if (!scroller || !item) return;
  const box = scroller.getBoundingClientRect();
  const row = item.getBoundingClientRect();
  const top = box.top + scroller.clientTop;
  const bottom = top + scroller.clientHeight;
  if (row.top < top) scroller.scrollTop -= top - row.top;
  else if (row.bottom > bottom) scroller.scrollTop += row.bottom - bottom;
}

/**
 * Place the open panel against its control and keep it there. `deps` are
 * the caller's values that change the panel's size, such as a filtered
 * option list; the panel is placed again when any of them changes. Returns
 * the side the panel opened on.
 */
export function useAnchoredLayer(
  { open, anchor, panel, side = 'bottom', align = 'start', gap, gutter, onHidden }: AnchoredLayerOptions,
  deps: readonly unknown[] = [],
): AnchoredSide {
  const [placed, setPlaced] = useState<AnchoredSide>(side);
  const hidden = useRef(onHidden);
  hidden.current = onHidden;

  const place = useCallback(() => {
    const el = panel.current;
    const at = anchor.current;
    if (!el || !at) return;
    const rect = at.getBoundingClientRect();
    // A control with no box has no position to place against, as in a page
    // without layout or under display: contents: keep the preferred side.
    if (rect.width === 0 && rect.height === 0) {
      setPlaced(side);
      return;
    }
    el.style.setProperty('--lu-anchor-width', `${rect.width}px`);
    // Measure the panel at its natural height, then hold it to the room. The
    // stand-in is set rather than the property removed, so a panel nested in
    // another never measures against the outer one's room.
    el.style.setProperty('--lu-layer-max-height', `${UNBOUNDED}px`);
    const box = el.getBoundingClientRect();
    const spot = anchoredPlacement(rect, box, viewportSize(), { side, align, gap, gutter });
    el.style.top = `${spot.top}px`;
    el.style.left = `${spot.left}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.setProperty('--lu-layer-max-height', `${spot.maxHeight}px`);
    el.toggleAttribute('data-lu-scroll', box.height > spot.maxHeight);
    setPlaced(spot.side);
  }, [anchor, panel, side, align, gap, gutter]);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    // A [popover] is display:none until shown, so it is raised before it is measured.
    raise(el);
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` are the caller's size inputs.
  }, [open, place, ...deps]);

  useEffect(() => {
    if (!open) return undefined;
    let frame = 0;
    // Scrolling anywhere but inside the panel moves the control: follow it,
    // or close once it is out of sight.
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      const at = anchor.current;
      if (at && !anchorInView(at)) hidden.current?.();
      else place();
    };
    // A size change is placed on the next frame, so writing the panel's
    // height never re-enters the observer that reported it.
    const later = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };
    // A dialog or a drawer that moves its control with a transform, as it
    // does while it opens, reports neither a scroll nor a resize: place the
    // panel again once that motion ends.
    const onSettled = (event: Event) => {
      const at = anchor.current;
      if (at && event.target instanceof Node && event.target.contains(at)) place();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    document.addEventListener('transitionend', onSettled, true);
    document.addEventListener('animationend', onSettled, true);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(later) : undefined;
    if (panel.current) observer?.observe(panel.current);
    if (anchor.current) observer?.observe(anchor.current);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('transitionend', onSettled, true);
      document.removeEventListener('animationend', onSettled, true);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open, place, anchor, panel]);

  return open ? placed : side;
}

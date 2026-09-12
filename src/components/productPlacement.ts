export interface ProductPlacement { side: 'bottom' | 'top'; align: 'start' | 'end'; shiftX: number; shiftY: number; }

/** Prefer below/start, flip when it fits, then clamp to the viewport. */
export function productPlacement(anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>, panel: Pick<DOMRect, 'width' | 'height'>, viewport: { width: number; height: number }): ProductPlacement {
  const margin = 8;
  const align = anchor.left + panel.width > viewport.width - margin && anchor.right - panel.width >= margin ? 'end' : 'start';
  const side = anchor.bottom + margin + panel.height > viewport.height - margin && anchor.top - margin - panel.height >= margin ? 'top' : 'bottom';
  const left = align === 'end' ? anchor.right - panel.width : anchor.left;
  const top = side === 'top' ? anchor.top - margin - panel.height : anchor.bottom + margin;
  return { side, align,
    shiftX: Math.max(margin, Math.min(left, viewport.width - margin - panel.width)) - left,
    shiftY: Math.max(margin, Math.min(top, viewport.height - margin - panel.height)) - top,
  };
}

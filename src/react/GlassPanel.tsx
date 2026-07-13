// React adapter of GlassPanel.vue — a content card: a regular-tier glass
// surface with comfortable padding.
import type { ReactNode } from 'react';
import '../styles/components/glass-panel.css';
import { GlassSurface, type GlassTier } from './GlassSurface';
import { cx } from './internal';

export interface GlassPanelProps {
  /** Override the tier if a panel needs a thinner/thicker material. */
  tier?: GlassTier;
  /** Drop the default padding (for panels that own their own layout). */
  flush?: boolean;
  children?: ReactNode;
}

export function GlassPanel({ tier = 'regular', flush = false, children }: GlassPanelProps) {
  return (
    <GlassSurface tier={tier} className={cx('lu-panel', flush && 'lu-panel-flush')}>
      {children}
    </GlassSurface>
  );
}

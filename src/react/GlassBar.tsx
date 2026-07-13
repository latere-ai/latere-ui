// React adapter of GlassBar.vue — a horizontal chrome bar (top strip, toolbar,
// section header) on regular-tier glass, safe to lay over scrolling content.
import type { ReactNode } from 'react';
import '../styles/components/glass-bar.css';
import { GlassSurface } from './GlassSurface';
import { cx } from './internal';

export interface GlassBarProps {
  /** Render as a <header> instead of a <div>. */
  header?: boolean;
  /** position: sticky; top: 0 — pins the bar while content scrolls under it. */
  sticky?: boolean;
  children?: ReactNode;
}

export function GlassBar({ header = false, sticky = false, children }: GlassBarProps) {
  return (
    <GlassSurface
      as={header ? 'header' : 'div'}
      tier="regular"
      className={cx('lu-bar', sticky && 'lu-bar-sticky')}
    >
      {children}
    </GlassSurface>
  );
}

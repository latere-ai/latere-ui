// React adapter of GlassBadge.vue — a small status pill. `tone` maps to the
// product's --state-* tokens; thin glass by default, `solid` fills it.
import type { CSSProperties, ReactNode } from 'react';
import '../styles/components/glass-badge.css';
import { cx } from './internal';

export type GlassBadgeTone = 'neutral' | 'running' | 'idle' | 'stopped' | 'error' | 'creating';

const TONE_VAR: Record<string, string> = {
  neutral: 'var(--text-muted, #a0a0a0)',
  running: 'var(--state-running, #4a7558)',
  idle: 'var(--state-idle, #b48a4a)',
  stopped: 'var(--state-stopped, #92948c)',
  error: 'var(--state-error, #a8412e)',
  creating: 'var(--state-creating, #8fb894)',
};

export interface GlassBadgeProps {
  tone?: GlassBadgeTone;
  /** Filled pill instead of glass — for high-emphasis status. */
  solid?: boolean;
  /** Show a leading status dot. */
  dot?: boolean;
  children?: ReactNode;
}

export function GlassBadge({ tone = 'neutral', solid = false, dot = false, children }: GlassBadgeProps) {
  const color = TONE_VAR[tone] ?? TONE_VAR.neutral;
  return (
    <span
      className={cx('lu-badge', !solid && 'lu-glass-ultrathin', solid && 'is-solid')}
      style={{ '--tone': color } as CSSProperties}
    >
      {dot && <span className="lu-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

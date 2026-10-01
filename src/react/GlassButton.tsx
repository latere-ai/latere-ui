// GlassButton: an action control in the one control shape, a capsule. The
// default variant is the secondary action, a hairline outline; `primary` is
// the ink fill, `ghost` a bare label, `danger` the confirming destructive
// fill and `danger-ghost` a destructive bare label. Flat: no glass material,
// blur or shadow (glass-button.css).
import type { MouseEvent, ReactNode } from 'react';
import '../styles/components/glass-button.css';
import { cx } from './internal';

export interface GlassButtonProps {
  /** `glass` (the default) is the secondary action, a hairline outline;
   *  `primary` the ink fill; `ghost` a bare label. */
  variant?: 'glass' | 'primary' | 'ghost' | 'danger' | 'danger-ghost';
  size?: 'sm' | 'md';
  /** Show a spinner and block interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Native button type; defaults to "button" so it never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
  /** Leading icon, set before the label. */
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

export function GlassButton({
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  icon,
  children,
  onClick,
}: GlassButtonProps) {
  function handleClick(ev: MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) return;
    onClick?.(ev);
  }

  return (
    <button
      type={type}
      className={cx('lu-btn', `lu-btn-${variant}`, `lu-btn-${size}`, loading && 'is-loading')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading && <span className="lu-btn-spin" aria-hidden="true" />}
      {icon}
      <span className="lu-btn-label">{children}</span>
    </button>
  );
}

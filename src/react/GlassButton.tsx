// React adapter of GlassButton.vue — a glass action control. Capsule-shaped;
// the default variant is thin glass, `primary` is smoked ink glass, `danger`
// destructive. Requires `import 'latere-ui/glass'`.
import type { MouseEvent, ReactNode } from 'react';
import '../styles/components/glass-button.css';
import { cx } from './internal';

export interface GlassButtonProps {
  variant?: 'glass' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  /** Show a spinner and block interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Native button type; defaults to "button" so it never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
  /** Leading icon — the `icon` slot of the Vue component. */
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
  // Only the default variant paints itself as glass; primary/ghost/danger own
  // their fill so they read as distinct affordances against a glass panel.
  const glassy = variant === 'glass';

  function handleClick(ev: MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) return;
    onClick?.(ev);
  }

  return (
    <button
      type={type}
      className={cx('lu-btn', `lu-btn-${variant}`, `lu-btn-${size}`, glassy && 'lu-glass-thin', loading && 'is-loading')}
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

import type { MouseEvent, ReactNode } from 'react';
import '../styles/components/glass-icon-button.css';
import { cx } from './internal';

export interface GlassIconButtonProps {
  /** Accessible name for the icon-only action. */
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  pressed?: boolean;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function GlassIconButton({ label, size = 'md', disabled = false, pressed = false,
  children, onClick }: GlassIconButtonProps) {
  return <button type="button"
    className={cx('lu-iconbtn lu-glass-ultrathin', `lu-iconbtn-${size}`, pressed && 'is-pressed')}
    aria-label={label} aria-pressed={pressed || undefined} disabled={disabled} onClick={onClick}>
    {children}
  </button>;
}

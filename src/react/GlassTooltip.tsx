import type { ReactNode } from 'react';
import '../styles/components/glass-tooltip.css';

export interface GlassTooltipProps {
  text: string;
  placement?: 'top' | 'bottom';
  children?: ReactNode;
}

export function GlassTooltip({ text, placement = 'top', children }: GlassTooltipProps) {
  return <span className="lu-tip-wrap">{children}<span className={`lu-tip lu-glass-smoke lu-tip--${placement}`} role="tooltip">{text}</span></span>;
}

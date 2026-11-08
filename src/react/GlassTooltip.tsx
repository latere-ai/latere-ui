import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';
import '../styles/components/glass-tooltip.css';

export interface GlassTooltipProps {
  text: string;
  placement?: 'top' | 'bottom';
  /**
   * The control the tooltip describes. A single element receives
   * `aria-describedby`; any other content is shown as is and is not linked.
   */
  children?: ReactNode;
}

export function GlassTooltip({ text, placement = 'top', children }: GlassTooltipProps) {
  const id = useId();
  // Escape hides the tip while the pointer or focus stays on the control
  // (WCAG 1.4.13); leaving the control shows it again on the next visit.
  const [dismissed, setDismissed] = useState(false);
  const control = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
    })
    : children;
  return <span
    className="lu-tip-wrap"
    data-dismissed={dismissed || undefined}
    onKeyDown={event => { if (event.key === 'Escape') setDismissed(true); }}
    onMouseLeave={() => setDismissed(false)}
    onBlur={() => setDismissed(false)}
  >{control}<span id={id} className={`lu-tip lu-glass-smoke lu-tip--${placement}`} role="tooltip">{text}</span></span>;
}

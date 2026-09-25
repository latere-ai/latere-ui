// React adapter of GlassAlert.vue: an inline notice with a leading tone icon,
// the title and the body on one left edge, a hairline frame with a faint wash
// of the tone, and an optional dismiss. Requires `import 'latere-ui/glass'`.
import type { CSSProperties, ReactNode } from 'react';
import '../styles/components/glass-alert.css';
import { ALERT_TONE_ICON, ALERT_TONE_VAR, alertRole, alertTone, type GlassAlertTone } from '../components/glassAlert';
import { ConsoleIcon } from './ConsoleIcon';

export type { GlassAlertTone };

export interface GlassAlertProps {
  tone?: GlassAlertTone;
  title?: string;
  /** Show a close button; calls `onDismiss`. */
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: ReactNode;
}

export function GlassAlert({
  tone: toneProp = 'info',
  title,
  dismissible = false,
  onDismiss,
  children,
}: GlassAlertProps) {
  const tone = alertTone(toneProp);
  return (
    <div className="lu-alert lu-glass" role={alertRole(tone)} data-tone={tone} style={{ '--tone': ALERT_TONE_VAR[tone] } as CSSProperties}>
      <span className="lu-alert-icon" aria-hidden="true"><ConsoleIcon name={ALERT_TONE_ICON[tone]} size={16} /></span>
      <div className="lu-alert-body">
        {title && <p className="lu-alert-title">{title}</p>}
        <div className="lu-alert-text">{children}</div>
      </div>
      {dismissible && (
        <button type="button" className="lu-alert-close" aria-label="Dismiss" onClick={() => onDismiss?.()}>
          ×
        </button>
      )}
    </div>
  );
}

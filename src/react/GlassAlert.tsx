// React adapter of GlassAlert.vue — an inline notice banner on a regular-glass
// surface, with a tone accent bar and optional dismiss.
// Requires `import 'latere-ui/glass'`.
import type { CSSProperties, ReactNode } from 'react';
import '../styles/components/glass-alert.css';

export type GlassAlertTone = 'info' | 'success' | 'warning' | 'error';

const TONE_VAR: Record<string, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};

export interface GlassAlertProps {
  tone?: GlassAlertTone;
  title?: string;
  /** Show a close button; calls `onDismiss`. */
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: ReactNode;
}

export function GlassAlert({
  tone = 'info',
  title,
  dismissible = false,
  onDismiss,
  children,
}: GlassAlertProps) {
  const accent = TONE_VAR[tone] ?? TONE_VAR.info;
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div className="lu-alert lu-glass" role={role} style={{ '--tone': accent } as CSSProperties}>
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

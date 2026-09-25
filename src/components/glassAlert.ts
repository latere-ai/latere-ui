// The GlassAlert anatomy both adapters share: the tone's color token, the
// icon that leads the notice, and the live-region role. Kept in a .ts module
// so the Vue and React adapters render the same notice from one table.

import type { ConsoleIconName } from '../console/icons';

export type GlassAlertTone = 'info' | 'success' | 'warning' | 'error';

/** The color each tone draws its icon, hairline and tint in. */
export const ALERT_TONE_VAR: Record<GlassAlertTone, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};

/** The mark that leads each tone, so a notice never rests on color alone. */
export const ALERT_TONE_ICON: Record<GlassAlertTone, ConsoleIconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
};

/** A tone outside the set reads as info. */
export function alertTone(tone: string | undefined): GlassAlertTone {
  return tone && Object.prototype.hasOwnProperty.call(ALERT_TONE_VAR, tone) ? (tone as GlassAlertTone) : 'info';
}

/** An error interrupts assistive technology; every other tone is polite. */
export function alertRole(tone: GlassAlertTone): 'alert' | 'status' {
  return tone === 'error' ? 'alert' : 'status';
}

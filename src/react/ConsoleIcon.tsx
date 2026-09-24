// React adapter of ConsoleIcon.vue: one stroke icon from the console set
// (src/console/icons.ts). A name outside the set renders nothing, so a host
// can pass any `NavItem.icon` and a row without a known icon keeps no slot.
import { createElement } from 'react';

import { consoleIcon, consoleIconAttrs, type ConsoleIconName } from '../console/icons';

export interface ConsoleIconProps {
  /** A name from the built-in set; any other string renders nothing. */
  name: ConsoleIconName | (string & {});
  /** Edge length in CSS pixels. */
  size?: number;
  className?: string;
}

// React takes SVG presentation attributes in camelCase; aria-* stay as is.
function reactAttrs(attrs: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    out[key.startsWith('aria-') ? key : key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
  }
  return out;
}

export function ConsoleIcon({ name, size = 16, className }: ConsoleIconProps) {
  const shape = consoleIcon(name);
  if (!shape) return null;
  return createElement(
    'svg',
    { ...reactAttrs(consoleIconAttrs(size)), className: className ? `lu-ci ${className}` : 'lu-ci', 'data-icon': name },
    ...shape.map(([tag, attrs], i) => createElement(tag, { key: i, ...reactAttrs(attrs) })),
  );
}

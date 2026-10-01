// The theme control: a quiet icon button showing the current preference (sun,
// moon, or a monitor for following the system) that opens Light, Dark and
// System on a solid menu surface, with a check on the current one. Built on
// GlassPopover and GlassMenu, so it has their menu-button keys, focus return
// and menuitemradio semantics. Presentational: the host owns the preference.
import type { Theme } from '../i18n/footer';
import {
  DEFAULT_THEME_MENU_LABELS,
  THEME_ICONS,
  themeMenuItems,
  themeTriggerLabel,
  type ThemeMenuLabels,
} from '../components/preferenceMenus';
import { GlassPopover } from './GlassPopover';
import { GlassMenu } from './GlassMenu';
import { cx } from './internal';
import '../styles/components/preference-menu.css';

export type { ThemeMenuLabels };

export interface ThemeMenuProps {
  /** Current preference; `auto` follows the operating system. */
  theme: Theme;
  /** Called with the preference the reader picked. */
  onThemeChange?: (theme: Theme) => void;
  /** Text overrides, merged over the English defaults. */
  labels?: Partial<ThemeMenuLabels>;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Extra class on the root, for host placement. */
  className?: string;
}

export function ThemeMenu({ theme, onThemeChange, labels, placement = 'bottom-end', className }: ThemeMenuProps) {
  const t = { ...DEFAULT_THEME_MENU_LABELS, ...labels };
  return (
    <GlassPopover
      className={cx('lu-pref lu-theme-menu', className)}
      placement={placement}
      surface="solid"
      trigger={({ open, id }) => (
        <button
          type="button"
          className="lu-pref-trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-label={themeTriggerLabel(theme, t)}
          title={t.theme}
        >
          <span className="lu-pref-icon" dangerouslySetInnerHTML={{ __html: THEME_ICONS[theme] }} />
        </button>
      )}
    >
      {({ close }) => (
        <GlassMenu
          items={themeMenuItems(theme, t)}
          label={t.theme}
          autofocus
          onSelect={value => { onThemeChange?.(value as Theme); close(); }}
        />
      )}
    </GlassPopover>
  );
}

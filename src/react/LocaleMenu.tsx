// React adapter of LocaleMenu.vue: the same trigger, menu and semantics. See
// the SFC for the contract.
import type { LocaleOption } from '../i18n/footer';
import { DEFAULT_LOCALE_OPTIONS, GLOBE_ICON, localeMenuItems, localeTriggerLabel } from '../components/preferenceMenus';
import { GlassPopover } from './GlassPopover';
import { GlassMenu } from './GlassMenu';
import { cx } from './internal';
import '../styles/components/preference-menu.css';

export interface LocaleMenuProps {
  /** Current locale code. */
  locale: string;
  /** Called with the locale the reader picked. */
  onLocaleChange?: (locale: string) => void;
  /** Languages offered. Defaults to English and Chinese. */
  locales?: LocaleOption[];
  /** Name of the menu and prefix of the trigger's accessible name. */
  label?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Extra class on the root, for host placement. */
  className?: string;
}

export function LocaleMenu({
  locale,
  onLocaleChange,
  locales = DEFAULT_LOCALE_OPTIONS,
  label = 'Language',
  placement = 'bottom-end',
  className,
}: LocaleMenuProps) {
  return (
    <GlassPopover
      className={cx('lu-pref lu-locale-menu', className)}
      placement={placement}
      surface="solid"
      trigger={({ open, id }) => (
        <button
          type="button"
          className="lu-pref-trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-label={localeTriggerLabel(locale, locales, label)}
          title={label}
        >
          <span className="lu-pref-icon" dangerouslySetInnerHTML={{ __html: GLOBE_ICON }} />
        </button>
      )}
    >
      {({ close }) => (
        <GlassMenu
          items={localeMenuItems(locale, locales)}
          label={label}
          autofocus
          onSelect={value => { onLocaleChange?.(value); close(); }}
        />
      )}
    </GlassPopover>
  );
}

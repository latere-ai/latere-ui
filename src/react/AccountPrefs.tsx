import type { Theme, LocaleOption } from '../i18n/footer';
import { DEFAULT_ACCOUNT_PREFS_LABELS, type AccountPrefsLabels } from '../components/accountPrefs';
import '../styles/components/account-prefs.css';

export interface AccountPrefsProps {
  theme: Theme;
  locale: string;
  localeOptions: LocaleOption[];
  labels?: Partial<AccountPrefsLabels>;
  onSetTheme?: (theme: Theme) => void;
  onSetLocale?: (code: string) => void;
}

export function AccountPrefs({ theme, locale, localeOptions, labels, onSetTheme, onSetLocale }: AccountPrefsProps) {
  const t = { ...DEFAULT_ACCOUNT_PREFS_LABELS, ...labels };
  return <div className="lu-ap">
    <div className="lu-ap-label">{t.language}</div>
    <div className="lu-ap-row" role="group" aria-label={t.language}>
      {localeOptions.map(opt => <button key={opt.code} type="button" className={`lu-ap-pill${locale === opt.code ? ' is-active' : ''}`} title={opt.name || opt.label} aria-pressed={locale === opt.code} onClick={() => onSetLocale?.(opt.code)}><span className="lu-ap-pill-label">{opt.label}</span></button>)}
    </div>
    <div className="lu-ap-label">{t.theme}</div>
    <div className="lu-ap-row" role="group" aria-label={t.theme}>
      {(['light', 'dark', 'auto'] as const).map(value => <button key={value} type="button" className={`lu-ap-pill${theme === value ? ' is-active' : ''}`} title={t[value]} aria-pressed={theme === value} onClick={() => onSetTheme?.(value)}><span className="lu-ap-pill-label">{t[value]}</span></button>)}
    </div>
  </div>;
}

import type { MenuItem } from '../glass/types';
import { cx } from './internal';
import '../styles/components/glass-menu.css';

export interface GlassMenuProps {
  items: MenuItem[];
  onSelect?: (value: string) => void;
}

export function GlassMenu({ items, onSelect }: GlassMenuProps) {
  return (
    <div className="lu-menu" role="menu">
      {items.map(item => (
        <button
          key={item.value}
          type="button"
          role="menuitem"
          className={cx('lu-menu-item', item.danger && 'is-danger')}
          disabled={item.disabled}
          onClick={() => { if (!item.disabled) onSelect?.(item.value); }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// React adapter of ConsoleSidebar.vue — shared product-console sidebar:
// brand headline · grouped nav tabs · foldable rail · an account foot slot.
// The nav model and partition/disabled helpers are headless
// (src/console/nav.ts, vue-free); this is the thin React shell, mirroring
// the Vue adapter's markup and class names 1:1 so both frameworks render
// identical DOM against the same stylesheet.
//
// Styling: unlike the Glass primitives, ConsoleSidebar.vue has no
// `<style scoped>` block to de-scope — its styles already live in the shared,
// opt-in `src/styles/console.css` (exported as `latere-ui/console`), which
// also carries cross-component rules for AccountMenu nested in the collapsed
// rail (`.lu-cs-foot .lu-am-*`). This component does not import a stylesheet
// itself; hosts `import 'latere-ui/console'` once, exactly as Vue consumers
// already do.
//
// Deliberately NOT ported: the `product`/`productLabels` head integration
// (ProductSwitcher.vue is a Vue SFC and is not in the v1.27 ported set — see
// the spec's deferred list). Use the `brandExtra` slot as the escape hatch
// for a custom head control.
import {
  Fragment,
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { isItemDisabled, partitionGroups, type NavGroup, type NavItem, type ConsoleNavModel } from '../console/nav';
import { cx } from './internal';

type BrandTheme = 'lux' | 'cella' | 'topos' | 'wallfacer' | 'lectio';

/**
 * Minimal shape accepted for an injected router link component (e.g.
 * react-router's `Link`). Unlike Vue — which auto-forwards non-prop
 * attributes (`class`, `title`, `onClick`, …) onto a single-root child
 * component — React has no attrs fallthrough, so the component itself must
 * accept and render `className`/`title`/`onClick`/`children` for the sidebar
 * row and brand link to look and behave correctly. Real router `Link`
 * components (react-router, TanStack Router, …) already do this.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentionally loose, like Vue's `Component` prop type: callers pass react-router's `Link`, TanStack Router's `Link`, or any component whose props are a superset of `{ to }`.
export type RouterLinkComponent = ComponentType<any>;

type SlotContent = ReactNode | ((collapsed: boolean) => ReactNode);

function renderSlot(content: SlotContent | undefined, collapsed: boolean): ReactNode {
  return typeof content === 'function' ? (content as (c: boolean) => ReactNode)(collapsed) : content;
}

export interface ConsoleSidebarItemRenderProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  disabled: boolean;
}

export interface ConsoleSidebarIconRenderProps {
  item: NavItem;
  collapsed: boolean;
}

export interface ConsoleSidebarProps {
  /** Grouped navigation model. */
  model: ConsoleNavModel;
  /** Active row: matched against `NavItem.id`. */
  activeKey?: string;
  /**
   * Controlled collapsed state. Omit (undefined) for an uncontrolled rail
   * that manages its own state.
   */
  collapsed?: boolean;
  /** Called on every collapsed-state change (controlled or not). */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Show the fold button. Set false for a fixed rail (sandbox). */
  collapsible?: boolean;
  /** Injected router-link component; falls back to a plain `<a>` off-router. */
  routerLink?: RouterLinkComponent;
  /** Home target for the brand link. */
  homeTo?: string;
  /** Gradient wordmark theme for the default brand. */
  brandTheme?: BrandTheme;
  /** Product name shown in the default brand (e.g. "Lux"). */
  brandName?: string;
  /** Subtitle under the brand (e.g. "Console"). */
  brandSub?: string;
  /** Background for the logo box (any CSS color/gradient). */
  brandColor?: string;
  /** When collapsed, clicking the brand expands the rail (wallfacer affordance). */
  expandOnBrandClick?: boolean;
  /** Show the built-in search bar (fires `onSearch`; also Cmd/Ctrl-K). */
  search?: boolean;
  /** Search bar placeholder label. */
  searchLabel?: string;
  /** Keyboard hint shown in the search bar. */
  searchHint?: string;
  /** Label rendered next to the live-badge dot. */
  liveLabel?: string;
  /** Accessible labels for the fold button. */
  expandLabel?: string;
  collapseLabel?: string;
  /** Called when a row is clicked/activated. */
  onNavigate?: (item: NavItem) => void;
  /** Called on the built-in search trigger (click or Cmd/Ctrl-K). */
  onSearch?: () => void;
  /** Replaces the default brand block. Receives the current collapsed state. */
  brand?: SlotContent;
  /** Extra head content next to the brand (e.g. a custom product switcher). */
  brandExtra?: SlotContent;
  /** Replaces the default brand mark's fallback letter. */
  logo?: ReactNode;
  /** App-specific content above the search bar. */
  top?: SlotContent;
  /** Replaces the default row markup. */
  renderItem?: (props: ConsoleSidebarItemRenderProps) => ReactNode;
  /** Replaces a row's default icon fallback. */
  renderIcon?: (props: ConsoleSidebarIconRenderProps) => ReactNode;
  /** App-specific content below the nav groups, above the foot. */
  extra?: SlotContent;
  /** The account control / foot content. */
  foot?: SlotContent;
}

function letter(label: string): string {
  return (label.trim()[0] ?? '?').toUpperCase();
}

export function ConsoleSidebar({
  model,
  activeKey,
  collapsed: collapsedProp,
  onCollapsedChange,
  collapsible = true,
  routerLink,
  homeTo = '/',
  brandTheme,
  brandName,
  brandSub,
  brandColor,
  expandOnBrandClick,
  search,
  searchLabel = 'Search',
  searchHint = '⌘K',
  liveLabel = 'Live',
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
  onNavigate,
  onSearch,
  brand,
  brandExtra,
  logo,
  top,
  renderItem,
  renderIcon,
  extra,
  foot,
}: ConsoleSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? !!collapsedProp : internalCollapsed;

  function setCollapsed(v: boolean) {
    if (!isControlled) setInternalCollapsed(v);
    onCollapsedChange?.(v);
  }
  function toggle() {
    setCollapsed(!collapsed);
  }

  // Global Cmd/Ctrl-K opens search, mirroring the Vue adapter's always-on
  // listener that no-ops unless `search` is enabled (avoids re-attaching on
  // every prop change).
  const searchRef = useRef(search);
  searchRef.current = search;
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  useEffect(() => {
    if (typeof document === 'undefined') return;
    function onKeydown(e: KeyboardEvent) {
      if (!searchRef.current) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearchRef.current?.();
      }
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, []);

  const orderedGroups = useMemo<(NavGroup & { firstPinned: boolean })[]>(() => {
    const { top: topGroups, bottom } = partitionGroups(model.groups);
    return [
      ...topGroups.map((g) => ({ ...g, firstPinned: false })),
      ...bottom.map((g, i) => ({ ...g, firstPinned: i === 0 })),
    ];
  }, [model.groups]);

  function rowActive(item: NavItem): boolean {
    return activeKey !== undefined && item.id === activeKey;
  }

  function rowTag(item: NavItem): RouterLinkComponent | string {
    if (isItemDisabled(item)) return 'span';
    if (item.action && !item.to) return 'button';
    if (routerLink && !item.external) return routerLink;
    return 'a';
  }

  function rowProps(item: NavItem): Record<string, unknown> {
    if (isItemDisabled(item)) return {};
    if (item.action && !item.to) return { type: 'button' };
    if (routerLink && !item.external) return { to: item.to };
    return item.external
      ? { href: item.to, target: '_blank', rel: 'noreferrer' }
      : { href: item.to };
  }

  function onRowClick(item: NavItem, e: ReactMouseEvent) {
    if (isItemDisabled(item)) {
      e.preventDefault();
      return;
    }
    onNavigate?.(item);
  }

  function onBrandClick(e: ReactMouseEvent) {
    if (expandOnBrandClick && collapsed) {
      e.preventDefault();
      setCollapsed(false);
    }
  }

  const brandAsButton = !!expandOnBrandClick && collapsed;
  const brandTag: RouterLinkComponent | string = brandAsButton ? 'button' : (routerLink ?? 'a');
  const brandProps: Record<string, unknown> = brandAsButton
    ? { type: 'button' }
    : routerLink
      ? { to: homeTo }
      : { href: homeTo };

  function defaultRow(item: NavItem) {
    const active = rowActive(item);
    const disabled = isItemDisabled(item);
    return createElement(
      rowTag(item) as never,
      {
        key: item.id,
        ...rowProps(item),
        className: 'lu-cs-item',
        'data-active': active ? 'true' : 'false',
        'data-disabled': disabled ? 'true' : 'false',
        title: collapsed ? item.label : disabled ? 'Not yet available' : undefined,
        'aria-current': active ? 'page' : undefined,
        onClick: (e: ReactMouseEvent) => onRowClick(item, e),
      },
      <span className="lu-cs-item-icon">
        {renderIcon
          ? renderIcon({ item, collapsed })
          : collapsed
            ? letter(item.label)
            : ''}
      </span>,
      !collapsed && <span className="lu-cs-item-label">{item.label}</span>,
      item.dot && !collapsed && <span className="lu-cs-dot" aria-hidden="true" />,
      item.badge !== undefined && !collapsed
        ? item.badge === 'live'
          ? (
            <span className="lu-cs-badge lu-cs-badge-live">
              <span className="lu-cs-badge-dot" aria-hidden="true" />
              {liveLabel}
            </span>
          )
          : <span className="lu-cs-badge">{item.badge}</span>
        : null,
    );
  }

  return (
    <aside className="lu-cs" data-collapsed={collapsed ? 'true' : 'false'}>
      <div className="lu-cs-head">
        {brand !== undefined
          ? renderSlot(brand, collapsed)
          : createElement(
              brandTag as never,
              {
                ...brandProps,
                className: 'lu-cs-brand',
                title: collapsed ? expandLabel : undefined,
                onClick: onBrandClick,
              },
              <span
                className={cx('lu-cs-brand-mark', brandColor && 'lu-cs-brand-mark--colored')}
                style={brandColor ? { background: brandColor } : undefined}
              >
                {logo ?? letter(brandName ?? 'L')}
              </span>,
              !collapsed && (
                <span className="lu-cs-brand-text">
                  <span className={cx('lu-cs-brand-name', brandTheme && `${brandTheme}-brand`)}>
                    {brandName}
                  </span>
                  {brandSub && <span className="lu-cs-brand-sub">{brandSub}</span>}
                </span>
              ),
            )}

        {renderSlot(brandExtra, collapsed)}

        {collapsible && (
          <button
            type="button"
            className="lu-cs-fold"
            title={collapsed ? expandLabel : collapseLabel}
            aria-label={collapsed ? expandLabel : collapseLabel}
            onClick={toggle}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
              {!collapsed ? (
                <polyline points="15.5 9 13 12 15.5 15" />
              ) : (
                <polyline points="13 9 15.5 12 13 15" />
              )}
            </svg>
          </button>
        )}
      </div>

      {renderSlot(top, collapsed)}

      {search && (
        <button
          type="button"
          className="lu-cs-search"
          data-collapsed={collapsed ? 'true' : 'false'}
          title={`${searchLabel} (${searchHint})`}
          onClick={() => onSearch?.()}
        >
          <span className="lu-cs-search-ic" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {!collapsed && <span className="lu-cs-search-label">{searchLabel}</span>}
          {!collapsed && searchHint && <span className="lu-cs-search-hint">{searchHint}</span>}
        </button>
      )}

      <nav className="lu-cs-nav">
        {orderedGroups.map((g, gi) => (
          <div
            key={`g-${gi}`}
            className={cx('lu-cs-group', g.firstPinned && 'lu-cs-group-pinned')}
            data-pin={g.pin === 'bottom' ? 'bottom' : 'top'}
          >
            {g.label && !collapsed && <div className="lu-cs-group-label">{g.label}</div>}
            {g.items.map((item) =>
              renderItem ? (
                <Fragment key={item.id}>
                  {renderItem({
                    item,
                    active: rowActive(item),
                    collapsed,
                    disabled: isItemDisabled(item),
                  })}
                </Fragment>
              ) : (
                defaultRow(item)
              ),
            )}
          </div>
        ))}

        {renderSlot(extra, collapsed)}
      </nav>

      <div className="lu-cs-foot">{renderSlot(foot, collapsed)}</div>
    </aside>
  );
}

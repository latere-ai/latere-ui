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
import {
  Fragment,
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import {
  activePath,
  hasChildren,
  isItemDisabled,
  navTarget,
  partitionGroups,
  type ConsoleNavModel,
  type NavFootItem,
  type NavGroup,
  type NavItem,
} from '../console/nav';
import { consoleIcon } from '../console/icons';
import { handleNavKey } from '../console/navKeys';
import {
  DEFAULT_NAV_OPEN_KEY,
  isNavOpen,
  openActivePath,
  readNavOpen,
  setNavOpen,
  writeNavOpen,
  type NavOpenState,
} from '../console/openState';
import { ConsoleIcon } from './ConsoleIcon';
import { cx } from './internal';
import { ProductSwitcher } from './ProductSwitcher';
import type { ProductSwitcherLabelOverrides } from '../components/productSwitcher';

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
  /** Show a product switcher in the expanded sidebar head. */
  product?: string;
  productLabels?: ProductSwitcherLabelOverrides;
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
  /**
   * Compact head: the brand, name and fold button share one row as tall as a
   * nav row, and the collapsed rail keeps a single button that shows the
   * logo and expands the rail. Also sets the rail's inset from
   * `--lu-cs-inset` and the account card's corner from `--radius-window`.
   */
  compact?: boolean;
  /**
   * localStorage key under which the open parents persist for this viewer.
   * `null` keeps them for the page's lifetime only.
   */
  openKey?: string | null;
  /** Injected router-link component; falls back to a plain `<a>` off-router. */
  routerLink?: RouterLinkComponent;
  /** Home target for the brand link. */
  homeTo?: string;
  /** Gradient wordmark theme for the default brand. */
  brandTheme?: BrandTheme;
  /** Display name shown in the default brand (e.g. "Workspace"). */
  brandName?: string;
  /** Subtitle under the brand (e.g. "Console"). */
  brandSub?: string;
  /** Background for the logo box (any CSS color/gradient). */
  brandColor?: string;
  /** When collapsed, clicking the brand expands the rail (optional). */
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
  /** Rows set in the foot above `foot`: links or actions with a value. */
  footItems?: NavFootItem[];
  /**
   * Where groups pinned to the bottom render. `'nav'` (the default) ends the
   * scrolling nav with them; `'foot'` sets them in the foot with the foot
   * rows, above the account control, so they stay in view while the nav
   * scrolls and read as one group with the foot rows.
   */
  bottomGroups?: 'nav' | 'foot';
  /**
   * The chip a row with an `audience` carries in the expanded rail, and the
   * suffix of its collapsed tooltip. A row whose own label already says it
   * (a row named "Admin") carries no chip.
   */
  audienceLabel?: string;
  /** The account control / foot content. */
  foot?: SlotContent;
}

function letter(label: string): string {
  return (label.trim()[0] ?? '?').toUpperCase();
}

export function ConsoleSidebar({
  model,
  activeKey,
  product,
  productLabels,
  collapsed: collapsedProp,
  onCollapsedChange,
  collapsible = true,
  compact = false,
  openKey = DEFAULT_NAV_OPEN_KEY,
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
  footItems,
  bottomGroups = 'nav',
  audienceLabel = 'Admin',
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

  // Top groups first, then the bottom-pinned ones, which end the nav or, with
  // `bottomGroups="foot"`, open the foot.
  const { navGroups, footGroups } = useMemo(() => {
    const { top: topGroups, bottom } = partitionGroups(model.groups);
    const pinned = bottom.map((g, i) => ({ ...g, firstPinned: i === 0 }));
    const inFoot = bottomGroups === 'foot';
    return {
      navGroups: [...topGroups.map((g) => ({ ...g, firstPinned: false })), ...(inFoot ? [] : pinned)] as (NavGroup & { firstPinned: boolean })[],
      footGroups: (inFoot ? pinned.map((g) => ({ ...g, firstPinned: false })) : []) as (NavGroup & { firstPinned: boolean })[],
    };
  }, [model.groups, bottomGroups]);

  const navId = useId();
  const navRef = useRef<HTMLElement>(null);
  const footNavRef = useRef<HTMLDivElement>(null);
  const path = useMemo(() => activePath(model.groups, activeKey), [model.groups, activeKey]);
  const [openState, setOpenState] = useState<NavOpenState>(() => readNavOpen(openKey));
  // Arriving at a page opens every parent above it; the viewer's choice for
  // any other parent stays as they left it.
  useEffect(() => {
    setOpenState((prev) => {
      const next = openActivePath(prev, path);
      if (next !== prev) writeNavOpen(openKey, next);
      return next;
    });
  }, [path, openKey]);

  function setOpen(id: string, open: boolean) {
    setOpenState((prev) => {
      const next = setNavOpen(prev, id, open);
      if (next !== prev) writeNavOpen(openKey, next);
      return next;
    });
  }

  function onNavKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
    if (navRef.current) handleNavKey(e.nativeEvent, navRef.current, setOpen);
  }
  function onFootNavKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
    if (footNavRef.current) handleNavKey(e.nativeEvent, footNavRef.current, setOpen);
  }

  // The audience chip a row carries, unless its label already names the
  // audience; and the audience in the collapsed rail's tooltip.
  function namesAudience(item: NavItem): boolean {
    return item.label.trim().toLowerCase() === audienceLabel.trim().toLowerCase();
  }
  function audienceChip(item: NavItem): ReactNode {
    if (!item.audience || collapsed || namesAudience(item)) return null;
    return <span className="lu-cs-audience">{audienceLabel}</span>;
  }
  function audienceTitle(item: NavItem, label: string): string {
    return item.audience && !namesAudience(item) ? `${label} · ${audienceLabel}` : label;
  }

  function rowActive(item: NavItem): boolean {
    return activeKey !== undefined && item.id === activeKey;
  }

  // A row on the path to the current page: the page itself or a parent of it.
  function inPath(item: NavItem): boolean {
    return path.some((p) => p.id === item.id);
  }

  // The icon a row shows: the host's, a built-in one named by `item.icon`,
  // or, for a top-level row in the collapsed rail, the label's first letter.
  // Nothing at all renders no slot, so a label never follows empty space.
  function iconFor(item: NavItem, depth: number): ReactNode {
    if (renderIcon) return renderIcon({ item, collapsed });
    if (consoleIcon(item.icon)) return <ConsoleIcon name={item.icon!} />;
    return collapsed && depth === 0 ? letter(item.label) : null;
  }

  function iconSlot(item: NavItem, depth: number): ReactNode {
    const icon = iconFor(item, depth);
    if (icon === null || icon === undefined || icon === false || icon === '') return null;
    return <span className="lu-cs-item-icon">{icon}</span>;
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

  function defaultRow(
    item: NavItem,
    depth = 0,
    options: { active?: boolean; value?: string; className?: string } = {},
  ) {
    const active = options.active ?? rowActive(item);
    const disabled = isItemDisabled(item);
    const label = options.value !== undefined ? `${item.label} ${options.value}` : item.label;
    return createElement(
      rowTag(item) as never,
      {
        key: item.id,
        ...rowProps(item),
        className: cx('lu-cs-item', depth > 0 && 'lu-cs-child', options.className),
        'data-active': active ? 'true' : 'false',
        'data-disabled': disabled ? 'true' : 'false',
        'data-nav-id': item.id,
        'data-audience': item.audience,
        title: collapsed ? audienceTitle(item, label) : disabled ? 'Not yet available' : undefined,
        'aria-current': rowActive(item) ? 'page' : undefined,
        onClick: (e: ReactMouseEvent) => onRowClick(item, e),
      },
      iconSlot(item, depth),
      !collapsed && <span className="lu-cs-item-label">{item.label}</span>,
      audienceChip(item),
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
      options.value !== undefined && !collapsed && <span className="lu-cs-item-value">{options.value}</span>,
    );
  }

  // A parent row. Collapsed, there is no room for its children, so it is a
  // link to its own page (or its first child's) and carries the selection
  // while any page under it is open. Expanded, it is a disclosure button
  // over a group of child rows that stays in the DOM, hidden while folded,
  // so `aria-controls` always names an element.
  function parentRow(item: NavItem, depth: number): ReactNode {
    if (collapsed) {
      return defaultRow({ ...item, to: navTarget(item), children: undefined }, depth, { active: inPath(item) });
    }
    const open = isNavOpen(openState, item.id, path);
    const groupId = `${navId}-${item.id}`;
    const disabled = item.disabled === true;
    return (
      <Fragment key={item.id}>
        <button
          type="button"
          className="lu-cs-item lu-cs-parent"
          data-active={rowActive(item) ? 'true' : 'false'}
          data-path={inPath(item) ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
          data-nav-id={item.id}
          data-audience={item.audience}
          aria-expanded={open}
          aria-controls={groupId}
          disabled={disabled}
          onClick={() => setOpen(item.id, !open)}
        >
          {iconSlot(item, depth)}
          <span className="lu-cs-item-label">{item.label}</span>
          {audienceChip(item)}
          {item.dot && <span className="lu-cs-dot" aria-hidden="true" />}
          <span className="lu-cs-item-chevron" aria-hidden="true"><ConsoleIcon name="chevron" size={14} /></span>
        </button>
        <div className="lu-cs-children" id={groupId} role="group" aria-label={item.label} hidden={!open}>
          {item.children!.map((child) => leaf(child, depth + 1))}
        </div>
      </Fragment>
    );
  }

  // Children render one level deep: a child's own children are not shown.
  function row(item: NavItem, depth: number): ReactNode {
    return hasChildren(item) ? parentRow(item, depth) : leaf(item, depth);
  }

  function leaf(item: NavItem, depth: number): ReactNode {
    if (renderItem) {
      return (
        <Fragment key={item.id}>
          {renderItem({ item, active: rowActive(item), collapsed, disabled: isItemDisabled(item) })}
        </Fragment>
      );
    }
    return defaultRow(item, depth);
  }

  function group(g: NavGroup & { firstPinned: boolean }, gi: number): ReactNode {
    return (
      <div
        key={`g-${gi}`}
        className={cx('lu-cs-group', g.firstPinned && 'lu-cs-group-pinned')}
        data-pin={g.pin === 'bottom' ? 'bottom' : 'top'}
      >
        {g.label && !collapsed && <div className="lu-cs-group-label">{g.label}</div>}
        {g.items.map((item) => row(item, 0))}
      </div>
    );
  }

  const footRows = footItems && footItems.length > 0 ? (
    <div className="lu-cs-foot-items">
      {footItems.map((item) => defaultRow(item, 0, { value: item.value, className: 'lu-cs-foot-item' }))}
    </div>
  ) : null;

  // The compact collapsed head is one button: the logo, which turns into the
  // expand glyph on hover or focus.
  const compactFold = compact && collapsed && collapsible;

  return (
    <aside className="lu-cs" data-collapsed={collapsed ? 'true' : 'false'} data-compact={compact ? 'true' : undefined}>
      <div className="lu-cs-head">
        {compactFold
          ? null
          : brand !== undefined
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

        {!compactFold && renderSlot(brandExtra, collapsed)}
        {product && !collapsed && <ProductSwitcher className="lu-cs-switch" current={product} labels={productLabels} size="sm" />}

        {collapsible && (
          <button
            type="button"
            className="lu-cs-fold"
            title={collapsed ? expandLabel : collapseLabel}
            aria-label={collapsed ? expandLabel : collapseLabel}
            onClick={toggle}
          >
            {compactFold && (
              <span className="lu-cs-fold-mark" aria-hidden="true">{logo ?? letter(brandName ?? 'L')}</span>
            )}
            <svg
              className="lu-cs-fold-glyph"
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

      <nav className="lu-cs-nav" ref={navRef} onKeyDown={onNavKeyDown}>
        {navGroups.map(group)}

        {renderSlot(extra, collapsed)}
      </nav>

      <div className={cx('lu-cs-foot', footGroups.length > 0 && 'lu-cs-foot-has-nav')}>
        {footGroups.length > 0 ? (
          <div className="lu-cs-foot-nav" ref={footNavRef} onKeyDown={onFootNavKeyDown}>
            {footGroups.map(group)}
            {footRows}
          </div>
        ) : footRows}
        {renderSlot(foot, collapsed)}
      </div>
    </aside>
  );
}

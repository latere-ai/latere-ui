import { createElement, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { adjacentDocs, docPath, findDoc, type DocGroup, type FlatDoc } from '../docs/model';
import { createTocCore, type TocCore, type TocItem, type TocSnapshot } from '../docs/tocCore';
import type { RouterLinkComponent } from './ConsoleSidebar';

export interface DocsLayoutProps {
  groups: DocGroup[];
  activeSlug: string;
  activeGroupId?: string;
  articleHtml?: string;
  articleTitle?: string;
  routerLink?: RouterLinkComponent;
  base?: string;
  showToc?: boolean;
  tocLevels?: number[];
  enhance?: (element: HTMLElement) => void;
  eyebrow?: string;
  tocLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  sidebarHead?: ReactNode;
  renderGroupIcon?: (group: DocGroup) => ReactNode;
  article?: ReactNode;
  renderToc?: (state: { items: TocItem[]; activeId: string }) => ReactNode;
  onNavigate?: (doc: FlatDoc) => void;
  onTocSelect?: (id: string) => void;
}
export interface DocsLayoutHandle { refresh: () => void; toc: TocCore; }

/** In-app docs shell. Import `latere-ui/docs` for its shared layout styles. */
export const DocsLayout = forwardRef<DocsLayoutHandle, DocsLayoutProps>(function DocsLayout({
  groups, activeSlug, activeGroupId, articleHtml, articleTitle, routerLink, base = '', showToc = true, tocLevels,
  enhance, eyebrow = 'Docs', tocLabel = 'On this page', prevLabel = 'Previous', nextLabel = 'Next',
  sidebarHead, renderGroupIcon, article, renderToc, onNavigate, onTocSelect,
}, ref) {
  const articleRef = useRef<HTMLElement>(null);
  // Preserve enhanced DOM and assigned heading IDs when only TOC state changes.
  const htmlBody = useMemo(() => <div className="lu-docs-body" dangerouslySetInnerHTML={{ __html: articleHtml ?? '' }} />, [articleHtml]);
  const [outline, setOutline] = useState<TocSnapshot>({ items: [], activeId: '' });
  const levelsKey = (tocLevels ?? [2, 3]).join(',');
  const toc = useMemo(() => createTocCore({ levels: levelsKey ? levelsKey.split(',').map(Number) : [] }, setOutline), [levelsKey]);
  const current = findDoc(groups, activeSlug, activeGroupId);
  const heading = articleTitle ?? current?.title ?? '';
  const adjacent = adjacentDocs(groups, activeSlug, activeGroupId);
  const refresh = useCallback(() => {
    const element = articleRef.current;
    if (!element) return;
    enhance?.(element);
    if (showToc) toc.scan(element); else toc.dispose();
  }, [enhance, showToc, toc]);
  useEffect(() => { refresh(); return toc.dispose; }, [refresh, toc, articleHtml, activeSlug, activeGroupId, heading, article]);
  useImperativeHandle(ref, () => ({ refresh, toc }), [refresh, toc]);
  function link(groupId: string, slug: string, props: Record<string, unknown>, children: ReactNode) {
    const path = docPath(groupId, slug, base);
    return createElement(routerLink ?? 'a', { ...(routerLink ? { to: path } : { href: path }), ...props }, children);
  }
  function pager(doc: FlatDoc, direction: 'prev' | 'next') {
    return link(doc.groupId, doc.slug, { className: `lu-docs-pager-link lu-docs-pager-${direction}`, onClick: () => onNavigate?.(doc) }, <><span className="lu-docs-pager-dir">{direction === 'prev' ? prevLabel : nextLabel}</span><span className="lu-docs-pager-title">{doc.title}</span></>);
  }
  return <div className="lu-docs-frame"><div className="lu-docs">
    <aside className="lu-docs-side">
      {sidebarHead ?? <div className="lu-docs-eyebrow">{eyebrow}</div>}
      <nav className="lu-docs-nav">{groups.map(group => <div key={group.id} className="lu-docs-group" data-advanced={group.advanced ? 'true' : 'false'}>
        <div className="lu-docs-group-label">{renderGroupIcon?.(group)}<span>{group.label}</span></div>
        {group.pages.map(page => {
          const active = page.slug === activeSlug && (activeGroupId === undefined || activeGroupId === group.id);
          return link(group.id, page.slug, { key: page.slug, className: 'lu-docs-link', 'data-active': active ? 'true' : 'false', 'data-advanced': page.advanced ? 'true' : 'false', 'aria-current': active ? 'page' : undefined, onClick: () => { const doc = findDoc(groups, page.slug, group.id); if (doc) onNavigate?.(doc); } }, <><span className="lu-docs-link-label">{page.title}</span>{page.badge !== undefined && <span className="lu-docs-link-badge">{page.badge}</span>}</>);
        })}
      </div>)}</nav>
    </aside>
    <main className="lu-docs-main">
      <article ref={articleRef} className="lu-docs-article">{heading && <h1 className="lu-docs-title">{heading}</h1>}{article ?? htmlBody}</article>
      {(adjacent.prev || adjacent.next) && <nav className="lu-docs-pager">{adjacent.prev ? pager(adjacent.prev, 'prev') : <span />}{adjacent.next && pager(adjacent.next, 'next')}</nav>}
    </main>
    {showToc && <aside className="lu-docs-toc">{renderToc ? renderToc(outline) : !!outline.items.length && <div className="lu-docs-toc-inner">
      <div className="lu-docs-toc-label">{tocLabel}</div>
      {outline.items.map(item => <a key={item.id} href={`#${item.id}`} className="lu-docs-toc-link" data-level={item.level} data-active={outline.activeId === item.id ? 'true' : 'false'} onClick={() => { toc.setActive(item.id); onTocSelect?.(item.id); }}>{item.text}</a>)}
    </div>}</aside>}
  </div></div>;
});

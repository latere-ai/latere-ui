import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { DEFAULT_PRODUCT_SWITCHER_LABELS, LATERE_PRODUCTS, type ProductInfo, type ProductSwitcherLabelOverrides } from '../components/productSwitcher';
import { productPlacement, type ProductPlacement } from '../components/productPlacement';
import { GlassIconButton } from './GlassIconButton';
import { useClickOutside } from './internal';
import '../styles/components/product-switcher.css';

export interface ProductSwitcherProps {
  current: string;
  className?: string;
  products?: readonly ProductInfo[];
  labels?: ProductSwitcherLabelOverrides;
  size?: 'sm' | 'md';
}
const initial: ProductPlacement = { side: 'bottom', align: 'start', shiftX: 0, shiftY: 0 };

export function ProductSwitcher({ current, className, products = LATERE_PRODUCTS, labels, size = 'md' }: ProductSwitcherProps) {
  const t = { ...DEFAULT_PRODUCT_SWITCHER_LABELS, ...labels };
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState(initial);
  useClickOutside(root, open, () => setOpen(false));
  useLayoutEffect(() => {
    if (!open) return;
    function reposition() {
      const anchor = root.current?.getBoundingClientRect();
      const pane = panel.current?.getBoundingClientRect();
      if (anchor && pane) setPlacement(productPlacement(anchor, pane, { width: window.innerWidth, height: window.innerHeight }));
    }
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => { window.removeEventListener('resize', reposition); window.removeEventListener('scroll', reposition, true); };
  }, [open, products, labels, size]);
  return <div ref={root} className={['lu-ps', className].filter(Boolean).join(' ')}>
    <GlassIconButton label={t.switchProduct} size={size} aria-expanded={open ? 'true' : 'false'} aria-haspopup="true" onClick={() => { setPlacement(initial); setOpen(value => !value); }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{[5, 12, 19].flatMap(cy => [5, 12, 19].map(cx => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" />))}</svg>
    </GlassIconButton>
    {open && <div ref={panel} className="lu-ps-panel" data-side={placement.side} data-align={placement.align} style={{ '--lu-ps-shift-x': `${placement.shiftX}px`, '--lu-ps-shift-y': `${placement.shiftY}px` } as CSSProperties}>
      <nav className="lu-ps-grid" aria-label={t.products}>{products.map(product => {
        const content = <><span className="lu-ps-ic" aria-hidden="true" dangerouslySetInnerHTML={{ __html: product.icon }} /><span className={['lu-ps-name', product.brandClass].filter(Boolean).join(' ')}>{product.name}</span></>;
        return product.slug === current ? <span key={product.slug} className="lu-ps-tile is-current" aria-current="true">{content}<span className="lu-ps-sr">{t.current}</span></span> : <a key={product.slug} className="lu-ps-tile" href={product.url} onClick={() => setOpen(false)}>{content}</a>;
      })}</nav>
    </div>}
  </div>;
}

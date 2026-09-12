// Liquid Glass v2 runtime — the "native v2" progressive enhancement.
//
// Two effects layered on top of the CSS glass materials (`latere-ui/glass`):
//   1. Refraction — a per-element SVG displacement map appended to the
//      backdrop-filter chain, so the background visibly bends at the rounded
//      edges like real glass. Chromium only (feature-detected); every other
//      engine keeps the frosted blur from the CSS materials.
//   2. Specular sheen — a soft light spot that follows the cursor across large
//      glass panels and fades out on leave.
//
// Progressive + accessible: honors `prefers-reduced-motion` (no sheen) and
// `prefers-reduced-transparency` (no refraction), and is SSR-safe (no-ops
// without a DOM). Ported verbatim in behavior from the design handoff's
// `assets/liquid-glass.js`; kept framework-free so any surface can opt in.
//
// Per-element opt in / out via attributes:
//   data-lg-refract / data-lg-refract="off"
//   data-lg-sheen   (opt-IN; sheen never auto-attaches)
// Refraction auto-qualifies any backdrop-filter surface with a border radius
// >= 16px (or force it with data-lg-refract). Sheen is OPT-IN only: a cursor-
// following light spot is right for a deliberate hero panel but reads as a
// stray blob smeared across a footer / card / menu, so a surface must ask for
// it with `data-lg-sheen`. Add `data-lg-sheen="off"` to also suppress a
// nested opt-in inherited from a wrapper.

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;
let defs: SVGSVGElement | null = null;

// Live refraction filters keyed by their owning element. Every re-scan prunes
// filters whose element has left the document: without this, each SPA
// navigation re-created glass chrome and appended fresh <filter> nodes (each
// holding a canvas-rendered data-URL feImage) while the old ones stayed in the
// shared defs forever — unbounded DOM/memory growth over a browsing session.
interface Refraction {
  filter: SVGFilterElement;
  original: string;
  priority: string;
  applied: string;
  signature: string;
}
const refractions = new Map<LGElement, Refraction>();
const sheens = new Map<LGElement, { cleanup: () => void; refresh: () => void }>();

function restoreFilter(el: LGElement, state: Refraction): void {
  if (el.style.backdropFilter === state.applied) {
    el.style.setProperty('backdrop-filter', state.original, state.priority);
  }
}

function removeRefraction(el: LGElement): void {
  const state = refractions.get(el);
  if (!state) return;
  restoreFilter(el, state);
  state.filter.remove();
  refractions.delete(el);
  delete el.__lgRefract;
}

function pruneEffects(): void {
  refractions.forEach((_state, el) => {
    if (!el.isConnected) removeRefraction(el);
  });
  sheens.forEach((state, el) => {
    if (!el.isConnected) state.cleanup();
  });
}

function prefersReduced(feature: 'motion' | 'transparency'): boolean {
  return window.matchMedia?.('(prefers-reduced-' + feature + ': reduce)').matches ?? false;
}

interface LGElement extends HTMLElement {
  __lgRefract?: boolean;
  __lgSheen?: boolean;
}

function ensureDefs(): SVGSVGElement {
  if (defs?.isConnected) return defs;
  defs = document.createElementNS(NS, 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.style.position = 'absolute';
  defs.setAttribute('aria-hidden', 'true');
  document.body.appendChild(defs);
  return defs;
}

// A normal map whose R/G channels encode an edge-inward displacement, ramped to
// its strongest right at the rounded border so the lensing reads as glass depth.
function makeMap(w: number, h: number, r: number): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const hw = w / 2;
  const hh = h / 2;
  const band = Math.min(Math.max(r * 0.9, 14), 40);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      let depth: number;
      let nx: number;
      let ny: number;
      if (qx > 0 && qy > 0) {
        const len = Math.sqrt(qx * qx + qy * qy) || 1;
        depth = r - len;
        nx = (Math.sign(px) * qx) / len;
        ny = (Math.sign(py) * qy) / len;
      } else if (qx > qy) {
        depth = r - qx;
        nx = Math.sign(px);
        ny = 0;
      } else {
        depth = r - qy;
        nx = 0;
        ny = Math.sign(py);
      }
      let t = 0;
      if (depth < band) {
        t = 1 - Math.max(depth, 0) / band;
        t = t * t; // strongest right at the edge
      }
      const i = (y * w + x) * 4;
      d[i] = 128 + nx * t * 127; // R: x displacement
      d[i + 1] = 128 + ny * t * 127; // G: y displacement
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/** Append an SVG displacement filter to one element's backdrop-filter chain. */
export function refract(el: LGElement): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (prefersReduced('transparency') || el.getAttribute('data-lg-refract') === 'off'
      || typeof CSS === 'undefined' || !CSS.supports('backdrop-filter', 'url(#f)')) {
    removeRefraction(el);
    return;
  }
  let previous = refractions.get(el);
  // Temporarily restore the author's declaration so a rescan sees current CSS
  // (theme, media queries, classes), rather than our cached inline filter.
  if (previous && el.style.backdropFilter !== previous.applied) {
    removeRefraction(el);
    previous = undefined;
  }
  if (previous) restoreFilter(el, previous);
  const cs = getComputedStyle(el);
  const bf = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none';
  if (bf === 'none' || bf.includes('url(')) {
    removeRefraction(el);
    return;
  }
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h || w * h > 700000) {
    removeRefraction(el);
    return;
  }
  const rad = parseFloat(cs.borderTopLeftRadius) || 0;
  if (el.getAttribute('data-lg-refract') === null && rad < 16) {
    removeRefraction(el);
    return;
  }
  const signature = JSON.stringify([bf, w, h, rad]);
  if (previous?.signature === signature && previous.filter.isConnected) {
    el.style.setProperty('backdrop-filter', previous.applied, previous.priority);
    return;
  }
  removeRefraction(el);
  const original = el.style.backdropFilter;
  const priority = el.style.getPropertyPriority('backdrop-filter');
  el.__lgRefract = true;
  const r = Math.min(rad, h / 2, w / 2);
  const isCapsule = rad >= h / 2 - 1;
  const id = 'lgref' + uid++;
  const f = document.createElementNS(NS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '0');
  f.setAttribute('y', '0');
  f.setAttribute('width', '100%');
  f.setAttribute('height', '100%');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  const fi = document.createElementNS(NS, 'feImage');
  fi.setAttribute('href', makeMap(w, h, r));
  fi.setAttribute('x', '0');
  fi.setAttribute('y', '0');
  fi.setAttribute('width', String(w));
  fi.setAttribute('height', String(h));
  fi.setAttribute('preserveAspectRatio', 'none');
  fi.setAttribute('result', 'm');
  const dm = document.createElementNS(NS, 'feDisplacementMap');
  dm.setAttribute('in', 'SourceGraphic');
  dm.setAttribute('in2', 'm');
  dm.setAttribute('scale', isCapsule ? '52' : '36');
  dm.setAttribute('xChannelSelector', 'R');
  dm.setAttribute('yChannelSelector', 'G');
  f.appendChild(fi);
  f.appendChild(dm);
  ensureDefs().appendChild(f);
  // Blur first, then displace: lensing stays crisp at the edges.
  const softened = bf.replace(/blur\((\d+(?:\.\d+)?)px\)/, (_m, v) => 'blur(' + Math.min(parseFloat(v), 14) + 'px)');
  const applied = softened + ' url(#' + id + ')';
  el.style.setProperty('backdrop-filter', applied, priority);
  refractions.set(el, { filter: f, original, priority, applied: el.style.backdropFilter, signature });
}

/** Attach a cursor-following specular sheen to one glass panel. OPT-IN: the
 *  element must carry `data-lg-sheen` (a value other than "off"). Without it the
 *  panel gets no sheen — a big radial highlight chasing the cursor across a
 *  footer or menu reads as a stray blob, not glass. */
export function sheen(el: LGElement): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const attr = el.getAttribute('data-lg-sheen');
  if (prefersReduced('motion') || attr === null || attr === 'off') {
    sheens.get(el)?.cleanup();
    return;
  }
  const cs = getComputedStyle(el);
  const bf = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none';
  if (bf === 'none') {
    sheens.get(el)?.cleanup();
    return;
  }
  if (el.__lgSheen) {
    sheens.get(el)?.refresh();
    return;
  }
  el.__lgSheen = true;
  // Restrained peak + a tighter radius: a soft specular hint, not a spotlight.
  const readPeak = () => {
    const bgc = getComputedStyle(el).backgroundColor.match(/rgba?\((\d+)/);
    return bgc && parseInt(bgc[1], 10) < 128 ? 0.06 : 0.16;
  };
  let peak = readPeak();
  const originalPosition = el.style.position;
  const positioned = cs.position === 'static';
  if (positioned) el.style.position = 'relative';
  const s = document.createElement('div');
  s.setAttribute('aria-hidden', 'true');
  s.style.cssText =
    'position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity 0.45s cubic-bezier(0.22,1,0.36,1); z-index:0;';
  el.appendChild(s);
  let x = 50;
  let y = 50;
  const paint = () => {
    s.style.background =
      'radial-gradient(200px circle at ' + x + '% ' + y + '%, rgba(255,255,255,' + peak + '), rgba(255,255,255,0) 60%)';
  };
  const move = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    x = ((e.clientX - r.left) / r.width) * 100;
    y = ((e.clientY - r.top) / r.height) * 100;
    paint();
    s.style.opacity = '1';
  };
  const leave = () => { s.style.opacity = '0'; };
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
  sheens.set(el, {
    refresh: () => {
      peak = readPeak();
      if (s.style.opacity === '1') paint();
    },
    cleanup: () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      s.remove();
      if (positioned && el.style.position === 'relative') el.style.position = originalPosition;
      delete el.__lgSheen;
      sheens.delete(el);
    },
  });
}

/**
 * Scan a subtree (default: the whole document) and enhance every qualifying
 * glass surface with refraction and/or sheen. Idempotent per element — safe to
 * call again after the DOM changes (e.g. on route change). SSR-safe no-op.
 */
export function initLiquidGlass(root?: Document | HTMLElement): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  // Re-scans run on every route change; first drop filters owned by elements
  // that navigation removed, so long sessions stay flat.
  pruneEffects();
  const scope: Document | HTMLElement = root ?? document;
  const enhance = (el: Element) => {
    if (!(el instanceof HTMLElement)) return;
    refract(el);
    sheen(el);
  };
  if (scope instanceof HTMLElement) enhance(scope);
  scope.querySelectorAll('*').forEach(enhance);
}

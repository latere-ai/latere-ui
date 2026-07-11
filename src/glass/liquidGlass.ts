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
const refractions = new Map<SVGFilterElement, LGElement>();

function pruneRefractions(): void {
  refractions.forEach((el, f) => {
    if (!el.isConnected) {
      f.remove();
      refractions.delete(f);
    }
  });
}

interface LGElement extends HTMLElement {
  __lgRefract?: boolean;
  __lgSheen?: boolean;
}

function ensureDefs(): SVGSVGElement {
  if (defs) return defs;
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
  if (el.__lgRefract) return;
  const cs = getComputedStyle(el);
  const bf = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none';
  if (bf === 'none' || bf.indexOf('url(') !== -1) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h || w * h > 700000) return;
  const rad = parseFloat(cs.borderTopLeftRadius) || 0;
  if (el.getAttribute('data-lg-refract') === null && rad < 16) return;
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
  refractions.set(f, el);
  // Blur first, then displace: lensing stays crisp at the edges.
  const softened = bf.replace(/blur\((\d+(?:\.\d+)?)px\)/, (_m, v) => 'blur(' + Math.min(parseFloat(v), 14) + 'px)');
  el.style.backdropFilter = softened + ' url(#' + id + ')';
}

/** Attach a cursor-following specular sheen to one glass panel. OPT-IN: the
 *  element must carry `data-lg-sheen` (a value other than "off"). Without it the
 *  panel gets no sheen — a big radial highlight chasing the cursor across a
 *  footer or menu reads as a stray blob, not glass. */
export function sheen(el: LGElement): void {
  if (el.__lgSheen) return;
  const attr = el.getAttribute('data-lg-sheen');
  if (attr === null || attr === 'off') return;
  const cs = getComputedStyle(el);
  const bf = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none';
  if (bf === 'none') return;
  el.__lgSheen = true;
  let dark = false;
  const bgc = cs.backgroundColor.match(/rgba?\((\d+)/);
  if (bgc && parseInt(bgc[1], 10) < 128) dark = true;
  // Restrained peak + a tighter radius: a soft specular hint, not a spotlight.
  const peak = dark ? 0.06 : 0.16;
  if (cs.position === 'static') el.style.position = 'relative';
  const s = document.createElement('div');
  s.setAttribute('aria-hidden', 'true');
  s.style.cssText =
    'position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity 0.45s cubic-bezier(0.22,1,0.36,1); z-index:0;';
  el.appendChild(s);
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    s.style.background =
      'radial-gradient(200px circle at ' + x + '% ' + y + '%, rgba(255,255,255,' + peak + '), rgba(255,255,255,0) 60%)';
    s.style.opacity = '1';
  });
  el.addEventListener('mouseleave', () => {
    s.style.opacity = '0';
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
  pruneRefractions();
  const scope: Document | HTMLElement = root ?? document;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  const canRefract = !reducedTransparency && typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#f)');
  scope.querySelectorAll('*').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (canRefract && el.getAttribute('data-lg-refract') !== 'off') refract(el);
    // sheen() self-gates on the data-lg-sheen opt-in; motion-averse users get none.
    if (!reducedMotion) sheen(el);
  });
}

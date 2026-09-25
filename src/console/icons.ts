// Stroke icons for console navigation, as element descriptors both adapters
// render into one `<svg>` with the same attributes, so Vue and React output
// the same DOM. Each icon draws on a 24-unit grid with round caps and joins
// and takes its color from `currentColor`.
//
// The shapes are Lucide icons (https://lucide.dev), used under the ISC
// license below.
//
// ISC License
//
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as
// part of Feather (MIT). All other copyright (c) for Lucide are held by
// Lucide Contributors 2022.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
// IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

/** One SVG child element: its tag and its attributes. */
export type ConsoleIconElement = readonly ['path' | 'circle' | 'rect' | 'line', Readonly<Record<string, string>>];

const p = (d: string): ConsoleIconElement => ['path', { d }];

/** The icon set, keyed by the name a `NavItem.icon` carries. */
export const CONSOLE_ICONS = {
  /** Lucide "house". */
  home: [
    p('M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'),
    p('M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
  ],
  /** Lucide "key-round". */
  key: [
    p('M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'),
    ['circle', { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
  ],
  /** Lucide "credit-card". */
  card: [
    ['rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }],
    ['line', { x1: '2', x2: '22', y1: '10', y2: '10' }],
  ],
  /** Lucide "folder". */
  folder: [
    p('M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'),
  ],
  /** Lucide "box". */
  cube: [
    p('M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'),
    p('m3.3 7 8.7 5 8.7-5'),
    p('M12 22V12'),
  ],
  /** Lucide "globe". */
  globe: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    p('M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'),
    p('M2 12h20'),
  ],
  /** Lucide "sparkles". */
  sparkles: [
    p('M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'),
    p('M20 2v4'),
    p('M22 4h-4'),
    ['circle', { cx: '4', cy: '20', r: '2' }],
  ],
  /** Lucide "bot". */
  bot: [
    p('M12 8V4H8'),
    ['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }],
    p('M2 14h2'),
    p('M20 14h2'),
    p('M15 13v2'),
    p('M9 13v2'),
  ],
  /** Lucide "git-branch". */
  branch: [
    ['line', { x1: '6', x2: '6', y1: '3', y2: '15' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    p('M18 9a9 9 0 0 1-9 9'),
  ],
  /** Lucide "book-marked". */
  repo: [
    p('M10 2v8l3-3 3 3V2'),
    p('M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'),
  ],
  /** Lucide "building-2". */
  org: [
    p('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'),
    p('M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'),
    p('M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'),
    p('M10 6h4'),
    p('M10 10h4'),
    p('M10 14h4'),
    p('M10 18h4'),
  ],
  /** Lucide "shield". */
  shield: [
    p('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'),
  ],
  /** Lucide "book-open". */
  book: [
    p('M12 7v14'),
    p('M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'),
  ],
  /** Lucide "coins". */
  coins: [
    ['circle', { cx: '8', cy: '8', r: '6' }],
    p('M18.09 10.37A6 6 0 1 1 10.34 18'),
    p('M7 6h1v4'),
    p('m16.71 13.88.7.71-2.82 2.82'),
  ],
  /** Lucide "terminal". */
  terminal: [
    p('M12 19h8'),
    p('m4 17 6-6-6-6'),
  ],
  /** Lucide "plus". */
  plus: [
    p('M5 12h14'),
    p('M12 5v14'),
  ],
  /** Lucide "search". */
  search: [
    ['circle', { cx: '11', cy: '11', r: '8' }],
    p('m21 21-4.3-4.3'),
  ],
  /** Lucide "chevron-right". */
  chevron: [
    p('m9 18 6-6-6-6'),
  ],
  /** Lucide "arrow-up-right". */
  external: [
    p('M7 7h10v10'),
    p('M7 17 17 7'),
  ],
  /** Lucide "info": the leading mark of an info notice. */
  info: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    p('M12 16v-4'),
    p('M12 8h.01'),
  ],
  /** Lucide "circle-check": the leading mark of a success notice. */
  'check-circle': [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    p('m9 12 2 2 4-4'),
  ],
  /** Lucide "triangle-alert": the leading mark of a warning notice. */
  'alert-triangle': [
    p('m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'),
    p('M12 9v4'),
    p('M12 17h.01'),
  ],
  /** Lucide "circle-x": the leading mark of an error notice. */
  'x-circle': [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    p('m15 9-6 6'),
    p('m9 9 6 6'),
  ],
  /** Lucide "ellipsis": the trigger of a row's action menu. */
  more: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '19', cy: '12', r: '1' }],
    ['circle', { cx: '5', cy: '12', r: '1' }],
  ],
} as const satisfies Record<string, readonly ConsoleIconElement[]>;

/** A name in the built-in set. */
export type ConsoleIconName = keyof typeof CONSOLE_ICONS;

/** The element list for `name`, or undefined for a name outside the set. */
export function consoleIcon(name: string | undefined): readonly ConsoleIconElement[] | undefined {
  if (!name || !Object.prototype.hasOwnProperty.call(CONSOLE_ICONS, name)) return undefined;
  return CONSOLE_ICONS[name as ConsoleIconName];
}

/** The `<svg>` attributes every console icon shares, at `size` CSS pixels. */
export function consoleIconAttrs(size: number): Record<string, string> {
  return {
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };
}

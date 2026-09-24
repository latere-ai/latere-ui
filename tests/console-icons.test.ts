import { describe, expect, it } from 'vitest';

import { CONSOLE_ICONS, consoleIcon, consoleIconAttrs } from '../src/console/icons';

describe('console icons', () => {
  it('names every icon the platform sections use', () => {
    for (const name of ['home', 'key', 'card', 'folder', 'cube', 'globe', 'branch', 'repo', 'org', 'shield', 'book', 'coins', 'sparkles', 'bot', 'search', 'chevron'])
      expect(consoleIcon(name)?.length, name).toBeGreaterThan(0);
  });

  it('answers nothing for unknown or inherited names', () => {
    expect(consoleIcon('nope')).toBeUndefined();
    expect(consoleIcon('toString')).toBeUndefined();
    expect(consoleIcon(undefined)).toBeUndefined();
  });

  it('draws with strokes in currentColor on a 24-unit grid', () => {
    expect(consoleIconAttrs(18)).toMatchObject({ width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' });
    for (const shape of Object.values(CONSOLE_ICONS)) for (const [tag] of shape) expect(['path', 'circle', 'rect', 'line']).toContain(tag);
  });
});

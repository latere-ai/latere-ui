import { scenarios } from './manifest';

export const designs = ['replichai', 'wallfacer', 'origo'] as const;
// Fixed identity assets, headless organization UI and glass-only optics retain
// their original references. Expanded sidebar sheets exercise each new recipe.
export const designExclusions = ['logo', 'organizations', 'effects', 'sidebar-collapsed'] as const;
export const designScenarios = Object.fromEntries(Object.entries(scenarios).map(([adapter, sheets]) => [
  adapter, Object.fromEntries(Object.entries(sheets).filter(([name]) => !(designExclusions as readonly string[]).includes(name))),
])) as Record<string, Record<string, readonly string[]>>;
export const designMobileScenarios = new Set(['workspace', 'forms', 'modal', 'sidebar', 'footer-compact']);

import { scenarios } from './manifest';

export const designs = ['replichai', 'wallfacer', 'origo'] as const;
// All components are rendered, including fixed identities and headless UI.
export const designExclusions = [] as const;
export const designScenarios = scenarios;
export const designMobileScenarios = new Set<string>(Object.keys(scenarios.vue));

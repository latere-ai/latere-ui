import { scenarios } from './manifest';

export const designs = ['replichai', 'wallfacer', 'origo'] as const;
// All components are rendered, including fixed identities and headless UI.
export const designExclusions = [] as const;
export const designScenarios = scenarios;
// Product appearances are captured at desktop width only; the default
// appearance carries every mobile capture. Narrow-width wrapping under a
// preset's own fonts and spacing is therefore not compared.
export const designMobileScenarios = new Set<string>();

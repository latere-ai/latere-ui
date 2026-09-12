import type { SelectOption } from './types';

/** Find the next enabled choice, wrapping once; -1 means none is available. */
export function nextEnabledOption(options: SelectOption[], from: number, direction: 1 | -1): number {
  const n = options.length;
  for (let step = 1; step <= n; step++) {
    const index = ((from + direction * step) % n + n) % n;
    if (!options[index].disabled) return index;
  }
  return -1;
}

export function initialOption(options: SelectOption[], value: string): number {
  const selected = options.findIndex((option) => option.value === value && !option.disabled);
  return selected >= 0 ? selected : nextEnabledOption(options, -1, 1);
}

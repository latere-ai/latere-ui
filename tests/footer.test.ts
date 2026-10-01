import { describe, expect, it } from 'vitest';
import { en, zh, de } from '../src/i18n/footer';

// The bundled footer dictionaries. The rendered footer is covered in
// src/react/__tests__/site-footer.test.tsx.
describe('footer dictionaries', () => {
  it.each(Object.entries({ zh, de }))('%s has the same keys as English', (_locale, dict) => {
    expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
  });

  // The chat's public name is Latere, a proper name in every locale.
  it.each(Object.entries({ en, zh, de }))('%s names the chat Latere', (_locale, dict) => {
    expect(dict['footer.products.chat']).toBe('Latere');
  });

  // Wallfacer left the lineup, so no footer copy names it.
  it.each(Object.entries({ en, zh, de }))('%s carries no Wallfacer label', (_locale, dict) => {
    expect(Object.keys(dict)).not.toContain('footer.products.wallfacer');
    expect(Object.values(dict)).not.toContain('Wallfacer');
  });

  it.each(Object.entries({ en, zh, de }))('%s names no retired Lectio service', (_locale, dict) => {
    expect(Object.keys(dict)).not.toContain('footer.products.lectio');
    expect(Object.values(dict)).not.toContain('Lectio');
  });

  it.each(Object.entries({ en, zh, de }))('%s has no blank translations', (locale, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      expect(value.trim(), `${locale}: ${key}`).not.toBe('');
    }
  });
});

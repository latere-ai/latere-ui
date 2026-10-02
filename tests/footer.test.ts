import { describe, expect, it } from 'vitest';
import { en, zh, de } from '../src/i18n/footer';

// The bundled footer dictionaries. The rendered footer is covered in
// src/react/__tests__/site-footer.test.tsx.
describe('footer dictionaries', () => {
  it.each(Object.entries({ zh, de }))('%s has the same keys as English', (_locale, dict) => {
    expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(Object.entries({ en, zh, de }))('%s has no blank translations', (locale, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      expect(value.trim(), `${locale}: ${key}`).not.toBe('');
    }
  });
});

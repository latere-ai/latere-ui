// Fixture for structured-data.spec.ts: a browser-only page that places its
// structured data with mountJsonLd, the way a single-page app does on each
// navigation, and exposes the calls so the spec can drive them.
import { blogPosting, mountJsonLd } from '../../src/structured-data';

function post(headline: string) {
  return blogPosting({ headline, url: `https://example.com/blog/${headline.toLowerCase()}` });
}

let remove = mountJsonLd(post('First'));

Object.assign(window, {
  structuredData: {
    navigate(headline: string) {
      const previous = remove;
      remove = mountJsonLd(post(headline));
      // The previous view unmounts after the next one placed its data.
      previous();
    },
    clear() {
      remove();
    },
  },
});

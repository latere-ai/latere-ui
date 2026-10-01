import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/visual/**'],
    environment: 'happy-dom',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { lines: 90 },
    },
    // Expose afterEach & co. globally so @testing-library/react registers its
    // automatic DOM cleanup between tests.
    globals: true,
  },
});

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // @vitejs/plugin-vue only transforms .vue files; .tsx goes through esbuild
  // with the tsconfig "react-jsx" setting, so both frameworks' tests coexist.
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    // Expose afterEach & co. globally so @testing-library/react registers its
    // automatic DOM cleanup between tests.
    globals: true,
  },
});

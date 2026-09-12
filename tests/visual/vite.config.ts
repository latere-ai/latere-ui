import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  // TSX injects this import after dependency scanning. Discovering it on the
  // first React mount would reload every open page, including active captures.
  optimizeDeps: { include: ['react/jsx-dev-runtime'] },
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});

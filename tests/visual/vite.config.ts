import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  // TSX injects this import after dependency scanning. Discovering it on the
  // first React mount would reload every open page, including active captures.
  // The telemetry fixture's SDK chunk is imported only after load, so its
  // packages are listed too rather than discovered mid-run.
  optimizeDeps: {
    include: [
      'react/jsx-dev-runtime',
      '@opentelemetry/exporter-trace-otlp-http',
      '@opentelemetry/instrumentation',
      '@opentelemetry/instrumentation-document-load',
      '@opentelemetry/instrumentation-fetch',
      '@opentelemetry/instrumentation-xml-http-request',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-trace-web',
      '@opentelemetry/semantic-conventions',
      'web-vitals',
    ],
  },
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});

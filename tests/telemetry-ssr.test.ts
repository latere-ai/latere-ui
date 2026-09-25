// @vitest-environment node
import { expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ imports: 0 }));

vi.mock('../src/telemetry/sdk', () => {
  sdk.imports++;
  return { init: () => {} };
});

it('does nothing outside a browser', async () => {
  const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const { startTelemetry } = await import('../src/telemetry/index');

  expect(typeof window).toBe('undefined');
  expect(startTelemetry({ service: 'example-web' })).toBeUndefined();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(sdk.imports).toBe(0);
  expect(debug).not.toHaveBeenCalled();
});

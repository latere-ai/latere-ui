// Fixture for telemetry.spec.ts: a static page that starts browser telemetry
// the way a host does, plus one application request carrying a query string
// and a fragment the export must not contain.
import { startTelemetry } from '../../src/telemetry';

startTelemetry({ service: 'fixture-web', version: '0.0.0-fixture', environment: 'test' });

document.getElementById('request')!.addEventListener('click', () => {
  void fetch('/api/fixture?token=secret#section').then((response) => response.text());
});

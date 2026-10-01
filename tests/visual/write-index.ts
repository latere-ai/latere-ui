import { writeFileSync, readdirSync } from 'node:fs';
import { designs, designScenarios, designMobileScenarios } from './design-manifest';
import { scenarios, mobileScenarios } from './manifest';

const directory = 'tests/visual/goldens/darwin-24';
const link = (name: string) => `../${directory}/${name}`;
const lines = [
  '# Visual reference index', '',
  'These PNGs are the expected renders used by the browser suite. Chromium renders them on macOS 15 at 2× browser resolution, as on a high-density display. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.', '',
  'Every visual component renders in light and dark themes at desktop and mobile widths. Vue and React must render each sheet with identical decoded RGBA pixels before its reference is compared or recorded, so each figure shows both adapters.', '',
];
const standard = new Set<string>();
function table(prefix: string, sheets: Record<string, readonly string[]>, mobile: Set<string>) {
  lines.push('| Sheet | Components | Light | Dark | Mobile |', '|---|---|---|---|---|');
  for (const [scenario, components] of Object.entries(sheets)) {
    const name = (theme: string, layout: string) => `${prefix}${scenario}-${theme}-${layout}.png`;
    const layouts = mobile.has(scenario) ? ['desktop', 'mobile'] : ['desktop'];
    for (const theme of ['light', 'dark']) for (const layout of layouts) standard.add(name(theme, layout));
    const mobileLinks = mobile.has(scenario) ? `[Light](${link(name('light', 'mobile'))}) · [Dark](${link(name('dark', 'mobile'))})` : '—';
    lines.push(`| ${scenario} | ${components.join(', ')} | [View](${link(name('light', 'desktop'))}) | [View](${link(name('dark', 'desktop'))}) | ${mobileLinks} |`);
  }
  lines.push('');
}
lines.push('## Components', '');
table('', scenarios.vue, mobileScenarios);
lines.push('## Product style variations', '', 'Real components rendered with the optional `latere-ui/presets` stylesheet, in both themes and both viewport sizes for each style. Identity marks retain their brand artwork; headless organization controls demonstrate host styling; optical opt-ins show their intentional matte fallback in these presets.', '');
for (const design of designs) {
  lines.push(`### ${design}`, '');
  table(`${design}-`, designScenarios.vue, designMobileScenarios);
}
lines.push('## Interaction and accessibility states', '', 'Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.', '');
for (const name of readdirSync(directory).filter(name => name.endsWith('.png') && !standard.has(name)).sort()) lines.push(`- [${name.replace('.png', '')}](${link(name)})`);
lines.push('', 'Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.', '');
writeFileSync('docs/visual-reference.md', lines.join('\n'));

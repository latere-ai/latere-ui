import { writeFileSync, readdirSync } from 'node:fs';
import { scenarios, mobileScenarios } from './manifest';
const lines = [
  '# Visual reference index', '',
  'These PNGs are the expected renders used by the browser suite. Figures are rendered at 3.125× browser resolution and carry 300 DPI metadata. Open a figure to inspect sharp text and edges at full size. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.', '',
  'These documentation figures use macOS 27 and pinned Chromium. The [macOS 15 CI references](../tests/visual/goldens/darwin-24) are reviewed separately. Every exported Vue and React UI component has a scenario; this is component inventory coverage, not a percentage of all possible appearances or browser engines.', '',
];
for (const [framework, sheets] of Object.entries(scenarios)) {
  lines.push(`## ${framework === 'vue' ? 'Vue' : 'React'}`, '', '| Sheet | Components | Light | Dark | Mobile |', '|---|---|---|---|---|');
  for (const [scenario, components] of Object.entries(sheets)) {
    const link = (theme: string, layout: string) => `../tests/visual/goldens/darwin-27/${framework}-${scenario}-${theme}-${layout}.png`;
    const mobile = mobileScenarios.has(scenario) ? `[Light](${link('light', 'mobile')}) · [Dark](${link('dark', 'mobile')})` : '—';
    lines.push(`| ${scenario} | ${components.join(', ')} | [View](${link('light', 'desktop')}) | [View](${link('dark', 'desktop')}) | ${mobile} |`);
  }
  lines.push('');
}
const standard = new Set(Object.entries(scenarios).flatMap(([framework, sheets]) => Object.keys(sheets).flatMap(scenario => ['light', 'dark'].flatMap(theme => (mobileScenarios.has(scenario) ? ['desktop', 'mobile'] : ['desktop']).map(layout => `${framework}-${scenario}-${theme}-${layout}.png`)))));
lines.push('## Interaction and accessibility states', '', 'Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.', '');
for (const name of readdirSync('tests/visual/goldens/darwin-27').filter(name => name.endsWith('.png') && !standard.has(name)).sort()) lines.push(`- [${name.replace('.png', '')}](../tests/visual/goldens/darwin-27/${name})`);
lines.push('', 'Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.', '');
writeFileSync('docs/visual-reference.md', lines.join('\n'));

import { writeFileSync, readdirSync } from 'node:fs';
import { scenarios, mobileScenarios } from './manifest';
const lines = [
  '# Visual reference index', '',
  'These PNGs are the expected renders used by the browser suite. Open a figure to inspect it at full size. The same fixtures are interactive in the local gallery (`bun run visual:dev`). See [Contributing](../CONTRIBUTING.md) for comparison and update commands.', '',
  'The initial baseline uses macOS and pinned Chromium. Every exported Vue and React UI component has a scenario; this is component inventory coverage, not a percentage of all possible appearances or browser engines.', '',
];
for (const [framework, sheets] of Object.entries(scenarios)) {
  lines.push(`## ${framework === 'vue' ? 'Vue' : 'React'}`, '', '| Sheet | Components | Light | Dark | Mobile |', '|---|---|---|---|---|');
  for (const [scenario, components] of Object.entries(sheets)) {
    const link = (theme: string, layout: string) => `../tests/visual/goldens/darwin/${framework}-${scenario}-${theme}-${layout}.png`;
    const mobile = mobileScenarios.has(scenario) ? `[Light](${link('light', 'mobile')}) · [Dark](${link('dark', 'mobile')})` : '—';
    lines.push(`| ${scenario} | ${components.join(', ')} | [View](${link('light', 'desktop')}) | [View](${link('dark', 'desktop')}) | ${mobile} |`);
  }
  lines.push('');
}
const standard = new Set(Object.entries(scenarios).flatMap(([framework, sheets]) => Object.keys(sheets).flatMap(scenario => ['light', 'dark'].flatMap(theme => (mobileScenarios.has(scenario) ? ['desktop', 'mobile'] : ['desktop']).map(layout => `${framework}-${scenario}-${theme}-${layout}.png`)))));
lines.push('## Interaction and accessibility states', '', 'Additional figures cover focus, hover, nested dialogs, keyboard selection, popover placement, refraction, reduced motion, reduced transparency, and increased contrast.', '');
for (const name of readdirSync('tests/visual/goldens/darwin').filter(name => name.endsWith('.png') && !standard.has(name)).sort()) lines.push(`- [${name.replace('.png', '')}](../tests/visual/goldens/darwin/${name})`);
lines.push('', 'Generated from [the fixture manifest](../tests/visual/manifest.ts) with `bun run visual:index`.', '');
writeFileSync('docs/visual-reference.md', lines.join('\n'));

import '@fontsource/inter/400.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '../../src/styles/tokens.css';
import '../../src/styles/glass.css';
import '../../src/styles/console.css';
import '../../src/styles/docs.css';
import '../../src/styles/footer.css';
import '../../src/styles/brand.css';
import '../../src/styles/presets.css';
import './gallery.css';
import './preset-gallery.css';
import { designs, designScenarios } from './design-manifest';
import { scenarios } from './manifest';

// Load every fixture face before mounting: late font swaps can leave glass
// compositing layers with fractional text positions from the fallback font.
await Promise.all([
  '400 13px "IBM Plex Sans"', '500 13px "IBM Plex Sans"', '600 19px "IBM Plex Sans"', '400 13px "IBM Plex Mono"',
  '400 14px Inter', '500 14px Inter', '600 24px Inter',
  '400 14px "Instrument Serif"', '400 14px "JetBrains Mono"',
].map(font => document.fonts.load(font)));

const params = new URLSearchParams(location.search);
const framework = params.get('framework') ?? 'vue';
const scenario = params.get('scenario');
const theme = params.get('theme') ?? 'light';
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme;
const design = params.get('design');
if (design && ['replichai', 'wallfacer', 'origo'].includes(design)) document.documentElement.dataset.design = design;
const root = document.getElementById('app')!;
if (!scenario) {
  root.innerHTML = '<header><h1>Latere UI visual references</h1><p>Choose a sheet. Each uses real components and local assets.</p></header>';
  for (const [adapter, cases] of Object.entries(scenarios)) {
    const section = document.createElement('section');
    section.className = 'sample';
    const title = document.createElement('h2'); title.textContent = adapter; section.append(title);
    for (const name of Object.keys(cases)) for (const mode of ['light', 'dark']) {
      const link = document.createElement('a');
      link.href = `?framework=${adapter}&scenario=${name}&theme=${mode}`;
      link.textContent = `${name} · ${mode}`; link.className = 'gallery-link'; section.append(link);
    }
    root.append(section);
  }
  for (const design of designs) {
    const section = document.createElement('section'); section.className = 'sample';
    const title = document.createElement('h2'); title.textContent = design; section.append(title);
    for (const [adapter, sheets] of Object.entries(designScenarios)) for (const name of Object.keys(sheets)) for (const mode of ['light', 'dark']) {
      const link = document.createElement('a'); link.className = 'gallery-link';
      link.href = `?framework=${adapter}&scenario=${name}&theme=${mode}&design=${design}`;
      link.textContent = `${adapter} / ${name} · ${mode}`; section.append(link);
    }
    root.append(section);
  }
} else {
  const heading = document.createElement('header');
  heading.innerHTML = '<p class="eyebrow">LATERE UI · VISUAL REFERENCE</p>';
  const title = document.createElement('h1'); title.textContent = `${design ? design + ' / ' : ''}${framework} / ${scenario} / ${theme}`;
  heading.append(title); root.append(heading);
  const stage = document.createElement('main'); stage.id = 'stage'; root.append(stage);
  if (framework === 'react') {
    const { mountReactGallery } = await import('./ReactGallery');
    mountReactGallery(stage, scenario);
  } else {
    const { createApp } = await import('vue');
    const { default: Gallery } = await import('./VueGallery.vue');
    createApp(Gallery, { scenario }).mount(stage);
  }
  await document.fonts.ready;
  document.documentElement.dataset.ready = 'true';
}

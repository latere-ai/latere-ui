import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { PNG } from 'pngjs';
import * as manifest from './visual/manifest';
import * as designManifest from './visual/design-manifest';
import { comparePixels } from './visual/exact-pixels';

const { scenarios } = manifest;
const { designs, designScenarios, designExclusions } = designManifest;
const sorted = (values: Iterable<string>) => [...new Set(values)].sort();
const read = (file: string) => readFileSync(file, 'utf8');
const parse = (file: string, source: string) => ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);

/** Resolve runtime exports through nested barrels without loading either framework. */
function publicValueExports(file: string, load = read, seen = new Set<string>()): Set<string> {
  file = resolve(file);
  if (seen.has(file)) return new Set();
  seen.add(file);
  const names = new Set<string>();
  for (const statement of parse(file, load(file)).statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const item of statement.exportClause.elements) if (!item.isTypeOnly) names.add(item.name.text);
      } else if (!statement.exportClause && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
        const path = resolve(dirname(file), statement.moduleSpecifier.text);
        const target = [path, `${path}.ts`, `${path}.tsx`, join(path, 'index.ts'), join(path, 'index.tsx')]
          .find(candidate => { try { load(candidate); return true; } catch { return false; } });
        if (!target) throw new Error(`Cannot resolve public barrel ${path}`);
        for (const name of publicValueExports(target, load, seen)) if (name !== 'default') names.add(name);
      }
      continue;
    }
    if (!ts.canHaveModifiers(statement) || !ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isEnumDeclaration(statement)) && statement.name) names.add(statement.name.text);
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
    }
  }
  return names;
}

// Only nonvisual values may be exempt. Every Vue SFC, including the headless
// OrgSwitcher and identity marks, still needs all visual matrix combinations.
const nonvisualExports: Record<string, string> = {
  SessionProvider: 'React context provider; renders its children without visual markup.',
  ApiError: 'HTTP client error class; never renders UI.',
  LATERE_PRODUCTS: 'Product registry data, rendered through ProductSwitcher and SiteFooter.',
  DEFAULT_PRODUCT_SWITCHER_LABELS: 'Default text data consumed by ProductSwitcher.',
};
function visualExports(file: string) {
  return sorted([...publicValueExports(file)].filter(name => /^[A-Z]/.test(name) && !(name in nonvisualExports)));
}
function vueComponentExports() {
  const file = 'src/index.ts';
  return sorted(parse(file, read(file)).statements.flatMap(statement => {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly || !statement.moduleSpecifier
      || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.endsWith('.vue')
      || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) return [];
    return statement.exportClause.elements.filter(item => !item.isTypeOnly && item.propertyName?.text === 'default').map(item => item.name.text);
  }));
}

/** Register the actual golden tests while leaving browser callbacks unexecuted. */
function registeredGoldens(file: string) {
  const names: string[] = [];
  const test = (name: string, _callback: unknown) => { names.push(name); };
  const javascript = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(javascript, {
    exports: {},
    require: (specifier: string) => {
      if (specifier === './fixtures') return { test };
      if (specifier === './manifest') return manifest;
      if (specifier === './design-manifest') return designManifest;
      if (specifier === './exact-golden' || specifier === './exact-pixels') return {};
      throw new Error(`Unexpected golden registration dependency: ${specifier}`);
    },
  }, { filename: file, timeout: 5000 });
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names).size, `${file} duplicate test titles`).toBe(names.length);
  return new Set(names);
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'goldens' ? [] : sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}
function memberName(node: ts.Node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) return node.argumentExpression.text;
  return undefined;
}

describe('visual fixture inventory', () => {
  it('discovers runtime components through nested, aliased and cyclic re-export barrels', () => {
    const files: Record<string, string> = {
      '/virtual/index.ts': "export * from './basic'; export { GlassMenu as Menu } from './menu'; export type { Hidden } from './types';",
      '/virtual/basic.ts': "export * from './nested'; export { GlassSurface, type GlassSurfaceProps } from './surface';",
      '/virtual/nested.ts': "export * from './basic'; export function GlassTabs() {} export interface Hidden {} export const GlassRadio = () => null;",
    };
    const load = (file: string) => { if (!(file in files)) throw new Error(file); return files[file]; };
    expect(sorted(publicValueExports('/virtual/index.ts', load))).toEqual(['GlassRadio', 'GlassSurface', 'GlassTabs', 'Menu']);
  });

  it('exports the complete Vue visual component set from React, including re-export barrels', () => {
    const vue = vueComponentExports();
    expect(vue.length).toBeGreaterThan(30);
    expect(visualExports('src/index.ts')).toEqual(vue);
    expect(visualExports('src/react/index.ts')).toEqual(vue);
    for (const [name, reason] of Object.entries(nonvisualExports)) {
      expect(reason.length).toBeGreaterThan(20);
      expect(vue, `${name} cannot exempt a visual SFC`).not.toContain(name);
    }
  });

  for (const framework of ['vue', 'react'] as const) {
    it(`${framework} manifest covers exactly its public visual exports`, () => {
      expect(sorted(Object.values(scenarios[framework]).flat())).toEqual(visualExports(framework === 'vue' ? 'src/index.ts' : 'src/react/index.ts'));
      for (const components of Object.values(scenarios[framework])) {
        expect(components.length).toBeGreaterThan(0);
        expect(new Set(components).size).toBe(components.length);
      }
    });
    it(`${framework} has every component sheet under every product appearance`, () => {
      expect(designScenarios[framework]).toEqual(scenarios[framework]);
      expect(sorted(Object.values(designScenarios[framework]).flat())).toEqual(vueComponentExports());
    });
  }

  it('uses the same named sheets and component membership in both adapters', () => {
    expect(scenarios.react).toEqual(scenarios.vue);
    expect(designScenarios.react).toEqual(designScenarios.vue);
  });

  it('has all four appearances with no visual exclusions', () => {
    expect(designs).toEqual(['replichai', 'wallfacer', 'origo']);
    expect(designExclusions).toEqual([]);
    expect(sorted(['default', ...designs])).toHaveLength(4);
  });

  it('registers desktop/mobile × light/dark for every adapter, sheet and appearance', () => {
    const paired = registeredGoldens('tests/visual/design-goldens.spec.ts');
    const sheets = Object.keys(scenarios.vue);
    expect(sheets).toHaveLength(25);
    expect(paired.size).toBe(25 * 4 * 2 * 2);
    expect(sorted(manifest.mobileScenarios)).toEqual(sorted(sheets));
    expect(sorted(designManifest.designMobileScenarios)).toEqual(sorted(sheets));
    for (const design of ['default', ...designs]) for (const sheet of sheets) {
      for (const theme of ['light', 'dark']) for (const layout of ['desktop', 'mobile']) {
        const title = `parity ${design} ${sheet} ${theme} ${layout}`;
        expect(paired.has(title), `Missing paired golden: ${title}`).toBe(true);
      }
    }
  });
});

describe('strict visual comparison contract', () => {
  it('captures both adapters and checks their RGBA equality before checking golden files', () => {
    const file = 'tests/visual/design-goldens.spec.ts';
    const source = read(file);
    const tree = parse(file, source);
    const captures: ts.CallExpression[] = [];
    const goldens: ts.CallExpression[] = [];
    const comparisons: ts.CallExpression[] = [];
    const assertions: ts.CallExpression[] = [];
    function inAdapterLoop(node: ts.Node) {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isForOfStatement(parent) && ts.isArrayLiteralExpression(parent.expression)) {
          const values = parent.expression.elements.filter(ts.isStringLiteral).map(item => item.text);
          if (sorted(values).join(',') === 'react,vue') return true;
        }
      }
      return false;
    }
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        if (ts.isIdentifier(node.expression) && node.expression.text === 'captureExact') captures.push(node);
        if (ts.isIdentifier(node.expression) && node.expression.text === 'comparePixels') comparisons.push(node);
        if (memberName(node.expression) === 'toMatchGolden') goldens.push(node);
        if (memberName(node.expression) === 'toBe' && node.arguments[0]?.kind === ts.SyntaxKind.TrueKeyword) {
          const receiver = (node.expression as ts.PropertyAccessExpression).expression;
          if (ts.isCallExpression(receiver) && receiver.arguments[0] && memberName(receiver.arguments[0]) === 'equal') assertions.push(node);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(tree);
    expect(captures).toHaveLength(1);
    expect(goldens).toHaveLength(1);
    expect(comparisons).toHaveLength(1);
    expect(assertions).toHaveLength(1);
    expect(inAdapterLoop(captures[0]), 'capture must cover both adapters').toBe(true);
    expect(inAdapterLoop(goldens[0]), 'golden assertion must cover both adapters').toBe(true);
    expect(comparisons[0].arguments.map(memberName)).toEqual(['vue', 'react']);
    expect(captures[0].pos).toBeLessThan(comparisons[0].pos);
    expect(comparisons[0].pos).toBeLessThan(assertions[0].pos);
    expect(assertions[0].pos).toBeLessThan(goldens[0].pos);
    expect(source).toContain('&parity=1');
  });

  it('uses only the exact custom matcher for golden assertions', () => {
    let goldenCalls = 0;
    for (const file of sourceFiles('tests/visual')) {
      const tree = parse(file, read(file));
      const exactExpectNames = new Set<string>();
      for (const statement of tree.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)
          || !['./fixtures', './exact-golden'].includes(statement.moduleSpecifier.text)) continue;
        const bindings = statement.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
          if ((item.propertyName?.text ?? item.name.text) === 'expect') exactExpectNames.add(item.name.text);
        }
      }
      const visit = (node: ts.Node) => {
        const member = memberName(node);
        expect(['toHaveScreenshot', 'toMatchSnapshot'].includes(member ?? ''), `${file}: permissive snapshot assertion`).toBe(false);
        if (member === 'toMatchGolden' && ts.isCallExpression(node.parent) && node.parent.expression === node) {
          goldenCalls++;
          const receiver = (node as ts.PropertyAccessExpression | ts.ElementAccessExpression).expression;
          expect(ts.isCallExpression(receiver), `${file}: golden must use imported exact expect`).toBe(true);
          if (ts.isCallExpression(receiver)) {
            expect(ts.isIdentifier(receiver.expression) && exactExpectNames.has(receiver.expression.text), `${file}: golden must use imported exact expect`).toBe(true);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(tree);
    }
    expect(goldenCalls).toBeGreaterThan(0);
    const fixtures = read('tests/visual/fixtures.ts');
    expect(fixtures).toMatch(/import\s*\{\s*expect\s*\}\s*from\s*['"]\.\/exact-golden['"]/);
    expect(existsSync('tests/visual/exact-golden.ts')).toBe(true);
  });

  it.each([0, 1, 2, 3])('rejects a one-level change in RGBA channel %i', channel => {
    const pixels = Buffer.from([31, 63, 127, 255, 10, 20, 30, 40]);
    const changed = Buffer.from(pixels);
    changed[4 + channel]++;
    const encode = (data: Buffer) => PNG.sync.write({ width: 2, height: 1, data } as PNG);
    const comparison = comparePixels(encode(pixels), encode(changed));
    expect(comparison.equal).toBe(false);
    expect(comparison.changedPixels).toBe(1);
    expect(comparison.firstDifference).toEqual({ x: 1, y: 0, expected: [...pixels.subarray(4)], actual: [...changed.subarray(4)] });
  });
});

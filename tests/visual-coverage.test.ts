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

/** Resolve runtime exports through nested barrels without loading the modules. */
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

// Only nonvisual values may be exempt. Every component, including the headless
// OrgSwitcher and identity marks, still needs all visual matrix combinations.
const nonvisualExports: Record<string, string> = {
  SessionProvider: 'React context provider; renders its children without visual markup.',
  ApiError: 'HTTP client error class; never renders UI.',
  CONSOLE_ICONS: 'Icon path data, rendered through ConsoleSidebar and ConsolePalette.',
  SELECT_SEARCH_THRESHOLD: 'Option count above which GlassSelect shows its search field; a number, never renders UI.',
  DEFAULT_NAV_OPEN_KEY: 'Default storage key string for the sidebar\'s open parents; never renders UI.',
};
function visualExports(file: string) {
  return sorted([...publicValueExports(file)].filter(name => /^[A-Z]/.test(name) && !(name in nonvisualExports)));
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
      if (specifier === './fixtures') return { test, goldenTest: test };
      if (specifier === './manifest') return manifest;
      if (specifier === './design-manifest') return designManifest;
      if (specifier === './exact-golden' || specifier === './exact-pixels' || specifier === 'node:fs') return {};
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

  it('exempts only nonvisual values the package entry exports', () => {
    const exported = publicValueExports('src/react/index.ts');
    for (const [name, reason] of Object.entries(nonvisualExports)) {
      expect(reason.length).toBeGreaterThan(20);
      expect(exported.has(name), `${name} is exempt but not exported`).toBe(true);
    }
  });

  it('manifest covers exactly the public visual exports, including re-export barrels', () => {
    const visual = visualExports('src/react/index.ts');
    expect(visual.length).toBeGreaterThan(30);
    expect(sorted(Object.values(scenarios).flat())).toEqual(visual);
    for (const components of Object.values(scenarios)) {
      expect(components.length).toBeGreaterThan(0);
      expect(new Set(components).size).toBe(components.length);
    }
  });

  it('has every component sheet under every product appearance', () => {
    expect(designScenarios).toEqual(scenarios);
  });

  it('has all four appearances with no visual exclusions', () => {
    expect(designs).toEqual(['replichai', 'wallfacer', 'origo']);
    expect(designExclusions).toEqual([]);
    expect(sorted(['default', ...designs])).toHaveLength(4);
  });

  it('registers light/dark for every sheet and appearance, and mobile for the default appearance', () => {
    const figures = registeredGoldens('tests/visual/design-goldens.spec.ts');
    const sheets = Object.keys(scenarios);
    expect(sheets).toHaveLength(24);
    expect(sorted(manifest.mobileScenarios)).toEqual(sorted(sheets));
    expect(sorted(designManifest.designMobileScenarios)).toEqual([]);
    expect(figures.size).toBe(sheets.length * 2 * 2 + sheets.length * designs.length * 2);
    for (const design of ['default', ...designs]) for (const sheet of sheets) {
      for (const theme of ['light', 'dark']) for (const layout of ['desktop', 'mobile']) {
        const title = `figure ${design} ${sheet} ${theme} ${layout}`;
        const expected = layout === 'desktop' || design === 'default';
        expect(figures.has(title), `${expected ? 'Missing' : 'Unexpected'} figure: ${title}`).toBe(expected);
      }
    }
  });
});

describe('strict visual comparison contract', () => {
  it('captures each figure once and checks that capture against its one golden file', () => {
    const file = 'tests/visual/design-goldens.spec.ts';
    const source = read(file);
    const tree = parse(file, source);
    const captures: ts.VariableDeclaration[] = [];
    const goldens: ts.CallExpression[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && node.initializer && ts.isAwaitExpression(node.initializer)
        && ts.isCallExpression(node.initializer.expression) && ts.isIdentifier(node.initializer.expression.expression)
        && node.initializer.expression.expression.text === 'captureExact') captures.push(node);
      if (ts.isCallExpression(node) && memberName(node.expression) === 'toMatchGolden') goldens.push(node);
      ts.forEachChild(node, visit);
    };
    visit(tree);
    expect(captures).toHaveLength(1);
    expect(goldens).toHaveLength(1);
    const receiver = (goldens[0].expression as ts.PropertyAccessExpression).expression;
    expect(ts.isCallExpression(receiver) && receiver.arguments.length === 1 && ts.isIdentifier(receiver.arguments[0])
      && receiver.arguments[0].text === (captures[0].name as ts.Identifier).text, 'the golden checks the exact capture').toBe(true);
    expect(captures[0].pos).toBeLessThan(goldens[0].pos);
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

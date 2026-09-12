import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { scenarios } from './visual/manifest';
describe('visual fixture inventory', () => {
  it('covers every Vue component export', () => {
    const source = readFileSync('src/index.ts', 'utf8');
    const exports = [...source.matchAll(/export \{ default as (\w+) \} from '.*\.vue'/g)].map(match => match[1]);
    const covered = new Set(Object.values(scenarios.vue).flat());
    expect(exports.length).toBeGreaterThan(30);
    expect(exports.filter(name => !covered.has(name as never))).toEqual([]);
  });
  it('covers every React component export', () => {
    const source = readFileSync('src/react/index.ts', 'utf8');
    const tree = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
    const exports = tree.statements.flatMap(statement => {
      if (!ts.isExportDeclaration(statement) || statement.isTypeOnly || !statement.moduleSpecifier
          || !ts.isStringLiteral(statement.moduleSpecifier) || !/^\.\/[A-Z]/.test(statement.moduleSpecifier.text)
          || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) return [];
      return statement.exportClause.elements.filter(item => !item.isTypeOnly).map(item => item.name.text);
    });
    const covered = new Set(Object.values(scenarios.react).flat());
    expect(exports.length).toBeGreaterThan(10);
    expect(exports.filter(name => !covered.has(name as never))).toEqual([]);
  });
});

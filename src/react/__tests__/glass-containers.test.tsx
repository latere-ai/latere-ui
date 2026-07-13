import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { GlassPanel } from '../GlassPanel';
import { GlassBar } from '../GlassBar';
import { GlassTable } from '../GlassTable';

describe('GlassPanel (react)', () => {
  it('renders a regular-glass surface with the Vue-identical classes', () => {
    const { container } = render(<GlassPanel>P</GlassPanel>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('lu-gs lu-glass lu-panel');
    expect(el.textContent).toBe('P');
  });

  it('supports tier override and flush padding', () => {
    const { container } = render(
      <GlassPanel tier="thick" flush>
        P
      </GlassPanel>,
    );
    expect(container.firstElementChild!.className).toBe('lu-gs lu-glass-thick lu-panel lu-panel-flush');
  });
});

describe('GlassBar (react)', () => {
  it('renders a div bar on regular glass', () => {
    const { container } = render(<GlassBar>B</GlassBar>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('lu-gs lu-glass lu-bar');
  });

  it('header + sticky switch the tag and pin class', () => {
    const { container } = render(
      <GlassBar header sticky>
        B
      </GlassBar>,
    );
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('HEADER');
    expect(el.className).toBe('lu-gs lu-glass lu-bar lu-bar-sticky');
  });
});

describe('GlassTable (react)', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', align: 'right' as const },
  ];
  const rows = [
    { name: 'sbx-1', status: 'running' },
    { name: 'sbx-2', status: 'idle' },
  ];

  it('renders a glass header and one row per datum', () => {
    const { container } = render(<GlassTable columns={columns} rows={rows} />);
    expect(container.querySelector('.lu-table-head')!.classList.contains('lu-glass')).toBe(true);
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(container.querySelector('tbody tr td')!.textContent).toBe('sbx-1');
  });

  it('supports per-cell renderers (the cell-<key> slots)', () => {
    const { container } = render(
      <GlassTable
        columns={columns}
        rows={rows}
        rowKey="name"
        cells={{ status: ({ value }) => <span className="pill">{String(value)}</span> }}
      />,
    );
    const pills = container.querySelectorAll('td .pill');
    expect(pills).toHaveLength(2);
    expect(pills[0].textContent).toBe('running');
  });
});

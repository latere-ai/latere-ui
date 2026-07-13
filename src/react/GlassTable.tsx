// React adapter of GlassTable.vue — a data table with a sticky regular-glass
// header over scrolling rows. Pass `columns` + `rows`; the Vue `cell-<key>`
// slots become the `cells` render-prop map. Requires `import 'latere-ui/glass'`.
import type { ReactNode } from 'react';
import type { TableColumn } from '../glass/types';
import '../styles/components/glass-table.css';

export interface GlassTableProps {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  /** Key to use for the row's React key; falls back to the row index. */
  rowKey?: string;
  /** Per-column cell renderers, keyed by column key — the `cell-<key>` slots. */
  cells?: Record<string, (ctx: { row: Record<string, unknown>; value: unknown }) => ReactNode>;
}

export function GlassTable({ columns, rows, rowKey, cells }: GlassTableProps) {
  return (
    <div className="lu-table-wrap lu-glass">
      <table className="lu-table">
        <thead>
          <tr className="lu-table-head lu-glass">
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align ?? 'left', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? String(row[rowKey]) : i} className="lu-table-row">
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {cells?.[col.key]
                    ? cells[col.key]({ row, value: row[col.key] })
                    : (row[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

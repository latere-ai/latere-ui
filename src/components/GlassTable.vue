<script setup lang="ts">
// A data table with a sticky regular-glass header over scrolling rows. Pass
// `columns` + `rows`; use the `cell-<key>` slots to customize rendering.
// Requires `import 'latere-ui/glass'`.
import type { TableColumn } from '../glass/types';

withDefaults(defineProps<{
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  /** Key to use for the row's :key; falls back to the row index. */
  rowKey?: string;
}>(), {});
</script>

<template>
  <div class="lu-table-wrap lu-glass">
    <table class="lu-table">
      <thead>
        <tr class="lu-table-head lu-glass">
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align ?? 'left', width: col.width }"
          >{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="rowKey ? String(row[rowKey]) : i"
          class="lu-table-row"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align ?? 'left' }"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.lu-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-xl, 28px);
}
.lu-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--fs-body-sm, 13px);
}
.lu-table-head th {
  position: sticky;
  top: 0;
  z-index: 2;
  text-align: left;
  padding: 9px 12px;
  font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted, #999);
  border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  white-space: nowrap;
}
.lu-table-row td {
  padding: 9px 12px;
  color: var(--text, #0a0a0a);
  border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.06));
}
.lu-table-row:hover td { background: var(--accent-subtle, rgba(0, 0, 0, 0.03)); }
</style>

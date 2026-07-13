<script setup lang="ts">
// A data table with a sticky regular-glass header over scrolling rows. Pass
// `columns` + `rows`; use the `cell-<key>` slots to customize rendering.
// Requires `import 'latere-ui/glass'`.
import type { TableColumn } from '../glass/types';
import '../styles/components/glass-table.css';

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

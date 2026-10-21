<script setup lang="ts" generic="Row extends { id: string | number }">
import type { TableColumn } from '~/types/ui';

defineProps<{
  columns: TableColumn[];
  rows: Row[];
  loading?: boolean;
  emptyTitle?: string;
  emptyIcon?: string;
}>();

defineSlots<{
  [key: `cell-${string}`]: (props: { row: Row; index: number }) => unknown;
  empty?: () => unknown;
}>();
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :style="{ inlineSize: column.width, textAlign: column.align ?? 'start' }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="loading && !rows.length">
        <tr v-for="n in 5" :key="n" class="table__skeleton">
          <td v-for="column in columns" :key="column.key"><span class="skeleton" /></td>
        </tr>
      </tbody>
      <TransitionGroup v-else name="list" tag="tbody" :class="{ 'is-stale': loading }">
        <tr v-for="(row, index) in rows" :key="row.id">
          <td
            v-for="column in columns"
            :key="column.key"
            :data-label="column.label"
            :class="{ 'hide-sm': column.hideMobile }"
            :style="{ textAlign: column.align ?? 'start' }"
          >
            <slot :name="`cell-${column.key}`" :row="row" :index="index">
              {{ (row as Record<string, unknown>)[column.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </TransitionGroup>
    </table>
    <div v-if="!loading && !rows.length" class="table__empty">
      <slot name="empty">
        <BaseEmptyState compact :icon="emptyIcon ?? 'ph:tray'" :title="emptyTitle ?? 'لا توجد بيانات'" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
.table {
  inline-size: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.table th {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border-block-end: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--color-text-muted);
  white-space: nowrap;
}
.table td {
  padding: var(--space-3) var(--space-4);
  border-block-end: 1px solid var(--color-border);
  vertical-align: middle;
}
.table tbody tr {
  transition: background-color var(--duration-fast) ease;
}
.table tbody tr:hover {
  background: var(--color-primary-softer);
}
.table tbody tr:last-child td {
  border-block-end: none;
}
.table__skeleton .skeleton {
  display: block;
  block-size: 1rem;
}
.is-stale {
  opacity: 0.55;
}
.table__empty {
  border-block-start: 1px solid var(--color-border);
}

/* Phones: every row becomes a labelled card. */
@media (max-width: 767.98px) {
  .table thead {
    display: none;
  }
  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
  }
  .table tr {
    padding: var(--space-3) var(--space-4);
    border-block-end: 1px solid var(--color-border);
  }
  .table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-1) 0;
    border: none;
    text-align: end !important;
  }
  .table td::before {
    content: attr(data-label);
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-weight: var(--weight-bold);
    color: var(--color-text-subtle);
  }
  .table td.hide-sm {
    display: none;
  }
}
</style>

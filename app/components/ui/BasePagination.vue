<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';

const page = defineModel<number>('page', { required: true });

const props = withDefaults(
  defineProps<{
    totalPages: number;
    /** When given, pages render as crawlable links instead of buttons. */
    linkFor?: (page: number) => RouteLocationRaw;
    siblings?: number;
  }>(),
  { siblings: 1 },
);

const { t } = useI18n();

interface Item {
  key: string;
  page: number | null;
  label?: string;
  icon?: string;
  ariaLabel?: string;
  active?: boolean;
}

/** ‹ 1 … 4 5 [6] 7 8 … 20 › */
const items = computed<Item[]>(() => {
  const total = props.totalPages;
  const current = page.value;
  const range = new Set<number>([1, total]);
  for (let p = current - props.siblings; p <= current + props.siblings; p++) {
    if (p >= 1 && p <= total) range.add(p);
  }
  const sorted = [...range].sort((a, b) => a - b);

  const out: Item[] = [
    { key: 'prev', page: current > 1 ? current - 1 : null, icon: 'ph:caret-left', ariaLabel: t('common.previous') },
  ];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push({ key: `gap-${p}`, page: null, label: '…' });
    out.push({ key: `p-${p}`, page: p, label: String(p), active: p === current });
  });
  out.push({ key: 'next', page: current < total ? current + 1 : null, icon: 'ph:caret-right', ariaLabel: t('common.next') });
  return out;
});

function go(target: number | null) {
  if (target === null || target === page.value) return;
  page.value = target;
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" :aria-label="t('common.pagination')">
    <template v-for="item in items" :key="item.key">
      <span v-if="item.label === '…'" class="pagination__gap" aria-hidden="true">…</span>
      <NuxtLink
        v-else-if="linkFor && item.page !== null"
        :to="linkFor(item.page)"
        class="pagination__item"
        :class="{ 'is-active': item.active }"
        :aria-current="item.active ? 'page' : undefined"
        :aria-label="item.ariaLabel"
      >
        <Icon v-if="item.icon" :name="item.icon" class="flip-rtl" />
        <template v-else>{{ item.label }}</template>
      </NuxtLink>
      <button
        v-else
        type="button"
        class="pagination__item"
        :class="{ 'is-active': item.active }"
        :disabled="item.page === null"
        :aria-current="item.active ? 'page' : undefined"
        :aria-label="item.ariaLabel"
        @click="go(item.page)"
      >
        <Icon v-if="item.icon" :name="item.icon" class="flip-rtl" />
        <template v-else>{{ item.label }}</template>
      </button>
    </template>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  margin-block-start: var(--space-10);
}
.pagination__item {
  display: grid;
  place-items: center;
  min-inline-size: 2.6rem;
  block-size: 2.6rem;
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    border-color var(--duration-fast) ease;
}
.pagination__item:hover:not(:disabled):not(.is-active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.pagination__item.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-gold);
}
.pagination__item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination__gap {
  color: var(--color-text-subtle);
  padding-inline: var(--space-1);
}
</style>

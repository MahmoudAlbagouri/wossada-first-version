<script setup lang="ts">
import type { CatalogFacets } from '~/types/models';

const props = defineProps<{
  facets: CatalogFacets | null | undefined;
  /** Inside the mobile drawer, which already shows the title. */
  inDrawer?: boolean;
}>();

const { t } = useI18n();
const { price } = useLocalized();
const { state, toggle, update, clear, activeCount } = useCatalogQuery();

const minPrice = ref<number | null>(state.value.min ?? null);
const maxPrice = ref<number | null>(state.value.max ?? null);
watch(
  () => [state.value.min, state.value.max],
  ([min, max]) => {
    minPrice.value = min ?? null;
    maxPrice.value = max ?? null;
  },
);

function applyPrice() {
  let min = minPrice.value ?? undefined;
  let max = maxPrice.value ?? undefined;
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  update({ min, max });
}

const range = computed(() => props.facets?.priceRange);
const hasFacets = computed(() => {
  const f = props.facets;
  return !!f && (f.colors.length || f.sizes.length || f.materials.length || f.brands.length || (f.priceRange?.max ?? 0) > 0);
});
</script>

<template>
  <div class="filters">
    <div class="filters__head">
      <h2 v-if="!inDrawer" class="filters__title"><Icon name="ph:faders" aria-hidden="true" />{{ t('catalog.filters') }}</h2>
      <button v-if="activeCount" type="button" class="filters__clear" @click="clear">{{ t('catalog.clearAll') }}</button>
    </div>

    <slot name="top" />

    <p v-if="!hasFacets" class="filters__empty">{{ t('catalog.noFilters') }}</p>

    <details v-if="range && range.max > 0" class="filters__group" open>
      <summary>{{ t('catalog.price') }}<Icon name="ph:caret-down" aria-hidden="true" /></summary>
      <form class="filters__price" @submit.prevent="applyPrice">
        <BaseInput v-model="minPrice" type="number" :min="0" :placeholder="price(range.min)" :label="t('catalog.from')" inputmode="numeric" />
        <BaseInput v-model="maxPrice" type="number" :min="0" :placeholder="price(range.max)" :label="t('catalog.to')" inputmode="numeric" />
        <BaseButton type="submit" variant="secondary" size="sm" block>{{ t('catalog.apply') }}</BaseButton>
      </form>
    </details>

    <details v-if="facets?.colors.length" class="filters__group" open>
      <summary>{{ t('catalog.colors') }}<Icon name="ph:caret-down" aria-hidden="true" /></summary>
      <div class="filters__swatches">
        <button
          v-for="color in facets.colors"
          :key="color.id"
          type="button"
          class="swatch"
          :class="{ 'is-active': state.colors.includes(color.id) }"
          :style="{ '--swatch': color.hex }"
          :aria-pressed="state.colors.includes(color.id)"
          :aria-label="color.name ?? color.hex"
          :title="color.name ?? color.hex"
          @click="toggle('colors', color.id)"
        >
          <Icon v-if="state.colors.includes(color.id)" name="ph:check-bold" class="swatch__tick" />
        </button>
      </div>
    </details>

    <details v-if="facets?.sizes.length" class="filters__group" open>
      <summary>{{ t('catalog.sizes') }}<Icon name="ph:caret-down" aria-hidden="true" /></summary>
      <div class="filters__chips">
        <button
          v-for="size in facets.sizes"
          :key="size.id"
          type="button"
          class="chip"
          :class="{ 'is-active': state.sizes.includes(size.id) }"
          :aria-pressed="state.sizes.includes(size.id)"
          @click="toggle('sizes', size.id)"
        >
          {{ size.value ?? size.type }}
        </button>
      </div>
    </details>

    <details v-if="facets?.materials.length" class="filters__group" open>
      <summary>{{ t('catalog.materials') }}<Icon name="ph:caret-down" aria-hidden="true" /></summary>
      <div class="filters__list">
        <BaseCheckbox
          v-for="material in facets.materials"
          :key="material.id"
          :model-value="state.materials.includes(material.id)"
          :label="material.name ?? '—'"
          @update:model-value="toggle('materials', material.id)"
        />
      </div>
    </details>

    <details v-if="facets?.brands.length" class="filters__group" open>
      <summary>{{ t('catalog.brands') }}<Icon name="ph:caret-down" aria-hidden="true" /></summary>
      <div class="filters__list">
        <BaseCheckbox
          v-for="brand in facets.brands"
          :key="brand.id"
          :model-value="state.brands.includes(brand.id)"
          :label="brand.name ?? '—'"
          @update:model-value="toggle('brands', brand.id)"
        />
      </div>
    </details>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.filters__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block-end: var(--space-3);
}
.filters__head:empty {
  display: none;
}
.filters__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
}
.filters__clear {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}
.filters__empty {
  color: var(--color-text-subtle);
  font-size: var(--text-sm);
}
.filters__group {
  border-block-start: 1px solid var(--color-border);
  padding-block: var(--space-4);
}
.filters__group summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--weight-bold);
  cursor: pointer;
  list-style: none;
}
.filters__group summary::-webkit-details-marker {
  display: none;
}
.filters__group summary :deep(svg),
.filters__group summary > :last-child {
  transition: transform var(--duration-base) var(--ease-out);
}
.filters__group[open] summary > :last-child {
  transform: rotate(180deg);
}
.filters__group > :not(summary) {
  margin-block-start: var(--space-4);
  animation: fade-up var(--duration-base) var(--ease-out);
}
.filters__price {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.filters__price > :last-child {
  grid-column: 1 / -1;
}
.filters__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.swatch {
  display: grid;
  place-items: center;
  inline-size: 2.1rem;
  block-size: 2.1rem;
  border-radius: 50%;
  background: var(--swatch);
  box-shadow:
    inset 0 0 0 1px rgb(0 0 0 / 0.12),
    0 0 0 2px var(--color-surface),
    0 0 0 3px transparent;
  transition:
    box-shadow var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch.is-active {
  box-shadow:
    inset 0 0 0 1px rgb(0 0 0 / 0.12),
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-primary);
}
.swatch__tick {
  color: #fff;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.6));
}
.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.chip {
  min-inline-size: 2.75rem;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition:
    border-color var(--duration-fast) ease,
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.chip:hover {
  border-color: var(--color-primary);
}
.chip.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.filters__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-block-size: 16rem;
  overflow-y: auto;
}
</style>

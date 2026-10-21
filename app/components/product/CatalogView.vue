<script setup lang="ts">
import type { CatalogResult, ProductSort } from '~/types/models';

const props = defineProps<{
  result: CatalogResult | null | undefined;
  pending: boolean;
}>();

const { t } = useI18n();
const { number } = useLocalized();
const { state, update, activeCount, clear, pageLink } = useCatalogQuery();
const filtersOpen = ref(false);
const resultsTop = ref<HTMLElement | null>(null);

const products = computed(() => props.result?.data ?? []);
const meta = computed(() => props.result?.meta);
const sortOptions = computed(() =>
  PRODUCT_SORTS.map((value) => ({ value, label: t(`catalog.sort.${value}`) })),
);

const sort = computed({
  get: () => state.value.sort,
  set: (value: ProductSort | '' | null | undefined) => update({ sort: value || undefined }),
});

const page = computed({
  get: () => state.value.page,
  set: (value: number) => update({ page: value }),
});

// Bring the grid back into view when paging.
watch(
  () => state.value.page,
  () => {
    if (!import.meta.client || !resultsTop.value) return;
    const top = resultsTop.value.getBoundingClientRect().top + window.scrollY - 140;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  },
);
</script>

<template>
  <div class="catalog">
    <aside class="catalog__aside hide-mobile">
      <div class="catalog__aside-inner">
        <ProductFilters :facets="result?.filters">
          <template #top><slot name="aside" /></template>
        </ProductFilters>
      </div>
    </aside>

    <div ref="resultsTop" class="catalog__main">
      <div class="catalog__toolbar">
        <p class="catalog__count" aria-live="polite">
          <template v-if="meta">{{ t('catalog.results', { count: number(meta.totalItems) }, meta.totalItems) }}</template>
        </p>
        <BaseButton
          class="hide-desktop"
          variant="outline"
          size="sm"
          icon="ph:faders"
          @click="filtersOpen = true"
        >
          {{ t('catalog.filters') }}<span v-if="activeCount" class="catalog__badge">{{ activeCount }}</span>
        </BaseButton>
        <BaseSelect v-model="sort" :options="sortOptions" icon="ph:sort-ascending" class="catalog__sort" />
      </div>

      <ProductGrid :products="products" :loading="pending" :skeletons="12" />

      <BaseEmptyState
        v-if="!pending && !products.length"
        icon="ph:magnifying-glass"
        :title="t('catalog.emptyTitle')"
        :description="t('catalog.emptyText')"
      >
        <BaseButton v-if="activeCount" variant="outline" @click="clear">{{ t('catalog.clearAll') }}</BaseButton>
        <BaseButton v-else to="/products">{{ t('nav.allProducts') }}</BaseButton>
      </BaseEmptyState>

      <BasePagination v-if="meta" v-model:page="page" :total-pages="meta.totalPages" :link-for="pageLink" />
    </div>

    <BaseDrawer v-model="filtersOpen" side="end" :title="t('catalog.filters')">
      <ProductFilters :facets="result?.filters" in-drawer>
        <template #top><slot name="aside" /></template>
      </ProductFilters>
      <template #footer>
        <BaseButton block @click="filtersOpen = false">
          {{ meta ? t('catalog.showResults', { count: number(meta.totalItems) }) : t('common.close') }}
        </BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<style scoped>
.catalog {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}
@media (min-width: 1024px) {
  .catalog {
    grid-template-columns: 270px minmax(0, 1fr);
  }
}
.catalog__aside-inner {
  position: sticky;
  inset-block-start: calc(var(--header-height) + 3rem + var(--space-4));
  max-block-size: calc(100dvh - var(--header-height) - 5rem);
  overflow-y: auto;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  scrollbar-width: thin;
}
.catalog__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-block-end: var(--space-5);
}
.catalog__count {
  margin-inline-end: auto;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.catalog__sort {
  min-inline-size: 13rem;
}
.catalog__sort :deep(.field__control) {
  min-block-size: 2.5rem;
  border-radius: var(--radius-full);
}
.catalog__sort :deep(.field__select) {
  min-block-size: 2.4rem;
  font-size: var(--text-sm);
}
.catalog__badge {
  display: inline-grid;
  place-items: center;
  min-inline-size: 1.25rem;
  block-size: 1.25rem;
  margin-inline-start: var(--space-1);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--text-2xs);
}
@media (max-width: 640px) {
  .catalog__count {
    inline-size: 100%;
  }
  .catalog__sort {
    flex: 1;
    min-inline-size: 0;
  }
}
</style>

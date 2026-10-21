<script setup lang="ts">
const { t, locale } = useI18n();
const catalog = useCatalogService();
const { state, apiQuery, activeCount } = useCatalogQuery();

const { data, status } = await useAsyncData('products', () => catalog.listProducts(apiQuery.value), {
  watch: [apiQuery, locale],
});

const title = computed(() => (state.value.q ? t('catalog.searchTitle', { q: state.value.q }) : t('catalog.allProducts')));

usePageSeo(() => ({
  title: title.value,
  description: t('catalog.allProductsDescription'),
  // Search results and filter combinations are not pages of their own.
  noindex: !!state.value.q || activeCount.value > 0,
}));
</script>

<template>
  <div>
    <PageHeader
      :title="title"
      :description="state.q ? null : t('catalog.allProductsDescription')"
      :crumbs="[{ label: t('catalog.allProducts'), to: state.q ? '/products' : undefined }, ...(state.q ? [{ label: state.q }] : [])]"
    />
    <div class="container">
      <CatalogView :result="data" :pending="status === 'pending'" />
    </div>
  </div>
</template>

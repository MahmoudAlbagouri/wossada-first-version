<script setup lang="ts">
const route = useRoute();
const { t, locale } = useI18n();
const catalog = useCatalogService();
const { apiQuery, activeCount } = useCatalogQuery();

const slug = computed(() => String(route.params.slug));

const { data, status, error } = await useAsyncData(
  () => `category-${slug.value}`,
  () => catalog.getCategoryPage(slug.value, apiQuery.value),
  { watch: [apiQuery, locale] },
);
failPage(error.value);

const category = computed(() => data.value?.category);

const crumbs = computed(() => {
  const c = category.value;
  if (!c) return [];
  return [
    ...(c.parent ? [{ label: c.parent.name, to: `/category/${c.parent.slug}` }] : []),
    { label: c.name },
  ];
});

usePageSeo(() => ({
  title: category.value?.metaTitle || category.value?.name,
  description: category.value?.metaDescription || category.value?.description || t('catalog.categoryDescription', { name: category.value?.name ?? '' }),
  image: category.value?.ogImage || category.value?.image,
  noindex: activeCount.value > 0,
}));

useJsonLd(
  () =>
    category.value
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.value.name,
          description: category.value.description ?? undefined,
          numberOfItems: data.value?.meta.totalItems,
        }
      : null,
  'collection',
);
</script>

<template>
  <div v-if="category">
    <PageHeader :title="category.name" :description="category.description" :crumbs="crumbs" :image="category.image">
      <nav v-if="category.children.length" class="subcats scroller" :aria-label="t('catalog.subcategories')">
        <NuxtLink v-for="child in category.children" :key="child.id" :to="`/category/${child.slug}`" class="subcats__chip">
          <BaseImage v-if="child.image" :src="child.image" :alt="child.name" :width="40" :height="40" ratio="1" class="subcats__img" />
          {{ child.name }}
        </NuxtLink>
      </nav>
    </PageHeader>

    <div class="container">
      <CatalogView :result="data" :pending="status === 'pending'">
        <template v-if="category.parent || category.children.length" #aside>
          <div class="aside-cats">
            <NuxtLink v-if="category.parent" :to="`/category/${category.parent.slug}`" class="aside-cats__back">
              <Icon name="ph:arrow-left" class="flip-rtl" aria-hidden="true" />{{ category.parent.name }}
            </NuxtLink>
            <NuxtLink v-for="child in category.children" :key="child.id" :to="`/category/${child.slug}`" class="aside-cats__link">
              {{ child.name }}
            </NuxtLink>
          </div>
        </template>
      </CatalogView>
    </div>
  </div>
</template>

<style scoped>
.subcats {
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}
.subcats__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-4) var(--space-1) var(--space-1);
  padding-inline: var(--space-1) var(--space-4);
  min-block-size: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition:
    border-color var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-out);
}
.subcats__chip:not(:has(.subcats__img)) {
  padding-inline: var(--space-4);
}
.subcats__chip:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.subcats__img {
  inline-size: 2rem;
  border-radius: 50%;
}
.aside-cats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-block-end: var(--space-4);
}
.aside-cats__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-end: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
.aside-cats__link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: background-color var(--duration-fast) ease;
}
.aside-cats__link:hover {
  background: var(--color-primary-softer);
  color: var(--color-primary);
}
</style>

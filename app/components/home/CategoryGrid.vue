<script setup lang="ts">
import type { CategoryCard } from '~/types/models';

defineProps<{ categories: CategoryCard[]; title?: string }>();

const { t } = useI18n();
</script>

<template>
  <section v-if="categories.length" class="cats">
    <div class="section-heading">
      <div v-reveal>
        <span class="eyebrow">{{ t('home.categoriesEyebrow') }}</span>
        <h2 class="title-lg">{{ title || t('home.shopByCategory') }}</h2>
      </div>
      <NuxtLink to="/products" class="cats__all">
        {{ t('common.viewAll') }}<Icon name="ph:arrow-right" class="flip-rtl" aria-hidden="true" />
      </NuxtLink>
    </div>

    <ul class="cats__list scroller">
      <li v-for="(category, index) in categories" :key="category.id" v-reveal="index * 60" class="cats__item">
        <NuxtLink :to="`/category/${category.slug}`" class="cats__card">
          <span class="cats__media">
            <BaseImage :src="category.image" :alt="category.name" :width="240" :height="240" ratio="1" sizes="xs:40vw md:20vw lg:15vw" />
          </span>
          <span class="cats__name">{{ category.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.cats__all {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  white-space: nowrap;
}
.cats__list {
  gap: clamp(0.75rem, 0.5rem + 1.5vw, 1.75rem);
  margin-inline: calc(var(--gutter) * -1);
  padding-inline: var(--gutter);
  padding-block: var(--space-2);
}
.cats__item {
  inline-size: clamp(7rem, 26vw, 10rem);
}
@media (min-width: 1024px) {
  .cats__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    overflow: visible;
    margin-inline: 0;
    padding-inline: 0;
  }
  .cats__item {
    inline-size: auto;
  }
}
.cats__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}
.cats__media {
  position: relative;
  display: block;
  inline-size: 100%;
  padding: 6px;
  border-radius: 50%;
  background: conic-gradient(from 180deg, var(--gold-200), var(--gold-500), var(--gold-200));
  transition: transform var(--duration-slow) var(--ease-spring);
}
.cats__media :deep(.img-frame) {
  border-radius: 50%;
  border: 4px solid var(--color-surface);
}
.cats__media :deep(.img-frame__img) {
  transition: transform 0.8s var(--ease-out);
}
.cats__card:hover .cats__media {
  transform: translateY(-6px);
}
.cats__card:hover :deep(.img-frame__img) {
  transform: scale(1.1);
}
.cats__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  transition: color var(--duration-fast) ease;
}
.cats__card:hover .cats__name {
  color: var(--color-primary);
}
</style>

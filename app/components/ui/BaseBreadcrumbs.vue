<script setup lang="ts">
import type { Crumb } from '~/types/ui';

const props = defineProps<{ items: Crumb[] }>();

const { t } = useI18n();
const siteUrl = useSiteUrl();

const crumbs = computed<Crumb[]>(() => [{ label: t('nav.home'), to: '/' }, ...props.items]);

// Breadcrumb rich results in Google.
useJsonLd(
  () => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.value.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.to ? { item: `${siteUrl}${crumb.to}` } : {}),
    })),
  }),
  'breadcrumbs',
);
</script>

<template>
  <nav class="crumbs" :aria-label="t('common.breadcrumbs')">
    <ol class="crumbs__list">
      <li v-for="(crumb, index) in crumbs" :key="index" class="crumbs__item">
        <NuxtLink v-if="crumb.to && index < crumbs.length - 1" :to="crumb.to" class="crumbs__link">
          <Icon v-if="index === 0" name="ph:house" aria-hidden="true" />
          {{ crumb.label }}
        </NuxtLink>
        <span v-else aria-current="page" class="crumbs__current line-clamp-1">{{ crumb.label }}</span>
        <Icon v-if="index < crumbs.length - 1" name="ph:caret-right" class="crumbs__sep flip-rtl" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}
.crumbs__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-inline-size: 0;
}
.crumbs__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  transition: color var(--duration-fast) ease;
}
.crumbs__link:hover {
  color: var(--color-primary);
}
.crumbs__current {
  color: var(--color-text);
  font-weight: var(--weight-semibold);
  max-inline-size: 40ch;
}
.crumbs__sep {
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>

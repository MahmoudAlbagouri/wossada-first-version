<script setup lang="ts">
import type { Crumb } from '~/types/ui';

defineProps<{
  title: string;
  description?: string | null;
  crumbs?: Crumb[];
  /** Optional background image (category banners). */
  image?: string | null;
}>();
</script>

<template>
  <header class="page-header" :class="{ 'page-header--image': image }">
    <BaseImage v-if="image" :src="image" :alt="title" :width="1600" :height="400" sizes="xs:100vw" priority class="page-header__bg" />
    <div class="container page-header__inner">
      <BaseBreadcrumbs v-if="crumbs" :items="crumbs" />
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="description" class="page-header__description">{{ description }}</p>
      <slot />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  position: relative;
  padding-block: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  margin-block-end: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  background:
    radial-gradient(circle at 90% 0%, var(--gold-100), transparent 40%),
    linear-gradient(180deg, var(--color-surface-muted), var(--color-bg));
  border-block-end: 1px solid var(--color-border);
  overflow: hidden;
}
.page-header__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: fade-up 0.6s var(--ease-out);
}
.page-header__title {
  font-size: var(--text-4xl);
  font-weight: var(--weight-black);
  line-height: var(--leading-tight);
}
.page-header__description {
  max-inline-size: 70ch;
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}
.page-header--image {
  padding-block: clamp(3rem, 2rem + 5vw, 6rem);
  color: #fff;
  border: none;
}
.page-header__bg {
  position: absolute !important;
  inset: 0;
  block-size: 100%;
}
.page-header--image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(28 25 20 / 0.75), rgb(28 25 20 / 0.35));
}
.page-header--image .page-header__inner {
  z-index: 1;
}
.page-header--image .page-header__description,
.page-header--image :deep(.crumbs__list),
.page-header--image :deep(.crumbs__current) {
  color: rgb(255 255 255 / 0.85);
}
</style>

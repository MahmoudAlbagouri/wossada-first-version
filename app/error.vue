<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const { t } = useI18n();
const { brandName } = useBrand();

const is404 = computed(() => props.error.statusCode === 404);

useHead({
  title: () => (is404.value ? t('errorPage.notFoundTitle') : t('errorPage.title')),
  titleTemplate: (title?: string) => `${title} | ${brandName.value}`,
});
useSeoMeta({ robots: 'noindex, nofollow' });

const goHome = () => clearError({ redirect: '/' });
</script>

<template>
  <NuxtLayout>
    <section class="container error">
      <div class="error__code" aria-hidden="true">{{ error.statusCode || 500 }}</div>
      <div class="error__icon" aria-hidden="true">
        <Icon :name="is404 ? 'ph:magnifying-glass' : 'ph:plug-charging'" />
      </div>
      <h1 class="error__title">{{ is404 ? t('errorPage.notFoundTitle') : t('errorPage.title') }}</h1>
      <p class="error__text">{{ is404 ? t('errorPage.notFoundText') : t('errorPage.text') }}</p>
      <div class="error__actions">
        <BaseButton icon="ph:house" @click="goHome">{{ t('errorPage.home') }}</BaseButton>
        <BaseButton variant="outline" icon="ph:storefront" @click="clearError({ redirect: '/products' })">
          {{ t('nav.allProducts') }}
        </BaseButton>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.error {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding-block: clamp(3rem, 2rem + 6vw, 7rem);
}
.error__code {
  position: absolute;
  inset-block-start: 50%;
  inset-inline: 0;
  transform: translateY(-60%);
  font-size: clamp(8rem, 5rem + 18vw, 16rem);
  font-weight: var(--weight-black);
  line-height: 1;
  color: var(--color-primary-soft);
  z-index: -1;
  user-select: none;
}
.error__icon {
  display: grid;
  place-items: center;
  inline-size: 5rem;
  block-size: 5rem;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  color: var(--color-primary);
  font-size: 2.4rem;
  animation: float 4s ease-in-out infinite;
}
.error__title {
  font-size: var(--text-3xl);
}
.error__text {
  max-inline-size: 46ch;
  color: var(--color-text-muted);
}
.error__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-block-start: var(--space-4);
}
</style>

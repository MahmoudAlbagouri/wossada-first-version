<script setup lang="ts">
const localeHead = useLocaleHead();
const { brandName, tagline } = useBrand();
const { t } = useI18n();

useHead({
  htmlAttrs: {
    lang: () => localeHead.value.htmlAttrs?.lang,
    dir: () => localeHead.value.htmlAttrs?.dir as 'ltr' | 'rtl' | undefined,
  },
  meta: () => localeHead.value.meta ?? [],
  titleTemplate: (title?: string) => (title ? `${title} | ${brandName.value}` : `${brandName.value} — ${tagline.value}`),
});
</script>

<template>
  <a href="#main" class="skip-link">{{ t('common.skipToContent') }}</a>
  <NuxtLoadingIndicator color="#b18a3c" :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastHost />
  <ConfirmHost />
</template>

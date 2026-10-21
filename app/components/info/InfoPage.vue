<script setup lang="ts">
/**
 * Text pages (about, policies) rendered from `info.<page>` in the locale
 * files, so the store owner edits wording in one place per language.
 */
type InfoPageKey = 'about' | 'privacy' | 'terms' | 'shippingReturns';

const props = defineProps<{ page: InfoPageKey }>();

const { t, tm, rt } = useI18n();
const { brandName } = useBrand();

const sections = computed(() =>
  (tm(`info.${props.page}.sections`) as unknown as { title: unknown; body: unknown }[]).map((section) => ({
    title: rt(section.title as Parameters<typeof rt>[0], { brand: brandName.value }),
    body: rt(section.body as Parameters<typeof rt>[0], { brand: brandName.value }),
  })),
);

const title = computed(() => t(`info.${props.page}.title`));
const intro = computed(() => t(`info.${props.page}.intro`, { brand: brandName.value }));

usePageSeo(() => ({ title: title.value, description: intro.value }));
</script>

<template>
  <div>
    <PageHeader :title="title" :description="intro" :crumbs="[{ label: title }]" />
    <div class="container container--narrow info">
      <section v-for="(section, index) in sections" :key="index" v-reveal="index * 60" class="info__section">
        <h2 class="info__title">{{ section.title }}</h2>
        <p class="info__body">{{ section.body }}</p>
      </section>
      <slot />
      <p class="info__updated text-subtle">{{ t('info.questions') }} <NuxtLink to="/contact">{{ t('nav.contact') }}</NuxtLink></p>
    </div>
  </div>
</template>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}
.info__section {
  padding-inline-start: var(--space-5);
  border-inline-start: 3px solid var(--color-primary-soft);
}
.info__title {
  margin-block-end: var(--space-3);
  font-size: var(--text-xl);
}
.info__body {
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  white-space: pre-line;
}
.info__updated {
  font-size: var(--text-sm);
}
.info__updated a {
  color: var(--color-primary);
  font-weight: var(--weight-bold);
}
</style>

<script setup lang="ts">
import type { HomeSection } from '~/types/models';

const { t, locale } = useI18n();
const catalog = useCatalogService();
const config = useRuntimeConfig();
const { brandName, tagline, brandDescription, logo, contact, social } = useBrand();

const { data: sections } = await useAsyncData('home', () => catalog.getHome(), {
  watch: [locale],
  default: (): HomeSection[] => [],
});

// Until the admin builds the home layout, show the newest products.
const isEmpty = computed(() => !renderableHomeSections(sections.value).length);
const { data: latest } = await useAsyncData(
  'home-latest',
  () => (isEmpty.value ? catalog.listProducts({ limit: 8, sortBy: 'newest' }).then((r) => r.data) : Promise.resolve([])),
  { watch: [locale, isEmpty], default: () => [] },
);

usePageSeo({ description: brandDescription.value });

useJsonLd(
  () => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FurnitureStore',
        '@id': `${config.public.siteUrl}/#store`,
        name: brandName.value,
        description: brandDescription.value,
        url: config.public.siteUrl,
        logo: `${config.public.siteUrl}${logo}`,
        image: `${config.public.siteUrl}${logo}`,
        telephone: contact.phone,
        email: contact.email,
        priceRange: '$$',
        sameAs: Object.values(social).filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': `${config.public.siteUrl}/#website`,
        url: config.public.siteUrl,
        name: brandName.value,
        inLanguage: locale.value,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${config.public.siteUrl}/products?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }),
  'site',
);
</script>

<template>
  <div class="home">
    <h1 class="visually-hidden">{{ brandName }} — {{ tagline }}</h1>

    <HomeSections v-if="!isEmpty" :sections="sections" />

    <template v-else>
      <HeroSlider :sliders="[]" />
      <div class="container section">
        <FeaturesSection />
      </div>
      <div class="container">
        <ProductCarousel :title="t('home.newArrivals')" :eyebrow="t('home.justIn')" :products="latest" view-all-to="/products" />
      </div>
    </template>
  </div>
</template>

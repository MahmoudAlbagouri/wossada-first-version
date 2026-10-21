<script setup lang="ts">
import type { HomeSection } from '~/types/models';

/** Renders the admin-ordered home layout returned by `GET /home`. */
const props = defineProps<{ sections: HomeSection[] }>();

const visibleSections = computed(() => renderableHomeSections(props.sections));

const { pick } = useLocalized();

/** Static sections the storefront knows how to render, by their admin key. */
const STATIC_SECTIONS: Record<string, string> = {
  'features-section': 'FeaturesSection',
  features: 'FeaturesSection',
};
</script>

<template>
  <template v-for="section in visibleSections" :key="section.id">
    <HeroSlider v-if="section.type === 'mainSlider'" :sliders="section.data" />

    <div v-else class="container home-section" :class="`home-section--${section.type}`">
      <CategoryGrid
        v-if="section.type === 'CATEGORY_GRID'"
        :categories="section.data"
        :title="(section.metadata?.title as string | undefined)"
      />

      <template v-else-if="section.type === 'productSlider'">
        <ProductCarousel
          v-for="slider in section.data"
          :key="slider.id"
          :title="pick(slider.translations)?.title ?? ''"
          :products="slider.products ?? []"
          view-all-to="/products"
          class="home-section__carousel"
        />
      </template>

      <PromoBanners v-else-if="section.type === 'fixedBanner'" :banners="section.data" />
      <PromoBanners v-else-if="section.type === 'fullImage'" :banners="section.data" full />

      <template v-else-if="section.type === 'staticSection'">
        <template v-for="block in section.data" :key="block.id">
          <FeaturesSection v-if="STATIC_SECTIONS[block.key] === 'FeaturesSection'" />
        </template>
      </template>
    </div>
  </template>
</template>

<style scoped>
.home-section {
  padding-block: calc(var(--space-section) * 0.5);
}
.home-section__carousel + .home-section__carousel {
  margin-block-start: var(--space-section);
}
</style>

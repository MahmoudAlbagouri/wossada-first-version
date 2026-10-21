<script setup lang="ts">
import type { Product } from '~/types/models';

defineProps<{
  title: string;
  eyebrow?: string;
  products: Product[];
  viewAllTo?: string;
}>();

const { t } = useI18n();
const track = ref<HTMLElement | null>(null);
const { canPrev, canNext, prev, next } = useScroller(track);
</script>

<template>
  <section v-if="products.length" class="carousel">
    <div class="section-heading">
      <div v-reveal>
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2 class="title-lg">{{ title }}</h2>
      </div>
      <div class="carousel__controls">
        <NuxtLink v-if="viewAllTo" :to="viewAllTo" class="carousel__all">
          {{ t('common.viewAll') }}<Icon name="ph:arrow-right" class="flip-rtl" aria-hidden="true" />
        </NuxtLink>
        <div class="carousel__arrows hide-mobile">
          <BaseButton
            variant="outline"
            size="sm"
            icon="ph:caret-left"
            icon-only
            :label="t('common.previous')"
            :disabled="!canPrev"
            @click="prev"
          />
          <BaseButton
            variant="outline"
            size="sm"
            icon="ph:caret-right"
            icon-only
            :label="t('common.next')"
            :disabled="!canNext"
            @click="next"
          />
        </div>
      </div>
    </div>

    <div ref="track" class="scroller carousel__track">
      <div v-for="product in products" :key="product.id" class="carousel__slide">
        <ProductCard :product="product" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel__controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.carousel__arrows {
  display: flex;
  gap: var(--space-2);
}
.carousel__all {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  white-space: nowrap;
}
.carousel__all:hover {
  gap: var(--space-2);
}
.carousel__track {
  --peek: var(--gutter);
  gap: clamp(0.75rem, 0.4rem + 1.4vw, 1.5rem);
  margin-inline: calc(var(--gutter) * -1);
  padding-inline: var(--gutter);
  scroll-padding-inline: var(--gutter);
  padding-block: var(--space-2) var(--space-4);
}
.carousel__slide {
  inline-size: clamp(170px, 44vw, 270px);
}
@media (min-width: 1024px) {
  .carousel__slide {
    inline-size: calc((100% - 3 * 1.5rem) / 4);
  }
}
</style>

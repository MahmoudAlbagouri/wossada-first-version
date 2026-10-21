<script setup lang="ts">
import type { Product } from '~/types/models';

withDefaults(
  defineProps<{
    products: Product[];
    loading?: boolean;
    skeletons?: number;
    /** Eager-load images of the first N cards (above the fold). */
    priorityCount?: number;
  }>(),
  { skeletons: 8, priorityCount: 4 },
);
</script>

<template>
  <div class="product-grid" :aria-busy="loading || undefined">
    <template v-if="loading && !products.length">
      <ProductCardSkeleton v-for="n in skeletons" :key="`s${n}`" />
    </template>
    <template v-else>
      <ProductCard
        v-for="(product, index) in products"
        :key="product.id"
        v-reveal="(index % 4) * 70"
        :product="product"
        :priority="index < priorityCount"
        :class="{ 'is-stale': loading }"
      />
    </template>
  </div>
</template>

<style scoped>
.is-stale {
  opacity: 0.55;
  pointer-events: none;
  transition: opacity var(--duration-base) ease;
}
</style>

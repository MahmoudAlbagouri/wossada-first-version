<script setup lang="ts">
import type { Product } from '~/types/models';

const props = defineProps<{
  product: Product;
  /** First row of a page: load the image eagerly. */
  priority?: boolean;
}>();

const { t } = useI18n();
const { name } = useLocalized();

const url = computed(() => `/product/${props.product.slug}`);
const title = computed(() => name(props.product));
const pricing = computed(() => startingPrice(props.product));
const variesInPrice = computed(() => {
  const prices = new Set(props.product.variants?.map((v) => displayPrice(props.product, v).price));
  return prices.size > 1;
});
const inStock = computed(() => isInStock(props.product));
const hoverImage = computed(() => props.product.defaultGallery?.find((img) => img && img !== props.product.mainImage));
const isNew = computed(() => Date.now() - new Date(props.product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 21);
const brandName = computed(() => (props.product.brand ? name(props.product.brand) : ''));
</script>

<template>
  <article class="pcard" :class="{ 'is-soldout': !inStock }">
    <div class="pcard__media">
      <NuxtLink :to="url" class="pcard__image-link" tabindex="-1" aria-hidden="true">
        <BaseImage
          :src="product.mainImage"
          :alt="title"
          :width="400"
          :height="500"
          ratio="4/5"
          sizes="xs:50vw md:33vw lg:25vw"
          :priority="priority"
          class="pcard__image"
        />
        <BaseImage
          v-if="hoverImage"
          :src="hoverImage"
          :alt="title"
          :width="400"
          :height="500"
          ratio="4/5"
          sizes="xs:50vw md:33vw lg:25vw"
          class="pcard__image pcard__image--hover"
        />
      </NuxtLink>

      <div class="pcard__badges">
        <BaseBadge v-if="!inStock" tone="neutral" solid size="sm">{{ t('product.outOfStock') }}</BaseBadge>
        <BaseBadge v-else-if="pricing.discountPercent" tone="danger" solid size="sm" dir="ltr">-{{ pricing.discountPercent }}%</BaseBadge>
        <BaseBadge v-if="isNew && inStock" tone="primary" solid size="sm">{{ t('product.new') }}</BaseBadge>
      </div>

      <WishlistButton :product-id="product.id" class="pcard__wish" />

      <div v-if="product.isFreeShipping" class="pcard__ribbon">
        <Icon name="ph:truck" aria-hidden="true" />{{ t('product.freeShipping') }}
      </div>
    </div>

    <div class="pcard__body">
      <p v-if="brandName" class="pcard__brand">{{ brandName }}</p>
      <h3 class="pcard__title">
        <NuxtLink :to="url" class="line-clamp-2">{{ title }}</NuxtLink>
      </h3>
      <BaseRating v-if="product.ratingsQuantity" :value="Number(product.ratingsAverage)" :count="product.ratingsQuantity" size="0.85rem" />
      <BasePrice :amount="pricing.price" :compare-at="pricing.compareAt" :from="variesInPrice" class="pcard__price" />
      <AddToCartButton :product="product" size="sm" block class="pcard__cta" />
    </div>
  </article>
</template>

<style scoped>
.pcard {
  position: relative;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition:
    box-shadow var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out),
    border-color var(--duration-base) ease;
}
@media (hover: hover) {
  .pcard:hover {
    transform: translateY(-4px);
    border-color: var(--gold-200);
    box-shadow: var(--shadow-md);
  }
  .pcard:hover .pcard__image:not(.pcard__image--hover) :deep(.img-frame__img) {
    transform: scale(1.05);
  }
  .pcard:hover .pcard__image--hover {
    opacity: 1;
  }
}
.pcard__media {
  position: relative;
  background: var(--color-surface-sunken);
}
.pcard__image-link {
  display: block;
}
.pcard__image--hover {
  position: absolute !important;
  inset: 0;
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
}
.is-soldout .pcard__image {
  filter: grayscale(0.6);
  opacity: 0.75;
}
.pcard__badges {
  position: absolute;
  inset-block-start: var(--space-3);
  inset-inline-start: var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}
.pcard__wish {
  position: absolute;
  inset-block-start: var(--space-2);
  inset-inline-end: var(--space-2);
}
.pcard__ribbon {
  position: absolute;
  inset-inline-start: var(--space-3);
  inset-block-end: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.92);
  color: var(--color-success);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  backdrop-filter: blur(6px);
}
.pcard__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3) var(--space-4);
}
@media (min-width: 768px) {
  .pcard__body {
    padding-inline: var(--space-4);
  }
}
.pcard__brand {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pcard__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: 1.5;
  min-block-size: 3em;
}
.pcard__title a {
  transition: color var(--duration-fast) ease;
}
.pcard__title a:hover {
  color: var(--color-primary);
}
.pcard__title a::after {
  /* Whole card is clickable while the inner buttons stay usable. */
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
}
.pcard__wish,
.pcard__cta {
  z-index: 1;
}
.pcard__price {
  margin-block-start: auto;
}
.pcard__cta {
  position: relative;
}
</style>

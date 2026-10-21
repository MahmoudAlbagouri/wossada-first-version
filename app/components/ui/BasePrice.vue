<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    amount: number;
    /** Regular price, shown struck through when higher than `amount`. */
    compareAt?: number | null;
    size?: 'sm' | 'md' | 'lg';
    /** Prefix "From" for products with several variant prices. */
    from?: boolean;
    showSaving?: boolean;
  }>(),
  { size: 'md' },
);

const { price } = useLocalized();
const { t } = useI18n();
const hasDiscount = computed(() => !!props.compareAt && props.compareAt > props.amount);
</script>

<template>
  <div class="price" :class="`price--${size}`">
    <span v-if="from" class="price__from">{{ t('product.from') }}</span>
    <span class="price__current" :class="{ 'is-sale': hasDiscount }">{{ price(amount) }}</span>
    <del v-if="hasDiscount" class="price__compare">{{ price(compareAt) }}</del>
    <span v-if="hasDiscount && showSaving" class="price__saving">
      {{ t('product.youSave', { amount: price(compareAt! - amount) }) }}
    </span>
  </div>
</template>

<style scoped>
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.6rem;
}
.price__from {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.price__current {
  font-weight: var(--weight-black);
  color: var(--color-text);
  font-size: var(--text-base);
}
.price__current.is-sale {
  color: var(--color-danger);
}
.price__compare {
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
  text-decoration-thickness: 1.5px;
}
.price--sm .price__current {
  font-size: var(--text-sm);
}
.price--sm .price__compare {
  font-size: var(--text-xs);
}
.price--lg .price__current {
  font-size: var(--text-3xl);
}
.price--lg .price__compare {
  font-size: var(--text-lg);
}
.price__saving {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
</style>

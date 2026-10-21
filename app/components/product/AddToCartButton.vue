<script setup lang="ts">
import type { Product } from '~/types/models';

const props = withDefaults(
  defineProps<{
    product: Pick<Product, 'id' | 'slug' | 'variants' | 'baseStock'>;
    variantId?: string | null;
    quantity?: number;
    /** Product page: the variant picker is on screen, so never redirect. */
    inline?: boolean;
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    disabled?: boolean;
  }>(),
  { quantity: 1, size: 'md' },
);

const cart = useCartStore();
const requireAuth = useRequireAuth();
const toast = useToast();
const { t } = useI18n();
const justAdded = ref(false);

const selectedVariant = computed(() => props.product.variants?.find((v) => v.id === props.variantId) ?? null);
const missingOption = computed(() => hasOptions(props.product) && !props.variantId);
/** Cards link to the product page to pick a variant first. */
const needsOptions = computed(() => !props.inline && missingOption.value);
const soldOut = computed(() =>
  missingOption.value ? !isInStock(props.product as Product) : availableStock(props.product, selectedVariant.value) <= 0,
);
const waitingForOption = computed(() => props.inline && missingOption.value);
const loading = computed(() => cart.busy.has(`add:${props.product.id}`));

const label = computed(() => {
  if (soldOut.value) return t('product.outOfStock');
  if (waitingForOption.value) return t('product.selectOptionsFirst');
  if (justAdded.value) return t('cart.addedShort');
  return needsOptions.value ? t('product.chooseOptions') : t('cart.add');
});

async function add() {
  if (needsOptions.value) return navigateTo(`/product/${props.product.slug}`);
  if (!requireAuth()) return;
  try {
    await cart.add(props.product.id, props.quantity, props.variantId);
    justAdded.value = true;
    setTimeout(() => (justAdded.value = false), 1600);
    toast.success(t('cart.added'), { action: { label: t('cart.view'), to: '/cart' } });
  } catch (error) {
    toast.fromError(error);
  }
}
</script>

<template>
  <BaseButton
    :size="size"
    :block="block"
    :variant="needsOptions ? 'outline' : 'primary'"
    :loading="loading"
    :disabled="disabled || soldOut || waitingForOption"
    :icon="justAdded ? 'ph:check-bold' : needsOptions ? 'ph:sliders-horizontal' : 'ph:shopping-bag-open'"
    class="add-to-cart"
    :class="{ 'is-added': justAdded }"
    @click.prevent.stop="add"
  >
    {{ label }}
  </BaseButton>
</template>

<style scoped>
.add-to-cart.is-added {
  animation: pop var(--duration-slow) var(--ease-spring);
}
</style>

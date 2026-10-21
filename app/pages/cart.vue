<script setup lang="ts">
import type { CartLine } from '~/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const { name, price } = useLocalized();
const cart = useCartStore();
const toast = useToast();
const { confirm } = useConfirm();
const freeShippingThreshold = useRuntimeConfig().public.freeShippingThreshold;

usePageSeo({ title: t('cart.title'), noindex: true });

onMounted(() => {
  if (!cart.loaded) cart.fetch().catch((error) => toast.fromError(error));
});

/** "Red / 160×200 / Oak" */
function variantLabel(line: CartLine): string {
  const v = line.productVariant;
  if (!v) return '';
  return [v.color, v.size, v.material]
    .filter((value): value is NonNullable<typeof value> => !!value)
    .map((value) => name(value))
    .join(' / ');
}

async function changeQuantity(line: CartLine, quantity: number) {
  try {
    await cart.update(line.id, quantity);
  } catch (error) {
    toast.fromError(error);
  }
}

async function remove(line: CartLine) {
  try {
    await cart.remove(line.id);
    toast.info(t('cart.removed', { name: line.product.name }));
  } catch (error) {
    toast.fromError(error);
  }
}

async function clearAll() {
  const ok = await confirm({ title: t('cart.clearConfirm'), message: t('cart.clearConfirmText'), tone: 'danger', confirmText: t('cart.clear') });
  if (!ok) return;
  try {
    await cart.clear();
  } catch (error) {
    toast.fromError(error);
  }
}

const freeShippingLeft = computed(() => Math.max(0, freeShippingThreshold - cart.cart.total));
const freeShippingProgress = computed(() =>
  freeShippingThreshold > 0 ? Math.min(100, (cart.cart.total / freeShippingThreshold) * 100) : 0,
);
</script>

<template>
  <div>
    <PageHeader :title="t('cart.title')" :crumbs="[{ label: t('cart.title') }]">
      <p v-if="!cart.isEmpty" class="text-muted">{{ t('cart.itemsCount', { count: cart.count }, cart.count) }}</p>
    </PageHeader>

    <div class="container">
      <div v-if="!cart.loaded" class="cart-layout">
        <div class="stack">
          <div v-for="n in 3" :key="n" class="skeleton" style="block-size: 8rem; border-radius: var(--radius-lg)" />
        </div>
        <div class="skeleton" style="block-size: 18rem; border-radius: var(--radius-lg)" />
      </div>

      <BaseEmptyState
        v-else-if="cart.isEmpty"
        icon="ph:shopping-bag-open"
        :title="t('cart.emptyTitle')"
        :description="t('cart.emptyText')"
      >
        <BaseButton to="/products" icon-end="ph:arrow-right">{{ t('cart.startShopping') }}</BaseButton>
      </BaseEmptyState>

      <div v-else class="cart-layout">
        <section class="cart-lines" :aria-label="t('cart.items')">
          <BaseAlert v-if="cart.hasUnavailable" tone="warning" :title="t('cart.unavailableTitle')">
            {{ t('cart.unavailableText') }}
          </BaseAlert>

          <TransitionGroup name="list" tag="ul" class="cart-lines__list">
            <li
              v-for="line in cart.items"
              :key="line.id"
              class="line card"
              :class="{ 'is-unavailable': !line.isAvailable, 'is-busy': cart.busy.has(line.id) }"
            >
              <NuxtLink :to="`/product/${line.product.slug}`" class="line__media">
                <BaseImage :src="line.product.mainImage" :alt="line.product.name" :width="160" :height="160" ratio="1" rounded />
              </NuxtLink>

              <div class="line__info">
                <NuxtLink :to="`/product/${line.product.slug}`" class="line__name line-clamp-2">{{ line.product.name }}</NuxtLink>
                <p v-if="variantLabel(line)" class="line__variant">{{ variantLabel(line) }}</p>
                <BasePrice :amount="line.effectivePrice" :compare-at="line.unitPrice" size="sm" />
                <p v-if="!line.isAvailable" class="line__warning">
                  <Icon name="ph:warning-circle" aria-hidden="true" />
                  {{ line.availableStock > 0 ? t('cart.onlyAvailable', { count: line.availableStock }) : t('product.outOfStock') }}
                </p>
              </div>

              <div class="line__actions">
                <BaseQuantity
                  :model-value="line.quantity"
                  :max="Math.max(1, Math.min(line.availableStock, 100))"
                  :loading="cart.busy.has(line.id)"
                  size="sm"
                  @update:model-value="changeQuantity(line, $event)"
                />
                <strong class="line__total">{{ price(line.subTotal) }}</strong>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  icon="ph:trash"
                  icon-only
                  :label="t('cart.remove')"
                  class="line__remove"
                  @click="remove(line)"
                />
              </div>
            </li>
          </TransitionGroup>

          <div class="cart-lines__footer">
            <BaseButton to="/products" variant="link" icon="ph:arrow-left">{{ t('cart.continueShopping') }}</BaseButton>
            <BaseButton variant="ghost" size="sm" icon="ph:trash" :loading="cart.busy.has('clear')" @click="clearAll">
              {{ t('cart.clear') }}
            </BaseButton>
          </div>
        </section>

        <aside class="summary card card-pad">
          <h2 class="summary__title">{{ t('cart.summary') }}</h2>

          <div v-if="freeShippingThreshold > 0" class="summary__shipping">
            <p v-if="freeShippingLeft > 0">{{ t('cart.freeShippingLeft', { amount: price(freeShippingLeft) }) }}</p>
            <p v-else class="text-primary"><Icon name="ph:confetti" aria-hidden="true" /> {{ t('cart.freeShippingUnlocked') }}</p>
            <div class="summary__bar"><span :style="{ inlineSize: `${freeShippingProgress}%` }" /></div>
          </div>

          <dl class="summary__rows">
            <div>
              <dt>{{ t('cart.subtotal') }}</dt>
              <dd>{{ price(cart.cart.originalTotal) }}</dd>
            </div>
            <div v-if="cart.cart.savings > 0" class="summary__saving">
              <dt>{{ t('cart.savings') }}</dt>
              <dd>-{{ price(cart.cart.savings) }}</dd>
            </div>
            <div>
              <dt>{{ t('cart.shipping') }}</dt>
              <dd class="text-subtle">{{ t('cart.shippingAtCheckout') }}</dd>
            </div>
            <div class="summary__total">
              <dt>{{ t('cart.total') }}</dt>
              <dd>{{ price(cart.cart.total) }}</dd>
            </div>
          </dl>

          <BaseButton to="/checkout" size="lg" block icon-end="ph:arrow-right" :disabled="cart.hasUnavailable">
            {{ t('cart.checkout') }}
          </BaseButton>
          <p class="summary__secure"><Icon name="ph:lock-simple" aria-hidden="true" />{{ t('cart.secure') }}</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-layout {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
@media (min-width: 1024px) {
  .cart-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
  .summary {
    position: sticky;
    inset-block-start: calc(var(--header-height) + 4rem);
  }
}
.cart-lines {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.cart-lines__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.line {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-4);
  transition: opacity var(--duration-base) ease;
}
@media (min-width: 640px) {
  .line {
    grid-template-columns: 7rem minmax(0, 1fr) auto;
    align-items: center;
  }
}
.line.is-busy {
  opacity: 0.6;
}
.line.is-unavailable {
  border-color: var(--color-warning);
  background: var(--color-warning-soft);
}
.line__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-inline-size: 0;
}
.line__name {
  font-weight: var(--weight-bold);
}
.line__name:hover {
  color: var(--color-primary);
}
.line__variant {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.line__warning {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--color-warning);
}
.line__actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
@media (min-width: 640px) {
  .line__actions {
    grid-column: auto;
  }
}
.line__total {
  min-inline-size: 6rem;
  margin-inline-start: auto;
  text-align: end;
}
.line__remove:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.cart-lines__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.summary__title {
  font-size: var(--text-xl);
}
.summary__shipping {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary-softer);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.summary__bar {
  block-size: 0.45rem;
  border-radius: var(--radius-full);
  background: var(--gold-100);
  overflow: hidden;
}
.summary__bar span {
  display: block;
  block-size: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--gold-400), var(--gold-600));
  transition: inline-size 0.8s var(--ease-out);
}
.summary__rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.summary__rows div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.summary__rows dt {
  color: var(--color-text-muted);
}
.summary__rows dd {
  font-weight: var(--weight-semibold);
}
.summary__saving dd {
  color: var(--color-success);
}
.summary__total {
  padding-block-start: var(--space-3);
  border-block-start: 1px dashed var(--color-border);
  font-size: var(--text-lg);
}
.summary__total dt {
  color: var(--color-text) !important;
  font-weight: var(--weight-bold);
}
.summary__total dd {
  font-weight: var(--weight-black) !important;
}
.summary__secure {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
</style>

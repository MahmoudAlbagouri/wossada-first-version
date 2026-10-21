<script setup lang="ts">
import type { Address, CheckoutPreview, PaymentMethod } from '~/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const { price } = useLocalized();
const shop = useShopService();
const cart = useCartStore();
const toast = useToast();

usePageSeo({ title: t('checkout.title'), noindex: true });

const addresses = ref<Address[]>([]);
const addressId = ref<string | null>(null);
const loading = ref(true);
const addressModal = ref(false);
const editing = ref<Address | null>(null);

const preview = ref<CheckoutPreview | null>(null);
const previewing = ref(false);
const previewError = ref<string | null>(null);

const couponInput = ref('');
const coupon = ref<string | null>(null);
const couponError = ref<string | null>(null);
const applyingCoupon = ref(false);

const paymentMethod = ref<PaymentMethod>('cod');
const notes = ref('');
const placing = ref(false);

async function loadPreview(couponCode = coupon.value): Promise<boolean> {
  if (!addressId.value) return false;
  previewing.value = true;
  previewError.value = null;
  try {
    preview.value = await shop.previewOrder({ addressId: addressId.value, couponCode: couponCode ?? undefined });
    return true;
  } catch (error) {
    if (couponCode) throw error;
    previewError.value = toast.errorMessage(error);
    return false;
  } finally {
    previewing.value = false;
  }
}

onMounted(async () => {
  try {
    const [list] = await Promise.all([shop.addresses(), cart.loaded ? Promise.resolve() : cart.fetch()]);
    addresses.value = list;
    addressId.value = list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;
    if (!list.length) addressModal.value = true;
  } catch (error) {
    toast.fromError(error);
  } finally {
    loading.value = false;
  }
});

// A coupon that does not apply to the new address total is dropped.
watch(addressId, () => loadPreview().catch(() => removeCoupon()));

async function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) return;
  couponError.value = null;
  applyingCoupon.value = true;
  try {
    await loadPreview(code);
    coupon.value = code;
    toast.success(t('checkout.couponApplied'));
  } catch (error) {
    couponError.value = toast.errorMessage(error);
  } finally {
    applyingCoupon.value = false;
  }
}

async function removeCoupon() {
  coupon.value = null;
  couponInput.value = '';
  couponError.value = null;
  await loadPreview(null).catch(() => undefined);
}

function openAddressForm(address: Address | null = null) {
  editing.value = address;
  addressModal.value = true;
}

async function onAddressSaved(saved: Address) {
  addressModal.value = false;
  addresses.value = await shop.addresses();
  addressId.value = saved.id;
  await loadPreview().catch(() => undefined);
}

async function placeOrder() {
  if (!addressId.value || placing.value) return;
  placing.value = true;
  try {
    const order = await shop.placeOrder({
      addressId: addressId.value,
      couponCode: coupon.value ?? undefined,
      notes: notes.value.trim() || undefined,
      paymentMethod: paymentMethod.value,
    });
    cart.reset();
    await navigateTo({ path: `/account/orders/${order.id}`, query: { success: 'true' } });
  } catch (error) {
    toast.fromError(error);
    // Prices or stock may have changed: show the fresh numbers.
    await Promise.allSettled([cart.fetch(), loadPreview()]);
  } finally {
    placing.value = false;
  }
}

const canPlace = computed(() => !!addressId.value && !!preview.value && !previewing.value && !cart.isEmpty && !cart.hasUnavailable);
</script>

<template>
  <div>
    <PageHeader :title="t('checkout.title')" :crumbs="[{ label: t('cart.title'), to: '/cart' }, { label: t('checkout.title') }]" />

    <div class="container">
      <div v-if="loading" class="checkout">
        <div class="stack">
          <div v-for="n in 3" :key="n" class="skeleton" style="block-size: 10rem; border-radius: var(--radius-lg)" />
        </div>
        <div class="skeleton" style="block-size: 22rem; border-radius: var(--radius-lg)" />
      </div>

      <BaseEmptyState v-else-if="cart.isEmpty" icon="ph:shopping-bag-open" :title="t('cart.emptyTitle')" :description="t('checkout.emptyText')">
        <BaseButton to="/products">{{ t('cart.startShopping') }}</BaseButton>
      </BaseEmptyState>

      <div v-else class="checkout">
        <div class="checkout__steps">
          <!-- 1. Address -->
          <section class="step card card-pad">
            <header class="step__head">
              <span class="step__num">1</span>
              <h2 class="step__title">{{ t('checkout.shippingAddress') }}</h2>
              <BaseButton variant="secondary" size="sm" icon="ph:plus" @click="openAddressForm()">{{ t('address.add') }}</BaseButton>
            </header>
            <div v-if="addresses.length" class="step__addresses" role="radiogroup" :aria-label="t('checkout.shippingAddress')">
              <AddressCard
                v-for="address in addresses"
                :key="address.id"
                :address="address"
                selectable
                :selected="address.id === addressId"
                @select="addressId = address.id"
                @edit="openAddressForm(address)"
              />
            </div>
            <BaseEmptyState v-else compact icon="ph:map-pin-line" :title="t('address.emptyTitle')" :description="t('checkout.addAddressHint')" />
          </section>

          <!-- 2. Payment -->
          <section class="step card card-pad">
            <header class="step__head">
              <span class="step__num">2</span>
              <h2 class="step__title">{{ t('checkout.payment') }}</h2>
            </header>
            <div class="payments" role="radiogroup" :aria-label="t('checkout.payment')">
              <label class="pay" :class="{ 'is-selected': paymentMethod === 'cod' }">
                <input v-model="paymentMethod" type="radio" value="cod" class="visually-hidden" />
                <Icon name="ph:hand-coins" class="pay__icon" aria-hidden="true" />
                <span class="pay__text">
                  <strong>{{ t('checkout.cod') }}</strong>
                  <small>{{ t('checkout.codHint') }}</small>
                </span>
              </label>
              <div class="pay is-disabled" aria-disabled="true">
                <Icon name="ph:credit-card" class="pay__icon" aria-hidden="true" />
                <span class="pay__text">
                  <strong>{{ t('checkout.online') }}</strong>
                  <small>{{ t('checkout.onlineHint') }}</small>
                </span>
                <BaseBadge tone="info" size="sm">{{ t('common.soon') }}</BaseBadge>
              </div>
            </div>
          </section>

          <!-- 3. Notes -->
          <section class="step card card-pad">
            <header class="step__head">
              <span class="step__num">3</span>
              <h2 class="step__title">{{ t('checkout.notes') }}</h2>
            </header>
            <BaseTextarea v-model="notes" :placeholder="t('checkout.notesPlaceholder')" :rows="3" :maxlength="500" />
          </section>
        </div>

        <aside class="summary card card-pad">
          <h2 class="summary__title">{{ t('checkout.orderSummary') }}</h2>

          <ul v-if="preview" class="summary__items">
            <li v-for="item in preview.items" :key="`${item.productId}-${item.variantId}`" class="summary__item">
              <span class="summary__thumb">
                <BaseImage :src="item.image" :alt="item.name" :width="64" :height="64" ratio="1" rounded />
                <span class="summary__qty">{{ item.quantity }}</span>
              </span>
              <span class="summary__name">
                <span class="line-clamp-2">{{ item.name }}</span>
                <small v-if="item.variantLabel">{{ item.variantLabel }}</small>
              </span>
              <strong>{{ price(item.lineTotal) }}</strong>
            </li>
          </ul>
          <BaseAlert v-else-if="previewError" tone="danger">{{ previewError }}</BaseAlert>
          <p v-else-if="!addressId" class="text-subtle summary__hint">{{ t('checkout.selectAddressFirst') }}</p>
          <div v-else class="stack"><div v-for="n in 2" :key="n" class="skeleton" style="block-size: 3.5rem" /></div>

          <form class="coupon" @submit.prevent="applyCoupon">
            <template v-if="coupon">
              <div class="coupon__applied">
                <Icon name="ph:ticket" aria-hidden="true" />
                <span>{{ t('checkout.couponCode', { code: coupon }) }}</span>
                <button type="button" class="coupon__remove" :aria-label="t('common.remove')" @click="removeCoupon"><Icon name="ph:x" /></button>
              </div>
            </template>
            <template v-else>
              <BaseInput v-model="couponInput" :placeholder="t('checkout.couponPlaceholder')" icon="ph:ticket" dir="ltr" :error="couponError ?? undefined" :disabled="!addressId" />
              <BaseButton type="submit" variant="secondary" :loading="applyingCoupon" :disabled="!couponInput.trim() || !addressId">
                {{ t('checkout.apply') }}
              </BaseButton>
            </template>
          </form>

          <dl v-if="preview" class="summary__rows" :class="{ 'is-stale': previewing }">
            <div>
              <dt>{{ t('cart.subtotal') }}</dt>
              <dd>{{ price(preview.subTotal) }}</dd>
            </div>
            <div>
              <dt>{{ t('cart.shipping') }}</dt>
              <dd>
                <span v-if="preview.shippingFee === 0" class="text-success">{{ t('checkout.free') }}</span>
                <template v-else>{{ price(preview.shippingFee) }}</template>
              </dd>
            </div>
            <div v-if="preview.discountAmount > 0" class="summary__saving">
              <dt>{{ t('checkout.discount') }}</dt>
              <dd>-{{ price(preview.discountAmount) }}</dd>
            </div>
            <div class="summary__total">
              <dt>{{ t('cart.total') }}</dt>
              <dd>{{ price(preview.totalAmount) }}</dd>
            </div>
          </dl>

          <BaseButton size="lg" block icon="ph:lock-simple" :loading="placing" :disabled="!canPlace" @click="placeOrder">
            {{ t('checkout.placeOrder') }}
          </BaseButton>
          <p class="summary__terms">
            {{ t('checkout.agree') }} <NuxtLink to="/terms">{{ t('nav.terms') }}</NuxtLink>
          </p>
        </aside>
      </div>
    </div>

    <BaseModal v-model="addressModal" :title="editing ? t('address.edit') : t('address.add')" size="lg" persistent>
      <AddressForm
        v-if="addressModal"
        :address="editing"
        :make-default="!addresses.length"
        @saved="onAddressSaved"
        @cancel="addressModal = false"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.checkout {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
@media (min-width: 1024px) {
  .checkout {
    grid-template-columns: minmax(0, 1fr) 400px;
  }
  .summary {
    position: sticky;
    inset-block-start: calc(var(--header-height) + 4rem);
  }
}
.checkout__steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.step {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fade-up 0.5s var(--ease-out) both;
}
.step:nth-child(2) {
  animation-delay: 80ms;
}
.step:nth-child(3) {
  animation-delay: 160ms;
}
.step__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.step__num {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
}
.step__title {
  margin-inline-end: auto;
  font-size: var(--text-lg);
}
.step__addresses {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
}
.payments {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
}
@media (min-width: 640px) {
  .payments {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}
.pay {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) ease,
    background-color var(--duration-fast) ease;
}
.pay.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-softer);
}
.pay:focus-within {
  box-shadow: var(--ring);
}
.pay.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.pay__icon {
  font-size: 1.75rem;
  color: var(--color-primary);
}
.pay__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: var(--text-sm);
}
.pay__text small {
  color: var(--color-text-subtle);
}
.summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.summary__title {
  font-size: var(--text-xl);
}
.summary__hint {
  font-size: var(--text-sm);
}
.summary__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-block-size: 18rem;
  overflow-y: auto;
}
.summary__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.summary__thumb {
  position: relative;
  flex-shrink: 0;
  inline-size: 3.5rem;
}
.summary__qty {
  position: absolute;
  inset-block-start: -0.4rem;
  inset-inline-end: -0.4rem;
  display: grid;
  place-items: center;
  min-inline-size: 1.3rem;
  block-size: 1.3rem;
  border-radius: var(--radius-full);
  background: var(--stone-700);
  color: #fff;
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
}
.summary__name {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
}
.summary__name small {
  color: var(--color-text-subtle);
}
.coupon {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}
.coupon > :first-child {
  flex: 1;
}
.coupon :deep(.btn) {
  min-block-size: 3rem;
}
.coupon__applied {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  inline-size: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px dashed var(--color-success);
  background: var(--color-success-soft);
  color: var(--color-success);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
}
.coupon__applied span {
  flex: 1;
}
.coupon__remove {
  display: grid;
  place-items: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 50%;
}
.coupon__remove:hover {
  background: rgb(0 0 0 / 0.06);
}
.summary__rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
  transition: opacity var(--duration-base) ease;
}
.summary__rows.is-stale {
  opacity: 0.5;
}
.summary__rows div {
  display: flex;
  justify-content: space-between;
}
.summary__rows dt {
  color: var(--color-text-muted);
}
.summary__rows dd {
  font-weight: var(--weight-semibold);
}
.text-success {
  color: var(--color-success);
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
.summary__terms {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  text-align: center;
}
.summary__terms a {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>

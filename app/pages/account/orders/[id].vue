<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();
const { price, dateTime, placeName, lang } = useLocalized();
const shop = useShopService();
const toast = useToast();
const { confirm } = useConfirm();

const id = computed(() => String(route.params.id));
const justPlaced = computed(() => route.query.success === "true");

const {
  data: order,
  status,
  error,
  refresh,
} = await useLazyAsyncData(
  () => `my-order-${id.value}`,
  () => shop.myOrder(id.value),
  {
    server: false,
  },
);

useHead({
  title: () =>
    order.value
      ? `${t("orders.order")} #${shortOrderNumber(order.value.orderNumber)}`
      : t("orders.order"),
});

const step = computed(() =>
  order.value ? ORDER_STATUS_META[order.value.status].step : 0,
);
const offTrack = computed(() => step.value < 0);
const canCancel = computed(
  () => !!order.value && CUSTOMER_CANCELLABLE.includes(order.value.status),
);

const timeline = computed(() =>
  ORDER_PROGRESS.map((status, index) => ({
    status,
    icon: ORDER_STATUS_META[status].icon,
    label: t(`orders.status.${status}`),
    done: !offTrack.value && index <= step.value,
    current: !offTrack.value && index === step.value,
  })),
);

const address = computed(() => order.value?.shippingSnapshot);
const city = computed(() =>
  address.value
    ? placeName({
        nameAr: address.value.cityNameAr,
        nameEn: address.value.cityNameEn,
      })
    : "",
);
const governorate = computed(() =>
  address.value
    ? placeName({
        nameAr: address.value.governorateNameAr,
        nameEn: address.value.governorateNameEn,
      })
    : "",
);

const cancelling = ref(false);
async function cancel() {
  if (!order.value) return;
  const ok = await confirm({
    title: t("orders.cancelConfirm"),
    message: t("orders.cancelConfirmText"),
    tone: "danger",
    confirmText: t("orders.cancel"),
    cancelText: t("orders.keep"),
  });
  if (!ok) return;
  cancelling.value = true;
  try {
    await shop.cancelOrder(order.value.id);
    toast.success(t("orders.cancelled"));
    await refresh();
  } catch (e) {
    toast.fromError(e);
  } finally {
    cancelling.value = false;
  }
}

const downloading = ref(false);
async function downloadInvoice() {
  if (!order.value) return;
  downloading.value = true;
  try {
    const blob = await shop.downloadInvoice(order.value.id);
    saveBlob(blob, `invoice-${order.value.orderNumber}.pdf`);
  } catch (e) {
    toast.fromError(e);
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <div class="order-page">
    <NuxtLink to="/account/orders" class="order-page__back">
      <Icon name="ph:arrow-left" class="flip-rtl" aria-hidden="true" />{{
        t("orders.back")
      }}
    </NuxtLink>

    <div v-if="isFetching(status) && !order" class="stack">
      <div
        class="skeleton"
        style="block-size: 8rem; border-radius: var(--radius-lg)"
      />
      <div
        class="skeleton"
        style="block-size: 16rem; border-radius: var(--radius-lg)"
      />
    </div>

    <div v-else-if="error || !order" class="card">
      <BaseEmptyState icon="ph:package" :title="t('orders.notFound')">
        <BaseButton to="/account/orders">{{ t("orders.back") }}</BaseButton>
      </BaseEmptyState>
    </div>

    <template v-else>
      <div v-if="justPlaced" class="success card">
        <div class="success__burst" aria-hidden="true">
          <span v-for="n in 12" :key="n" :style="{ '--i': n }" />
        </div>
        <span class="success__icon"><Icon name="ph:check-bold" /></span>
        <div>
          <h2 class="success__title">{{ t("orders.thanksTitle") }}</h2>
          <p class="text-muted">{{ t("orders.thanksText") }}</p>
        </div>
      </div>

      <header class="order-page__head">
        <div>
          <h1 class="order-page__title">
            {{ t("orders.order") }} #{{ shortOrderNumber(order.orderNumber) }}
          </h1>
          <p class="text-subtle meta-list">
            <span dir="ltr">{{ order.orderNumber }}</span>
            <time :datetime="order.createdAt">{{
              dateTime(order.createdAt)
            }}</time>
          </p>
        </div>
        <div class="cluster">
          <OrderStatusBadge :status="order.status" />
          <BaseButton
            variant="outline"
            size="sm"
            icon="ph:file-pdf"
            :loading="downloading"
            @click="downloadInvoice"
          >
            {{ t("orders.invoice") }}
          </BaseButton>
          <BaseButton
            v-if="canCancel"
            variant="ghost"
            size="sm"
            icon="ph:x-circle"
            :loading="cancelling"
            class="order-page__cancel"
            @click="cancel"
          >
            {{ t("orders.cancel") }}
          </BaseButton>
        </div>
      </header>

      <!-- Progress tracker -->
      <section class="card card-pad">
        <BaseAlert
          v-if="offTrack"
          :tone="order.status === 'cancelled' ? 'danger' : 'warning'"
          :title="t(`orders.status.${order.status}`)"
        >
          {{
            order.status === "cancelled"
              ? t("orders.cancelledText")
              : t("orders.returnedText")
          }}
        </BaseAlert>
        <ol
          v-else
          class="tracker"
          :style="{
            '--progress': Math.max(step, 0) / (ORDER_PROGRESS.length - 1),
          }"
        >
          <li
            v-for="item in timeline"
            :key="item.status"
            class="tracker__step"
            :class="{ 'is-done': item.done, 'is-current': item.current }"
          >
            <span class="tracker__dot"
              ><Icon
                :name="item.done ? 'ph:check-bold' : item.icon"
                aria-hidden="true"
            /></span>
            <span class="tracker__label">{{ item.label }}</span>
          </li>
        </ol>
        <p v-if="order.trackingNumber" class="tracking">
          <Icon name="ph:barcode" aria-hidden="true" />{{
            t("orders.tracking")
          }}: <strong dir="ltr">{{ order.trackingNumber }}</strong>
        </p>
      </section>

      <div class="order-page__grid">
        <section class="card card-pad">
          <h2 class="block-title">{{ t("orders.items") }}</h2>
          <ul class="items">
            <li v-for="item in order.items" :key="item.id" class="item">
              <BaseImage
                :src="item.productImage ?? item.product?.mainImage"
                :alt="item.productName ?? ''"
                :width="80"
                :height="80"
                ratio="1"
                rounded
                class="item__img"
              />
              <div class="item__info">
                <NuxtLink
                  v-if="item.product"
                  :to="`/product/${item.product.slug}`"
                  class="item__name"
                  >{{ item.productName }}</NuxtLink
                >
                <span v-else class="item__name">{{ item.productName }}</span>
                <small v-if="item.variantLabel" class="text-subtle">{{
                  item.variantLabel
                }}</small>
                <small class="text-subtle"
                  >{{ item.quantity }} ×
                  {{ price(item.priceAtPurchase) }}</small
                >
              </div>
              <strong>{{ price(item.priceAtPurchase * item.quantity) }}</strong>
            </li>
          </ul>
        </section>

        <div class="stack">
          <section class="card card-pad">
            <h2 class="block-title">{{ t("checkout.orderSummary") }}</h2>
            <dl class="totals">
              <div>
                <dt>{{ t("cart.subtotal") }}</dt>
                <dd>{{ price(order.subTotal) }}</dd>
              </div>
              <div>
                <dt>{{ t("cart.shipping") }}</dt>
                <dd>
                  {{
                    order.shippingFee > 0
                      ? price(order.shippingFee)
                      : t("checkout.free")
                  }}
                </dd>
              </div>
              <div v-if="order.discountAmount > 0" class="totals__discount">
                <dt>
                  {{ t("checkout.discount")
                  }}<template v-if="order.couponCode">
                    ({{ order.couponCode }})</template
                  >
                </dt>
                <dd>-{{ price(order.discountAmount) }}</dd>
              </div>
              <div class="totals__total">
                <dt>{{ t("cart.total") }}</dt>
                <dd>{{ price(order.totalAmount) }}</dd>
              </div>
            </dl>
            <p class="payment">
              <Icon name="ph:hand-coins" aria-hidden="true" />{{
                t(`orders.payment.${order.paymentMethod}`)
              }}
            </p>
          </section>

          <section v-if="address" class="card card-pad">
            <h2 class="block-title">{{ t("checkout.shippingAddress") }}</h2>
            <address class="addr">
              <strong>{{ address.fullName }}</strong>
              <span>{{ address.streetAddress }}</span>
              <span
                >{{ city
                }}<template v-if="governorate"
                  >{{ lang === "ar" ? "، " : ", " }}{{ governorate }}</template
                ></span
              >
              <span v-if="address.landmark" class="text-subtle">{{
                address.landmark
              }}</span>
              <span dir="ltr" class="addr__phone">{{
                address.phoneNumber
              }}</span>
            </address>
          </section>

          <section v-if="order.notes" class="card card-pad">
            <h2 class="block-title">{{ t("checkout.notes") }}</h2>
            <p class="text-muted">{{ order.notes }}</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.order-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fade-up 0.5s var(--ease-out);
}
.order-page__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-muted);
}
.order-page__back:hover {
  color: var(--color-primary);
}
.order-page__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
}
.order-page__title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
}
.order-page__head p {
  font-size: var(--text-sm);
}
.order-page__cancel {
  color: var(--color-danger);
}
.order-page__cancel:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.order-page__grid {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  align-items: start;
}
@media (min-width: 1024px) {
  .order-page__grid {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
}

.success {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-color: var(--color-success);
  background: linear-gradient(
    135deg,
    var(--color-success-soft),
    var(--color-surface)
  );
  overflow: hidden;
}
.success__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 3.5rem;
  block-size: 3.5rem;
  border-radius: 50%;
  background: var(--color-success);
  color: #fff;
  font-size: 1.6rem;
  animation: pop 0.7s var(--ease-spring);
}
.success__title {
  font-size: var(--text-xl);
}
.success__burst {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 3.25rem;
  pointer-events: none;
}
.success__burst span {
  position: absolute;
  inline-size: 0.5rem;
  block-size: 0.5rem;
  border-radius: 2px;
  background: hsl(calc(var(--i) * 30) 80% 55%);
  animation: confetti 1.1s var(--ease-out) forwards;
  transform: rotate(calc(var(--i) * 30deg)) translateY(0);
  opacity: 0;
}
@keyframes confetti {
  0% {
    opacity: 1;
    transform: rotate(calc(var(--i) * 30deg)) translateY(0);
  }
  100% {
    opacity: 0;
    transform: rotate(calc(var(--i) * 30deg)) translateY(-70px);
  }
}

.tracker {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
}
.tracker::before,
.tracker::after {
  content: "";
  position: absolute;
  inset-block-start: 1.25rem;
  inset-inline-start: 12.5%;
  block-size: 3px;
  border-radius: var(--radius-full);
}
.tracker::before {
  inset-inline-end: 12.5%;
  background: var(--color-surface-sunken);
}
.tracker::after {
  /* The line spans the centers of the first and last dots (75% of the width). */
  inline-size: calc(75% * var(--progress));
  background: linear-gradient(90deg, var(--gold-400), var(--gold-600));
  transition: inline-size 1s var(--ease-out);
}
.tracker__step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
}
.tracker__dot {
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-text-subtle);
  font-size: 1.1rem;
  transition:
    background-color var(--duration-base) ease,
    border-color var(--duration-base) ease;
}
.tracker__step.is-done .tracker__dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.tracker__step.is-current .tracker__dot {
  animation: pulse-ring 1.8s ease-out infinite;
}
.tracker__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text-muted);
}
.tracker__step.is-done .tracker__label {
  color: var(--color-text);
}
.tracking {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-start: var(--space-5);
  font-size: var(--text-sm);
}
.block-title {
  margin-block-end: var(--space-4);
  font-size: var(--text-lg);
}
.items {
  display: flex;
  flex-direction: column;
}
.item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  padding-block: var(--space-3);
  border-block-end: 1px solid var(--color-border);
}
.item:last-child {
  border: none;
}
.item__img {
  inline-size: 4rem;
  flex-shrink: 0;
}
.item__info {
  display: flex;
  flex: 1 1 10rem;
  flex-direction: column;
  min-inline-size: 0;
}
/* On narrow screens the line total drops under the name instead of squeezing it. */
.item > strong {
  margin-inline-start: auto;
}
.item__name {
  font-weight: var(--weight-semibold);
}
a.item__name:hover {
  color: var(--color-primary);
}
.totals {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.totals div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.totals dt {
  color: var(--color-text-muted);
}
.totals__discount dd {
  color: var(--color-success);
}
.totals__total {
  padding-block-start: var(--space-3);
  border-block-start: 1px dashed var(--color-border);
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
}
.totals__total dt {
  color: var(--color-text) !important;
}
.payment {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-start: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.addr {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-style: normal;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.addr strong {
  color: var(--color-text);
}
.addr__phone {
  align-self: flex-start;
}
</style>

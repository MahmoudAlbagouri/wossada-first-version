<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/models';

const { t } = useI18n();
const { price, date, number } = useLocalized();
const shop = useShopService();

useHead({ title: t('account.orders') });

const { data: orders, status } = await useLazyAsyncData('my-orders', () => shop.myOrders(), {
  server: false,
  default: () => [] as Order[],
});

type Filter = 'all' | 'active' | 'delivered' | 'cancelled';
const filter = ref<Filter>('all');
const ACTIVE: OrderStatus[] = ['pending', 'processing', 'shipped', 'redelivery'];
const matches = (order: Order, f: Filter) =>
  f === 'all' ||
  (f === 'active' && ACTIVE.includes(order.status)) ||
  (f === 'delivered' && order.status === 'delivered') ||
  (f === 'cancelled' && (order.status === 'cancelled' || order.status === 'returned'));

const tabs = computed(() =>
  (['all', 'active', 'delivered', 'cancelled'] as Filter[]).map((key) => ({
    key,
    label: t(`orders.filters.${key}`),
    count: orders.value.filter((o) => matches(o, key)).length,
  })),
);
const visible = computed(() => orders.value.filter((o) => matches(o, filter.value)));
const thumbs = (order: Order) => (order.items ?? []).slice(0, 4);
</script>

<template>
  <AccountSection :title="t('account.orders')" :description="t('orders.hint')" flat>
    <BaseTabs v-if="orders.length" v-model="filter" :tabs="tabs" />

    <div v-if="isFetching(status) && !orders.length" class="stack">
      <div v-for="n in 3" :key="n" class="skeleton" style="block-size: 9rem; border-radius: var(--radius-lg)" />
    </div>

    <div v-else-if="!visible.length" class="card">
      <BaseEmptyState icon="ph:package" :title="t('orders.emptyTitle')" :description="t('orders.emptyText')">
        <BaseButton to="/products">{{ t('cart.startShopping') }}</BaseButton>
      </BaseEmptyState>
    </div>

    <TransitionGroup v-else name="list" tag="ul" class="orders">
      <li v-for="order in visible" :key="order.id">
        <NuxtLink :to="`/account/orders/${order.id}`" class="order card">
          <div class="order__head">
            <div>
              <p class="order__number">#{{ shortOrderNumber(order.orderNumber) }}</p>
              <time class="order__date" :datetime="order.createdAt">{{ date(order.createdAt) }}</time>
            </div>
            <OrderStatusBadge :status="order.status" />
          </div>
          <div class="order__body">
            <div class="order__thumbs">
              <BaseImage
                v-for="item in thumbs(order)"
                :key="item.id"
                :src="item.productImage ?? item.product?.mainImage"
                :alt="item.productName ?? ''"
                :width="64"
                :height="64"
                ratio="1"
                rounded
                class="order__thumb"
              />
              <span v-if="(order.items?.length ?? 0) > 4" class="order__more">+{{ (order.items?.length ?? 0) - 4 }}</span>
            </div>
            <div class="order__total">
              <span class="text-subtle">{{ t('orders.itemsCount', { count: number(order.items?.length ?? order.itemsCount ?? 0) }, order.items?.length ?? 0) }}</span>
              <strong>{{ price(order.totalAmount) }}</strong>
            </div>
            <Icon name="ph:caret-right" class="order__chevron flip-rtl" aria-hidden="true" />
          </div>
        </NuxtLink>
      </li>
    </TransitionGroup>
  </AccountSection>
</template>

<style scoped>
.orders {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.order {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}
.order:hover {
  border-color: var(--gold-200);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.order__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}
.order__number {
  font-weight: var(--weight-black);
  letter-spacing: 0.04em;
}
.order__date {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.order__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
}
.order__thumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-end: auto;
}
.order__thumb {
  inline-size: clamp(2.75rem, 2rem + 3vw, 3.25rem);
}
.order__more {
  display: grid;
  place-items: center;
  inline-size: clamp(2.75rem, 2rem + 3vw, 3.25rem);
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.order__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: var(--text-sm);
}
.order__total strong {
  font-size: var(--text-lg);
}
.order__chevron {
  color: var(--color-text-subtle);
}
</style>

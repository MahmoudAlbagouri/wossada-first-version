<script setup lang="ts">
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const { price, number, dateTime } = useLocalized();
const auth = useAuthStore();

useHead({ title: 'الرئيسية' });

const { data: stats, status, refresh } = await useAsyncData('admin-stats', () => admin.stats(), { server: false });

const tiles = computed(() => {
  const s = stats.value;
  if (!s) return [];
  return [
    { label: 'إجمالي الإيرادات', value: price(s.revenue), icon: 'ph:currency-circle-dollar', hint: 'بدون الملغي والمرتجع' },
    { label: 'طلبات اليوم', value: number(s.todayOrders), icon: 'ph:calendar-check', to: '/admin/orders' },
    { label: 'بانتظار المراجعة', value: number(s.pendingOrders), icon: 'ph:hourglass-medium', to: '/admin/orders?status=pending' },
    { label: 'طلبات جارية', value: number(s.activeOrders), icon: 'ph:truck', to: '/admin/orders' },
    { label: 'كل الطلبات', value: number(s.totalOrders), icon: 'ph:receipt', to: '/admin/orders' },
    { label: 'المنتجات', value: number(s.products), icon: 'ph:armchair', to: '/admin/products' },
    { label: 'المستخدمون', value: number(s.users), icon: 'ph:users-three', to: '/admin/users' },
    { label: 'الأقسام', value: number(s.categories), icon: 'ph:tree-structure', to: '/admin/category' },
  ];
});

const columns: TableColumn[] = [
  { key: 'number', label: 'رقم الطلب' },
  { key: 'customer', label: 'العميل' },
  { key: 'date', label: 'التاريخ', hideMobile: true },
  { key: 'status', label: 'الحالة' },
  { key: 'total', label: 'الإجمالي', align: 'end' },
];

const quickLinks = [
  { to: '/admin/products/new', icon: 'ph:plus-circle', label: 'منتج جديد' },
  { to: '/admin/coupons', icon: 'ph:ticket', label: 'كوبون خصم' },
  { to: '/admin/home', icon: 'ph:layout', label: 'ترتيب الرئيسية' },
  { to: '/admin/shipping', icon: 'ph:truck', label: 'أسعار الشحن' },
];
</script>

<template>
  <AdminPage :title="`أهلاً ${auth.displayName}`" description="نظرة سريعة على أداء المتجر.">
    <template #actions>
      <BaseButton variant="outline" size="sm" icon="ph:arrows-clockwise" :loading="status === 'pending'" @click="refresh()">تحديث</BaseButton>
    </template>

    <div v-if="!stats" class="tiles">
      <div v-for="n in 8" :key="n" class="skeleton" style="block-size: 6rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else class="tiles">
      <StatTile v-for="(tile, index) in tiles" :key="tile.label" v-reveal="index * 40" v-bind="tile" />
    </div>

    <div class="grid">
      <section class="card card-pad">
        <RevenueChart v-if="stats" :data="stats.salesByDay" />
        <div v-else class="skeleton" style="block-size: 260px" />
      </section>

      <section class="card card-pad quick">
        <h2 class="quick__title">إجراءات سريعة</h2>
        <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="quick__link">
          <Icon :name="link.icon" aria-hidden="true" />{{ link.label }}
          <Icon name="ph:caret-left" class="quick__chevron" aria-hidden="true" />
        </NuxtLink>
      </section>
    </div>

    <section class="stack">
      <div class="section-row">
        <h2 class="title-lg">أحدث الطلبات</h2>
        <BaseButton to="/admin/orders" variant="link" icon-end="ph:arrow-right">كل الطلبات</BaseButton>
      </div>
      <DataTable :columns="columns" :rows="stats?.recentOrders ?? []" :loading="!stats" empty-title="لا توجد طلبات بعد">
        <template #cell-number="{ row }">
          <NuxtLink :to="`/admin/orders?open=${row.id}`" class="order-link">#{{ shortOrderNumber(row.orderNumber) }}</NuxtLink>
        </template>
        <template #cell-customer="{ row }">{{ row.user?.name ?? row.shippingSnapshot?.fullName ?? '—' }}</template>
        <template #cell-date="{ row }"><span class="text-subtle">{{ dateTime(row.createdAt) }}</span></template>
        <template #cell-status="{ row }"><OrderStatusBadge :status="row.status" size="sm" /></template>
        <template #cell-total="{ row }"><strong>{{ price(row.totalAmount) }}</strong></template>
      </DataTable>
    </section>
  </AdminPage>
</template>

<style scoped>
.tiles {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
}
.grid {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}
@media (min-width: 1100px) {
  .grid {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}
.quick {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.quick__title {
  margin-block-end: var(--space-2);
  font-size: var(--text-lg);
}
.quick__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition: background-color var(--duration-fast) ease;
}
.quick__link > :first-child {
  font-size: 1.3rem;
  color: var(--color-primary);
}
.quick__link:hover {
  background: var(--color-primary-softer);
}
.quick__chevron {
  margin-inline-start: auto;
  color: var(--color-text-subtle);
}
.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.order-link {
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
</style>

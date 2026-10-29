<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/models';
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { price, dateTime, placeName } = useLocalized();

useHead({ title: 'الطلبات' });

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد المراجعة',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مسترجع',
  redelivery: 'إعادة توصيل',
};

const { page, filter, search, searchTerm, keepPageInRange } = useAdminListQuery();
const status = filter<OrderStatus | 'all'>('status', 'all');

const query = computed(() => ({
  page: page.value,
  limit: 15,
  status: status.value === 'all' ? undefined : status.value,
  search: searchTerm.value || undefined,
}));

const { data, status: fetchStatus, refresh } = await useAsyncData('admin-orders', () => admin.orders.list(query.value), {
  server: false,
  watch: [query],
});
keepPageInRange(() => data.value?.meta.totalPages);

const tabs = computed(() => [
  { key: 'all' as const, label: 'الكل' },
  ...ORDER_STATUSES.map((key) => ({ key, label: STATUS_LABELS[key], icon: ORDER_STATUS_META[key].icon })),
]);

const columns: TableColumn[] = [
  { key: 'number', label: 'الطلب' },
  { key: 'customer', label: 'العميل' },
  { key: 'city', label: 'المدينة', hideMobile: true },
  { key: 'date', label: 'التاريخ', hideMobile: true },
  { key: 'status', label: 'الحالة' },
  { key: 'total', label: 'الإجمالي', align: 'end' },
  { key: 'actions', label: '', align: 'end', width: '60px' },
];

// --- Details drawer ---
const drawerOpen = ref(false);
const selected = ref<Order | null>(null);
const loadingOrder = ref(false);
const nextStatus = ref<OrderStatus>('pending');
const trackingNumber = ref('');
const saving = ref(false);
const downloading = ref(false);

async function open(id: string) {
  drawerOpen.value = true;
  loadingOrder.value = true;
  try {
    selected.value = await admin.orders.get(id);
    nextStatus.value = selected.value.status;
    trackingNumber.value = selected.value.trackingNumber ?? '';
  } catch (error) {
    toast.fromError(error);
    drawerOpen.value = false;
  } finally {
    loadingOrder.value = false;
  }
}

watch(drawerOpen, (isOpen) => {
  if (!isOpen && route.query.open) router.replace({ query: { ...route.query, open: undefined } });
});
onMounted(() => {
  if (typeof route.query.open === 'string') open(route.query.open);
});

const isTerminal = computed(() => !!selected.value && TERMINAL_STATUSES.includes(selected.value.status));
const statusOptions = computed(() => ORDER_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })));
const dirty = computed(
  () =>
    !!selected.value &&
    (nextStatus.value !== selected.value.status || trackingNumber.value.trim() !== (selected.value.trackingNumber ?? '')),
);

async function saveStatus() {
  if (!selected.value || !dirty.value) return;
  saving.value = true;
  try {
    selected.value = await admin.orders.updateStatus(selected.value.id, {
      status: nextStatus.value,
      trackingNumber: trackingNumber.value.trim() || undefined,
    });
    toast.success('تم تحديث حالة الطلب وإشعار العميل');
    await refresh();
  } catch (error) {
    toast.fromError(error);
  } finally {
    saving.value = false;
  }
}

async function downloadInvoice() {
  if (!selected.value) return;
  downloading.value = true;
  try {
    saveBlob(await admin.orders.invoice(selected.value.id), `invoice-${selected.value.orderNumber}.pdf`);
  } catch (error) {
    toast.fromError(error);
  } finally {
    downloading.value = false;
  }
}

const city = (order: Order) =>
  order.shippingSnapshot
    ? placeName({ nameAr: order.shippingSnapshot.cityNameAr, nameEn: order.shippingSnapshot.cityNameEn })
    : '—';
</script>

<template>
  <AdminPage title="الطلبات" description="تابع الطلبات وحدّث حالتها؛ العميل يصله إشعار مع كل تغيير.">
    <BaseTabs v-model="status" :tabs="tabs" />
    <div class="toolbar">
      <BaseInput v-model="search" icon="ph:magnifying-glass" placeholder="ابحث برقم الطلب، اسم العميل أو الموبايل…" class="toolbar__search" />
      <span v-if="data" class="text-subtle">{{ data.meta.totalItems }} طلب</span>
    </div>

    <DataTable :columns="columns" :rows="data?.data ?? []" :loading="fetchStatus === 'pending'" empty-title="لا توجد طلبات مطابقة" empty-icon="ph:receipt">
      <template #cell-number="{ row }">
        <button type="button" class="order-link" @click="open(row.id)">#{{ shortOrderNumber(row.orderNumber) }}</button>
      </template>
      <template #cell-customer="{ row }">
        <div class="customer">
          <strong>{{ row.user?.name ?? row.shippingSnapshot?.fullName ?? '—' }}</strong>
          <span dir="ltr">{{ row.shippingSnapshot?.phoneNumber ?? row.user?.phone ?? '' }}</span>
        </div>
      </template>
      <template #cell-city="{ row }">{{ city(row) }}</template>
      <template #cell-date="{ row }"><span class="text-subtle">{{ dateTime(row.createdAt) }}</span></template>
      <template #cell-status="{ row }"><OrderStatusBadge :status="row.status" size="sm" /></template>
      <template #cell-total="{ row }"><strong>{{ price(row.totalAmount) }}</strong></template>
      <template #cell-actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="ph:eye" icon-only label="التفاصيل" @click="open(row.id)" />
      </template>
    </DataTable>

    <BasePagination v-if="data" v-model:page="page" :total-pages="data.meta.totalPages" />

    <BaseDrawer v-model="drawerOpen" side="end" width="560px" :title="selected ? `طلب #${shortOrderNumber(selected.orderNumber)}` : 'تفاصيل الطلب'">
      <div v-if="loadingOrder || !selected" class="stack">
        <div v-for="n in 4" :key="n" class="skeleton" style="block-size: 5rem" />
      </div>
      <div v-else class="details">
        <div class="details__head">
          <OrderStatusBadge :status="selected.status" />
          <span class="text-subtle" dir="ltr">{{ selected.orderNumber }}</span>
          <span class="text-subtle">{{ dateTime(selected.createdAt) }}</span>
        </div>

        <section class="details__box">
          <h3>تحديث الحالة</h3>
          <BaseAlert v-if="isTerminal" tone="warning">هذا الطلب {{ STATUS_LABELS[selected.status] }} وتم إرجاع المخزون، لا يمكن تغيير حالته.</BaseAlert>
          <template v-else>
            <BaseSelect v-model="nextStatus" :options="statusOptions" label="الحالة الجديدة" />
            <BaseInput v-model="trackingNumber" label="رقم الشحنة (اختياري)" dir="ltr" icon="ph:barcode" />
            <BaseButton :disabled="!dirty" :loading="saving" icon="ph:check" @click="saveStatus">حفظ الحالة</BaseButton>
          </template>
        </section>

        <section class="details__box">
          <h3>العميل والتوصيل</h3>
          <dl class="kv">
            <div><dt>العميل</dt><dd>{{ selected.user?.name ?? '—' }}</dd></div>
            <div><dt>البريد</dt><dd dir="ltr">{{ selected.user?.email ?? '—' }}</dd></div>
            <template v-if="selected.shippingSnapshot">
              <div><dt>المستلم</dt><dd>{{ selected.shippingSnapshot.fullName }}</dd></div>
              <div><dt>الموبايل</dt><dd dir="ltr"><a :href="`tel:${selected.shippingSnapshot.phoneNumber}`">{{ selected.shippingSnapshot.phoneNumber }}</a></dd></div>
              <div><dt>العنوان</dt><dd>{{ selected.shippingSnapshot.streetAddress }}، {{ selected.shippingSnapshot.cityNameAr }}، {{ selected.shippingSnapshot.governorateNameAr }}</dd></div>
              <div v-if="selected.shippingSnapshot.landmark"><dt>علامة مميزة</dt><dd>{{ selected.shippingSnapshot.landmark }}</dd></div>
            </template>
            <div><dt>الدفع</dt><dd>{{ selected.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني' }}</dd></div>
            <div v-if="selected.notes"><dt>ملاحظات</dt><dd>{{ selected.notes }}</dd></div>
          </dl>
        </section>

        <section class="details__box">
          <h3>المنتجات ({{ selected.items?.length ?? 0 }})</h3>
          <ul class="items">
            <li v-for="item in selected.items" :key="item.id" class="item">
              <BaseImage :src="item.productImage ?? item.product?.mainImage" alt="" :width="56" :height="56" ratio="1" rounded class="item__img" />
              <div class="item__info">
                <strong class="line-clamp-2">{{ item.productName }}</strong>
                <small v-if="item.variantLabel" class="text-subtle">{{ item.variantLabel }}</small>
                <small v-if="item.sku" class="text-subtle" dir="ltr">{{ item.sku }}</small>
              </div>
              <span class="item__qty">{{ item.quantity }} × {{ price(item.priceAtPurchase) }}</span>
            </li>
          </ul>
          <dl class="kv kv--totals">
            <div><dt>المجموع الفرعي</dt><dd>{{ price(selected.subTotal) }}</dd></div>
            <div><dt>الشحن</dt><dd>{{ price(selected.shippingFee) }}</dd></div>
            <div v-if="selected.discountAmount > 0">
              <dt>الخصم <template v-if="selected.couponCode">({{ selected.couponCode }})</template></dt>
              <dd>-{{ price(selected.discountAmount) }}</dd>
            </div>
            <div class="kv__total"><dt>الإجمالي</dt><dd>{{ price(selected.totalAmount) }}</dd></div>
          </dl>
        </section>
      </div>
      <template v-if="selected && !loadingOrder" #footer>
        <BaseButton variant="outline" icon="ph:file-pdf" :loading="downloading" @click="downloadInvoice">تحميل الفاتورة</BaseButton>
      </template>
    </BaseDrawer>
  </AdminPage>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.toolbar__search {
  flex: 1;
  max-inline-size: 420px;
}
.order-link {
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
.order-link:hover {
  text-decoration: underline;
}
.customer {
  display: flex;
  flex-direction: column;
}
.customer span {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.details__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.details__box {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.details__box h3 {
  font-size: var(--text-base);
}
.kv {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}
.kv div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.kv dt {
  flex-shrink: 0;
  color: var(--color-text-subtle);
}
.kv dd {
  text-align: end;
}
.kv a {
  color: var(--color-primary);
}
.kv--totals {
  padding-block-start: var(--space-3);
  border-block-start: 1px dashed var(--color-border);
}
.kv__total {
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
}
.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.item__img {
  inline-size: 3.5rem;
  flex-shrink: 0;
}
.item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
}
.item__qty {
  white-space: nowrap;
  font-weight: var(--weight-semibold);
}
</style>

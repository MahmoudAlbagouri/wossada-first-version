<script setup lang="ts">
import type { Product } from '~/types/models';
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const toast = useToast();
const { confirm } = useConfirm();
const { price, pick } = useLocalized();

useHead({ title: 'المنتجات' });

const { page, filter, search, searchTerm, keepPageInRange } = useAdminListQuery();
const categoryId = filter('category');

const query = computed(() => ({
  page: page.value,
  limit: 15,
  searchTerm: searchTerm.value || undefined,
  categoryId: categoryId.value || undefined,
}));

const { data, status, refresh } = await useAsyncData('admin-products', () => admin.products.list(query.value), {
  server: false,
  watch: [query],
});
keepPageInRange(() => data.value?.meta.totalPages);
const { data: categories } = await useAsyncData('admin-products-categories', () => admin.categories.tree(), {
  server: false,
  default: () => [],
});

const categoryOptions = computed(() => [
  { value: '', label: 'كل الأقسام' },
  ...categories.value.flatMap((c) => [
    { value: c.id, label: pick(c.translations)?.name ?? c.slug },
    ...(c.children ?? []).map((child) => ({ value: child.id, label: `— ${pick(child.translations)?.name ?? child.slug}` })),
  ]),
]);

const columns: TableColumn[] = [
  { key: 'product', label: 'المنتج' },
  { key: 'price', label: 'السعر' },
  { key: 'stock', label: 'المخزون' },
  { key: 'variants', label: 'المواصفات', hideMobile: true },
  { key: 'active', label: 'ظاهر' },
  { key: 'actions', label: '', align: 'end', width: '170px' },
];

const totalStock = (p: Product) =>
  p.variants?.length ? p.variants.reduce((sum, v) => sum + availableStock(p, v), 0) : availableStock(p);

const busy = ref<string | null>(null);

async function toggleActive(product: Product, isActive: boolean) {
  busy.value = product.id;
  try {
    await admin.products.update(product.id, { isActive });
    product.isActive = isActive;
  } catch (error) {
    toast.fromError(error);
  } finally {
    busy.value = null;
  }
}

async function duplicate(product: Product) {
  busy.value = product.id;
  try {
    const copy = await admin.products.duplicate(product.id);
    toast.success('تم إنشاء نسخة مخفية من المنتج', { action: { label: 'تعديل النسخة', to: `/admin/products/${copy.id}` } });
    await refresh();
  } catch (error) {
    toast.fromError(error);
  } finally {
    busy.value = null;
  }
}

async function remove(product: Product) {
  const ok = await confirm({
    title: 'حذف المنتج؟',
    message: `سيتم حذف «${pick(product.translations)?.name}» نهائياً. إذا كان له طلبات سابقة يُفضّل إخفاؤه بدلاً من حذفه.`,
    tone: 'danger',
    confirmText: 'حذف',
    cancelText: 'إلغاء',
  });
  if (!ok) return;
  try {
    await admin.products.remove(product.id);
    toast.success('تم حذف المنتج');
    await refresh();
  } catch (error) {
    toast.fromError(error);
  }
}
</script>

<template>
  <AdminPage title="المنتجات" description="أضف المنتجات وعدّل أسعارها ومخزونها ومواصفاتها.">
    <template #actions>
      <BaseButton to="/admin/products/new" icon="ph:plus">منتج جديد</BaseButton>
    </template>

    <div class="toolbar">
      <BaseInput v-model="search" icon="ph:magnifying-glass" placeholder="ابحث باسم المنتج…" class="toolbar__search" />
      <BaseSelect v-model="categoryId" :options="categoryOptions" icon="ph:funnel" class="toolbar__filter" />
      <span v-if="data" class="text-subtle">{{ data.meta.totalItems }} منتج</span>
    </div>

    <DataTable :columns="columns" :rows="data?.data ?? []" :loading="status === 'pending'" empty-title="لا توجد منتجات" empty-icon="ph:armchair">
      <template #cell-product="{ row }">
        <NuxtLink :to="`/admin/products/${row.id}`" class="product">
          <BaseImage :src="row.mainImage" alt="" :width="56" :height="56" ratio="1" rounded class="product__img" />
          <span class="product__text">
            <strong class="line-clamp-1">{{ pick(row.translations)?.name }}</strong>
            <code dir="ltr">/{{ row.slug }}</code>
          </span>
        </NuxtLink>
      </template>
      <template #cell-price="{ row }">
        <BasePrice :amount="displayPrice(row).price" :compare-at="displayPrice(row).compareAt" size="sm" />
      </template>
      <template #cell-stock="{ row }">
        <BaseBadge :tone="totalStock(row) === 0 ? 'danger' : totalStock(row) <= 5 ? 'warning' : 'success'" size="sm">
          {{ totalStock(row) }}
        </BaseBadge>
      </template>
      <template #cell-variants="{ row }">
        <span class="text-subtle">{{ row.variants?.length ? `${row.variants.length} اختيار` : '—' }}</span>
      </template>
      <template #cell-active="{ row }">
        <BaseCheckbox switch :model-value="row.isActive" :disabled="busy === row.id" @update:model-value="toggleActive(row, $event)" />
      </template>
      <template #cell-actions="{ row }">
        <div class="row-actions">
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" :to="`/admin/products/${row.id}`" />
          <BaseButton variant="ghost" size="sm" icon="ph:arrow-square-out" icon-only label="عرض في المتجر" :to="`/product/${row.slug}`" target="_blank" />
          <BaseButton variant="ghost" size="sm" icon="ph:copy" icon-only label="نسخ" :loading="busy === row.id" @click="duplicate(row)" />
          <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(row)" />
        </div>
      </template>
    </DataTable>

    <BasePagination v-if="data" v-model:page="page" :total-pages="data.meta.totalPages" />
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
  min-inline-size: 220px;
  max-inline-size: 420px;
}
.toolbar__filter {
  min-inline-size: 220px;
}
.product {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-inline-size: 0;
}
.product__img {
  inline-size: 3.5rem;
  flex-shrink: 0;
}
.product__text {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.product__text code {
  font-size: var(--text-2xs);
  color: var(--color-text-subtle);
}
.product:hover strong {
  color: var(--color-primary);
}
.row-actions {
  display: inline-flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>

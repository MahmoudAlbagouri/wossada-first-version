<script setup lang="ts">
import type { Coupon, DiscountType } from '~/types/models';
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const toast = useToast();
const { price, date } = useLocalized();

useHead({ title: 'كوبونات الخصم' });

interface CouponForm {
  code: string;
  discountType: DiscountType;
  discountValue: number | null;
  minOrderValue: number | null;
  expiryDate: string;
  usageLimit: number | null;
  isActive: boolean;
}

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const { items, loading, refresh, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<Coupon, CouponForm>({
  key: 'admin-coupons',
  list: () => admin.coupons.list(),
  toForm: (coupon) => ({
    code: coupon?.code ?? '',
    discountType: coupon?.discountType ?? 'percentage',
    discountValue: coupon ? Number(coupon.discountValue) : null,
    minOrderValue: coupon ? Number(coupon.minOrderValue) : 0,
    expiryDate: coupon ? coupon.expiryDate.slice(0, 10) : inDays(30),
    usageLimit: coupon?.usageLimit ?? 0,
    isActive: coupon?.isActive ?? true,
  }),
  rules: {
    code: [
      (v) => !!String(v ?? '').trim() || 'الكود مطلوب',
      (v) => /^[A-Za-z0-9_-]{3,30}$/.test(String(v).trim()) || 'من 3 إلى 30 حرفاً إنجليزياً أو رقماً أو - _',
    ],
    discountValue: [
      (v) => (v !== null && v !== undefined && Number(v) > 0) || 'أدخل قيمة أكبر من صفر',
      (v, values) => values.discountType !== 'percentage' || Number(v) <= 100 || 'النسبة لا تزيد عن 100%',
    ],
    minOrderValue: [(v) => v === null || Number(v) >= 0 || 'قيمة غير صحيحة'],
    expiryDate: [(v) => !!v || 'تاريخ الانتهاء مطلوب'],
    usageLimit: [(v) => v === null || (Number.isInteger(Number(v)) && Number(v) >= 0) || 'عدد صحيح (0 = غير محدود)'],
  },
  save: (values, coupon) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      minOrderValue: Number(values.minOrderValue ?? 0),
      // End of the chosen day in local time.
      expiryDate: new Date(`${values.expiryDate}T23:59:59`).toISOString(),
      usageLimit: Number(values.usageLimit ?? 0),
      isActive: values.isActive,
    };
    return coupon ? admin.coupons.update(coupon.id, payload) : admin.coupons.create(payload);
  },
  remove: (coupon) => admin.coupons.remove(coupon.id),
  describe: (coupon) => coupon.code,
});

const typeOptions = [
  { value: 'percentage' as const, label: 'نسبة مئوية %' },
  { value: 'fixed' as const, label: 'مبلغ ثابت (ج.م)' },
];

const columns: TableColumn[] = [
  { key: 'code', label: 'الكود' },
  { key: 'discount', label: 'الخصم' },
  { key: 'min', label: 'أقل طلب', hideMobile: true },
  { key: 'usage', label: 'الاستخدام' },
  { key: 'expiry', label: 'ينتهي في', hideMobile: true },
  { key: 'active', label: 'مفعّل' },
  { key: 'actions', label: '', align: 'end', width: '110px' },
];

const isExpired = (coupon: Coupon) => new Date(coupon.expiryDate).getTime() < Date.now();
const isUsedUp = (coupon: Coupon) => coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
const discountLabel = (coupon: Coupon) =>
  coupon.discountType === 'percentage' ? `${Number(coupon.discountValue)}%` : price(coupon.discountValue);

const toggling = ref<string | null>(null);
async function toggleActive(coupon: Coupon, isActive: boolean) {
  toggling.value = coupon.id;
  try {
    await admin.coupons.update(coupon.id, { isActive });
    coupon.isActive = isActive;
    toast.success(isActive ? 'تم تفعيل الكوبون' : 'تم إيقاف الكوبون');
  } catch (error) {
    toast.fromError(error);
    await refresh();
  } finally {
    toggling.value = null;
  }
}
</script>

<template>
  <AdminPage title="كوبونات الخصم" description="أكواد خصم بنسبة أو بمبلغ ثابت، بحد أدنى للطلب وعدد استخدامات.">
    <template #actions>
      <BaseButton icon="ph:plus" @click="openCreate">كوبون جديد</BaseButton>
    </template>

    <DataTable :columns="columns" :rows="items" :loading="loading" empty-title="لا توجد كوبونات" empty-icon="ph:ticket">
      <template #cell-code="{ row }">
        <div class="code">
          <code dir="ltr">{{ row.code }}</code>
          <BaseBadge v-if="isExpired(row)" tone="danger" size="sm">منتهي</BaseBadge>
          <BaseBadge v-else-if="isUsedUp(row)" tone="warning" size="sm">مستنفد</BaseBadge>
        </div>
      </template>
      <template #cell-discount="{ row }"><strong>{{ discountLabel(row) }}</strong></template>
      <template #cell-min="{ row }">{{ Number(row.minOrderValue) > 0 ? price(row.minOrderValue) : '—' }}</template>
      <template #cell-usage="{ row }">{{ row.usedCount }} / {{ row.usageLimit > 0 ? row.usageLimit : '∞' }}</template>
      <template #cell-expiry="{ row }">{{ date(row.expiryDate) }}</template>
      <template #cell-active="{ row }">
        <BaseCheckbox switch :model-value="row.isActive" :disabled="toggling === row.id" @update:model-value="toggleActive(row, $event)" />
      </template>
      <template #cell-actions="{ row }">
        <div class="row-actions">
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(row)" />
          <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(row)" />
        </div>
      </template>
    </DataTable>

    <BaseModal v-model="modalOpen" :title="editing ? 'تعديل الكوبون' : 'كوبون جديد'">
      <form id="coupon-form" class="form-grid" novalidate @submit="submit">
        <BaseInput v-model="form.values.code" label="الكود" dir="ltr" placeholder="SUMMER25" :error="form.errors.code" class="form-grid__full" required />
        <BaseSelect v-model="form.values.discountType" :options="typeOptions" label="نوع الخصم" />
        <BaseInput
          v-model="form.values.discountValue"
          type="number"
          :min="0"
          :max="form.values.discountType === 'percentage' ? 100 : undefined"
          :label="form.values.discountType === 'percentage' ? 'النسبة %' : 'المبلغ (ج.م)'"
          :error="form.errors.discountValue"
          required
        />
        <BaseInput v-model="form.values.minOrderValue" type="number" :min="0" label="أقل قيمة للطلب (ج.م)" :error="form.errors.minOrderValue" hint="0 = بدون حد أدنى" />
        <BaseInput v-model="form.values.usageLimit" type="number" :min="0" label="عدد مرات الاستخدام" :error="form.errors.usageLimit" hint="0 = غير محدود" />
        <BaseInput v-model="form.values.expiryDate" type="date" label="تاريخ الانتهاء" :error="form.errors.expiryDate" dir="ltr" required />
        <div class="form-grid__switch">
          <BaseCheckbox v-model="form.values.isActive" switch label="الكوبون مفعّل" />
        </div>
        <BaseAlert v-if="form.formError.value" tone="danger" class="form-grid__full">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="coupon-form" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </AdminPage>
</template>

<style scoped>
.code {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.code code {
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
  background: var(--color-primary-softer);
  border: 1px dashed var(--gold-300);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
}
.row-actions {
  display: inline-flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.form-grid__switch {
  display: flex;
  align-items: flex-end;
  padding-block-end: var(--space-3);
}
</style>

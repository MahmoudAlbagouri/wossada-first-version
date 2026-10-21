<script setup lang="ts">
import type { City, Governorate } from '~/types/models';
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const { price } = useLocalized();

useHead({ title: 'الشحن والمحافظات' });

const isMoney = (v: unknown) => v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0;

// --- Governorates ---
interface GovernorateForm {
  nameAr: string;
  nameEn: string;
  baseShippingCost: number | null;
  extraWeightFee: number | null;
  isActive: boolean;
}

const gov = useAdminCrud<Governorate, GovernorateForm>({
  key: 'admin-governorates',
  list: async () => (await admin.governorates.list()).sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar')),
  toForm: (g) => ({
    nameAr: g?.nameAr ?? '',
    nameEn: g?.nameEn ?? '',
    baseShippingCost: g ? Number(g.baseShippingCost) : null,
    extraWeightFee: g ? Number(g.extraWeightFee) : 0,
    isActive: g?.isActive ?? true,
  }),
  rules: {
    nameAr: [(v) => !!String(v).trim() || 'الاسم بالعربية مطلوب'],
    nameEn: [(v) => !!String(v).trim() || 'الاسم بالإنجليزية مطلوب'],
    baseShippingCost: [(v) => isMoney(v) || 'أدخل تكلفة صحيحة'],
    extraWeightFee: [(v) => isMoney(v) || 'أدخل قيمة صحيحة'],
  },
  save: (v, g) => {
    const payload = {
      nameAr: v.nameAr.trim(),
      nameEn: v.nameEn.trim(),
      baseShippingCost: Number(v.baseShippingCost),
      extraWeightFee: Number(v.extraWeightFee),
      isActive: v.isActive,
    };
    return g ? admin.governorates.update(g.id, payload) : admin.governorates.create(payload);
  },
  remove: (g) => admin.governorates.remove(g.id),
  describe: (g) => g.nameAr,
});

const selectedId = ref<string | null>(null);
const selected = computed(() => gov.items.value.find((g) => g.id === selectedId.value) ?? null);
watch(
  () => gov.items.value,
  (list) => {
    if (!selectedId.value && list[0]) selectedId.value = list[0].id;
  },
);

// --- Cities ---
interface CityForm {
  nameAr: string;
  nameEn: string;
  baseShippingCost: number | null;
  extraWeightFee: number | null;
  isActive: boolean;
}

const city = useAdminCrud<City, CityForm>({
  key: 'admin-cities',
  list: () => admin.cities.list(),
  toForm: (c) => ({
    nameAr: c?.nameAr ?? '',
    nameEn: c?.nameEn ?? '',
    baseShippingCost: c?.baseShippingCost ?? null,
    extraWeightFee: c?.extraWeightFee ?? null,
    isActive: c?.isActive ?? true,
  }),
  rules: {
    nameAr: [(v) => !!String(v).trim() || 'الاسم بالعربية مطلوب'],
    nameEn: [(v) => !!String(v).trim() || 'الاسم بالإنجليزية مطلوب'],
    baseShippingCost: [(v) => v === null || isMoney(v) || 'قيمة غير صحيحة'],
  },
  save: (v, c) => {
    const payload = {
      nameAr: v.nameAr.trim(),
      nameEn: v.nameEn.trim(),
      baseShippingCost: isMoney(v.baseShippingCost) ? Number(v.baseShippingCost) : null,
      extraWeightFee: isMoney(v.extraWeightFee) ? Number(v.extraWeightFee) : null,
      isActive: v.isActive,
      governorateId: c?.governorate?.id ?? selectedId.value,
    };
    return c ? admin.cities.update(c.id, payload) : admin.cities.create(payload);
  },
  remove: (c) => admin.cities.remove(c.id),
  describe: (c) => c.nameAr,
});

const govSearch = ref('');
const governorates = computed(() =>
  gov.items.value.filter((g) => !govSearch.value.trim() || g.nameAr.includes(govSearch.value.trim()) || g.nameEn.toLowerCase().includes(govSearch.value.trim().toLowerCase())),
);
const cities = computed(() => city.items.value.filter((c) => c.governorate?.id === selectedId.value));
const cityCount = (id: string) => city.items.value.filter((c) => c.governorate?.id === id).length;

const cityColumns: TableColumn[] = [
  { key: 'name', label: 'المدينة' },
  { key: 'cost', label: 'تكلفة الشحن' },
  { key: 'active', label: 'متاحة' },
  { key: 'actions', label: '', align: 'end', width: '110px' },
];

const gForm = gov.form;
const cForm = city.form;
</script>

<template>
  <AdminPage title="الشحن والمحافظات" description="تكلفة الشحن = سعر الأساس لكل شحنة حتى 50 كجم (بالوزن الفعلي أو الحجمي). المدينة بدون سعر تأخذ سعر محافظتها.">
    <template #actions>
      <BaseButton icon="ph:plus" @click="gov.openCreate">محافظة جديدة</BaseButton>
    </template>

    <div class="shipping">
      <aside class="govs card">
        <BaseInput v-model="govSearch" icon="ph:magnifying-glass" placeholder="بحث عن محافظة…" />
        <div v-if="gov.loading.value && !gov.items.value.length" class="stack">
          <div v-for="n in 6" :key="n" class="skeleton" style="block-size: 3.25rem" />
        </div>
        <BaseEmptyState v-else-if="!gov.items.value.length" compact icon="ph:map-trifold" title="لا توجد محافظات" />
        <ul v-else class="govs__list">
          <li v-for="g in governorates" :key="g.id">
            <button type="button" class="gov" :class="{ 'is-active': g.id === selectedId }" @click="selectedId = g.id">
              <span class="gov__name">
                <strong>{{ g.nameAr }}</strong>
                <small>{{ cityCount(g.id) }} مدينة · {{ price(g.baseShippingCost) }}</small>
              </span>
              <BaseBadge v-if="!g.isActive" tone="neutral" size="sm">متوقفة</BaseBadge>
            </button>
          </li>
        </ul>
      </aside>

      <section class="cities">
        <div v-if="selected" class="gov-card card card-pad">
          <div>
            <h2 class="title-lg">{{ selected.nameAr }} <small class="text-subtle" dir="ltr">{{ selected.nameEn }}</small></h2>
            <p class="text-muted">سعر الشحن الأساسي: <strong>{{ price(selected.baseShippingCost) }}</strong></p>
          </div>
          <div class="cluster">
            <BaseButton variant="outline" size="sm" icon="ph:pencil-simple" @click="gov.openEdit(selected)">تعديل المحافظة</BaseButton>
            <BaseButton variant="ghost" size="sm" icon="ph:trash" class="danger" @click="gov.remove(selected)">حذف</BaseButton>
            <BaseButton size="sm" icon="ph:plus" @click="city.openCreate">مدينة جديدة</BaseButton>
          </div>
        </div>

        <DataTable v-if="selected" :columns="cityColumns" :rows="cities" :loading="city.loading.value" empty-title="لا توجد مدن في هذه المحافظة" empty-icon="ph:buildings">
          <template #cell-name="{ row }">
            <strong>{{ row.nameAr }}</strong> <span class="text-subtle" dir="ltr">{{ row.nameEn }}</span>
          </template>
          <template #cell-cost="{ row }">
            <span v-if="row.baseShippingCost !== null">{{ price(row.baseShippingCost) }}</span>
            <span v-else class="text-subtle">سعر المحافظة ({{ price(selected.baseShippingCost) }})</span>
          </template>
          <template #cell-active="{ row }">
            <BaseBadge :tone="row.isActive ? 'success' : 'neutral'" dot size="sm">{{ row.isActive ? 'متاحة' : 'متوقفة' }}</BaseBadge>
          </template>
          <template #cell-actions="{ row }">
            <div class="row-actions">
              <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="city.openEdit(row)" />
              <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="city.remove(row)" />
            </div>
          </template>
        </DataTable>
        <div v-else class="card">
          <BaseEmptyState compact icon="ph:map-pin" title="اختر محافظة لعرض مدنها" />
        </div>
      </section>
    </div>

    <BaseModal v-model="gov.modalOpen.value" :title="gov.editing.value ? 'تعديل المحافظة' : 'محافظة جديدة'">
      <form id="gov-form" class="form-grid" novalidate @submit="gov.submit">
        <BaseInput v-model="gForm.values.nameAr" label="الاسم بالعربية" :error="gForm.errors.nameAr" required />
        <BaseInput v-model="gForm.values.nameEn" label="الاسم بالإنجليزية" dir="ltr" :error="gForm.errors.nameEn" required />
        <BaseInput v-model="gForm.values.baseShippingCost" type="number" :min="0" label="سعر الشحن الأساسي (ج.م)" :error="gForm.errors.baseShippingCost" required />
        <BaseInput
          v-model="gForm.values.extraWeightFee"
          type="number"
          :min="0"
          label="رسوم الوزن الإضافي"
          :error="gForm.errors.extraWeightFee"
          hint="محفوظة للتوافق؛ الحساب الحالي بالشحنات (50 كجم)"
        />
        <BaseCheckbox v-model="gForm.values.isActive" switch label="التوصيل متاح" class="form-grid__full" />
        <BaseAlert v-if="gForm.formError.value" tone="danger" class="form-grid__full">{{ gForm.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="gov-form" :loading="gForm.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="city.modalOpen.value" :title="city.editing.value ? 'تعديل المدينة' : `مدينة جديدة في ${selected?.nameAr ?? ''}`">
      <form id="city-form" class="form-grid" novalidate @submit="city.submit">
        <BaseInput v-model="cForm.values.nameAr" label="الاسم بالعربية" :error="cForm.errors.nameAr" required />
        <BaseInput v-model="cForm.values.nameEn" label="الاسم بالإنجليزية" dir="ltr" :error="cForm.errors.nameEn" required />
        <BaseInput
          v-model="cForm.values.baseShippingCost"
          type="number"
          :min="0"
          label="سعر شحن خاص (اختياري)"
          :error="cForm.errors.baseShippingCost"
          :hint="`فارغ = سعر المحافظة (${price(selected?.baseShippingCost)})`"
        />
        <BaseCheckbox v-model="cForm.values.isActive" switch label="التوصيل متاح" class="form-grid__full" />
        <BaseAlert v-if="cForm.formError.value" tone="danger" class="form-grid__full">{{ cForm.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="city-form" :loading="cForm.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </AdminPage>
</template>

<style scoped>
.shipping {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}
@media (min-width: 1024px) {
  .shipping {
    grid-template-columns: 300px minmax(0, 1fr);
  }
  .govs {
    position: sticky;
    inset-block-start: 5rem;
  }
}
.govs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
}
.govs__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-block-size: 60dvh;
  overflow-y: auto;
}
.gov {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  inline-size: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  text-align: start;
  transition: background-color var(--duration-fast) ease;
}
.gov:hover {
  background: var(--color-surface-muted);
}
.gov.is-active {
  background: var(--color-primary-softer);
  box-shadow: inset -3px 0 0 var(--color-primary);
}
.gov__name {
  display: flex;
  flex-direction: column;
  font-size: var(--text-sm);
}
.gov__name small {
  font-size: var(--text-2xs);
  color: var(--color-text-subtle);
}
.cities {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-inline-size: 0;
}
.gov-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
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

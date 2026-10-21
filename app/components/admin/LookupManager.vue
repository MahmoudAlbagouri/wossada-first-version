<script setup lang="ts">
import type { Resource } from '~/services/resource';
import type { Brand, Color, Material, Size } from '~/types/models';
import type { AdminLanguage } from '~/utils/translation';

type LookupType = 'colors' | 'sizes' | 'materials' | 'brands';
type Lookup = Color | Size | Material | Brand;

/** One screen for the four "name in ar/en + one extra field" catalog lookups. */
const props = defineProps<{ type: LookupType }>();

const CONFIG: Record<LookupType, { title: string; singular: string; description: string; icon: string }> = {
  colors: { title: 'الألوان', singular: 'لون', description: 'ألوان المنتجات المتاحة في الفلاتر واختيار المواصفات.', icon: 'ph:palette' },
  sizes: { title: 'المقاسات', singular: 'مقاس', description: 'المقاسات مجمّعة حسب النوع (أثاث، مراتب، ...).', icon: 'ph:ruler' },
  materials: { title: 'الخامات', singular: 'خامة', description: 'خامات التصنيع التي يمكن الفلترة بها.', icon: 'ph:tree' },
  brands: { title: 'الماركات', singular: 'ماركة', description: 'الماركات تظهر في بطاقة المنتج والفلاتر.', icon: 'ph:seal-check' },
};
const config = computed(() => CONFIG[props.type]);

const admin = useAdminService();
const resource = admin[props.type] as unknown as Resource<Lookup, Record<string, unknown>>;
const { pick } = useLocalized();
const search = ref('');

interface LookupForm {
  names: Record<AdminLanguage, string>;
  hexCode: string;
  sizeType: string;
  logo: string | null;
}

const { items, loading, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<Lookup, LookupForm>({
  key: `admin-${props.type}`,
  list: () => resource.list(),
  toForm: (item) => ({
    names: fromTranslations(item?.translations, ADMIN_LANGUAGES, (t) => t?.name ?? '') as Record<AdminLanguage, string>,
    hexCode: (item as Color | null)?.hexCode ?? '#987226',
    sizeType: (item as Size | null)?.type ?? 'furniture',
    logo: (item as Brand | null)?.logo ?? null,
  }),
  rules: {
    names: [(names) => !!(names as Record<string, string>).ar?.trim() || 'الاسم بالعربية مطلوب'],
    hexCode: [(value) => props.type !== 'colors' || /^#[0-9a-f]{6}$/i.test(String(value)) || 'كود اللون غير صحيح'],
    sizeType: [(value) => props.type !== 'sizes' || !!String(value).trim() || 'نوع المقاس مطلوب'],
  },
  save: (values, item) => {
    const payload: Record<string, unknown> = {
      translations: toTranslations(
        Object.fromEntries(Object.entries(values.names).map(([code, name]) => [code, { name: name.trim() }])),
        (v) => !!v.name,
      ),
    };
    if (props.type === 'colors') payload.hexCode = values.hexCode.toUpperCase();
    if (props.type === 'sizes') payload.type = values.sizeType.trim();
    if (props.type === 'brands') payload.logo = values.logo;
    return item ? resource.update(item.id, payload) : resource.create(payload);
  },
  remove: (item) => resource.remove(item.id),
  describe: (item) => pick(item.translations)?.name ?? '',
});

const rows = computed(() => {
  const term = search.value.trim().toLowerCase();
  return items.value.filter(
    (item) => !term || item.translations.some((t) => t.name.toLowerCase().includes(term)),
  );
});

const nameIn = (item: Lookup, code: string) => item.translations.find((t) => t.languageCode === code)?.name ?? '—';

const columns = computed(() => [
  ...(props.type === 'colors' ? [{ key: 'swatch', label: 'اللون', width: '70px' }] : []),
  ...(props.type === 'brands' ? [{ key: 'logo', label: 'الشعار', width: '80px' }] : []),
  { key: 'ar', label: 'الاسم (عربي)' },
  { key: 'en', label: 'الاسم (English)', hideMobile: true },
  ...(props.type === 'colors' ? [{ key: 'hex', label: 'الكود' }] : []),
  ...(props.type === 'sizes' ? [{ key: 'sizeType', label: 'النوع' }] : []),
  { key: 'actions', label: '', align: 'end' as const, width: '110px' },
]);

const sizeTypes = computed(() => [...new Set(items.value.map((i) => (i as Size).type).filter(Boolean))]);
</script>

<template>
  <AdminPage :title="config.title" :description="config.description">
    <template #actions>
      <BaseButton icon="ph:plus" @click="openCreate">إضافة {{ config.singular }}</BaseButton>
    </template>

    <div class="toolbar">
      <BaseInput v-model="search" icon="ph:magnifying-glass" placeholder="بحث بالاسم…" class="toolbar__search" />
      <span class="text-subtle">{{ rows.length }} عنصر</span>
    </div>

    <DataTable :columns="columns" :rows="rows" :loading="loading" :empty-icon="config.icon">
      <template #cell-swatch="{ row }">
        <span class="swatch" :style="{ background: (row as Color).hexCode }" />
      </template>
      <template #cell-logo="{ row }">
        <BaseImage v-if="(row as Brand).logo" :src="(row as Brand).logo" alt="" :width="48" :height="48" ratio="1" fit="contain" class="logo" />
        <span v-else class="text-subtle">—</span>
      </template>
      <template #cell-ar="{ row }"><strong>{{ nameIn(row, 'ar') }}</strong></template>
      <template #cell-en="{ row }"><span dir="ltr">{{ nameIn(row, 'en') }}</span></template>
      <template #cell-hex="{ row }"><code dir="ltr">{{ (row as Color).hexCode }}</code></template>
      <template #cell-sizeType="{ row }"><BaseBadge size="sm">{{ (row as Size).type }}</BaseBadge></template>
      <template #cell-actions="{ row }">
        <div class="row-actions">
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(row)" />
          <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(row)" />
        </div>
      </template>
    </DataTable>

    <BaseModal v-model="modalOpen" :title="editing ? `تعديل ${config.singular}` : `إضافة ${config.singular}`">
      <form id="lookup-form" class="stack" novalidate @submit="submit">
        <TranslationTabs v-slot="{ lang }" :errors="{ ar: !!form.errors.names }">
          <BaseInput
            v-model="form.values.names[lang]"
            :label="lang === 'ar' ? 'الاسم بالعربية' : 'Name in English'"
            :required="lang === 'ar'"
            :error="lang === 'ar' ? form.errors.names : undefined"
          />
        </TranslationTabs>

        <div v-if="type === 'colors'" class="color-field">
          <label class="color-field__picker">
            <!-- Only complete hex codes reach the native picker while the code is being typed. -->
            <input
              type="color"
              aria-label="اختيار اللون"
              :value="/^#[0-9a-f]{6}$/i.test(form.values.hexCode) ? form.values.hexCode : '#000000'"
              @input="form.values.hexCode = ($event.target as HTMLInputElement).value.toUpperCase()"
            />
          </label>
          <BaseInput v-model="form.values.hexCode" label="كود اللون" dir="ltr" placeholder="#987226" :error="form.errors.hexCode" />
        </div>

        <template v-if="type === 'sizes'">
          <BaseInput v-model="form.values.sizeType" label="نوع المقاس" list="size-types" dir="ltr" :error="form.errors.sizeType" hint="مثال: furniture، mattress، pillow" />
          <datalist id="size-types">
            <option v-for="sizeType in sizeTypes" :key="sizeType" :value="sizeType" />
          </datalist>
        </template>

        <ImageUploader v-if="type === 'brands'" v-model="form.values.logo" folder="brands" label="شعار الماركة" />

        <BaseAlert v-if="form.formError.value" tone="danger">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="lookup-form" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
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
  max-inline-size: 360px;
}
.swatch {
  display: inline-block;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12);
}
.logo {
  inline-size: 3rem;
  border-radius: var(--radius-sm);
}
.row-actions {
  display: inline-flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.color-field {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
}
.color-field > :last-child {
  flex: 1;
}
.color-field__picker {
  display: block;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1.5px solid var(--color-border);
  cursor: pointer;
}
.color-field__picker input {
  inline-size: 150%;
  block-size: 150%;
  margin: -25%;
  border: none;
  cursor: pointer;
}
</style>

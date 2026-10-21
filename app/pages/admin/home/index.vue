<script setup lang="ts">
import type { HomeSectionConfig, HomeSectionType } from '~/types/models';

const admin = useAdminService();
const toast = useToast();

useHead({ title: 'الصفحة الرئيسية' });

const TYPES: Record<HomeSectionType, { label: string; icon: string; tab?: string }> = {
  mainSlider: { label: 'سلايدر رئيسي', icon: 'ph:slideshow', tab: 'mainSlider' },
  productSlider: { label: 'سلايدر منتجات', icon: 'ph:squares-four', tab: 'productSlider' },
  fixedBanner: { label: 'بانرات', icon: 'ph:image-square', tab: 'fixedBanner' },
  fullImage: { label: 'صورة عريضة', icon: 'ph:image', tab: 'fullImage' },
  staticSection: { label: 'قسم ثابت', icon: 'ph:puzzle-piece', tab: 'staticSection' },
  CATEGORY_GRID: { label: 'شبكة الأقسام', icon: 'ph:tree-structure' },
};
const typeOptions = (Object.keys(TYPES) as HomeSectionType[]).map((value) => ({ value, label: TYPES[value].label }));

// Keys of the existing content blocks, to link a section to its content.
const { data: blockKeys } = await useAsyncData(
  'admin-home-block-keys',
  async () => {
    const [main, product, banners, full, statics] = await Promise.all([
      admin.home.mainSliders.list(),
      admin.home.productSliders.list(),
      admin.home.fixedBanners.list(),
      admin.home.fullImages.list(),
      admin.home.staticSections.list(),
    ]);
    const keys = (list: { key: string }[]) => [...new Set(list.map((b) => b.key))];
    return {
      mainSlider: keys(main),
      productSlider: keys(product),
      fixedBanner: keys(banners),
      fullImage: keys(full),
      staticSection: keys(statics),
      CATEGORY_GRID: [],
    } as Record<HomeSectionType, string[]>;
  },
  { server: false },
);

/** New sections go to the bottom of the page. */
let nextOrder = 0;

interface SectionForm {
  type: HomeSectionType;
  section_key: string;
  title: string;
  isActive: boolean;
}

const { items, loading, refresh, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<HomeSectionConfig, SectionForm>({
  key: 'admin-home-configs',
  list: async () => (await admin.home.configs.list()).sort((a, b) => a.sectionOrder - b.sectionOrder),
  toForm: (section) => ({
    type: section?.type ?? 'productSlider',
    section_key: section?.section_key ?? '',
    title: String(section?.metadata?.title ?? ''),
    isActive: section?.isActive ?? true,
  }),
  rules: {
    section_key: [(v) => /^[a-z0-9][a-z0-9-_]{1,79}$/i.test(String(v ?? '').trim()) || 'مفتاح بالإنجليزية بدون مسافات'],
  },
  save: (values, section) => {
    const payload = {
      type: values.type,
      section_key: values.section_key.trim(),
      isActive: values.isActive,
      metadata: values.type === 'CATEGORY_GRID' && values.title.trim() ? { title: values.title.trim() } : {},
      ...(section ? {} : { sectionOrder: nextOrder }),
    };
    return section ? admin.home.configs.update(section.id, payload) : admin.home.configs.create(payload);
  },
  remove: (section) => admin.home.configs.remove(section.id),
  describe: (section) => section.section_key,
  messages: { created: 'تمت إضافة القسم', updated: 'تم حفظ القسم', deleted: 'تم حذف القسم' },
});

watch(items, (list) => (nextOrder = list.length), { immediate: true });

const keySuggestions = computed(() => blockKeys.value?.[form.values.type] ?? []);
const isLinked = (section: HomeSectionConfig) =>
  section.type === 'CATEGORY_GRID' ? null : (blockKeys.value?.[section.type]?.includes(section.section_key) ?? false);

const reordering = ref(false);
async function move(index: number, delta: -1 | 1) {
  const list = [...items.value];
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target]!, list[index]!];
  items.value = list;
  reordering.value = true;
  try {
    await admin.home.reorder(list.map((s) => s.id));
  } catch (error) {
    toast.fromError(error);
    await refresh();
  } finally {
    reordering.value = false;
  }
}

async function toggleActive(section: HomeSectionConfig, isActive: boolean) {
  try {
    await admin.home.configs.update(section.id, { isActive });
    section.isActive = isActive;
  } catch (error) {
    toast.fromError(error);
  }
}
</script>

<template>
  <AdminPage title="الصفحة الرئيسية" description="رتّب أقسام الصفحة الرئيسية من أعلى لأسفل. كل قسم يعرض المحتوى الذي يحمل نفس المفتاح.">
    <template #actions>
      <BaseButton to="/" target="_blank" variant="outline" icon="ph:arrow-square-out">معاينة</BaseButton>
      <BaseButton icon="ph:plus" @click="openCreate">إضافة قسم</BaseButton>
    </template>

    <div v-if="loading && !items.length" class="stack">
      <div v-for="n in 4" :key="n" class="skeleton" style="block-size: 4.5rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else-if="!items.length" class="card">
      <BaseEmptyState icon="ph:layout" title="الصفحة الرئيسية فارغة" description="حالياً يعرض المتجر أحدث المنتجات. أضف أقساماً لتصميم الصفحة.">
        <BaseButton icon="ph:plus" @click="openCreate">إضافة قسم</BaseButton>
      </BaseEmptyState>
    </div>

    <TransitionGroup v-else name="list" tag="ol" class="sections" :class="{ 'is-busy': reordering }">
      <li v-for="(section, index) in items" :key="section.id" class="section-row card">
        <span class="section-row__order">{{ index + 1 }}</span>
        <span class="section-row__icon" aria-hidden="true"><Icon :name="TYPES[section.type].icon" /></span>
        <div class="section-row__text">
          <strong>{{ TYPES[section.type].label }}<template v-if="section.metadata?.title"> — {{ section.metadata.title }}</template></strong>
          <span>
            <code dir="ltr">{{ section.section_key }}</code>
            <template v-if="isLinked(section) === false">
              · <span class="warn"><Icon name="ph:warning" aria-hidden="true" />لا يوجد محتوى بهذا المفتاح</span>
            </template>
          </span>
        </div>
        <BaseCheckbox switch :model-value="section.isActive" label="ظاهر" @update:model-value="toggleActive(section, $event)" />
        <div class="section-row__actions">
          <BaseButton variant="ghost" size="sm" icon="ph:arrow-up" icon-only label="أعلى" :disabled="index === 0 || reordering" @click="move(index, -1)" />
          <BaseButton variant="ghost" size="sm" icon="ph:arrow-down" icon-only label="أسفل" :disabled="index === items.length - 1 || reordering" @click="move(index, 1)" />
          <BaseButton
            v-if="TYPES[section.type].tab"
            variant="ghost"
            size="sm"
            icon="ph:images"
            icon-only
            label="إدارة المحتوى"
            :to="`/admin/sliders-banners?tab=${TYPES[section.type].tab}`"
          />
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(section)" />
          <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(section)" />
        </div>
      </li>
    </TransitionGroup>

    <BaseModal v-model="modalOpen" :title="editing ? 'تعديل القسم' : 'إضافة قسم'">
      <form id="section-form" class="stack" novalidate @submit="submit">
        <BaseSelect v-model="form.values.type" :options="typeOptions" label="نوع القسم" />
        <BaseInput
          v-model="form.values.section_key"
          label="المفتاح"
          dir="ltr"
          list="block-keys"
          :error="form.errors.section_key"
          :hint="form.values.type === 'CATEGORY_GRID' ? 'أي مفتاح مميز؛ يعرض الأقسام المحددة «بالرئيسية»' : 'نفس مفتاح المحتوى في صفحة السلايدر والبانرات'"
          required
        />
        <datalist id="block-keys">
          <option v-for="key in keySuggestions" :key="key" :value="key" />
        </datalist>
        <BaseInput v-if="form.values.type === 'CATEGORY_GRID'" v-model="form.values.title" label="عنوان القسم (اختياري)" placeholder="تسوّق حسب القسم" />
        <BaseCheckbox v-model="form.values.isActive" switch label="ظاهر في الصفحة الرئيسية" />
        <BaseAlert v-if="form.formError.value" tone="danger">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="section-form" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </AdminPage>
</template>

<style scoped>
.sections {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.sections.is-busy {
  opacity: 0.7;
}
.section-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}
.section-row__order {
  display: grid;
  place-items: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 50%;
  background: var(--color-surface-sunken);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.section-row__icon {
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-softer);
  color: var(--color-primary);
  font-size: 1.3rem;
}
.section-row__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 12rem;
  font-size: var(--text-sm);
}
.section-row__text > span {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.warn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--color-warning);
  font-weight: var(--weight-semibold);
}
.section-row__actions {
  display: flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>

<script setup lang="ts">
import type { Category } from '~/types/models';
import type { AdminLanguage } from '~/utils/translation';

const admin = useAdminService();
const toast = useToast();

useHead({ title: 'الأقسام' });

interface CategoryForm {
  tr: Record<AdminLanguage, { name: string; description: string }>;
  slug: string;
  parentId: string;
  image: string | null;
  isActive: boolean;
  showInHome: boolean;
  sectionOrder: number | null;
  metaTitle: string;
  metaDescription: string;
}

const { items: tree, loading, refresh, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<Category, CategoryForm>({
  key: 'admin-categories',
  list: () => admin.categories.tree(),
  toForm: (category) => ({
    tr: fromTranslations(category?.translations, ADMIN_LANGUAGES, (t) => ({
      name: t?.name ?? '',
      description: t?.description ?? '',
    })) as CategoryForm['tr'],
    slug: category?.slug ?? '',
    parentId: category?.parentId ?? '',
    image: category?.image ?? null,
    isActive: category?.isActive ?? true,
    showInHome: category?.showInHome ?? false,
    sectionOrder: category?.sectionOrder ?? 0,
    metaTitle: category?.metaTitle ?? '',
    metaDescription: category?.metaDescription ?? '',
  }),
  rules: {
    tr: [(tr) => !!(tr as CategoryForm['tr']).ar.name.trim() || 'اسم القسم بالعربية مطلوب'],
    slug: [(slug) => !slug || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug)) || 'حروف إنجليزية صغيرة وأرقام وشرطة فقط'],
    metaTitle: [(v) => String(v ?? '').length <= 70 || 'بحد أقصى 70 حرفاً'],
    metaDescription: [(v) => String(v ?? '').length <= 320 || 'بحد أقصى 320 حرفاً'],
  },
  save: (values, category) => {
    const payload = {
      translations: toTranslations(
        Object.fromEntries(
          Object.entries(values.tr).map(([code, t]) => [code, { name: t.name.trim(), description: t.description.trim() || undefined }]),
        ),
        (t) => !!t.name,
      ),
      slug: values.slug.trim() || undefined,
      parentId: values.parentId || null,
      image: values.image,
      isActive: values.isActive,
      showInHome: values.showInHome,
      sectionOrder: Number(values.sectionOrder ?? 0),
      metaTitle: values.metaTitle.trim() || null,
      metaDescription: values.metaDescription.trim() || null,
    };
    return category ? admin.categories.update(category.id, payload) : admin.categories.create(payload);
  },
  remove: (category) => admin.categories.remove(category.id),
  describe: (category) => nameAr(category),
  messages: { created: 'تمت إضافة القسم', updated: 'تم حفظ القسم', deleted: 'تم حذف القسم' },
});

const nameAr = (c: Category) => c.translations.find((t) => t.languageCode === 'ar')?.name ?? c.slug;
const nameEn = (c: Category) => c.translations.find((t) => t.languageCode === 'en')?.name;

const expanded = ref(new Set<string>());
const toggle = (id: string) => (expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id));

/** A category with children cannot become a child itself (two levels max). */
const parentOptions = computed(() =>
  tree.value
    .filter((c) => c.id !== editing.value?.id)
    .map((c) => ({ value: c.id, label: nameAr(c) })),
);
const canHaveParent = computed(() => !editing.value?.children?.length);

function addChild(parent: Category) {
  openCreate();
  form.values.parentId = parent.id;
}

async function quickToggle(category: Category, field: 'isActive' | 'showInHome', value: boolean) {
  try {
    await admin.categories.update(category.id, { [field]: value });
    category[field] = value;
  } catch (error) {
    toast.fromError(error);
    await refresh();
  }
}
</script>

<template>
  <AdminPage title="الأقسام" description="شجرة من مستويين: أقسام رئيسية وأقسام فرعية. الترتيب يتحكم في القائمة والصفحة الرئيسية.">
    <template #actions>
      <BaseButton icon="ph:plus" @click="openCreate">قسم جديد</BaseButton>
    </template>

    <div v-if="loading && !tree.length" class="stack">
      <div v-for="n in 4" :key="n" class="skeleton" style="block-size: 4.5rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else-if="!tree.length" class="card">
      <BaseEmptyState icon="ph:tree-structure" title="لا توجد أقسام بعد">
        <BaseButton icon="ph:plus" @click="openCreate">أضف أول قسم</BaseButton>
      </BaseEmptyState>
    </div>

    <ul v-else v-auto-animate class="tree">
      <li v-for="category in tree" :key="category.id" class="node card">
        <div class="node__row">
          <button
            type="button"
            class="node__toggle"
            :class="{ 'is-open': expanded.has(category.id) }"
            :disabled="!category.children?.length"
            :aria-label="expanded.has(category.id) ? 'طي' : 'توسيع'"
            @click="toggle(category.id)"
          >
            <Icon name="ph:caret-left" />
          </button>
          <BaseImage :src="category.image" alt="" :width="56" :height="56" ratio="1" rounded class="node__img" />
          <div class="node__text">
            <strong>{{ nameAr(category) }}</strong>
            <span class="node__meta meta-list">
              <span v-if="nameEn(category)" dir="ltr">{{ nameEn(category) }}</span>
              <code dir="ltr">/{{ category.slug }}</code>
              <span>{{ category.children?.length ?? 0 }} فرعي</span>
              <span>ترتيب {{ category.sectionOrder }}</span>
            </span>
          </div>
          <div class="node__flags">
            <BaseCheckbox switch :model-value="category.isActive" label="ظاهر" @update:model-value="quickToggle(category, 'isActive', $event)" />
            <BaseCheckbox switch :model-value="category.showInHome" label="بالرئيسية" @update:model-value="quickToggle(category, 'showInHome', $event)" />
          </div>
          <div class="node__actions">
            <BaseButton variant="ghost" size="sm" icon="ph:plus" icon-only label="إضافة قسم فرعي" @click="addChild(category)" />
            <BaseButton variant="ghost" size="sm" icon="ph:arrow-square-out" icon-only label="عرض في المتجر" :to="`/category/${category.slug}`" target="_blank" />
            <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(category)" />
            <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(category)" />
          </div>
        </div>

        <ul v-if="expanded.has(category.id) && category.children?.length" class="node__children">
          <li v-for="child in category.children" :key="child.id" class="node__row node__row--child">
            <BaseImage :src="child.image" alt="" :width="44" :height="44" ratio="1" rounded class="node__img node__img--sm" />
            <div class="node__text">
              <strong>{{ nameAr(child) }}</strong>
              <span class="node__meta meta-list">
                <code dir="ltr">/{{ child.slug }}</code>
                <span>ترتيب {{ child.sectionOrder }}</span>
              </span>
            </div>
            <div class="node__flags">
              <BaseCheckbox switch :model-value="child.isActive" label="ظاهر" @update:model-value="quickToggle(child, 'isActive', $event)" />
            </div>
            <div class="node__actions">
              <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(child)" />
              <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف" class="danger" @click="remove(child)" />
            </div>
          </li>
        </ul>
      </li>
    </ul>

    <BaseModal v-model="modalOpen" :title="editing ? 'تعديل القسم' : 'قسم جديد'" size="lg" persistent>
      <form id="category-form" class="stack" novalidate @submit="submit">
        <TranslationTabs v-slot="{ lang }" :errors="{ ar: !!form.errors.tr }">
          <BaseInput
            v-model="form.values.tr[lang].name"
            :label="lang === 'ar' ? 'اسم القسم' : 'Category name'"
            :error="lang === 'ar' ? form.errors.tr : undefined"
            :required="lang === 'ar'"
          />
          <BaseTextarea v-model="form.values.tr[lang].description" :label="lang === 'ar' ? 'وصف (يظهر أعلى صفحة القسم)' : 'Description'" :rows="3" :maxlength="1000" />
        </TranslationTabs>

        <div class="form-grid">
          <BaseSelect
            v-model="form.values.parentId"
            :options="[{ value: '', label: '— قسم رئيسي —' }, ...parentOptions]"
            label="القسم الأب"
            :disabled="!canHaveParent"
            :hint="canHaveParent ? undefined : 'هذا القسم له أقسام فرعية فلا يمكن نقله تحت قسم آخر'"
          />
          <BaseInput v-model="form.values.sectionOrder" type="number" :min="0" label="الترتيب" />
          <BaseInput v-model="form.values.slug" label="الرابط (slug)" dir="ltr" placeholder="يُنشأ تلقائياً من الاسم" :error="form.errors.slug" class="form-grid__full" />
        </div>

        <ImageUploader v-model="form.values.image" folder="categories" label="صورة القسم" hint="تظهر في الصفحة الرئيسية والقائمة وأعلى صفحة القسم." />

        <div class="cluster">
          <BaseCheckbox v-model="form.values.isActive" switch label="ظاهر في المتجر" />
          <BaseCheckbox v-model="form.values.showInHome" switch label="يظهر في الصفحة الرئيسية" />
        </div>

        <details class="seo">
          <summary><Icon name="ph:magnifying-glass" aria-hidden="true" />تحسين محركات البحث (SEO)</summary>
          <div class="stack">
            <BaseInput v-model="form.values.metaTitle" label="عنوان الصفحة" :maxlength="70" :error="form.errors.metaTitle" hint="حتى 70 حرفاً؛ يُستخدم الاسم إذا تُرك فارغاً" />
            <BaseTextarea v-model="form.values.metaDescription" label="وصف الصفحة" :rows="2" :maxlength="320" :error="form.errors.metaDescription" />
          </div>
        </details>

        <BaseAlert v-if="form.formError.value" tone="danger">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="category-form" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </AdminPage>
</template>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.node {
  overflow: hidden;
}
.node__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}
.node__row--child {
  padding-inline-start: var(--space-10);
  border-block-start: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}
.node__toggle {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  transition: transform var(--duration-base) var(--ease-out);
}
.node__toggle.is-open {
  transform: rotate(-90deg);
}
.node__toggle:disabled {
  opacity: 0.25;
}
.node__img {
  inline-size: 3.5rem;
  flex-shrink: 0;
}
.node__img--sm {
  inline-size: 2.75rem;
}
.node__text {
  display: flex;
  flex: 1 1 9rem;
  flex-direction: column;
  min-inline-size: 0;
}
.node__meta {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.node__flags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.node__actions {
  display: flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.seo {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}
.seo summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-bold);
  cursor: pointer;
}
.seo[open] summary {
  margin-block-end: var(--space-4);
}
</style>

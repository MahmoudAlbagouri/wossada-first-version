<script setup lang="ts">
import type { Brand, Category, Color, Material, Product, ProductSlider, Size } from '~/types/models';
import type { AdminLanguage } from '~/utils/translation';

/** Create (`productId` empty) or edit a product with all its sections. */
const props = defineProps<{ productId?: string }>();

const admin = useAdminService();
const router = useRouter();
const toast = useToast();
const { confirm } = useConfirm();
const { pick } = useLocalized();

interface SpecRow {
  key: string;
  value: string;
}
interface VariantRow {
  uid: number;
  sku: string;
  price: number | null;
  discountPrice: number | null;
  stock: number | null;
  colorId: string;
  sizeId: string;
  materialId: string;
  variantImages: string[];
}
interface ProductForm {
  tr: Record<AdminLanguage, { name: string; shortDescription: string; longDescription: string; specs: SpecRow[] }>;
  basePrice: number | null;
  baseDiscountPrice: number | null;
  baseStock: number | null;
  mainImage: string | null;
  defaultGallery: string[];
  categoryIds: string[];
  brandId: string;
  sliderIds: string[];
  isActive: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  isFreeShipping: boolean;
  fixedShippingPrice: number | null;
  variants: VariantRow[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogImage: string | null;
}

let uid = 0;
const toVariantRow = (v?: Product['variants'][number]): VariantRow => ({
  uid: ++uid,
  sku: v?.sku ?? '',
  price: v?.price ?? null,
  discountPrice: v?.discountPrice ?? null,
  stock: v?.stock ?? null,
  colorId: v?.color?.id ?? '',
  sizeId: v?.size?.id ?? '',
  materialId: v?.material?.id ?? '',
  variantImages: v?.variantImages ?? [],
});

function toForm(p: Product | null): ProductForm {
  return {
    tr: fromTranslations(p?.translations, ADMIN_LANGUAGES, (t) => ({
      name: t?.name ?? '',
      shortDescription: t?.shortDescription ?? '',
      longDescription: t?.longDescription ?? '',
      specs: Object.entries(t?.specifications ?? {}).map(([key, value]) => ({ key, value: String(value) })),
    })) as ProductForm['tr'],
    basePrice: p ? Number(p.basePrice) : null,
    baseDiscountPrice: p?.baseDiscountPrice ?? null,
    baseStock: p?.baseStock ?? 0,
    mainImage: p?.mainImage ?? null,
    defaultGallery: p?.defaultGallery ?? [],
    categoryIds: p?.categories?.map((c) => c.id) ?? [],
    brandId: p?.brand?.id ?? '',
    sliderIds: p?.sliders?.map((s) => s.id) ?? [],
    isActive: p?.isActive ?? true,
    weight: p?.weight ?? 0,
    length: p?.length ?? null,
    width: p?.width ?? null,
    height: p?.height ?? null,
    isFreeShipping: p?.isFreeShipping ?? false,
    fixedShippingPrice: p?.fixedShippingPrice ?? null,
    variants: p?.variants.map(toVariantRow) ?? [],
    slug: p?.slug ?? '',
    metaTitle: p?.metaTitle ?? '',
    metaDescription: p?.metaDescription ?? '',
    ogTitle: p?.ogTitle ?? '',
    ogImage: p?.ogImage ?? null,
  };
}

const isNumber = (v: unknown) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

const { values, errors, submitting, formError, handleSubmit, reset } = useForm(() => toForm(null), {
  tr: [(tr) => !!(tr as ProductForm['tr']).ar.name.trim() || 'اسم المنتج بالعربية مطلوب'],
  basePrice: [(v) => (isNumber(v) && Number(v) >= 0) || 'السعر مطلوب'],
  baseDiscountPrice: [
    (v, all) => !isNumber(v) || Number(v) < Number(all.basePrice) || 'سعر الخصم يجب أن يكون أقل من السعر الأساسي',
  ],
  baseStock: [(v) => (isNumber(v) && Number.isInteger(Number(v)) && Number(v) >= 0) || 'أدخل كمية صحيحة'],
  mainImage: [(v) => !!v || 'الصورة الرئيسية مطلوبة'],
  categoryIds: [(v) => (v as string[]).length > 0 || 'اختر قسماً واحداً على الأقل'],
  slug: [(v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v)) || 'حروف إنجليزية صغيرة وأرقام وشرطة فقط'],
  variants: [
    (rows) => {
      const list = rows as VariantRow[];
      if (list.some((r) => !r.sku.trim())) return 'كود SKU مطلوب لكل اختيار';
      const skus = list.map((r) => r.sku.trim().toLowerCase());
      if (new Set(skus).size !== skus.length) return 'أكواد SKU مكررة';
      if (list.some((r) => !r.colorId && !r.sizeId && !r.materialId)) return 'كل اختيار يحتاج لون أو مقاس أو خامة';
      if (list.some((r) => isNumber(r.discountPrice) && isNumber(r.price) && Number(r.discountPrice) >= Number(r.price)))
        return 'سعر الخصم في أحد الاختيارات أكبر من سعره';
      return true;
    },
  ],
});

// --- Lookups ---
const lookups = reactive({
  categories: [] as Category[],
  brands: [] as Brand[],
  colors: [] as Color[],
  sizes: [] as Size[],
  materials: [] as Material[],
  sliders: [] as ProductSlider[],
});
const loading = ref(true);
const product = ref<Product | null>(null);
let snapshot = '';

onMounted(async () => {
  try {
    const [categories, brands, colors, sizes, materials, sliders, existing] = await Promise.all([
      admin.categories.tree(),
      admin.brands.list(),
      admin.colors.list(),
      admin.sizes.list(),
      admin.materials.list(),
      admin.home.productSliders.list(),
      props.productId ? admin.products.get(props.productId) : Promise.resolve(null),
    ]);
    Object.assign(lookups, { categories, brands, colors, sizes, materials, sliders });
    product.value = existing;
    reset(toForm(existing));
  } catch (error) {
    toast.fromError(error);
  } finally {
    snapshot = JSON.stringify(values);
    loading.value = false;
  }
});

const dirty = computed(() => !loading.value && JSON.stringify(values) !== snapshot);

/**
 * History back when we came from the list, so it reopens on the same page,
 * filters and scroll position; a direct link or new tab starts at page 1.
 */
function backToList() {
  const back = router.options.history.state.back;
  if (typeof back === 'string' && router.resolve(back).path === '/admin/products') router.back();
  else navigateTo('/admin/products');
}

onBeforeRouteLeave(async () => {
  if (!dirty.value || submitting.value) return true;
  return confirm({ title: 'تغييرات غير محفوظة', message: 'هل تريد المغادرة دون حفظ؟', tone: 'danger', confirmText: 'مغادرة', cancelText: 'البقاء' });
});

const nameOf = (entity: { translations: { languageCode: string; name: string }[] }) => pick(entity.translations)?.name ?? '';
const brandOptions = computed(() => [{ value: '', label: 'بدون ماركة' }, ...lookups.brands.map((b) => ({ value: b.id, label: nameOf(b) }))]);
const colorOptions = computed(() => [{ value: '', label: '—' }, ...lookups.colors.map((c) => ({ value: c.id, label: nameOf(c) }))]);
const sizeOptions = computed(() => [{ value: '', label: '—' }, ...lookups.sizes.map((s) => ({ value: s.id, label: `${nameOf(s)} (${s.type})` }))]);
const materialOptions = computed(() => [{ value: '', label: '—' }, ...lookups.materials.map((m) => ({ value: m.id, label: nameOf(m) }))]);

function toggleIn(list: string[], id: string) {
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
}

// --- Specifications & variants ---
const addSpec = (lang: AdminLanguage) => values.tr[lang].specs.push({ key: '', value: '' });
const removeSpec = (lang: AdminLanguage, index: number) => values.tr[lang].specs.splice(index, 1);

function addVariant() {
  const base = values.slug || 'SKU';
  values.variants.push({ ...toVariantRow(), sku: `${base}-${values.variants.length + 1}`.toUpperCase() });
}
const removeVariant = (index: number) => values.variants.splice(index, 1);
const expandedVariant = ref<number | null>(null);

// --- Save ---
const numOrNull = (v: unknown) => (isNumber(v) ? Number(v) : null);

function buildPayload(v: ProductForm) {
  return {
    translations: ADMIN_LANGUAGES.map((code) => {
      const t = v.tr[code];
      const specifications = Object.fromEntries(
        t.specs.filter((s) => s.key.trim() && s.value.trim()).map((s) => [s.key.trim(), s.value.trim()]),
      );
      return {
        languageCode: code,
        name: t.name.trim(),
        shortDescription: t.shortDescription.trim() || undefined,
        longDescription: t.longDescription.trim() || undefined,
        specifications: Object.keys(specifications).length ? specifications : undefined,
      };
    }).filter((t) => t.name),
    basePrice: Number(v.basePrice),
    baseDiscountPrice: numOrNull(v.baseDiscountPrice),
    baseStock: Number(v.baseStock ?? 0),
    mainImage: v.mainImage,
    defaultGallery: v.defaultGallery,
    categoryIds: v.categoryIds,
    brandId: v.brandId || null,
    sliderIds: v.sliderIds,
    isActive: v.isActive,
    weight: Number(v.weight ?? 0),
    length: numOrNull(v.length),
    width: numOrNull(v.width),
    height: numOrNull(v.height),
    isFreeShipping: v.isFreeShipping,
    fixedShippingPrice: v.isFreeShipping ? null : numOrNull(v.fixedShippingPrice),
    variants: v.variants.map((row) => ({
      sku: row.sku.trim(),
      price: numOrNull(row.price),
      discountPrice: numOrNull(row.discountPrice),
      stock: numOrNull(row.stock),
      colorId: row.colorId || null,
      sizeId: row.sizeId || null,
      materialId: row.materialId || null,
      variantImages: row.variantImages,
    })),
    slug: v.slug.trim() || undefined,
    metaTitle: v.metaTitle.trim() || null,
    metaDescription: v.metaDescription.trim() || null,
    ogTitle: v.ogTitle.trim() || null,
    ogImage: v.ogImage,
  };
}

const save = handleSubmit(async (v) => {
  const payload = buildPayload(v as ProductForm);
  if (product.value) {
    product.value = await admin.products.update(product.value.id, payload);
    reset(toForm(product.value));
    snapshot = JSON.stringify(values);
    toast.success('تم حفظ المنتج');
  } else {
    const created = await admin.products.create(payload);
    snapshot = JSON.stringify(values);
    toast.success('تمت إضافة المنتج');
    await navigateTo(`/admin/products/${created.id}`, { replace: true });
  }
});

const errorCount = computed(() => Object.keys(errors).length);
</script>

<template>
  <AdminPage :title="product ? `تعديل: ${values.tr.ar.name || 'منتج'}` : 'منتج جديد'" :description="product ? undefined : 'املأ البيانات الأساسية ثم أضف الاختيارات (ألوان/مقاسات) إن وُجدت.'">
    <template #actions>
      <BaseButton variant="outline" icon="ph:arrow-left" @click="backToList">رجوع</BaseButton>
      <BaseButton v-if="product" :to="`/product/${product.slug}`" target="_blank" variant="outline" icon="ph:arrow-square-out">عرض</BaseButton>
      <BaseButton type="submit" form="product-form" :loading="submitting" :disabled="loading" icon="ph:floppy-disk">
        {{ product ? 'حفظ التغييرات' : 'إضافة المنتج' }}
      </BaseButton>
    </template>

    <div v-if="loading" class="editor">
      <div class="stack"><div v-for="n in 3" :key="n" class="skeleton" style="block-size: 14rem; border-radius: var(--radius-lg)" /></div>
      <div class="stack"><div v-for="n in 2" :key="n" class="skeleton" style="block-size: 12rem; border-radius: var(--radius-lg)" /></div>
    </div>

    <form v-else id="product-form" class="editor" novalidate @submit="save">
      <div class="editor__main">
        <BaseAlert v-if="errorCount" tone="danger" title="راجع الحقول المعلّمة">
          <ul class="errors">
            <li v-for="(message, field) in errors" :key="field">{{ message }}</li>
          </ul>
        </BaseAlert>
        <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:text-aa" />البيانات الأساسية</h2>
          <TranslationTabs v-slot="{ lang }" :errors="{ ar: !!errors.tr }">
            <BaseInput
              v-model="values.tr[lang].name"
              :label="lang === 'ar' ? 'اسم المنتج' : 'Product name'"
              :maxlength="200"
              :required="lang === 'ar'"
              :error="lang === 'ar' ? errors.tr : undefined"
            />
            <BaseTextarea v-model="values.tr[lang].shortDescription" :label="lang === 'ar' ? 'وصف مختصر' : 'Short description'" :rows="2" :maxlength="1000" />
            <BaseTextarea v-model="values.tr[lang].longDescription" :label="lang === 'ar' ? 'الوصف التفصيلي' : 'Full description'" :rows="6" :maxlength="20000" />

            <div class="specs">
              <p class="specs__label">{{ lang === 'ar' ? 'المواصفات' : 'Specifications' }}</p>
              <div v-for="(spec, index) in values.tr[lang].specs" :key="index" class="specs__row">
                <BaseInput v-model="spec.key" :placeholder="lang === 'ar' ? 'الخاصية (مثال: الخامة)' : 'Property'" />
                <BaseInput v-model="spec.value" :placeholder="lang === 'ar' ? 'القيمة (مثال: زان طبيعي)' : 'Value'" />
                <BaseButton variant="ghost" size="sm" icon="ph:x" icon-only label="حذف" @click="removeSpec(lang, index)" />
              </div>
              <BaseButton variant="secondary" size="sm" icon="ph:plus" @click="addSpec(lang)">{{ lang === 'ar' ? 'إضافة خاصية' : 'Add property' }}</BaseButton>
            </div>
          </TranslationTabs>
        </section>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:images" />الصور</h2>
          <ImageUploader v-model="values.mainImage" folder="products" label="الصورة الرئيسية" :error="errors.mainImage" required hint="تظهر في بطاقة المنتج ونتائج البحث. يُفضّل خلفية فاتحة ومقاس مربع." />
          <ImageUploader v-model="values.defaultGallery" folder="products" label="معرض الصور" multiple :max="10" />
        </section>

        <section class="panel">
          <div class="panel__head">
            <h2 class="panel__title"><Icon name="ph:swatches" />الاختيارات (ألوان / مقاسات / خامات)</h2>
            <BaseButton variant="secondary" size="sm" icon="ph:plus" @click="addVariant">إضافة اختيار</BaseButton>
          </div>
          <p class="panel__hint">
            اترك السعر أو المخزون فارغاً ليأخذ قيمة المنتج الأساسية. عند وجود اختيارات يجب على العميل اختيار واحد منها قبل الإضافة للسلة.
          </p>
          <p v-if="errors.variants" class="field-error" role="alert">{{ errors.variants }}</p>

          <div v-if="values.variants.length" class="variants">
            <div v-for="(variant, index) in values.variants" :key="variant.uid" class="variant">
              <div class="variant__grid">
                <BaseInput v-model="variant.sku" label="SKU" dir="ltr" required />
                <BaseSelect v-model="variant.colorId" :options="colorOptions" label="اللون" />
                <BaseSelect v-model="variant.sizeId" :options="sizeOptions" label="المقاس" />
                <BaseSelect v-model="variant.materialId" :options="materialOptions" label="الخامة" />
                <BaseInput v-model="variant.price" type="number" :min="0" label="السعر" placeholder="السعر الأساسي" />
                <BaseInput v-model="variant.discountPrice" type="number" :min="0" label="سعر الخصم" />
                <BaseInput v-model="variant.stock" type="number" :min="0" label="المخزون" placeholder="مشترك" />
              </div>
              <div class="variant__actions">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  :icon="expandedVariant === variant.uid ? 'ph:caret-up' : 'ph:image'"
                  @click="expandedVariant = expandedVariant === variant.uid ? null : variant.uid"
                >
                  صور الاختيار ({{ variant.variantImages.length }})
                </BaseButton>
                <BaseButton variant="ghost" size="sm" icon="ph:trash" class="danger" @click="removeVariant(index)">حذف</BaseButton>
              </div>
              <ImageUploader v-if="expandedVariant === variant.uid" v-model="variant.variantImages" folder="products" multiple :max="6" hint="تظهر أولاً في المعرض عند اختيار هذا الاختيار." />
            </div>
          </div>
          <BaseEmptyState v-else compact icon="ph:swatches" title="منتج بدون اختيارات" description="أضف اختيارات إذا كان المنتج متاحاً بأكثر من لون أو مقاس." />
        </section>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:truck" />الشحن</h2>
          <div class="form-grid">
            <BaseInput v-model="values.weight" type="number" :min="0" step="0.1" label="الوزن (كجم)" />
            <BaseInput v-model="values.length" type="number" :min="0" label="الطول (سم)" />
            <BaseInput v-model="values.width" type="number" :min="0" label="العرض (سم)" />
            <BaseInput v-model="values.height" type="number" :min="0" label="الارتفاع (سم)" />
          </div>
          <p class="panel__hint">يُحسب الشحن على الأكبر بين الوزن الفعلي والوزن الحجمي (الطول × العرض × الارتفاع ÷ 5000).</p>
          <BaseCheckbox v-model="values.isFreeShipping" switch label="شحن مجاني لهذا المنتج" />
          <BaseInput
            v-if="!values.isFreeShipping"
            v-model="values.fixedShippingPrice"
            type="number"
            :min="0"
            label="سعر شحن ثابت للقطعة (اختياري)"
            hint="إذا حُدد يُستخدم بدلاً من الحساب بالوزن"
          />
        </section>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:magnifying-glass" />تحسين محركات البحث (SEO)</h2>
          <BaseInput v-model="values.slug" label="الرابط (slug)" dir="ltr" placeholder="يُنشأ تلقائياً من الاسم" :error="errors.slug" />
          <BaseInput v-model="values.metaTitle" label="عنوان الصفحة" :maxlength="70" hint="حتى 70 حرفاً" />
          <BaseTextarea v-model="values.metaDescription" label="وصف الصفحة" :rows="2" :maxlength="320" />
          <BaseInput v-model="values.ogTitle" label="عنوان المشاركة على السوشيال" :maxlength="100" />
          <ImageUploader v-model="values.ogImage" folder="products" label="صورة المشاركة (اختياري)" hint="1200×630 مثالية؛ تُستخدم الصورة الرئيسية إذا تُركت فارغة." />
        </section>
      </div>

      <aside class="editor__side">
        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:eye" />الحالة</h2>
          <BaseCheckbox v-model="values.isActive" switch label="ظاهر في المتجر" description="المنتجات المخفية لا تظهر للعملاء" />
        </section>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:tag" />السعر والمخزون</h2>
          <BaseInput v-model="values.basePrice" type="number" :min="0" label="السعر (ج.م)" :error="errors.basePrice" required />
          <BaseInput v-model="values.baseDiscountPrice" type="number" :min="0" label="سعر بعد الخصم" :error="errors.baseDiscountPrice" hint="اتركه فارغاً إذا لا يوجد خصم" />
          <BaseInput v-model="values.baseStock" type="number" :min="0" label="المخزون" :error="errors.baseStock" required />
        </section>

        <section class="panel">
          <h2 class="panel__title"><Icon name="ph:tree-structure" />التصنيف</h2>
          <p class="specs__label">الأقسام <span class="field-required">*</span></p>
          <div class="checklist" :class="{ 'has-error': errors.categoryIds }">
            <template v-for="category in lookups.categories" :key="category.id">
              <BaseCheckbox
                :model-value="values.categoryIds.includes(category.id)"
                :label="nameOf(category)"
                @update:model-value="toggleIn(values.categoryIds, category.id)"
              />
              <BaseCheckbox
                v-for="child in category.children"
                :key="child.id"
                class="checklist__child"
                :model-value="values.categoryIds.includes(child.id)"
                :label="nameOf(child)"
                @update:model-value="toggleIn(values.categoryIds, child.id)"
              />
            </template>
          </div>
          <p v-if="errors.categoryIds" class="field-error" role="alert">{{ errors.categoryIds }}</p>
          <BaseSelect v-model="values.brandId" :options="brandOptions" label="الماركة" />

          <template v-if="lookups.sliders.length">
            <p class="specs__label">يظهر في سلايدر</p>
            <div class="checklist">
              <BaseCheckbox
                v-for="slider in lookups.sliders"
                :key="slider.id"
                :model-value="values.sliderIds.includes(slider.id)"
                :label="pick(slider.translations)?.title ?? slider.key"
                @update:model-value="toggleIn(values.sliderIds, slider.id)"
              />
            </div>
          </template>
        </section>
      </aside>
    </form>
  </AdminPage>
</template>

<style scoped>
.editor {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  align-items: start;
}
@media (min-width: 1100px) {
  .editor {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
  .editor__side {
    position: sticky;
    inset-block-start: 5rem;
  }
}
.editor__main,
.editor__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-inline-size: 0;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.panel__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
}
.panel__title > :first-child {
  color: var(--color-primary);
  font-size: 1.2rem;
}
.panel__hint {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.errors {
  padding-inline-start: var(--space-4);
  list-style: disc;
}
.specs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
}
.specs__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.specs__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  gap: var(--space-2);
  align-items: center;
  inline-size: 100%;
}
.variants {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.variant {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  animation: fade-up var(--duration-base) var(--ease-out);
}
.variant__grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
.variant__actions {
  display: flex;
  justify-content: space-between;
}
.danger {
  color: var(--color-danger);
}
.danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-block-size: 16rem;
  overflow-y: auto;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.checklist.has-error {
  border-color: var(--color-danger);
}
.checklist__child {
  padding-inline-start: var(--space-6);
}
.field-error {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-danger);
}
.field-required {
  color: var(--color-danger);
}
</style>

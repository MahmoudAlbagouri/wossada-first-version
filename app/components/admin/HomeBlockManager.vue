<script setup lang="ts">
import type { Resource } from '~/services/resource';
import type { FixedBanner, FullImage, MainSlider, Product, ProductSlider, StaticSection } from '~/types/models';
import type { HomeBlockType as BlockType } from '~/types/ui';
import type { AdminLanguage } from '~/utils/translation';

type Block = MainSlider | ProductSlider | FixedBanner | FullImage | StaticSection;

/**
 * CRUD for the home page content blocks. Each block has a `key`; a home
 * section (see /admin/home) shows every active block with its key.
 */
const props = defineProps<{ type: BlockType }>();

const admin = useAdminService();
const { pick } = useLocalized();

const RESOURCES: Record<BlockType, Resource<Block, Record<string, unknown>>> = {
  mainSlider: admin.home.mainSliders as unknown as Resource<Block, Record<string, unknown>>,
  productSlider: admin.home.productSliders as unknown as Resource<Block, Record<string, unknown>>,
  fixedBanner: admin.home.fixedBanners as unknown as Resource<Block, Record<string, unknown>>,
  fullImage: admin.home.fullImages as unknown as Resource<Block, Record<string, unknown>>,
  staticSection: admin.home.staticSections as unknown as Resource<Block, Record<string, unknown>>,
};
const LABELS: Record<BlockType, { singular: string; hint: string; icon: string }> = {
  mainSlider: { singular: 'سلايدر رئيسي', hint: 'صور كبيرة أعلى الصفحة الرئيسية مع عنوان وزر.', icon: 'ph:slideshow' },
  productSlider: { singular: 'سلايدر منتجات', hint: 'شريط منتجات مختارة (الأكثر مبيعاً، عروض، ...).', icon: 'ph:squares-four' },
  fixedBanner: { singular: 'بانر', hint: 'بانرات دعائية تظهر بجوار بعضها (1 إلى 3).', icon: 'ph:image-square' },
  fullImage: { singular: 'صورة عريضة', hint: 'صورة بعرض الصفحة برابط.', icon: 'ph:image' },
  staticSection: { singular: 'قسم ثابت', hint: 'أقسام جاهزة في التصميم؛ المفتاح features-section يعرض قسم المميزات.', icon: 'ph:puzzle-piece' },
};
const resource = RESOURCES[props.type];
const label = LABELS[props.type];

interface SlideRow {
  uid: number;
  imageUrl: string | null;
  tr: Record<AdminLanguage, { title: string; buttonText: string; buttonLink: string }>;
}
interface BlockForm {
  key: string;
  isActive: boolean;
  imageUrl: string | null;
  tr: Record<AdminLanguage, { title: string; link: string }>;
  items: SlideRow[];
  productIds: string[];
}

let uid = 0;
const emptyText = () => fromTranslations(undefined, ADMIN_LANGUAGES, () => ({ title: '', link: '' })) as BlockForm['tr'];
const toSlide = (item?: MainSlider['items'][number]): SlideRow => ({
  uid: ++uid,
  imageUrl: item?.imageUrl ?? null,
  tr: fromTranslations(item?.translations, ADMIN_LANGUAGES, (t) => ({
    title: t?.title ?? '',
    buttonText: t?.buttonText ?? '',
    buttonLink: t?.buttonLink ?? '',
  })) as SlideRow['tr'],
});

const initialProducts = ref<Product[]>([]);

const { items, loading, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<Block, BlockForm>({
  key: `admin-blocks-${props.type}`,
  list: () => resource.list(),
  toForm: (block) => {
    const withText = block as (FixedBanner | FullImage | ProductSlider) | null;
    initialProducts.value = (block as ProductSlider | null)?.products ?? [];
    return {
      key: block?.key ?? '',
      isActive: block?.isActive ?? true,
      imageUrl: (block as FixedBanner | null)?.imageUrl ?? null,
      tr:
        withText && 'translations' in withText
          ? (fromTranslations(withText.translations as { languageCode: string; title?: string | null; link?: string | null }[], ADMIN_LANGUAGES, (t) => ({
              title: t?.title ?? '',
              link: t?.link ?? '',
            })) as BlockForm['tr'])
          : emptyText(),
      items: (block as MainSlider | null)?.items?.slice().sort((a, b) => a.order - b.order).map(toSlide) ?? [],
      productIds: (block as ProductSlider | null)?.products?.map((p) => p.id) ?? [],
    };
  },
  rules: {
    key: [(v) => /^[a-z0-9][a-z0-9-_]{1,79}$/i.test(String(v ?? '').trim()) || 'مفتاح بالإنجليزية بدون مسافات (مثال: home-hero)'],
    imageUrl: [(v) => !['fixedBanner', 'fullImage'].includes(props.type) || !!v || 'الصورة مطلوبة'],
    tr: [(tr) => props.type !== 'productSlider' || !!(tr as BlockForm['tr']).ar.title.trim() || 'العنوان بالعربية مطلوب'],
    items: [
      (rows) =>
        props.type !== 'mainSlider' ||
        ((rows as SlideRow[]).length > 0 && (rows as SlideRow[]).every((r) => !!r.imageUrl)) ||
        'أضف شريحة واحدة على الأقل ولكل شريحة صورة',
    ],
  },
  save: (values, block) => {
    const base = { key: values.key.trim(), isActive: values.isActive };
    // Arabic is always sent; English only when something was filled in.
    const text = (pickFields: (t: BlockForm['tr'][AdminLanguage]) => Record<string, string | undefined>) =>
      ADMIN_LANGUAGES.map((code) => ({ code, fields: pickFields(values.tr[code]) }))
        .filter(({ code, fields }) => code === 'ar' || Object.values(fields).some(Boolean))
        .map(({ code, fields }) => ({ languageCode: code, ...fields }));
    const payloads: Record<BlockType, () => Record<string, unknown>> = {
      mainSlider: () => ({
        ...base,
        items: values.items.map((item, order) => ({
          imageUrl: item.imageUrl,
          order,
          translations: ADMIN_LANGUAGES.map((code) => ({
            languageCode: code,
            title: item.tr[code].title.trim() || undefined,
            buttonText: item.tr[code].buttonText.trim() || undefined,
            buttonLink: item.tr[code].buttonLink.trim() || undefined,
          })),
        })),
      }),
      productSlider: () => ({
        ...base,
        translations: ADMIN_LANGUAGES.map((code) => ({ languageCode: code, title: values.tr[code].title.trim() })).filter((t) => t.title),
        productIds: values.productIds,
      }),
      fixedBanner: () => ({
        ...base,
        imageUrl: values.imageUrl,
        translations: text((t) => ({ title: t.title.trim() || undefined, link: t.link.trim() || undefined })),
      }),
      fullImage: () => ({
        ...base,
        imageUrl: values.imageUrl,
        translations: text((t) => ({ link: t.link.trim() || undefined })),
      }),
      staticSection: () => base,
    };
    const payload = payloads[props.type]();
    return block ? resource.update(block.id, payload) : resource.create(payload);
  },
  remove: (block) => resource.remove(block.id),
  describe: (block) => block.key,
});

function preview(block: Block): string | null {
  if ('imageUrl' in block) return block.imageUrl;
  if ('items' in block) return block.items?.[0]?.imageUrl ?? null;
  if ('products' in block) return block.products?.[0]?.mainImage ?? null;
  return null;
}
function summary(block: Block): string {
  if ('items' in block) return `${block.items?.length ?? 0} شريحة`;
  if ('products' in block) return `${pick(block.translations)?.title ?? ''} · ${block.products?.length ?? 0} منتج`;
  if ('translations' in block) {
    const t = pick(block.translations as { languageCode: string; title?: string | null; link?: string | null }[]);
    return [t?.title, t?.link].filter(Boolean).join(' · ') || '—';
  }
  return '—';
}

const addSlide = () => form.values.items.push(toSlide());
const removeSlide = (index: number) => form.values.items.splice(index, 1);
function moveSlide(index: number, delta: -1 | 1) {
  const list = form.values.items;
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target]!, list[index]!];
}

const hasText = computed(() => ['productSlider', 'fixedBanner', 'fullImage'].includes(props.type));
const hasImage = computed(() => ['fixedBanner', 'fullImage'].includes(props.type));
</script>

<template>
  <div class="blocks">
    <div class="blocks__head">
      <p class="text-muted">{{ label.hint }}</p>
      <BaseButton icon="ph:plus" @click="openCreate">إضافة {{ label.singular }}</BaseButton>
    </div>

    <div v-if="loading && !items.length" class="grid-auto" style="--min: 260px">
      <div v-for="n in 3" :key="n" class="skeleton" style="block-size: 14rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else-if="!items.length" class="card">
      <BaseEmptyState :icon="label.icon" :title="`لا يوجد ${label.singular} بعد`" compact>
        <BaseButton icon="ph:plus" @click="openCreate">إضافة {{ label.singular }}</BaseButton>
      </BaseEmptyState>
    </div>
    <TransitionGroup v-else name="list" tag="div" class="grid-auto" style="--min: 260px">
      <article v-for="block in items" :key="block.id" class="block card">
        <BaseImage v-if="preview(block)" :src="preview(block)" alt="" :width="400" :height="200" ratio="2" class="block__img" />
        <div v-else class="block__placeholder"><Icon :name="label.icon" /></div>
        <div class="block__body">
          <div class="block__title">
            <code dir="ltr">{{ block.key }}</code>
            <BaseBadge :tone="block.isActive ? 'success' : 'neutral'" dot size="sm">{{ block.isActive ? 'مفعّل' : 'متوقف' }}</BaseBadge>
          </div>
          <p class="block__summary line-clamp-2">{{ summary(block) }}</p>
        </div>
        <div class="block__actions">
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" @click="openEdit(block)">تعديل</BaseButton>
          <BaseButton variant="ghost" size="sm" icon="ph:trash" class="danger" @click="remove(block)">حذف</BaseButton>
        </div>
      </article>
    </TransitionGroup>

    <BaseModal v-model="modalOpen" :title="editing ? `تعديل ${label.singular}` : `إضافة ${label.singular}`" size="lg" persistent>
      <form :id="`block-form-${type}`" class="stack" novalidate @submit="submit">
        <div class="form-grid">
          <BaseInput v-model="form.values.key" label="المفتاح (key)" dir="ltr" :error="form.errors.key" hint="يُستخدم لربطه بقسم في الصفحة الرئيسية" required />
          <div class="switch-cell"><BaseCheckbox v-model="form.values.isActive" switch label="مفعّل" /></div>
        </div>

        <ImageUploader v-if="hasImage" v-model="form.values.imageUrl" folder="banners" label="الصورة" :error="form.errors.imageUrl" required />

        <TranslationTabs v-if="hasText" v-slot="{ lang }" :errors="{ ar: !!form.errors.tr }">
          <BaseInput
            v-if="type !== 'fullImage'"
            v-model="form.values.tr[lang].title"
            :label="lang === 'ar' ? 'العنوان' : 'Title'"
            :error="lang === 'ar' ? form.errors.tr : undefined"
            :required="type === 'productSlider' && lang === 'ar'"
          />
          <BaseInput
            v-if="type !== 'productSlider'"
            v-model="form.values.tr[lang].link"
            :label="lang === 'ar' ? 'الرابط عند الضغط' : 'Link'"
            dir="ltr"
            placeholder="/category/bedrooms"
          />
        </TranslationTabs>

        <ProductPicker v-if="type === 'productSlider'" v-model="form.values.productIds" :initial="initialProducts" :max="30" />

        <template v-if="type === 'mainSlider'">
          <p v-if="form.errors.items" class="field-error" role="alert">{{ form.errors.items }}</p>
          <div v-for="(slide, index) in form.values.items" :key="slide.uid" class="slide">
            <div class="slide__head">
              <strong>شريحة {{ index + 1 }}</strong>
              <div class="cluster">
                <BaseButton variant="ghost" size="sm" icon="ph:arrow-up" icon-only label="أعلى" :disabled="index === 0" @click="moveSlide(index, -1)" />
                <BaseButton variant="ghost" size="sm" icon="ph:arrow-down" icon-only label="أسفل" :disabled="index === form.values.items.length - 1" @click="moveSlide(index, 1)" />
                <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only label="حذف الشريحة" class="danger" @click="removeSlide(index)" />
              </div>
            </div>
            <ImageUploader v-model="slide.imageUrl" folder="sliders" hint="مقاس مقترح 1600×640" />
            <TranslationTabs v-slot="{ lang }">
              <BaseInput v-model="slide.tr[lang].title" :label="lang === 'ar' ? 'العنوان (اختياري)' : 'Title'" />
              <div class="form-grid">
                <BaseInput v-model="slide.tr[lang].buttonText" :label="lang === 'ar' ? 'نص الزر' : 'Button text'" />
                <BaseInput v-model="slide.tr[lang].buttonLink" :label="lang === 'ar' ? 'رابط الزر' : 'Button link'" dir="ltr" placeholder="/products" />
              </div>
            </TranslationTabs>
          </div>
          <BaseButton variant="secondary" icon="ph:plus" @click="addSlide">إضافة شريحة</BaseButton>
        </template>

        <BaseAlert v-if="form.formError.value" tone="danger">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" :form="`block-form-${type}`" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.blocks__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.block {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.block__img {
  border-block-end: 1px solid var(--color-border);
}
.block__placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 2;
  background: var(--color-surface-muted);
  color: var(--color-primary);
  font-size: 2.5rem;
}
.block__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.block__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.block__title code {
  font-weight: var(--weight-bold);
}
.block__summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.block__actions {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-block-start: 1px solid var(--color-border);
}
.danger {
  color: var(--color-danger);
}
.danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.switch-cell {
  display: flex;
  align-items: center;
}
.slide {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
}
.slide__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field-error {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-danger);
}
</style>

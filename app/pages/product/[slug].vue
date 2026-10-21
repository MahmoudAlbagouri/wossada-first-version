<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import type { Product } from '~/types/models';
import type { VariantSelection } from '~/utils/product';

const route = useRoute();
const { t, locale } = useI18n();
const { name, pick, price } = useLocalized();
const config = useRuntimeConfig();
const appConfig = useAppConfig();
const catalog = useCatalogService();
const toast = useToast();

const slug = computed(() => String(route.params.slug));

const { data: product, error, refresh } = await useAsyncData(
  () => `product-${slug.value}`,
  () => catalog.getProduct(slug.value),
  { watch: [locale] },
);
failPage(error.value);

const { data: similar } = useLazyAsyncData(
  () => `similar-${product.value?.id}`,
  () => (product.value ? catalog.getSimilar(product.value.id) : Promise.resolve([] as Product[])),
  { default: () => [] as Product[], watch: [locale] },
);

// --- Variant selection (first in-stock variant is pre-selected) ---
function initialSelection(p: Product | null | undefined): VariantSelection {
  const variant = p?.variants.find((v) => availableStock(p, v) > 0) ?? p?.variants[0];
  return variant ? { color: variant.color?.id ?? null, size: variant.size?.id ?? null, material: variant.material?.id ?? null } : {};
}
const selection = ref<VariantSelection>(initialSelection(product.value));
watch(() => product.value?.id, () => (selection.value = initialSelection(product.value)));

const variant = computed(() => (product.value?.variants.length ? findVariant(product.value.variants, selection.value) : null));
const pricing = computed(() => (product.value ? displayPrice(product.value, variant.value) : null));
const stock = computed(() => (product.value ? availableStock(product.value, variant.value) : 0));
const images = computed(() => (product.value ? productImages(product.value, variant.value) : []));
const content = computed(() => pick(product.value?.translations));
const title = computed(() => content.value?.name ?? '');
const specs = computed(() => Object.entries(content.value?.specifications ?? {}).filter(([, value]) => value));
const category = computed(() => product.value?.categories?.[0]);
const canBuy = computed(() => !product.value?.variants.length || !!variant.value);

const quantity = ref(1);
watch([stock, () => variant.value?.id], () => {
  quantity.value = Math.min(Math.max(1, quantity.value), Math.max(1, stock.value));
});

type Tab = 'description' | 'specs' | 'shipping';
const tab = ref<Tab>('description');
const tabs = computed(() => [
  { key: 'description' as Tab, label: t('product.description') },
  ...(specs.value.length ? [{ key: 'specs' as Tab, label: t('product.specifications') }] : []),
  { key: 'shipping' as Tab, label: t('product.shippingReturns') },
]);

// --- Sticky purchase bar on phones once the main button scrolls away ---
const buyBox = ref<HTMLElement | null>(null);
const showStickyBar = ref(false);
useIntersectionObserver(buyBox, ([entry]) => {
  showStickyBar.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0;
});

// --- Sharing ---
const pageUrl = computed(() => `${config.public.siteUrl}${route.path}`);
const shareLinks = computed(() => [
  { name: 'WhatsApp', icon: 'ph:whatsapp-logo', href: `https://wa.me/?text=${encodeURIComponent(`${title.value} ${pageUrl.value}`)}` },
  { name: 'Facebook', icon: 'ph:facebook-logo', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}` },
  { name: 'X', icon: 'ph:x-logo', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl.value)}&text=${encodeURIComponent(title.value)}` },
]);
async function share() {
  try {
    if (navigator.share) await navigator.share({ title: title.value, url: pageUrl.value });
    else {
      await navigator.clipboard.writeText(pageUrl.value);
      toast.success(t('product.linkCopied'));
    }
  } catch {
    // The user closed the share sheet.
  }
}

// --- SEO ---
const crumbs = computed(() => [
  ...(category.value ? [{ label: name(category.value), to: `/category/${category.value.slug}` }] : [{ label: t('catalog.allProducts'), to: '/products' }]),
  { label: title.value },
]);

usePageSeo(() => ({
  title: product.value?.metaTitle || title.value,
  description: product.value?.metaDescription || content.value?.shortDescription || content.value?.longDescription,
  image: product.value?.ogImage || product.value?.mainImage,
  type: 'product',
}));

useJsonLd(() => {
  const p = product.value;
  if (!p) return null;
  const prices = p.variants.length ? p.variants.map((v) => displayPrice(p, v).price) : [displayPrice(p).price];
  const inStock = isInStock(p);
  const availability = `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title.value,
    description: content.value?.shortDescription || content.value?.longDescription || undefined,
    image: productImages(p),
    sku: p.variants[0]?.sku ?? p.id,
    brand: p.brand ? { '@type': 'Brand', name: name(p.brand) } : undefined,
    category: category.value ? name(category.value) : undefined,
    offers:
      prices.length > 1
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: appConfig.brand.currency,
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            availability,
            url: pageUrl.value,
          }
        : {
            '@type': 'Offer',
            priceCurrency: appConfig.brand.currency,
            price: prices[0],
            availability,
            itemCondition: 'https://schema.org/NewCondition',
            url: pageUrl.value,
          },
    aggregateRating:
      p.ratingsQuantity > 0
        ? { '@type': 'AggregateRating', ratingValue: Number(p.ratingsAverage).toFixed(1), reviewCount: p.ratingsQuantity }
        : undefined,
  };
}, 'product');
</script>

<template>
  <div v-if="product" class="pdp">
    <div class="container">
      <BaseBreadcrumbs :items="crumbs" class="pdp__crumbs" />

      <div class="pdp__grid">
        <div class="pdp__media">
          <ProductGallery
            :images="images"
            :alt="title"
            :badge="pricing?.discountPercent ? `-${pricing.discountPercent}%` : null"
          />
        </div>

        <div class="pdp__info">
          <NuxtLink v-if="product.brand" :to="`/products?brands=${product.brand.id}`" class="pdp__brand">
            {{ name(product.brand) }}
          </NuxtLink>
          <h1 class="pdp__title">{{ title }}</h1>

          <a v-if="product.ratingsQuantity" href="#reviews" class="pdp__rating">
            <BaseRating :value="Number(product.ratingsAverage)" show-value />
            <span>{{ t('reviews.count', { count: product.ratingsQuantity }, product.ratingsQuantity) }}</span>
          </a>

          <BasePrice v-if="pricing" :amount="pricing.price" :compare-at="pricing.compareAt" size="lg" show-saving class="pdp__price" />

          <p v-if="content?.shortDescription" class="pdp__short">{{ content.shortDescription }}</p>

          <VariantSelector v-if="product.variants.length" v-model="selection" :product="product" />
          <BaseAlert v-if="product.variants.length && !variant" tone="warning">{{ t('product.combinationUnavailable') }}</BaseAlert>

          <p v-if="canBuy" class="pdp__stock" :class="stock <= 0 ? 'is-out' : stock <= 5 ? 'is-low' : 'is-in'">
            <Icon :name="stock <= 0 ? 'ph:x-circle' : stock <= 5 ? 'ph:warning-circle' : 'ph:check-circle'" aria-hidden="true" />
            {{ stock <= 0 ? t('product.outOfStock') : stock <= 5 ? t('product.onlyLeft', { count: stock }) : t('product.inStock') }}
          </p>

          <div ref="buyBox" class="pdp__buy">
            <BaseQuantity v-model="quantity" :max="Math.max(1, Math.min(stock, 100))" :disabled="!canBuy || stock <= 0" />
            <AddToCartButton
              :product="product"
              :variant-id="variant?.id ?? null"
              :quantity="quantity"
              :disabled="!canBuy"
              inline
              size="lg"
              class="pdp__add"
            />
            <WishlistButton :product-id="product.id" variant="outline" />
          </div>

          <ul class="pdp__perks">
            <li>
              <Icon name="ph:truck" aria-hidden="true" />
              <span>{{ product.isFreeShipping ? t('product.freeShipping') : t('product.deliveryAll') }}</span>
            </li>
            <li><Icon name="ph:hand-coins" aria-hidden="true" /><span>{{ t('product.cod') }}</span></li>
            <li><Icon name="ph:arrows-counter-clockwise" aria-hidden="true" /><span>{{ t('product.easyReturns') }}</span></li>
          </ul>

          <dl v-if="variant?.sku || product.weight" class="pdp__meta">
            <div v-if="variant?.sku"><dt>{{ t('product.sku') }}</dt><dd dir="ltr">{{ variant.sku }}</dd></div>
            <div v-if="category">
              <dt>{{ t('product.category') }}</dt>
              <dd><NuxtLink :to="`/category/${category.slug}`">{{ name(category) }}</NuxtLink></dd>
            </div>
          </dl>

          <div class="pdp__share">
            <span>{{ t('product.share') }}</span>
            <a
              v-for="link in shareLinks"
              :key="link.name"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="pdp__share-btn"
              :aria-label="link.name"
            >
              <Icon :name="link.icon" />
            </a>
            <button type="button" class="pdp__share-btn" :aria-label="t('product.copyLink')" @click="share">
              <Icon name="ph:link" />
            </button>
          </div>
        </div>
      </div>

      <section class="pdp__details card">
        <BaseTabs v-model="tab" :tabs="tabs" />
        <Transition name="fade" mode="out-in">
          <div :key="tab" class="pdp__panel">
            <div v-if="tab === 'description'" class="prose">
              <p v-if="content?.longDescription">{{ content.longDescription }}</p>
              <p v-else class="text-subtle">{{ t('product.noDescription') }}</p>
            </div>
            <table v-else-if="tab === 'specs'" class="specs">
              <tbody>
                <tr v-for="[key, value] in specs" :key="key">
                  <th scope="row">{{ key }}</th>
                  <td>{{ value }}</td>
                </tr>
                <tr v-if="product.width || product.height || product.length">
                  <th scope="row">{{ t('product.dimensions') }}</th>
                  <td dir="ltr">{{ [product.length, product.width, product.height].filter(Boolean).join(' × ') }} cm</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="prose">
              <p>{{ t('product.shippingText') }}</p>
              <p v-if="config.public.freeShippingThreshold > 0">
                {{ t('product.freeShippingOver', { amount: price(config.public.freeShippingThreshold) }) }}
              </p>
              <p>{{ t('product.returnsText') }}</p>
            </div>
          </div>
        </Transition>
      </section>

      <ReviewsSection :product-id="product.id" class="pdp__reviews" @reviewed="refresh()" />

      <ProductCarousel
        v-if="similar.length"
        :title="t('product.similar')"
        :eyebrow="t('product.youMayLike')"
        :products="similar"
        :view-all-to="category ? `/category/${category.slug}` : '/products'"
        class="pdp__similar"
      />
    </div>

    <Transition name="slide-up">
      <div v-if="showStickyBar" class="sticky-buy hide-desktop">
        <div class="sticky-buy__info">
          <strong class="line-clamp-1">{{ title }}</strong>
          <BasePrice v-if="pricing" :amount="pricing.price" :compare-at="pricing.compareAt" size="sm" />
        </div>
        <AddToCartButton :product="product" :variant-id="variant?.id ?? null" :quantity="quantity" :disabled="!canBuy" inline />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pdp__crumbs {
  padding-block: var(--space-5);
}
.pdp__grid {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 1rem + 3vw, 4rem);
  align-items: start;
}
@media (min-width: 1024px) {
  .pdp__grid {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  }
  .pdp__media {
    position: sticky;
    inset-block-start: calc(var(--header-height) + 3rem + var(--space-4));
  }
}
.pdp__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fade-up 0.6s var(--ease-out);
}
.pdp__brand {
  align-self: flex-start;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  color: var(--color-primary);
  text-transform: uppercase;
}
.pdp__title {
  margin-block-start: calc(var(--space-3) * -1);
  font-size: clamp(1.4rem, 1.05rem + 1.6vw, 2.25rem);
  font-weight: var(--weight-black);
  line-height: var(--leading-tight);
}
.pdp__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-block-start: calc(var(--space-2) * -1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.pdp__rating:hover span {
  text-decoration: underline;
}
.pdp__price {
  padding-block: var(--space-4);
  border-block: 1px dashed var(--color-border);
}
.pdp__short {
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}
.pdp__stock {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.pdp__stock.is-in {
  color: var(--color-success);
}
.pdp__stock.is-low {
  color: var(--color-warning);
}
.pdp__stock.is-out {
  color: var(--color-danger);
}
.pdp__buy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.pdp__buy :deep(.qty) {
  --qty-h: 3.25rem;
}
.pdp__add {
  flex: 1;
  min-inline-size: 12rem;
}
.pdp__perks {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
  font-size: var(--text-sm);
}
@media (min-width: 640px) {
  .pdp__perks {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.pdp__perks li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
}
.pdp__perks li > :first-child {
  flex-shrink: 0;
  font-size: 1.4rem;
  color: var(--color-primary);
}
.pdp__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}
.pdp__meta div {
  display: flex;
  gap: var(--space-2);
}
.pdp__meta dt {
  color: var(--color-text-subtle);
}
.pdp__meta dt::after {
  content: ':';
}
.pdp__meta a {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}
.pdp__share {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}
.pdp__share-btn {
  display: grid;
  place-items: center;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 1.1rem;
  transition:
    color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
.pdp__share-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.pdp__details {
  margin-block-start: var(--space-section);
  padding: clamp(1rem, 0.6rem + 1.5vw, 2rem);
}
.pdp__panel {
  padding-block-start: var(--space-6);
}
.prose {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-inline-size: 75ch;
  line-height: var(--leading-relaxed);
  white-space: pre-line;
  color: var(--color-text-muted);
}
.specs {
  inline-size: 100%;
  max-inline-size: 720px;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.specs th,
.specs td {
  padding: var(--space-3) var(--space-4);
  border-block-end: 1px solid var(--color-border);
  text-align: start;
}
.specs th {
  inline-size: 35%;
  background: var(--color-surface-muted);
  font-weight: var(--weight-semibold);
}
.pdp__reviews,
.pdp__similar {
  margin-block-start: var(--space-section);
}
.sticky-buy {
  position: fixed;
  inset-inline: 0;
  inset-block-end: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--gutter);
  background: var(--color-surface);
  border-block-start: 1px solid var(--color-border);
  box-shadow: 0 -8px 24px rgb(47 42 34 / 0.08);
}
.sticky-buy__info {
  flex: 1;
  min-inline-size: 0;
  font-size: var(--text-sm);
}
</style>

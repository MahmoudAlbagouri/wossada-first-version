import type { MaybeRefOrGetter } from 'vue';

export interface PageSeo {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: 'website' | 'product' | 'article';
  /** Keep private pages (account, checkout) out of search engines. */
  noindex?: boolean;
}

const MAX_DESCRIPTION = 160;
const clip = (text: string) =>
  text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…` : text;

/**
 * Title, description, canonical, Open Graph and Twitter tags for a page.
 * Accepts getters so values update when async data arrives.
 */
export function usePageSeo(input: MaybeRefOrGetter<PageSeo>) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { brandName, brandDescription, ogImage } = useBrand();

  const seo = computed(() => toValue(input));
  const absolute = (url?: string | null) =>
    !url ? undefined : /^https?:\/\//.test(url) ? url : `${config.public.siteUrl}${url}`;

  const description = computed(() => clip((seo.value.description || brandDescription.value).replace(/\s+/g, ' ').trim()));
  const image = computed(() => absolute(seo.value.image) ?? absolute(ogImage));
  const canonical = computed(() => `${config.public.siteUrl}${route.path}`);

  useSeoMeta({
    title: () => seo.value.title || undefined,
    description,
    ogTitle: () => (seo.value.title ? `${seo.value.title} | ${brandName.value}` : brandName.value),
    ogDescription: description,
    ogImage: image,
    ogUrl: canonical,
    ogType: () => (seo.value.type === 'product' ? 'website' : (seo.value.type ?? 'website')),
    ogSiteName: brandName,
    twitterCard: 'summary_large_image',
    twitterTitle: () => seo.value.title || brandName.value,
    twitterDescription: description,
    twitterImage: image,
    robots: () => (seo.value.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'),
  });

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });
}

/**
 * Adds a schema.org JSON-LD block to the page head. `key` keeps several
 * blocks (product + breadcrumbs) from replacing each other.
 */
export function useJsonLd(
  data: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | null>,
  key = 'json-ld',
) {
  useHead({
    script: computed(() => {
      const value = toValue(data);
      return value ? [{ type: 'application/ld+json', key, innerHTML: JSON.stringify(value) }] : [];
    }),
  });
}

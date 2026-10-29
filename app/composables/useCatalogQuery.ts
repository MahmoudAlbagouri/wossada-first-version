import type { LocationQueryRaw } from 'vue-router';
import type { ProductQuery, ProductSort } from '~/types/models';

export const PRODUCT_SORTS: readonly ProductSort[] = ['relevance', 'newest', 'price_asc', 'price_desc', 'top_rated', 'most_reviewed'];

/** Best match while searching, newest otherwise. */
const defaultSort = (q: unknown): ProductSort => (q ? 'relevance' : 'newest');

/** Multi-select filters and the API parameter each one maps to. */
const LIST_FILTERS = {
  colors: 'colorIds',
  sizes: 'sizeIds',
  materials: 'materialIds',
  brands: 'brandIds',
} as const;

export type ListFilter = keyof typeof LIST_FILTERS;
type Patch = Partial<Record<'page' | 'sort' | 'q' | 'min' | 'max' | ListFilter, string | number | string[] | undefined>>;

/**
 * Catalog filters live in the URL (`?colors=a,b&min=100&sort=price_asc&page=2`)
 * so results are shareable, crawlable and survive reloads. Shared by the
 * shop page and every category page.
 */
export function useCatalogQuery(pageSize = 12) {
  const route = useRoute();
  const router = useRouter();

  const state = computed(() => {
    const q = route.query;
    const term = queryString(q, 'q') ?? '';
    const sort = queryString(q, 'sort') as ProductSort | undefined;
    const validSort = !!sort && PRODUCT_SORTS.includes(sort) && (sort !== 'relevance' || !!term);
    return {
      page: Math.max(1, queryNumber(q, 'page') ?? 1),
      sort: validSort ? sort : defaultSort(term),
      q: term,
      min: queryNumber(q, 'min'),
      max: queryNumber(q, 'max'),
      colors: queryList(q, 'colors'),
      sizes: queryList(q, 'sizes'),
      materials: queryList(q, 'materials'),
      brands: queryList(q, 'brands'),
    };
  });

  const apiQuery = computed<ProductQuery>(() => {
    const s = state.value;
    const query: ProductQuery = {
      page: s.page,
      limit: pageSize,
      sortBy: s.sort,
      searchTerm: s.q || undefined,
      minPrice: s.min,
      maxPrice: s.max,
    };
    for (const [filter, param] of Object.entries(LIST_FILTERS) as [ListFilter, (typeof LIST_FILTERS)[ListFilter]][]) {
      if (s[filter].length) query[param] = s[filter];
    }
    return query;
  });

  const activeCount = computed(() => {
    const s = state.value;
    const lists = (Object.keys(LIST_FILTERS) as ListFilter[]).reduce((sum, key) => sum + s[key].length, 0);
    return lists + (s.min !== undefined || s.max !== undefined ? 1 : 0);
  });

  /** Merges `patch` into the URL; any filter change goes back to page 1. */
  function update(patch: Patch) {
    const next: LocationQueryRaw = { ...route.query };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) delete next[key];
      else next[key] = Array.isArray(value) ? value.join(',') : String(value);
    }
    if (!('page' in patch) || next.page === '1') delete next.page;
    if (next.sort === defaultSort(next.q) || (next.sort === 'relevance' && !next.q)) delete next.sort;
    return router.push({ query: next });
  }

  function toggle(filter: ListFilter, id: string) {
    const current = state.value[filter];
    return update({ [filter]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] });
  }

  function clear() {
    return update({ colors: undefined, sizes: undefined, materials: undefined, brands: undefined, min: undefined, max: undefined });
  }

  /** Crawlable pagination links that keep the current filters. */
  const pageLink = (page: number) => ({ query: { ...route.query, page: page > 1 ? String(page) : undefined } });

  return { state, apiQuery, activeCount, update, toggle, clear, pageLink };
}

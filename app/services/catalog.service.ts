import type {
  Brand,
  CatalogResult,
  Category,
  CategoryPage,
  Color,
  HomeSection,
  Material,
  Product,
  ProductQuery,
  ProductReviews,
  Review,
  SearchSuggestions,
  Size,
} from '~/types/models';

/** Accepts `{ items, average, ... }` or a bare review array (older API). */
function toProductReviews(raw: unknown): ProductReviews {
  const summary = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Partial<ProductReviews>) : null;
  const items = (summary ? summary.items : raw) as Review[] | undefined;
  const list = Array.isArray(items) ? items : [];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ProductReviews['distribution'];
  for (const review of list) {
    const stars = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 0))) as 1 | 2 | 3 | 4 | 5;
    distribution[stars] += 1;
  }
  const average = list.length ? list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length : 0;
  return {
    items: list,
    average: Number(summary?.average ?? average) || 0,
    count: Number(summary?.count ?? list.length) || 0,
    distribution: { ...distribution, ...(summary?.distribution ?? {}) },
  };
}

/** Public storefront reads: products, categories, home page, reviews. */
export function useCatalogService() {
  const api = useApi();

  return {
    listProducts: (query: ProductQuery = {}) =>
      api<CatalogResult>('/products', { query: toApiQuery({ ...query }) }),

    searchSuggestions: (q: string) => api<SearchSuggestions>('/products/suggest', { query: { q } }),

    getProduct: (slug: string) => api<Product>(`/products/detail/${encodeURIComponent(slug)}`),

    getSimilar: (productId: string) => api<Product[]>(`/products/${productId}/similar`),

    getCategoryPage: (slug: string, query: ProductQuery = {}) =>
      api<CategoryPage>(`/categories/${encodeURIComponent(slug)}`, { query: toApiQuery({ ...query }) }),

    getNavCategories: () => api<Category[]>('/categories/nav'),

    getHome: () => api<HomeSection[]>('/home'),

    getReviews: (productId: string) =>
      api<unknown>(`/reviews/product/${productId}`).then(toProductReviews),

    createReview: (payload: { productId: string; rating: number; comment?: string }) =>
      api<Review>('/reviews', { method: 'POST', body: payload }),

    colors: () => api<Color[]>('/colors'),
    sizes: () => api<Size[]>('/sizes'),
    materials: () => api<Material[]>('/materials'),
    brands: () => api<Brand[]>('/brands'),
  };
}

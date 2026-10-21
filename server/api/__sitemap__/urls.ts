interface SitemapEntry {
  slug: string;
  updatedAt: string;
}

/**
 * Dynamic sitemap entries (products and categories) for @nuxtjs/sitemap.
 * Static pages are discovered from the `pages/` folder automatically.
 */
export default defineSitemapEventHandler(async () => {
  const { apiBase } = useRuntimeConfig().public;

  const list = (path: string) =>
    $fetch<{ data: SitemapEntry[] }>(path, { baseURL: apiBase, headers: { lang: 'ar' } })
      .then((response) => response.data ?? [])
      .catch(() => [] as SitemapEntry[]);

  const [products, categories] = await Promise.all([list('/products/sitemap'), list('/categories/sitemap')]);

  return [
    ...categories.map((category) => ({
      loc: `/category/${category.slug}`,
      lastmod: category.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.8 as const,
    })),
    ...products.map((product) => ({
      loc: `/product/${product.slug}`,
      lastmod: product.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.7 as const,
    })),
  ];
});

import type { Category } from '~/types/models';

const KEY = 'nav-categories';

/**
 * Fetches the category tree once, in the default layout (awaited, so SSR and
 * hydration see the same component tree). Refetches when the language changes.
 */
export function loadNavCategories() {
  const { locale } = useI18n();
  const catalog = useCatalogService();
  return useAsyncData(KEY, () => catalog.getNavCategories(), {
    watch: [locale],
    default: () => [] as Category[],
  });
}

/** Read-only access for the header, mobile menu and footer. */
export function useNavCategories() {
  const { data } = useNuxtData<Category[]>(KEY);
  return computed(() => data.value ?? []);
}

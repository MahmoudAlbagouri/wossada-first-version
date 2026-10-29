import { refDebounced } from '@vueuse/core';
import type { LocationQueryRaw } from 'vue-router';
import type { WritableComputedRef } from 'vue';

/**
 * Back-office list state (page, search and filters) lives in the URL
 * (`/admin/products?page=5&q=sofa&category=…`), so coming back from a detail
 * page, reloading or sharing the link lands on the same rows, and the browser
 * can restore the scroll position. Any search or filter change goes back to page 1.
 */
export function useAdminListQuery() {
  const route = useRoute();
  const router = useRouter();

  /** `replace`: paging and filtering don't stack up history entries, so Back leaves the list. */
  function write(patch: Record<string, string | undefined>) {
    const next: LocationQueryRaw = { ...route.query, ...patch };
    for (const [key, value] of Object.entries(patch)) if (!value) delete next[key];
    return router.replace({ query: next });
  }

  const page = computed({
    get: () => Math.max(1, Math.floor(queryNumber(route.query, 'page') ?? 1)),
    set: (value: number) => write({ page: value > 1 ? String(value) : undefined }),
  });

  /** A `?key=` filter; `fallback` is the "all" value and stays out of the URL. */
  function filter<T extends string = string>(key: string, fallback = '' as T): WritableComputedRef<T> {
    return computed({
      get: () => (queryString(route.query, key) ?? fallback) as T,
      set: (value: T) => write({ [key]: value === fallback ? undefined : value, page: undefined }),
    });
  }

  // The input stays responsive; the URL (`?q=`) follows once typing pauses.
  const searchTerm = computed(() => queryString(route.query, 'q')?.trim() ?? '');
  const search = ref(searchTerm.value);
  watch(refDebounced(search, 350), (value) => {
    if (value.trim() !== searchTerm.value) write({ q: value.trim() || undefined, page: undefined });
  });
  watch(searchTerm, (term) => {
    if (term !== search.value.trim()) search.value = term;
  });

  /** Steps back to the last page when a delete or a stale link points past the end (`undefined` while loading). */
  function keepPageInRange(totalPages: () => number | undefined) {
    // Only once mounted: a navigation fired during the page's async setup doesn't refetch its data.
    onMounted(() => {
      watch(
        [totalPages, page],
        ([total]) => {
          if (total && page.value > total) page.value = total;
        },
        { immediate: true },
      );
    });
  }

  return { page, filter, search, searchTerm, keepPageInRange };
}

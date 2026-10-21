import { defineStore } from 'pinia';

/** Saved product ids (for hearts everywhere); full cards load on the wishlist page. */
export const useWishlistStore = defineStore('wishlist', () => {
  const shop = useShopService();
  const ids = ref<string[]>([]);
  const loaded = ref(false);
  const pending = ref(new Set<string>());

  const count = computed(() => ids.value.length);
  const has = (productId: string) => ids.value.includes(productId);

  async function fetchIds(): Promise<void> {
    ids.value = await shop.getWishlistIds();
    loaded.value = true;
  }

  /** Optimistic toggle; rolled back if the request fails. */
  async function toggle(productId: string): Promise<boolean> {
    const wasSaved = has(productId);
    ids.value = wasSaved ? ids.value.filter((id) => id !== productId) : [...ids.value, productId];
    pending.value.add(productId);
    try {
      const { added } = await shop.toggleWishlist(productId);
      return added;
    } catch (error) {
      ids.value = wasSaved ? [...ids.value, productId] : ids.value.filter((id) => id !== productId);
      throw error;
    } finally {
      pending.value.delete(productId);
    }
  }

  function reset(): void {
    ids.value = [];
    loaded.value = false;
  }

  return { ids, loaded, pending, count, has, fetchIds, toggle, reset };
});

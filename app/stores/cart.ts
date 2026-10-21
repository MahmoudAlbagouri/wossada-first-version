import { defineStore } from 'pinia';
import type { Cart } from '~/types/models';

const EMPTY_CART: Cart = {
  items: [],
  itemsCount: 0,
  totalQuantity: 0,
  originalTotal: 0,
  savings: 0,
  total: 0,
};

/** Server-owned cart; every mutation replaces the state with the API result. */
export const useCartStore = defineStore('cart', () => {
  const shop = useShopService();
  const cart = ref<Cart>({ ...EMPTY_CART });
  const loaded = ref(false);
  const loading = ref(false);
  /** Line ids (or `add:<productId>`) currently being changed. */
  const busy = ref(new Set<string>());

  const items = computed(() => cart.value.items);
  const count = computed(() => cart.value.totalQuantity);
  const isEmpty = computed(() => cart.value.items.length === 0);
  const hasUnavailable = computed(() => cart.value.items.some((i) => !i.isAvailable));

  const lineFor = (productId: string, variantId?: string | null) =>
    cart.value.items.find(
      (i) => i.product.id === productId && (i.productVariant?.id ?? null) === (variantId ?? null),
    );

  async function track<T>(key: string, task: () => Promise<Cart>): Promise<void> {
    busy.value.add(key);
    try {
      cart.value = await task();
      loaded.value = true;
    } finally {
      busy.value.delete(key);
    }
  }

  async function fetch(): Promise<void> {
    loading.value = true;
    try {
      cart.value = await shop.getCart();
    } finally {
      loading.value = false;
      // "Loaded" means a fetch was attempted, so pages stop showing skeletons.
      loaded.value = true;
    }
  }

  const add = (productId: string, quantity = 1, variantId?: string | null) =>
    track(`add:${productId}`, () => shop.addToCart({ productId, quantity, variantId }));

  const update = (lineId: string, quantity: number) =>
    track(lineId, () => shop.updateCartLine(lineId, quantity));

  const remove = (lineId: string) => track(lineId, () => shop.removeCartLine(lineId));

  const clear = () => track('clear', () => shop.clearCart());

  /** Local reset after checkout / logout (the server empties the cart itself). */
  function reset(): void {
    cart.value = { ...EMPTY_CART };
    loaded.value = false;
  }

  return {
    cart,
    items,
    count,
    isEmpty,
    hasUnavailable,
    loaded,
    loading,
    busy,
    lineFor,
    fetch,
    add,
    update,
    remove,
    clear,
    reset,
  };
});

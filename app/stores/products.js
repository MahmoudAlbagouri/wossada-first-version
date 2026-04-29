import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useProductsStore = defineStore("products", () => {
  const api = useApi();
  const { locale } = useI18n();

  // --- State ---
  const products = ref([]);
  const meta = ref(null);
  const filters = ref(null);
  const currentProduct = ref(null);
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // --- Getters ---

  // تفاعلي تماماً مع تغيير اللغة
  const getProductName = computed(() => {
    return (product) => {
      const currentLang = locale.value;
      if (!product?.translations?.length)
        return product?.name || product?.slug || "";

      const t = product.translations.find(
        (t) => t.languageCode === currentLang,
      );
      return t ? t.name : product.translations[0]?.name || "";
    };
  });

  const getProductPrice = computed(() => (product) => {
    return parseFloat(product?.baseDiscountPrice || product?.basePrice || 0);
  });

  const getDiscountPercent = computed(() => (product) => {
    const base = parseFloat(product?.basePrice || 0);
    const disc = parseFloat(product?.baseDiscountPrice || 0);
    if (!base || !disc || disc >= base) return null;
    return Math.round(((base - disc) / base) * 100);
  });

  // --- Actions ---

  async function fetchProducts(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api("/products", { params });
      if (response.success) {
        products.value = response.data.data || response.data;
        meta.value = response.data.meta;
        filters.value = response.data.filters;
      }
    } catch (err) {
      error.value = "فشل تحميل المنتجات";
      console.error("fetchProducts error:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api(`/products/${id}`);
      if (response.success) {
        currentProduct.value = response.data;
        return response.data;
      }
      return null;
    } catch (err) {
      error.value = "فشل تحميل المنتج";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(payload) {
    actionLoading.value = true;
    try {
      const response = await api("/products", {
        method: "POST",
        body: payload,
      });
      if (response.success) {
        await fetchProducts();
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      actionLoading.value = false;
    }
  }

  async function updateProduct(id, payload) {
    actionLoading.value = true;
    try {
      const response = await api(`/products/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (response.success) {
        await fetchProducts();
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      actionLoading.value = false;
    }
  }

  async function deleteProduct(id) {
    actionLoading.value = true;
    try {
      const response = await api(`/products/${id}`, { method: "DELETE" });
      if (response.success) {
        products.value = products.value.filter((p) => p.id !== id);
        return { success: true };
      }
      return { success: false };
    } finally {
      actionLoading.value = false;
    }
  }

  async function duplicateProduct(id) {
    actionLoading.value = true;
    try {
      const response = await api(`/products/${id}/duplicate`, {
        method: "POST",
      });
      if (response.success) {
        await fetchProducts();
        return { success: true };
      }
      return { success: false };
    } finally {
      actionLoading.value = false;
    }
  }

  return {
    products,
    meta,
    filters,
    currentProduct,
    loading,
    actionLoading,
    error,
    getProductName,
    getProductPrice,
    getDiscountPercent,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
  };
});

import { defineStore } from "pinia";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    meta: null,
    filters: null,
    currentProduct: null, // سيحتوي على هيكل البيانات الجديد
    loading: false,
    actionLoading: false,
    error: null,
  }),

  getters: {
    getProductName:
      (state) =>
      (product, lang = "ar") => {
        if (!product?.translations?.length) return product?.slug || "";
        const t = product.translations.find((t) => t.languageCode === lang);
        return t ? t.name : product.translations[0]?.name || "";
      },

    getProductPrice: () => (product) => {
      return parseFloat(product?.baseDiscountPrice || product?.basePrice || 0);
    },

    getDiscountPercent: () => (product) => {
      const base = parseFloat(product?.basePrice || 0);
      const disc = parseFloat(product?.baseDiscountPrice || 0);
      if (!base || !disc || disc >= base) return null;
      return Math.round(((base - disc) / base) * 100);
    },
  },

  actions: {
    _getOpts() {
      const nuxtApp = useNuxtApp();
      const config = useRuntimeConfig();
      const token =
        useCookie("auth_token").value ||
        nuxtApp.$pinia?.state?.value?.auth?.token;
      return {
        baseURL: config.public.apiBase,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    },

    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const query = new URLSearchParams(params).toString();
        const url = query ? `/products?${query}` : "/products";
        const response = await $fetch(url, { baseURL, headers });
        if (response.success) {
          // تأكد من هيكلية الرد: هل البيانات في response.data.data أم response.data؟
          // حسب مثالك الجديد، البيانات المباشرة في response.data
          this.products = response.data.data || response.data;
          this.meta = response.data.meta;
          this.filters = response.data.filters;
        }
      } catch (error) {
        this.error = "فشل تحميل المنتجات";
        console.error("fetchProducts error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/products/${id}`, { baseURL, headers });
        if (response.success) {
          // هنا نستقبل الهيكل الجديد كما هو
          this.currentProduct = response.data;
          return response.data;
        }
        return null;
      } catch (error) {
        this.error = "فشل تحميل المنتج";
        console.error("fetchProduct error:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createProduct(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/products", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchProducts();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (error) {
        console.error("createProduct error:", error);
        return { success: false, error };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateProduct(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/products/${id}`, {
          method: "PATCH", // أو PUT حسب الـ API لديك
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchProducts();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (error) {
        console.error("updateProduct error:", error);
        return { success: false, error };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteProduct(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/products/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.products = this.products.filter((p) => p.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (error) {
        console.error("deleteProduct error:", error);
        return { success: false, error };
      } finally {
        this.actionLoading = false;
      }
    },

    async duplicateProduct(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/products/${id}/duplicate`, {
          method: "POST",
          baseURL,
          headers,
        });
        if (response.success) {
          await this.fetchProducts();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (error) {
        console.error("duplicateProduct error:", error);
        return { success: false, error };
      } finally {
        this.actionLoading = false;
      }
    },
  },
});

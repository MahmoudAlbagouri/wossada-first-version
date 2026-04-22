import { defineStore } from "pinia";

export const useCategoryProductsStore = defineStore("categoryProducts", {
  state: () => ({
    category: null,
    products: [],
    filters: {
      colors: [],
      sizes: [],
      brands: [],
    },
    meta: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 12,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCategoryProducts(slug, params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const nuxtApp = useNuxtApp();
        const config = useRuntimeConfig();
        const token =
          useCookie("auth_token").value ||
          nuxtApp.$pinia.state.value.auth?.token;

        const response = await $fetch(`/categories/${slug}`, {
          baseURL: config.public.apiBase,
          params,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": nuxtApp.$i18n?.locale?.value || "ar",
            "Content-Type": "application/json",
          },
        });

        if (response.success) {
          this.category = response.data.category;
          this.products = response.data.products;
          this.filters = response.data.filters;
          this.meta = response.data.meta;
          return response.data;
        }

        return null;
      } catch (error) {
        console.error("Fetch Category Products Error:", error);
        // ✅ string فقط لتفادي خطأ Cannot stringify non-POJOs
        this.error = error?.message || "حدث خطأ أثناء جلب المنتجات";
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});

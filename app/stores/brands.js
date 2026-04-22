// stores/brands.js
import { defineStore } from "pinia";

export const useBrandsStore = defineStore("brands", {
  state: () => ({
    brands: [],
    loading: false,
    error: null,
  }),

  getters: {
    getBrandName:
      (state) =>
      (brand, lang = "ar") => {
        const t = brand.translations?.find((t) => t.languageCode === lang);
        return t?.name || brand.translations?.[0]?.name || "—";
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

    async fetchBrands() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/brands", { baseURL, headers });
        if (response.success) {
          this.brands = response.data;
        } else {
          this.error = response.message || "حدث خطأ أثناء جلب الماركات";
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ غير متوقع";
        console.error("fetchBrands error:", e);
      } finally {
        this.loading = false;
      }
    },

    async createBrand(payload) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/brands", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          this.brands.push(response.data);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createBrand error:", e);
        return {
          success: false,
          error: e?.data?.message || "فشل إنشاء الماركة",
        };
      }
    },

    async deleteBrand(id) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/brands/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.brands = this.brands.filter((b) => b.id !== id);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("deleteBrand error:", e);
        return { success: false, error: e?.data?.message || "فشل حذف الماركة" };
      }
    },
  },
});

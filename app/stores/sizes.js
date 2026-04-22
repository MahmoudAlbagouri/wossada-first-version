// stores/sizes.js
import { defineStore } from "pinia";

export const useSizesStore = defineStore("sizes", {
  state: () => ({
    sizes: [],
    loading: false,
    error: null,
  }),

  getters: {
    getSizeName:
      (state) =>
      (size, lang = "ar") => {
        const t = size.translations?.find((t) => t.languageCode === lang);
        return t?.name || size.translations?.[0]?.name || "—";
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

    async fetchSizes() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/sizes", { baseURL, headers });
        if (response.success) {
          this.sizes = response.data;
        } else {
          this.error = response.message || "حدث خطأ أثناء جلب الأحجام";
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ غير متوقع";
        console.error("fetchSizes error:", e);
      } finally {
        this.loading = false;
      }
    },

    async createSize(payload) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/sizes", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          this.sizes.push(response.data);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createSize error:", e);
        return { success: false, error: e?.data?.message || "فشل إنشاء الحجم" };
      }
    },

    async deleteSize(id) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/sizes/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.sizes = this.sizes.filter((s) => s.id !== id);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("deleteSize error:", e);
        return { success: false, error: e?.data?.message || "فشل حذف الحجم" };
      }
    },
  },
});

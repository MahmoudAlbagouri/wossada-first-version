// stores/colors.js
import { defineStore } from "pinia";

export const useColorsStore = defineStore("colors", {
  state: () => ({
    colors: [],
    loading: false,
    error: null,
  }),

  getters: {
    getColorName:
      (state) =>
      (color, lang = "ar") => {
        const t = color.translations?.find((t) => t.languageCode === lang);
        return t?.name || color.translations?.[0]?.name || "—";
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

    // ====== جلب كل الألوان ======
    async fetchColors() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/colors", { baseURL, headers });
        if (response.success) {
          this.colors = response.data;
        } else {
          this.error = response.message || "حدث خطأ أثناء جلب الألوان";
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ غير متوقع";
        console.error("fetchColors error:", e);
      } finally {
        this.loading = false;
      }
    },

    // ====== إنشاء لون ======
    async createColor(payload) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/colors", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          this.colors.push(response.data);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createColor error:", e);
        return { success: false, error: e?.data?.message || "فشل إنشاء اللون" };
      }
    },

    // ====== حذف لون ======
    async deleteColor(id) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/colors/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.colors = this.colors.filter((c) => c.id !== id);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("deleteColor error:", e);
        return { success: false, error: e?.data?.message || "فشل حذف اللون" };
      }
    },
  },
});

// stores/materials.js
import { defineStore } from "pinia";

export const useMaterialsStore = defineStore("materials", {
  state: () => ({
    materials: [],
    loading: false,
    error: null,
  }),

  getters: {
    getMaterialName:
      (state) =>
      (material, lang = "ar") => {
        const t = material.translations?.find((t) => t.languageCode === lang);
        return t?.name || material.translations?.[0]?.name || "—";
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

    async fetchMaterials() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/materials", { baseURL, headers });
        if (response.success) {
          this.materials = response.data;
        } else {
          this.error = response.message || "حدث خطأ أثناء جلب الخامات";
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ غير متوقع";
        console.error("fetchMaterials error:", e);
      } finally {
        this.loading = false;
      }
    },

    async createMaterial(payload) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/materials", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          this.materials.push(response.data);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createMaterial error:", e);
        return {
          success: false,
          error: e?.data?.message || "فشل إنشاء الخامة",
        };
      }
    },

    async deleteMaterial(id) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/materials/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.materials = this.materials.filter((m) => m.id !== id);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("deleteMaterial error:", e);
        return { success: false, error: e?.data?.message || "فشل حذف الخامة" };
      }
    },
  },
});

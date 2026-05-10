import { defineStore } from "pinia";

export const useHomeConfigsStore = defineStore("homeConfigs", {
  state: () => ({
    sections: [],
    homeSections: [],
    loading: false,
    homeLoading: false,
    actionLoading: false,
    keySearchLoading: false,
    keySearchResults: [],
    error: null,
    homeError: null,
  }),

  getters: {
    getSectionById: (state) => (id) => state.sections.find((s) => s.id === id),
    hasData: (state) => state.sections.length > 0,
    sortedHomeSections: (state) =>
      [...state.homeSections].sort((a, b) => a.sectionOrder - b.sectionOrder),
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

    async fetchSections() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/home-/configs", { baseURL, headers });
        if (response.success) this.sections = response.data ?? [];
        else throw new Error(response.message || "فشل تحميل البيانات");
      } catch (e) {
        this.error = e.message || "حدث خطأ أثناء تحميل الأقسام";
      } finally {
        this.loading = false;
      }
    },

    async fetchHomePage() {
      this.homeLoading = true;
      this.homeError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/home-", { baseURL, headers });
        if (response.success) this.homeSections = response.data ?? [];
        else throw new Error(response.message || "فشل تحميل الصفحة الرئيسية");
      } catch (e) {
        this.homeError = e.message || "حدث خطأ أثناء تحميل الصفحة الرئيسية";
      } finally {
        this.homeLoading = false;
      }
    },

    async createSection(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/home-/configs", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchSections();
          return { success: true, data: response.data };
        }
        return { success: false, message: response.message };
      } catch (e) {
        return { success: false, message: e?.data?.message ?? e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateSection(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/home-/configs/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchSections();
          return { success: true, data: response.data };
        }
        return { success: false, message: response.message };
      } catch (e) {
        return { success: false, message: e?.data?.message ?? e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteSection(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/home-/configs/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.sections = this.sections.filter((s) => s.id !== id);
          return { success: true };
        }
        return { success: false, message: response.message };
      } catch (e) {
        return { success: false, message: e?.data?.message ?? e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    async toggleStatus(id, currentStatus) {
      const section = this.sections.find((s) => s.id === id);
      if (!section) return { success: false };
      section.isActive = !currentStatus;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/home-/configs/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: { isActive: !currentStatus },
        });
        if (response.success) return { success: true };
        section.isActive = currentStatus;
        return { success: false };
      } catch (e) {
        section.isActive = currentStatus;
        return { success: false, message: e?.data?.message ?? e.message };
      }
    },

    async searchKeys(type, query = "") {
      this.keySearchLoading = true;
      this.keySearchResults = [];
      const endpointMap = {
        mainSlider: "/main-sliders",
        productSlider: "/sliders",
        fixedBanner: "/fixed-banners",
        fullImage: "/full-images",
        staticSection: "/static-sections",
      };
      const endpoint = endpointMap[type];
      if (!endpoint) {
        this.keySearchLoading = false;
        return [];
      }
      try {
        const { baseURL, headers } = this._getOpts();
        const searchParam = query
          ? `?search=${encodeURIComponent(query)}&limit=10`
          : "?limit=10";
        const response = await $fetch(`${endpoint}${searchParam}`, {
          baseURL,
          headers,
        });
        if (response.success) {
          const list = Array.isArray(response.data)
            ? response.data
            : (response.data?.data ?? []);
          this.keySearchResults = list;
        }
      } catch (e) {
        console.error(`searchKeys error [${type}]:`, e);
      } finally {
        this.keySearchLoading = false;
      }
      return this.keySearchResults;
    },

    clearKeySearch() {
      this.keySearchResults = [];
      this.keySearchLoading = false;
    },
  },
});

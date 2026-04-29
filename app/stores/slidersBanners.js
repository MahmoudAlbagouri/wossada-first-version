import { defineStore } from "pinia";

export const useSlidersStore = defineStore("sliders", {
  state: () => ({
    // Main Sliders
    mainSliders: [],
    mainSlidersLoading: false,
    mainSlidersError: null,

    // Product Sliders
    productSliders: [],
    productSlidersLoading: false,
    productSlidersError: null,

    // Full Images (بنرات كاملة)
    fullImages: [],
    fullImagesLoading: false,
    fullImagesError: null,

    // Fixed Banners
    fixedBanners: [],
    fixedBannersLoading: false,
    fixedBannersError: null,

    // Static Sections
    staticSections: [],
    staticSectionsLoading: false,
    staticSectionsError: null,

    actionLoading: false,
  }),

  getters: {
    getTitle:
      () =>
      (item, lang = "ar") => {
        if (!item?.translations?.length) return item?.key || "";
        const t = item.translations.find((t) => t.languageCode === lang);
        return t?.title || item.translations[0]?.title || item.key || "";
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

    // ===== MAIN SLIDERS =====
    async fetchMainSliders() {
      this.mainSlidersLoading = true;
      this.mainSlidersError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/main-sliders", { baseURL, headers });
        if (response.success) this.mainSliders = response.data;
      } catch (e) {
        this.mainSlidersError = "فشل تحميل السلايدرات الرئيسية";
      } finally {
        this.mainSlidersLoading = false;
      }
    },

    async createMainSlider(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/main-sliders", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchMainSliders();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateMainSlider(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/main-sliders/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchMainSliders();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteMainSlider(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/main-sliders/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.mainSliders = this.mainSliders.filter((s) => s.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    // ===== PRODUCT SLIDERS =====
    async fetchProductSliders() {
      this.productSlidersLoading = true;
      this.productSlidersError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/sliders", { baseURL, headers });
        if (response.success) this.productSliders = response.data;
      } catch (e) {
        this.productSlidersError = "فشل تحميل سلايدرات المنتجات";
      } finally {
        this.productSlidersLoading = false;
      }
    },

    async createProductSlider(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/sliders", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchProductSliders();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateProductSlider(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/sliders/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchProductSliders();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteProductSlider(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/sliders/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.productSliders = this.productSliders.filter((s) => s.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    // ===== FULL IMAGES =====
    async fetchFullImages() {
      this.fullImagesLoading = true;
      this.fullImagesError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/full-images", { baseURL, headers });
        if (response.success) this.fullImages = response.data;
      } catch (e) {
        this.fullImagesError = "فشل تحميل البنرات الكاملة";
      } finally {
        this.fullImagesLoading = false;
      }
    },

    async createFullImage(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/full-images", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchFullImages();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateFullImage(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/full-images/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchFullImages();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteFullImage(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/full-images/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.fullImages = this.fullImages.filter((f) => f.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    // ===== FIXED BANNERS =====
    async fetchFixedBanners() {
      this.fixedBannersLoading = true;
      this.fixedBannersError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/fixed-banners", { baseURL, headers });
        if (response.success) this.fixedBanners = response.data;
      } catch (e) {
        this.fixedBannersError = "فشل تحميل البنرات الثابتة";
      } finally {
        this.fixedBannersLoading = false;
      }
    },

    async createFixedBanner(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/fixed-banners", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchFixedBanners();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateFixedBanner(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/fixed-banners/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchFixedBanners();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteFixedBanner(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/fixed-banners/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.fixedBanners = this.fixedBanners.filter((b) => b.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    // ===== STATIC SECTIONS =====
    async fetchStaticSections() {
      this.staticSectionsLoading = true;
      this.staticSectionsError = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/static-sections", { baseURL, headers });
        if (response.success) this.staticSections = response.data;
      } catch (e) {
        this.staticSectionsError = "فشل تحميل الأقسام الثابتة";
      } finally {
        this.staticSectionsLoading = false;
      }
    },

    async createStaticSection(payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/static-sections", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchStaticSections();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async updateStaticSection(id, payload) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/static-sections/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchStaticSections();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteStaticSection(id) {
      this.actionLoading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/static-sections/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.staticSections = this.staticSections.filter((s) => s.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        return { success: false, error: e };
      } finally {
        this.actionLoading = false;
      }
    },
  },
});

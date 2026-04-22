import { defineStore } from "pinia";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    topLevelCategories: (state) => {
      return state.categories.filter((cat) => !cat.parentId);
    },

    getCategoryName:
      (state) =>
      (category, currentLang = "ar") => {
        if (!category) return "";
        if (category.translations && category.translations.length > 0) {
          const trans = category.translations.find(
            (t) => t.languageCode === currentLang,
          );
          return trans ? trans.name : category.translations[0].name;
        }
        return category.name || "";
      },
  },

  actions: {
    async fetchCategories(lang = null) {
      this.loading = true;
      try {
        const nuxtApp = useNuxtApp();
        const config = useRuntimeConfig();
        const token =
          useCookie("auth_token").value ||
          nuxtApp.$pinia.state.value.auth?.token;

        const response = await $fetch("/categories/nav", {
          baseURL: config.public.apiBase,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": lang || nuxtApp.$i18n?.locale?.value || "ar",
            "Content-Type": "application/json",
          },
        });

        if (response.success) {
          this.categories = [...response.data];
          return this.categories; // ✅ رجّع قيمة
        }
      } catch (error) {
        console.error("Fetch Categories Error:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});

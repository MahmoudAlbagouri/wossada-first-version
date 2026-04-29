import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCategoryStore = defineStore("category", () => {
  // --- Composables ---
  const config = useRuntimeConfig();
  const { locale } = useI18n();
  // نفترض وجود useApi كـ helper عندك، وإذا لم يوجد سنستخدم $fetch العادية
  const api = useApi ? useApi() : null;

  // --- State ---
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // --- Getters ---

  // جلب الأقسام الرئيسية فقط
  const topLevelCategories = computed(() => {
    return categories.value.filter((cat) => !cat.parentId);
  });

  // دالة جلب الاسم بناءً على اللغة المفعلة
  const getCategoryName = computed(() => {
    return (category, langOverride = null) => {
      if (!category) return "";

      // استخدام اللغة الممررة أو لغة النظام الحالية
      const currentLang = langOverride || locale.value;

      if (category.translations?.length > 0) {
        const trans = category.translations.find(
          (t) => t.languageCode === currentLang,
        );
        return trans ? trans.name : category.translations[0].name;
      }
      return category.name || "";
    };
  });

  // --- Actions ---

  async function fetchCategories(lang = null) {
    loading.value = true;
    error.value = null;

    try {
      const token = useCookie("auth_token").value;
      const targetLang = lang || locale.value || "ar";

      // ملاحظة: إذا كنت تستخدم useApi فهو يتعامل مع التوكن والـ baseURL تلقائياً
      const response = await $fetch("/categories/nav", {
        baseURL: config.public.apiBase,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Accept-Language": targetLang,
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        categories.value = response.data;
        return categories.value;
      }
    } catch (err) {
      error.value = "حدث خطأ أثناء جلب الأقسام";
      console.error("Fetch Categories Error:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    categories,
    loading,
    error,
    // Getters
    topLevelCategories,
    getCategoryName,
    // Actions
    fetchCategories,
  };
});

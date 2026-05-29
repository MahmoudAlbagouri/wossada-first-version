import { defineStore } from "pinia";
import { ref, computed } from "vue";
// تأكد من استيراد useApi و useI18n حسب مسارات مشروعك
// import { useApi } from "@/composables/useApi";
// import { useI18n } from "vue-i18n";

export const useCategoryStore = defineStore("category", () => {
  // --- Composables ---
  const api = useApi(); // افترضنا أن useApi يعود بدالة جاهزة للاستخدام
  const { locale } = useI18n();

  // --- State ---
  const categories = ref([]);
  const categoriesAdmin = ref([]);
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // --- Getters ---

  // جلب الأقسام الرئيسية فقط (التي ليس لها أب)
  const topLevelCategories = computed(() =>
    categories.value.filter((cat) => !cat.parentId),
  );

  // دالة مساعدة لجلب الاسم بناءً على اللغة الحالية أو لغة محددة
  const getCategoryName = computed(() => {
    return (category, langOverride = null) => {
      if (!category) return "";

      const currentLang = langOverride || locale.value;

      // التحقق من وجود ترجمات
      if (category.translations?.length) {
        const translation = category.translations.find(
          (t) => t.languageCode === currentLang,
        );
        // إذا وجدنا ترجمة باللغة المطلوبة نرجعها، وإلا نرجع أول ترجمة متاحة، وإلا الاسم الافتراضي
        return translation
          ? translation.name
          : category.translations[0]?.name || category.name || "";
      }

      return category.name || "";
    };
  });

  // --- Actions ---

  /**
   * جلب جميع الأقسام (للوحة التحكم Admin)
   */
  async function fetchAdminCategories() {
    loading.value = true;
    error.value = null;
    try {
      // استخدام useApi الموحد
      const response = await api("/categories/admin/all");

      if (response.success) {
        categoriesAdmin.value = response.data;
      } else {
        // في حال كانت الاستجابة نجاح HTTP لكن المنطق فشل
        error.value = response.message || "فشل تحميل الأقسام";
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
      error.value = "حدث خطأ أثناء الاتصال بالخادم";
      // ملاحظة: لا نقوم برمي الخطأ هنا لتجنب إيقاف التطبيق إذا لم يكن حرجاً
    } finally {
      loading.value = false;
    }
  }

  /**
   * جلب أقسام التنقل (للواجهة العامة Public Nav)
   * هذه الدالة تستخدم بدلاً من fetchCategories في الصفحة الرئيسية لتجنب مشاكل الصلاحيات
   */
  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      // نفترض أن لديك endpoint عام للأقسام
      const response = await api("/categories/nav");

      if (response.success) {
        categories.value = response.data;
      }
    } catch (err) {
      console.error("fetchNavCategories error:", err);
      error.value = "فشل تحميل قائمة التنقل";
    } finally {
      loading.value = false;
    }
  }

  /**
   * إنشاء قسم جديد
   */
  async function createCategory(payload) {
    actionLoading.value = true;
    try {
      const response = await api("/categories", {
        method: "POST",
        body: payload,
      });

      if (response.success) {
        await fetchCategories(); // إعادة تحميل القائمة بعد الإضافة
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * تحديث قسم موجود
   */
  async function updateCategory(id, payload) {
    actionLoading.value = true;
    try {
      const response = await api(`/categories/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (response.success) {
        await fetchCategories(); // إعادة تحميل القائمة بعد التعديل
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * حذف قسم
   */
  async function deleteCategory(id) {
    actionLoading.value = true;
    try {
      const response = await api(`/categories/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        // تحديث الـ State محلياً لتحسين الأداء وتجنب الوميض
        categories.value = categories.value.filter((c) => {
          if (c.id === id) return false;
          // إذا كان القسم يحتوي على أطفال، نقوم بتصفية الطفل المحذوف أيضاً إذا لزم الأمر
          if (c.children?.length) {
            c.children = c.children.filter((ch) => ch.id !== id);
          }
          return true;
        });
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      actionLoading.value = false;
    }
  }

  return {
    // State
    categories,
    categoriesAdmin,
    loading,
    actionLoading,
    error,
    // Getters
    topLevelCategories,
    getCategoryName,
    // Actions
    fetchCategories,
    fetchAdminCategories, // دالة جديدة للواجهة العامة
    createCategory,
    updateCategory,
    deleteCategory,
  };
});

import { defineStore } from "pinia";

export const useHomeConfigsStore = defineStore("homeConfigs", {
  state: () => ({
    // قائمة أقسام الصفحة الرئيسية المرتبة
    sections: [],

    // حالات التحميل
    loading: false,
    actionLoading: false,

    // حالات البحث عن المفاتيح (Lazy Search)
    keySearchLoading: false,
    keySearchResults: [],

    error: null,
  }),

  getters: {
    // الحصول على قسم معين بالمعرف
    getSectionById: (state) => (id) => {
      return state.sections.find((s) => s.id === id);
    },

    // التحقق مما إذا كانت هناك بيانات محملة
    hasData: (state) => state.sections.length > 0,
  },

  actions: {
    /**
     * إعدادات الاتصال الأساسية (نفس نمط باقي الـ Stores في مشروعك)
     */
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

    /**
     * جلب هيكل الصفحة الرئيسية كاملاً
     * GET /home-/configs
     */
    async fetchSections() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        // ملاحظة: المسار بناءً على الكود الذي أرسلته هو /home-/configs
        const response = await $fetch("/home-/configs", { baseURL, headers });

        if (response.success) {
          this.sections = response.data;
        } else {
          throw new Error(response.message || "فشل تحميل البيانات");
        }
      } catch (e) {
        this.error = e.message || "حدث خطأ أثناء تحميل الأقسام";
        console.error("Fetch Home Sections Error:", e);
      } finally {
        this.loading = false;
      }
    },

    /**
     * إنشاء قسم جديد
     * POST /home-/configs
     */
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
          // إعادة جلب القائمة لتحديث الترتيب والبيانات الجديدة
          await this.fetchSections();
          return { success: true, data: response.data };
        }
        return { success: false, message: response.message };
      } catch (e) {
        return { success: false, message: e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    /**
     * تحديث قسم موجود (ترتيب، تفعيل، تغيير المفتاح)
     * PATCH /home-/configs/:id
     */
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
        return { success: false, message: e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    /**
     * حذف قسم من الصفحة الرئيسية
     * DELETE /home-/configs/:id
     */
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
          // تحديث القائمة محلياً أو إعادة الجلب
          await this.fetchSections();
          return { success: true };
        }
        return { success: false, message: response.message };
      } catch (e) {
        return { success: false, message: e.message };
      } finally {
        this.actionLoading = false;
      }
    },

    /**
     * تبديل حالة التفعيل (Toggle Active Status)
     * يتم استخدامه للاستجابة السريعة في الواجهة
     */
    async toggleStatus(id, currentStatus) {
      // تحديث مؤقت في الواجهة (Optimistic UI)
      const section = this.sections.find((s) => s.id === id);
      if (section) {
        const originalStatus = section.isActive;
        section.isActive = !currentStatus; // عكس الحالة

        try {
          const result = await this.updateSection(id, {
            isActive: section.isActive,
          });
          if (!result.success) {
            // إذا فشل الطلب، نعيد الحالة الأصلية
            section.isActive = originalStatus;
          }
          return result;
        } catch (e) {
          section.isActive = originalStatus;
          throw e;
        }
      }
    },

    /**
     * البحث عن مفاتيح العناصر (Sliders, Banners, etc.)
     * هذه الدالة تدعم الـ Lazy Loading في واجهة الإدخال
     * @param {string} type - نوع العنصر (mainSlider, productSlider, etc.)
     * @param {string} query - نص البحث
     */
    async searchKeys(type, query = "") {
      this.keySearchLoading = true;
      this.keySearchResults = [];

      let endpoint = "";

      // تحديد الـ Endpoint بناءً على النوع المختار
      switch (type) {
        case "mainSlider":
          endpoint = "/main-sliders";
          break;
        case "productSlider":
          endpoint = "/sliders"; // كما هو معتاد في مشروعك لسلايدرات المنتجات
          break;
        case "fixedBanner":
          endpoint = "/fixed-banners";
          break;
        case "fullImage":
          endpoint = "/full-images";
          break;
        default:
          this.keySearchLoading = false;
          return [];
      }

      try {
        const { baseURL, headers } = this._getOpts();
        // إضافة باراميتر البحث إذا وجد، مع تحديد limit صغير للأداء
        const searchParam = query ? `?search=${query}&limit=10` : "?limit=10";

        const response = await $fetch(`${endpoint}${searchParam}`, {
          baseURL,
          headers,
        });

        if (response.success) {
          this.keySearchResults = response.data.data || response.data;
        }
      } catch (e) {
        console.error(`Error searching keys for ${type}:`, e);
        this.keySearchResults = [];
      } finally {
        this.keySearchLoading = false;
      }

      return this.keySearchResults;
    },

    /**
     * مسح نتائج البحث عند إغلاق المودال أو تغيير النوع
     */
    clearKeySearch() {
      this.keySearchResults = [];
      this.keySearchLoading = false;
    },
  },
});

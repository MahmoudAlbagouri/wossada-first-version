// stores/coupons.js
import { defineStore } from "pinia";

export const useCouponsStore = defineStore("coupons", {
  state: () => ({
    coupons: [],
    loading: false,
    error: null,
  }),

  getters: {
    // دالة مساعدة لحساب نسبة الاستخدام
    usagePercentage: (state) => (coupon) => {
      if (!coupon.usageLimit || coupon.usageLimit === 0) return 0;
      return Math.round((coupon.usedCount / coupon.usageLimit) * 100);
    },
    // تحديد حالة الكوبون نصياً
    statusLabel: () => (coupon) => {
      if (!coupon.isActive) return "معطل";
      if (new Date(coupon.expiryDate) < new Date()) return "منتهي";
      if (coupon.usedCount >= coupon.usageLimit && coupon.usageLimit > 0)
        return "مستخدم بالكامل";
      return "نشط";
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

    // ====== جلب كل الكوبونات ======
    async fetchCoupons() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        // ملاحظة: بناءً على الرد الذي أرسلته، الـ GET يعيد مصفوفة داخل data
        const response = await $fetch("/coupons", { baseURL, headers });

        if (response.success) {
          // التعامل مع الهيكلية القادمة من السيرفر (قد تكون مصفوفة مباشرة أو كائن)
          this.coupons = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        } else {
          this.error = response.message || "حدث خطأ أثناء جلب الكوبونات";
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ غير متوقع";
        console.error("fetchCoupons error:", e);
      } finally {
        this.loading = false;
      }
    },

    // ====== إنشاء كوبون ======
    async createCoupon(payload) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/coupons", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          // إضافة الكوبون الجديد للقائمة (ندمج البيانات القادمة)
          const newCoupon = response.data?.data || response.data;
          this.coupons.push(newCoupon);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createCoupon error:", e);
        return {
          success: false,
          error: e?.data?.message || "فشل إنشاء الكوبون",
        };
      }
    },

    // ====== حذف كوبون ======
    async deleteCoupon(id) {
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/coupons/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.coupons = this.coupons.filter((c) => c.id !== id);
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("deleteCoupon error:", e);
        return { success: false, error: e?.data?.message || "فشل حذف الكوبون" };
      }
    },
  },
});

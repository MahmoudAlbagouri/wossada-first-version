// stores/orders.js
import { defineStore } from "pinia";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    orders: [], // قائمة الطلبات (للأدمن أو العميل حسب السياق)
    currentOrder: null, // تفاصيل طلب محدد
    loading: false,
    error: null,
  }),

  getters: {
    getStatusLabel: () => (status) => {
      const statuses = {
        pending: "قيد المراجعة",
        processing: "جاري التجهيز",
        shipped: "تم الشحن",
        delivered: "تم التسليم",
        cancelled: "ملغي",
      };
      return statuses[status] || status;
    },
    getStatusClass: () => (status) => {
      const classes = {
        pending: "status-pending",
        processing: "status-processing",
        shipped: "status-shipped",
        delivered: "status-delivered",
        cancelled: "status-cancelled",
      };
      return classes[status] || "";
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

    // ====== Admin: جلب كل الطلبات ======
    async fetchAdminOrders() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/orders/admin/all", {
          baseURL,
          headers,
        });
        if (response.success) {
          this.orders = response.data;
        } else {
          this.error = response.message;
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ أثناء جلب الطلبات";
        console.error("fetchAdminOrders error:", e);
      } finally {
        this.loading = false;
      }
    },

    // ====== User: جلب طلباتي ======
    async fetchMyOrders() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/orders/my-orders", {
          baseURL,
          headers,
        });
        if (response.success) {
          this.orders = response.data;
        } else {
          this.error = response.message;
        }
      } catch (e) {
        this.error = e?.data?.message || "حدث خطأ أثناء جلب طلباتي";
        console.error("fetchMyOrders error:", e);
      } finally {
        this.loading = false;
      }
    },

    // ====== Admin: تغيير حالة الطلب ======
    async updateOrderStatus(orderId, newStatus) {
      this.loading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/orders/admin/${orderId}/status`, {
          method: "PATCH",
          baseURL,
          headers,
          body: { status: newStatus },
        });
        if (response.success) {
          // تحديث الحالة محلياً لتجنب إعادة الجلب الكامل
          const orderIndex = this.orders.findIndex((o) => o.id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
          }
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("updateOrderStatus error:", e);
        return { success: false, error: e?.data?.message };
      } finally {
        this.loading = false;
      }
    },

    // ====== User: إلغاء طلب ======
    async cancelOrder(orderId) {
      this.loading = true;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch(`/orders/my-orders/${orderId}/cancel`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          const orderIndex = this.orders.findIndex((o) => o.id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = "cancelled";
          }
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("cancelOrder error:", e);
        return { success: false, error: e?.data?.message };
      } finally {
        this.loading = false;
      }
    },

    // ====== User: إنشاء طلب جديد (Checkout) ======
    async createOrder(payload) {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getOpts();
        const response = await $fetch("/orders", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          return { success: true, data: response.data };
        }
        return { success: false, error: response.message };
      } catch (e) {
        console.error("createOrder error:", e);
        return { success: false, error: e?.data?.message || "فشل إنشاء الطلب" };
      } finally {
        this.loading = false;
      }
    },
  },
});

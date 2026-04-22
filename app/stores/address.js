// stores/address.js
import { defineStore } from "pinia";

export const useAddressStore = defineStore("address", {
  state: () => ({
    addresses: [],
    governorates: [],
    cities: [],
    loading: false,
    loadingGov: false,
    loadingCities: false,
    error: null,
  }),

  getters: {
    defaultAddress: (state) => state.addresses.find((a) => a.isDefault) || null,
    citiesByGovernorate: (state) => (governorateId) =>
      state.cities.filter((c) => c.governorate?.id === governorateId),
  },

  actions: {
    // ====== helper داخلي — نفس نمط useCategoryStore ======
    _getRequestOptions() {
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

    // ====== جلب كل العناوين ======
    async fetchAddresses() {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch("/addresses", { baseURL, headers });
        if (response.success) {
          this.addresses = response.data;
        }
      } catch (error) {
        this.error = "فشل تحميل العناوين";
        console.error("fetchAddresses error:", error);
      } finally {
        this.loading = false;
      }
    },

    // ====== جلب المحافظات ======
    async fetchGovernorates() {
      this.loadingGov = true;
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch("/governorates/", { baseURL, headers });
        if (response.success) {
          this.governorates = response.data;
        }
      } catch (error) {
        console.error("fetchGovernorates error:", error);
      } finally {
        this.loadingGov = false;
      }
    },

    // ====== جلب المدن ======
    async fetchCities() {
      this.loadingCities = true;
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch("/cities", { baseURL, headers });
        if (response.success) {
          this.cities = response.data;
        }
      } catch (error) {
        console.error("fetchCities error:", error);
      } finally {
        this.loadingCities = false;
      }
    },

    // ====== إضافة عنوان جديد ======
    async createAddress(payload) {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch("/addresses", {
          method: "POST",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchAddresses();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (error) {
        this.error = "فشل إضافة العنوان";
        console.error("createAddress error:", error);
        return { success: false, error };
      } finally {
        this.loading = false;
      }
    },

    // ====== تعديل عنوان ======
    async updateAddress(id, payload) {
      this.loading = true;
      this.error = null;
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch(`/addresses/${id}`, {
          method: "PATCH",
          baseURL,
          headers,
          body: payload,
        });
        if (response.success) {
          await this.fetchAddresses();
          return { success: true, data: response.data };
        }
        return { success: false };
      } catch (error) {
        this.error = "فشل تعديل العنوان";
        console.error("updateAddress error:", error);
        return { success: false, error };
      } finally {
        this.loading = false;
      }
    },

    // ====== حذف عنوان ======
    async deleteAddress(id) {
      try {
        const { baseURL, headers } = this._getRequestOptions();
        const response = await $fetch(`/addresses/${id}`, {
          method: "DELETE",
          baseURL,
          headers,
        });
        if (response.success) {
          this.addresses = this.addresses.filter((a) => a.id !== id);
          return { success: true };
        }
        return { success: false };
      } catch (error) {
        console.error("deleteAddress error:", error);
        return { success: false, error };
      }
    },
  },
});

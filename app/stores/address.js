// stores/address.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAddressStore = defineStore("address", () => {
  // --- Composables ---
  const config = useRuntimeConfig();
  const { locale } = useI18n();

  // --- State ---
  const addresses = ref([]);
  const governorates = ref([]);
  const cities = ref([]);
  const loading = ref(false);
  const loadingGov = ref(false);
  const loadingCities = ref(false);
  const error = ref(null);

  // --- Getters ---
  const defaultAddress = computed(() => {
    return addresses.value.find((a) => a.isDefault) || null;
  });

  const citiesByGovernorate = computed(() => {
    return (governorateId) =>
      cities.value.filter((c) => c.governorate?.id === governorateId);
  });

  // --- Private Helper (للحصول على خيارات الطلب) ---
  const getRequestOptions = () => {
    const token = useCookie("auth_token").value;
    return {
      baseURL: config.public.apiBase,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale.value,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  };

  // --- Actions ---

  // جلب كل العناوين
  async function fetchAddresses() {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch("/addresses", getRequestOptions());
      if (response.success) {
        addresses.value = response.data;
      }
    } catch (err) {
      error.value = "فشل تحميل العناوين";
      console.error("fetchAddresses error:", err);
    } finally {
      loading.value = false;
    }
  }

  // جلب المحافظات
  async function fetchGovernorates() {
    loadingGov.value = true;
    try {
      const response = await $fetch("/governorates/", getRequestOptions());
      if (response.success) {
        governorates.value = response.data;
      }
    } catch (err) {
      console.error("fetchGovernorates error:", err);
    } finally {
      loadingGov.value = false;
    }
  }

  // جلب المدن
  async function fetchCities() {
    loadingCities.value = true;
    try {
      const response = await $fetch("/cities", getRequestOptions());
      if (response.success) {
        cities.value = response.data;
      }
    } catch (err) {
      console.error("fetchCities error:", err);
    } finally {
      loadingCities.value = false;
    }
  }

  // إضافة عنوان جديد
  async function createAddress(payload) {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch("/addresses", {
        method: "POST",
        ...getRequestOptions(),
        body: payload,
      });
      if (response.success) {
        await fetchAddresses();
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (err) {
      error.value = "فشل إضافة العنوان";
      console.error("createAddress error:", err);
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // تعديل عنوان
  async function updateAddress(id, payload) {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`/addresses/${id}`, {
        method: "PATCH",
        ...getRequestOptions(),
        body: payload,
      });
      if (response.success) {
        await fetchAddresses();
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (err) {
      error.value = "فشل تعديل العنوان";
      console.error("updateAddress error:", err);
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // حذف عنوان
  async function deleteAddress(id) {
    try {
      const response = await $fetch(`/addresses/${id}`, {
        method: "DELETE",
        ...getRequestOptions(),
      });
      if (response.success) {
        addresses.value = addresses.value.filter((a) => a.id !== id);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("deleteAddress error:", err);
      return { success: false, error: err };
    }
  }

  // إرجاع كل شيء لاستخدامه في المكونات
  return {
    // State
    addresses,
    governorates,
    cities,
    loading,
    loadingGov,
    loadingCities,
    error,
    // Getters
    defaultAddress,
    citiesByGovernorate,
    // Actions
    fetchAddresses,
    fetchGovernorates,
    fetchCities,
    createAddress,
    updateAddress,
    deleteAddress,
  };
});

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  return $fetch.create({
    baseURL: config.public.apiBase,

    async onRequest({ options }) {
      // ✅ تأكد من استدعاء useCookie داخل onRequest لقراءة الكوكيز في الوقت الحالي
      const token = useCookie("auth_token").value || authStore.token;

      options.headers = options.headers || {};

      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
        options.headers["Accept"] = "application/json";
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        authStore.clearAuth();
        if (process.client) {
          navigateTo("/login");
        }
      }
    },
  });
};

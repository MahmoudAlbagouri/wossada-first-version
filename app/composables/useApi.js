// app/composables/useApi.js
export const useApi = () => {
  // ✅ كل الـ composables هنا في الأعلى — مرة واحدة بس
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const { locale } = useI18n();

  const baseURL = config.public.apiBase;

  const buildHeaders = (extra = {}) => {
    const token = useCookie("auth_token").value || authStore.token;
    const headers = {
      "Content-Type": "application/json",
      ...extra,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // ✅ locale.value يُقرأ في كل request — مش snapshot ثابت
  const withLang = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}lang=${locale.value}`;
  };

  const apiFetch = $fetch.create({
    baseURL,

    onRequest({ options }) {
      options.headers = buildHeaders(options.headers || {});
    },

    async onResponseError({ response, request, options }) {
      if (response.status !== 401) return;

      const requestUrl = String(request);

      if (requestUrl.includes("/auth/refresh")) {
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
        return;
      }

      const refreshed = await authStore.refreshAccessToken();

      if (refreshed) {
        return await $fetch(requestUrl, {
          ...options,
          baseURL,
          headers: buildHeaders(),
        });
      } else {
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
      }
    },
  });

  // ✅ wrapper بيضيف اللغة الحالية تلقائياً لكل request
  return (url, options = {}) => apiFetch(withLang(url), options);
};

// app/composables/useApi.js

export const useApi = () => {
  // 1. استحضار الأدوات الأساسية من نكست والمخزن
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const { locale } = useI18n();

  const baseURL = config.public.apiBase;

  /**
   * دالة بناء الـ Headers
   * تقوم بإضافة الـ Token واللغة الحالية في كل طلب
   */
  const buildHeaders = (extra = {}) => {
    // جلب التوكن من الكوكيز أو المخزن
    const token = useCookie("auth_token").value || authStore.token;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // ✅ إرسال اللغة كـ Header ليقرأه NestJS عبر HeaderResolver(['lang'])
      lang: locale.value,
      // إرسال اللغة أيضاً في الهيدر القياسي لضمان عمل AcceptLanguageResolver
      "Accept-Language": locale.value,
      ...extra,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  /**
   * إنشاء نسخة مخصصة من $fetch
   */
  const apiFetch = $fetch.create({
    baseURL,

    // تنفيذ عمليات قبل إرسال الطلب
    onRequest({ options }) {
      options.headers = buildHeaders(options.headers || {});
    },

    // معالجة الأخطاء (خاصة خطأ 401 للتوكن المنتهي)
    async onResponseError({ response, request, options }) {
      if (response.status !== 401) return;

      const requestUrl = String(request);

      // إذا كان الخطأ من رابط تجديد التوكن نفسه، سجل خروج فوراً
      if (requestUrl.includes("/auth/refresh")) {
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
        return;
      }

      // محاولة تجديد التوكن تلقائياً (Silent Refresh)
      const refreshed = await authStore.refreshAccessToken();

      if (refreshed) {
        // إعادة محاولة الطلب الأصلي بالتوكن الجديد والهيدرز المحدثة
        return await $fetch(requestUrl, {
          ...options,
          baseURL,
          headers: buildHeaders(),
        });
      } else {
        // فشل التجديد -> مسح البيانات والتوجه لصفحة تسجيل الدخول
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
      }
    },
  });

  // المخرج النهائي: دالة نظيفة ترسل الطلب للرابط مباشرة مع الهيدرز المجهزة
  return (url, options = {}) => apiFetch(url, options);
};

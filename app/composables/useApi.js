export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const { locale } = useI18n();

  const baseURL = config.public.apiBase;

  // ✅ بناء الهيدرز بشكل ديناميكي مع دمج التوكن واللغة الحالية
  const buildHeaders = (extra = {}) => {
    const token = useCookie("auth_token").value || authStore.token;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      lang: locale.value,
      "Accept-Language": locale.value,
      ...extra,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  const apiFetch = $fetch.create({
    baseURL,

    // 1️⃣ يتم تشغيل هذا قبل خروج أي طلب من المتصفح
    onRequest({ options }) {
      options.headers = buildHeaders(options.headers || {});
    },

    // 2️⃣ حبل النجاة: اعتراض أخطاء الاستجابة والتعامل مع انتهاء الجلسة
    async onResponseError({ response, request, options }) {
      // إذا كان الخطأ ليس 401 (غير مصرح)، لا تتدخل واترك الخطأ يمر للمكون
      if (response.status !== 401) return;

      const requestUrl = String(request);

      // 🛡️ الفحص أ: إذا فشل طلب التجديد نفسه، فكل شيء انتهى. سجل خروج فوراً
      if (requestUrl.includes("/auth/refresh-token")) {
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
        return;
      }

      // 🛡️ الفحص ب: الحماية من الحلقة اللانهائية (Infinite Loop)
      // إذا كان الطلب يحمل وسم _retry مسبقاً وفشل مرة أخرى، توقف وسجل خروج
      if (options._retry) {
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
        return;
      }

      // 🏷️ ضع وسم على الطلب الحالي ليعرف النظام أنه قيد محاولة الإصلاح
      options._retry = true;

      console.warn(
        `⚠️ انتهت صلاحية الجلسة أثناء طلب [${requestUrl}]. جاري التجديد وإعادة المحاولة صامتاً...`,
      );

      // 🔄 استدعاء دالة التجديد الصامت وانتظار النتيجة (تعود بـ true أو false)
      const refreshed = await authStore.refreshAccessToken();

      if (refreshed) {
        console.log(
          "✅ تم تجديد التوكن بنجاح! جاري إعادة إرسال الطلب الأصلي...",
        );

        // 3️⃣ تحديث الهيدرز بالتوكن الجديد تماماً قبل إعادة المحاولة
        options.headers = buildHeaders(options.headers || {});

        // 🔥 السحر هنا: إعادة تنفيذ نفس الطلب الأصلي (بنفس الـ Payload والبيانات)
        // وإرجاع النتيجة مباشرة إلى الـ Component وكأن شيئاً لم يكن!
        return apiFetch(request, options);
      } else {
        // إذا فشل التجديد (مثلاً الـ refresh token انتهت صلاحيته هو الآخر)
        authStore.clearAuth();
        if (process.client) navigateTo("/login");
      }
    },
  });

  return (url, options = {}) => apiFetch(url, options);
};

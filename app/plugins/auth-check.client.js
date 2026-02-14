// plugins/auth-check.client.js
export default defineNuxtPlugin(async (nuxtApp) => {
  // هذا الكود يعمل فقط في الطرف العميل
  if (process.client) {
    const authStore = useAuthStore();
    const tokenCookie = useCookie("auth_token");

    // التحقق من صلاحية التوكن كل 5 دقائق
    setInterval(() => {
      const token = tokenCookie.value;

      if (token && !authStore.token) {
        // إذا كان التوكن موجود في الكوكيز ولكن ليس في الستور
        authStore.token = token;
        authStore.fetchUserProfile();
      }
    }, 300000); // 5 دقائق
  }
});

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const token = useCookie("auth_token").value;

  // إذا وجدنا توكن، نقوم بجلب الملف الشخصي فوراً قبل تحميل الصفحة
  if (token) {
    authStore.token = token;
    // نستخدم await هنا لتعطيل التحميل حتى تنتهي البيانات
    await authStore.fetchUserProfile();
  }
});

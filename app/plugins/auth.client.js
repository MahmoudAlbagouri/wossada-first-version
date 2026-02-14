// plugins/auth.client.js
export default defineNuxtPlugin(async (nuxtApp) => {
  // هذا الكود يعمل فقط في الطرف العميل
  if (process.client) {
    const authStore = useAuthStore();

    // تحميل بيانات المستخدم عند بدء التشغيل
    await authStore.initializeAuth();
  }
});

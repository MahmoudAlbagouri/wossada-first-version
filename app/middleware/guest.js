export default defineNuxtRouteMiddleware((to, from) => {
  const tokenCookie = useCookie("auth_token");
  const token = tokenCookie.value;

  // إذا كان المستخدم مسجل دخوله، نوجهه للصفحة الرئيسية
  if (token) {
    return navigateTo("/");
  }
});

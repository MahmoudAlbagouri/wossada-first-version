/**
 * Back-office guard (UI only — the API enforces the admin role on every call).
 * Uses the token claims, so no extra request is needed.
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  if (!auth.isLoggedIn) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
  if (!auth.isAdmin) {
    return navigateTo('/');
  }
});

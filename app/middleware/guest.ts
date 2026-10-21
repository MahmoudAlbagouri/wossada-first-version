/** Login / register pages: signed-in users go back where they came from. */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  if (!auth.isLoggedIn) return;
  const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/';
  // Same-site paths only (`//evil.com` is protocol-relative).
  return navigateTo(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/');
});

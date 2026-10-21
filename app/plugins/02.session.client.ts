/**
 * Loads per-user state (cart, wishlist hearts, profile) in the browser once
 * the app starts, and again whenever the user signs in or out.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  const cart = useCartStore();
  const wishlist = useWishlistStore();

  const load = () =>
    Promise.allSettled([auth.fetchUser(), cart.fetch(), wishlist.fetchIds()]);

  // After hydration, so the server-rendered markup is matched first.
  onNuxtReady(() => {
    if (auth.isLoggedIn) void load();
  });

  watch(
    () => auth.isLoggedIn,
    (loggedIn) => {
      if (loggedIn) void load();
      else {
        cart.reset();
        wishlist.reset();
      }
    },
  );
});

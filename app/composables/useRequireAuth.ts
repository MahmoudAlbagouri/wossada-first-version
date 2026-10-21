/**
 * Guards customer-only actions (add to cart, wishlist, reviews): guests get
 * a toast with a sign-in shortcut that brings them back afterwards.
 */
export function useRequireAuth() {
  const auth = useAuthStore();
  const route = useRoute();
  const toast = useToast();
  const { t } = useI18n();

  return (): boolean => {
    if (auth.isLoggedIn) return true;
    toast.info(t('auth.loginRequired'), {
      action: { label: t('auth.login'), to: `/login?redirect=${encodeURIComponent(route.fullPath)}` },
    });
    return false;
  };
}

/** Saves a Blob (invoice PDF, export) with the given file name. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

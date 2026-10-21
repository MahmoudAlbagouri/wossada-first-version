/** Account navigation shared by the header menu, mobile menu and account sidebar. */
export function useAccountLinks() {
  const auth = useAuthStore();
  const { t } = useI18n();

  return computed(() => [
    { to: '/account', icon: 'ph:user', label: t('account.profile') },
    { to: '/account/orders', icon: 'ph:package', label: t('account.orders') },
    { to: '/account/wishlist', icon: 'ph:heart', label: t('account.wishlist') },
    { to: '/account/addresses', icon: 'ph:map-pin', label: t('account.addresses') },
    { to: '/account/notifications', icon: 'ph:bell', label: t('account.notifications') },
    ...(auth.isAdmin ? [{ to: '/admin', icon: 'ph:squares-four', label: t('account.dashboard') }] : []),
  ]);
}

import type {
  Address,
  AddressInput,
  AppNotification,
  Cart,
  CheckoutPreview,
  City,
  CouponQuote,
  Governorate,
  Order,
  PaymentMethod,
  Product,
  User,
} from '~/types/models';

/** Signed-in customer flows: cart, wishlist, checkout, orders, profile. */
export function useShopService() {
  const api = useApi();

  return {
    // --- Cart (every mutation returns the recalculated cart) ---
    getCart: () => api<Cart>('/cart'),
    addToCart: (body: { productId: string; quantity: number; variantId?: string | null }) =>
      api<Cart>('/cart', {
        method: 'POST',
        body: { ...body, variantId: body.variantId ?? undefined },
      }),
    updateCartLine: (lineId: string, quantity: number) =>
      api<Cart>(`/cart/${lineId}`, { method: 'PATCH', body: { quantity } }),
    removeCartLine: (lineId: string) => api<Cart>(`/cart/${lineId}`, { method: 'DELETE' }),
    clearCart: () => api<Cart>('/cart', { method: 'DELETE' }),

    // --- Wishlist ---
    getWishlist: () => api<{ id: string; createdAt: string; product: Product }[]>('/wishlist'),
    getWishlistIds: () => api<string[]>('/wishlist/ids'),
    toggleWishlist: (productId: string) =>
      api<{ added: boolean; productId: string; message: string }>(`/wishlist/${productId}`, {
        method: 'POST',
      }),

    // --- Checkout & orders ---
    validateCoupon: (code: string, amount: number) =>
      api<CouponQuote>('/coupons/validate', { query: { code, amount } }),
    previewOrder: (body: { addressId: string; couponCode?: string }) =>
      api<CheckoutPreview>('/orders/preview', { method: 'POST', body }),
    placeOrder: (body: {
      addressId: string;
      couponCode?: string;
      notes?: string;
      paymentMethod: PaymentMethod;
    }) => api<Order>('/orders', { method: 'POST', body }),
    myOrders: () => api<Order[]>('/orders/my-orders'),
    myOrder: (id: string) => api<Order>(`/orders/my-orders/${id}`),
    cancelOrder: (id: string) => api<Order>(`/orders/my-orders/${id}/cancel`, { method: 'DELETE' }),
    downloadInvoice: (id: string) => api<Blob>(`/orders/my-orders/${id}/invoice`, { raw: true }),

    // --- Profile ---
    getProfile: () => api<User>('/users/profile/me'),
    updateProfile: (body: { name?: string; password?: string; currentPassword?: string }) =>
      api<User>('/users/profile/update', { method: 'PATCH', body }),

    // --- Addresses ---
    addresses: () => api<Address[]>('/addresses'),
    createAddress: (body: AddressInput) => api<Address>('/addresses', { method: 'POST', body }),
    updateAddress: (id: string, body: Partial<AddressInput>) =>
      api<Address>(`/addresses/${id}`, { method: 'PATCH', body }),
    deleteAddress: (id: string) => api<{ deleted: true }>(`/addresses/${id}`, { method: 'DELETE' }),
    governorates: () => api<Governorate[]>('/governorates'),
    cities: (governorateId?: string) =>
      api<City[]>('/cities', { query: governorateId ? { governorateId } : {} }),

    // --- Notifications ---
    notifications: () => api<{ items: AppNotification[]; unreadCount: number }>('/notifications'),
    unreadNotifications: () => api<{ unreadCount: number }>('/notifications/unread-count'),
    markNotificationRead: (id: string) =>
      api<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllNotificationsRead: () => api<{ updated: number }>('/notifications/read-all', { method: 'PATCH' }),
    deleteNotification: (id: string) => api<{ deleted: true }>(`/notifications/${id}`, { method: 'DELETE' }),
  };
}

<script setup lang="ts">
import type { Product } from '~/types/models';

const { t } = useI18n();
const shop = useShopService();
const wishlist = useWishlistStore();

useHead({ title: t('account.wishlist') });

const { data: entries, status } = await useLazyAsyncData('my-wishlist', () => shop.getWishlist(), {
  server: false,
  default: () => [] as { id: string; createdAt: string; product: Product }[],
});

// Hearts removed on this page disappear right away (the store is the source of truth).
const products = computed(() => entries.value.map((e) => e.product).filter((p) => wishlist.has(p.id)));
</script>

<template>
  <AccountSection :title="t('account.wishlist')" :description="t('wishlist.hint')" flat>
    <ProductGrid v-if="isFetching(status) || products.length" :products="products" :loading="isFetching(status)" :skeletons="4" />
    <div v-else class="card">
      <BaseEmptyState icon="ph:heart" :title="t('wishlist.emptyTitle')" :description="t('wishlist.emptyText')">
        <BaseButton to="/products">{{ t('cart.startShopping') }}</BaseButton>
      </BaseEmptyState>
    </div>
  </AccountSection>
</template>

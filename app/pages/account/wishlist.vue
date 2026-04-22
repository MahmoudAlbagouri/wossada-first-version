<template>
  <div class="container">
    <div class="account-layout">
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">المفضلة</h1>

          <div
            v-if="wishlistStore.loading && !wishlistStore.items.length"
            class="loading-state"
          >
            <div class="spinner"></div>
            <p>جاري تحميل قائمة أمنياتك...</p>
          </div>

          <div v-else-if="wishlistStore.items.length === 0" class="empty-state">
            <Icon name="ph:heart-break-light" class="empty-icon" />
            <p>قائمة المفضلة لديك فارغة حالياً</p>
            <NuxtLink to="/shop" class="go-shop-btn">
              تصفح المنتجات الآن
            </NuxtLink>
          </div>

          <div v-else class="wishlist-grid">
            <ProductCard
              v-for="item in wishlistStore.items"
              :key="item.id"
              :product="item.product"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useWishlistStore } from "@/stores/wishlist";
import ProductCard from "@/components/global/ProductCard.vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

definePageMeta({
  middleware: ["auth"],
});

const wishlistStore = useWishlistStore();
const { currentLang } = useLanguage(); // ✅ نفس الطريقة في category page

onMounted(() => {
  wishlistStore.fetchWishlist();
});

// ✅ إعادة جلب البيانات لما اللغة تتغير — نفس الطريقة في category page
watch(currentLang, async () => {
  await wishlistStore.fetchWishlist();
});
</script>

<style scoped lang="scss">
.account-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-body);
  padding: 20px;
  gap: 24px;
  padding-top: 50px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.main-content {
  flex: 1;
}

.account-card {
  background: var(--color-green-white);
  border-radius: 16px;
  box-shadow: var(--shadow-3);
  padding: 60px 40px 40px;
  position: relative;
  min-height: 400px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-green-primary);
  text-align: center;
  position: absolute;
  top: -20px;
  background: var(--color-green-light);
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 12px;
  padding: 10px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 70px;
  margin-bottom: 20px;
  color: var(--color-green-primary);
  opacity: 0.3;
}

.go-shop-btn {
  margin-top: 20px;
  padding: 12px 35px;
  background: var(--color-green-primary);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.3s;
  &:hover {
    background: var(--color-green-hover);
    transform: translateY(-2px);
  }
}

.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid var(--color-green-light);
  border-top: 4px solid var(--color-green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

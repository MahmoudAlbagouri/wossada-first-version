<template>
  <div class="action-icons-mobile">
    <NuxtLink to="/account/cart" class="action-item">
      <div class="icon-wrapper">
        <Icon name="ph:basket-light" class="icon-md" />
        <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        <span class="label">السلة</span>
      </div>
    </NuxtLink>

    <!-- ✅ تم التعديل هنا -->
    <NuxtLink :to="isLoggedIn ? '/account' : '/login'" class="action-item">
      <div class="icon-wrapper">
        <Icon
          :name="isLoggedIn ? 'ph:user-circle-fill' : 'ph:user-circle-light'"
          class="icon-md"
        />
        <span class="label">{{ isLoggedIn ? "حسابي" : "دخول" }}</span>
      </div>
    </NuxtLink>

    <NuxtLink to="/account/wishlist" class="action-item">
      <div class="icon-wrapper">
        <Icon name="ph:heart-light" class="icon-md" />
        <span v-if="wishlistCount > 0" class="badge">{{ wishlistCount }}</span>
        <span class="label">المفضلة</span>
      </div>
    </NuxtLink>

    <div class="action-item">
      <div class="icon-wrapper">
        <Icon name="ph:truck-light" class="icon-md" />
        <span class="label">تتبع</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

// ✅ الحل: استخدم useCookie مباشرة لتحديد حالة الدخول
const tokenCookie = useCookie("auth_token");
const isLoggedIn = computed(() => !!tokenCookie.value);

// لا تزال بحاجة إلى الستور لوظائف أخرى (مثل logout)
const authStore = useAuthStore();

const cartCount = ref(3);
const wishlistCount = ref(5);
</script>

<style scoped lang="scss">
.action-icons-mobile {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 8px 16px;
  background-color: var(--color-green-white);
  color: var(--color-green-primary);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  justify-content: space-around;

  .action-item {
    text-decoration: none;
    color: inherit;
    flex: 1;

    .icon-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      .icon-md {
        font-size: 24px;
        transition: transform 0.2s ease;
      }

      .badge {
        position: absolute;
        top: -4px;
        right: 20%;
        background-color: var(--color-green-primary);
        color: white;
        font-size: 9px;
        min-width: 14px;
        height: 14px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .label {
        font-size: 11px;
        font-weight: 500;
      }
    }
  }
}

@media (max-width: 870px) {
  .action-icons-mobile {
    display: flex;
  }
}
</style>

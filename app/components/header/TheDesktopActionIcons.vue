<
<template>
  <div class="action-icons">
    <NuxtLink to="/account/cart" aria-label="سلة المشتريات">
      <div class="icon-wrapper basket">
        <Icon name="ph:basket-light" class="icon-md" />
        <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
      </div>
    </NuxtLink>

    <!-- ✅ تم التعديل هنا -->
    <NuxtLink :to="isLoggedIn ? '/account' : '/login'" aria-label="حسابي">
      <div class="icon-wrapper">
        <Icon
          :name="isLoggedIn ? 'ph:user-circle-fill' : 'ph:user-circle-light'"
          class="icon-md"
        />
        <span v-if="isLoggedIn" class="online-indicator"></span>
      </div>
    </NuxtLink>

    <NuxtLink to="/account/wishlist" aria-label="قائمة المفضلة">
      <div class="icon-wrapper">
        <Icon name="ph:heart-light" class="icon-md" />
        <span v-if="wishlistCount > 0" class="badge">{{ wishlistCount }}</span>
      </div>
    </NuxtLink>

    <div class="icon-wrapper" aria-label="تتبع الشحنات" tabindex="0">
      <Icon name="ph:truck-light" class="icon-md" />
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
.action-icons {
  display: flex;
  gap: 24px;
  align-items: center;
  color: var(--color-green-primary);
  height: 100%;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }

  .icon-md {
    font-size: 26px;
    color: var(--color-green-primary);
  }

  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background-color: var(--color-green-primary);
    color: white;
    font-size: 10px;
    font-weight: bold;
    min-width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .online-indicator {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 9px;
    height: 9px;
    background-color: #22c55e;
    border: 1.5px solid white;
    border-radius: 50%;
  }
}

@media (max-width: 870px) {
  .action-icons {
    display: none;
  }
}
</style>

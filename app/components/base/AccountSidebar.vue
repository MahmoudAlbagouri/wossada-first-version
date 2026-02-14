<template>
  <div class="account-sidebar">
    <div class="sidebar-header">
      <div class="user-info">
        <Icon name="ph:user-circle" class="user-avatar" />
        <div>
          <h3 class="user-name">محمد ناصر</h3>
          <p class="user-email">mahmodnasser42@gmail.com</p>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink
        to="/account"
        class="nav-item"
        :class="{ active: isActive('/account') }"
      >
        <Icon name="ph:house" class="nav-icon" />
        <span>الحساب</span>
      </NuxtLink>

      <NuxtLink
        to="/account/addresses"
        class="nav-item"
        :class="{ active: isActive('/account/addresses') }"
      >
        <Icon name="ph:map-pin" class="nav-icon" />
        <span>العناوين</span>
      </NuxtLink>

      <NuxtLink
        to="/account/notifications"
        class="nav-item"
        :class="{ active: isActive('/account/notifications') }"
      >
        <Icon name="ph:bell" class="nav-icon" />
        <span>الإشعارات</span>
      </NuxtLink>

      <NuxtLink
        to="/account/cart"
        class="nav-item"
        :class="{ active: isActive('/account/cart') }"
      >
        <Icon name="ph:shopping-cart" class="nav-icon" />
        <span>سلة المنتجات</span>
      </NuxtLink>

      <NuxtLink
        to="/account/wishlist"
        class="nav-item"
        :class="{ active: isActive('/account/wishlist') }"
      >
        <Icon name="ph:heart" class="nav-icon" />
        <span>المفضلة</span>
      </NuxtLink>

      <NuxtLink
        to="/account/orders"
        class="nav-item"
        :class="{ active: isActive('/account/orders') }"
      >
        <Icon name="ph:shopping-bag" class="nav-icon" />
        <span>طلباتي</span>
      </NuxtLink>

      <!-- زر تسجيل الخروج -->
      <button @click="showLogoutModal = true" class="nav-item logout">
        <Icon name="ph:sign-out" class="nav-icon" />
        <span>تسجيل الخروج</span>
      </button>
    </nav>

    <!-- استخدام المكون العام للبوب أب -->
    <BaseConfirmationModal
      v-model="showLogoutModal"
      title="تأكيد تسجيل الخروج"
      message="هل أنت متأكد أنك تريد تسجيل الخروج؟ سيتم فقدان جلستك الحالية."
      confirm-text="خروج"
      cancel-text="البقاء مسجلًا"
      :whatsapp-number="whatsappNumber"
      @confirm="handleLogout"
    />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BaseConfirmationModal from "@/components/base/BaseConfirmationModal.vue";

const route = useRoute();
const authStore = useAuthStore();

// حالة عرض البوب أب
const showLogoutModal = ref(false);

// رقم الواتساب (غيّره إلى الرقم الفعلي لخدمة العملاء)
const whatsappNumber = "201000000000"; // مثال: "201012345678"

// تحديد العنصر النشط في القائمة
const isActive = (path) => {
  return route.path.startsWith(path);
};

// معالجة تسجيل الخروج
const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped lang="scss">
.account-sidebar {
  width: 280px;
  background: var(--color-green-white);
  border-radius: 16px;
  box-shadow: var(--shadow-3);
  padding: 24px;
  height: fit-content;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}

.sidebar-header {
  text-align: center;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  font-size: 56px;
  color: var(--color-green-primary);
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.user-email {
  font-size: 14px;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--text-main);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;

  .nav-icon {
    font-size: 20px;
    color: var(--text-muted);
  }

  &:hover {
    background: var(--color-green-light);
    color: var(--color-green-primary);
    .nav-icon {
      color: var(--color-green-primary);
    }
  }

  &.active {
    background: var(--color-green-light);
    color: var(--color-green-primary);
    .nav-icon {
      color: var(--color-green-primary);
    }
  }

  &.logout {
    color: var(--color-green-primary);
    margin-top: auto;
    .nav-icon {
      color: var(--color-green-primary);
    }

    &:hover {
      background: rgba(76, 175, 80, 0.1);
      color: var(--color-green-primary);
    }
  }
}
</style>

<template>
  <div class="account-sidebar">
    <!-- هيدر المستخدم -->
    <div class="sidebar-header">
      <div class="avatar-ring">
        <Icon name="ph:user-circle-fill" class="user-avatar" />
        <span class="online-dot"></span>
      </div>
      <div class="user-info">
        <h3 class="user-name">محمد ناصر</h3>
        <p class="user-email">mahmodnasser42@gmail.com</p>
        <span class="user-badge">
          <Icon name="ph:star-fill" class="badge-star" />
          عضو مميز
        </span>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <!-- القائمة -->
    <nav class="sidebar-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon-wrap">
          <Icon :name="item.icon" class="nav-icon" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        <Icon name="ph:caret-left" class="nav-arrow" />
      </NuxtLink>

      <div class="sidebar-divider small"></div>

      <!-- تسجيل الخروج -->
      <button class="nav-item logout" @click="showLogoutModal = true">
        <span class="nav-icon-wrap logout-wrap">
          <Icon name="ph:sign-out" class="nav-icon" />
        </span>
        <span class="nav-label">تسجيل الخروج</span>
        <Icon name="ph:caret-left" class="nav-arrow" />
      </button>
    </nav>

    <!-- Modal تأكيد الخروج -->
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
const showLogoutModal = ref(false);
const whatsappNumber = "201000000000";

const navItems = [
  { to: "/account", icon: "ph:user", label: "الحساب" },
  { to: "/account/addresses", icon: "ph:map-pin", label: "العناوين" },
  {
    to: "/account/notifications",
    icon: "ph:bell",
    label: "الإشعارات",
    badge: "3",
  },
  { to: "/account/cart", icon: "ph:shopping-cart", label: "سلة المنتجات" },
  { to: "/account/wishlist", icon: "ph:heart", label: "المفضلة" },
  { to: "/account/orders", icon: "ph:shopping-bag", label: "طلباتي" },
];

const isActive = (path) =>
  route.path === path || (path !== "/account" && route.path.startsWith(path));
const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped lang="scss">
/* ═══════════════════════════════════════════
   الشريط الجانبي
═══════════════════════════════════════════ */
.account-sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 12px 40px rgba(0, 0, 0, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 28px 20px;
  height: fit-content;
  flex-shrink: 0;
  position: sticky;
  top: 24px;

  @media (max-width: 768px) {
    width: 100%;
    position: static;
    border-radius: 20px;
  }
}

/* ── هيدر ── */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  direction: rtl;
}

.avatar-ring {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  font-size: 54px;
  color: var(--color-green-primary);
  display: block;
}

.online-dot {
  position: absolute;
  bottom: 4px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.1);
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-green-primary);
  background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.1);
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.15);
  .badge-star {
    font-size: 10px;
  }
}

/* ── فاصل ── */
.sidebar-divider {
  height: 1px;
  background: linear-gradient(
    to left,
    transparent,
    rgba(0, 0, 0, 0.06),
    transparent
  );
  margin: 0 0 20px;

  &.small {
    margin: 12px 0;
  }
}

/* ── القائمة ── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 14px;
  color: var(--text-main);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  direction: rtl;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.08),
      rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.03)
    );
    opacity: 0;
    transition: opacity 0.25s;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }
  &:hover {
    color: var(--color-green-primary);
    transform: translateX(-3px);
    .nav-icon-wrap {
      background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12);
    }
    .nav-icon {
      color: var(--color-green-primary);
    }
    .nav-arrow {
      opacity: 1;
      transform: translateX(-2px);
    }
  }

  &.active {
    color: var(--color-green-primary);
    font-weight: 700;
    &::before {
      opacity: 1;
    }
    .nav-icon-wrap {
      background: linear-gradient(
        135deg,
        var(--color-green-primary),
        var(--color-green-hover)
      );
    }
    .nav-icon {
      color: white;
    }
    .nav-arrow {
      opacity: 1;
      color: var(--color-green-primary);
    }
  }

  &.logout {
    margin-top: 4px;
    &:hover {
      color: #dc2626;
      transform: translateX(-3px);
    }
    &:hover .logout-wrap {
      background: rgba(220, 38, 38, 0.1);
    }
    &:hover .nav-icon {
      color: #dc2626;
    }
  }
}

.nav-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  transition: all 0.25s;

  &.logout-wrap {
    background: rgba(220, 38, 38, 0.08);
  }
}

.nav-icon {
  font-size: 18px;
  color: var(--text-muted);
  transition: color 0.25s;
  display: block;
}

.nav-label {
  flex: 1;
  text-align: right;
}

.nav-badge {
  background: var(--color-green-primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.nav-arrow {
  font-size: 13px;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.25s;
  flex-shrink: 0;
}
</style>

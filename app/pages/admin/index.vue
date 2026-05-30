<template>
  <div class="dashboard-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">لوحة التحكم</h1>
        <p class="dash-subtitle">مرحباً بك في لوحة إدارة المتجر</p>
      </div>
      <div class="dash-date">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {{ currentDate }}
      </div>
    </div>

    <!-- ===== Quick Stats ===== -->
    <div class="stats-grid">
      <div
        class="stat-card"
        v-for="stat in stats"
        :key="stat.label"
        :style="{ '--accent': stat.color }"
      >
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-body">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
        <div class="stat-bg-icon">{{ stat.icon }}</div>
      </div>
    </div>

    <!-- ===== Nav Cards ===== -->
    <h2 class="section-title">الأقسام الإدارية</h2>
    <div class="nav-cards-grid">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-card"
        :style="{ '--card-color': item.color }"
      >
        <div class="nav-card-icon">{{ item.icon }}</div>
        <div class="nav-card-body">
          <p class="nav-card-title">{{ item.title }}</p>
          <p class="nav-card-desc">{{ item.desc }}</p>
        </div>
        <div class="nav-card-arrow">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </div>
        <div class="nav-card-bg">{{ item.icon }}</div>
      </NuxtLink>
    </div>

    <!-- ===== Quick Actions ===== -->
    <!-- <h2 class="section-title">إجراءات سريعة</h2>
    <div class="quick-actions">
      <NuxtLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="quick-action-btn"
        :style="{ '--qa-color': action.color }"
      >
        <span class="qa-icon">{{ action.icon }}</span>
        <span>{{ action.label }}</span>
      </NuxtLink>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from "vue";

// ===== Date =====
const currentDate = computed(() => {
  return new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// ===== Stats =====
const stats = [
  { label: "إجمالي المنتجات", value: "—", icon: "📦", color: "#987226" },
  { label: "الطلبات النشطة", value: "—", icon: "🛒", color: "#1565c0" },
  { label: "المستخدمون", value: "—", icon: "👥", color: "#2e7d32" },
  { label: "الأقسام", value: "—", icon: "🗂️", color: "#6a1b9a" },
];

// ===== Nav Items =====
const navItems = [
  {
    to: "/admin/category",
    icon: "🗂️",
    title: "إدارة الأقسام",
    desc: "إضافة وتعديل وحذف أقسام المتجر",
    color: "#987226",
  },
  {
    to: "/admin/products",
    icon: "📦",
    title: "إدارة المنتجات",
    desc: "إدارة المنتجات والمخزون والأسعار",
    color: "#1565c0",
  },
  {
    to: "/admin/orders",
    icon: "🛒",
    title: "إدارة الطلبات",
    desc: "متابعة وتحديث حالة الطلبات",
    color: "#2e7d32",
  },
  {
    to: "/admin/users",
    icon: "👥",
    title: "إدارة المستخدمين",
    desc: "عرض وإدارة حسابات المستخدمين",
    color: "#c62828",
  },
  {
    to: "/admin/brands",
    icon: "🏷️",
    title: "إدارة الماركات",
    desc: "إضافة وتعديل ماركات المنتجات",
    color: "#e65100",
  },
  {
    to: "/admin/colors",
    icon: "🎨",
    title: "إدارة الألوان",
    desc: "تعريف ألوان المنتجات والمتغيرات",
    color: "#00838f",
  },
  {
    to: "/admin/sizes",
    icon: "📐",
    title: "إدارة الأحجام",
    desc: "تعريف أحجام وأبعاد المنتجات",
    color: "#4527a0",
  },
  {
    to: "/admin/materials",
    icon: "🪵",
    title: "إدارة الخامات",
    desc: "تعريف خامات ومواد المنتجات",
    color: "#558b2f",
  },
  {
    to: "/admin/coupons",
    icon: "🎟️",
    title: "إدارة الكوبونات",
    desc: "إنشاء وإدارة كوبونات الخصم",
    color: "#ad1457",
  },
  {
    to: "/admin/sliders-banners",
    icon: "🖼️",
    title: "السلايدر والبانرات",
    desc: "إدارة صور الصفحة الرئيسية",
    color: "#1565c0",
  },
  {
    to: "/admin/home",
    icon: "🏠",
    title: "إعدادات الرئيسية",
    desc: "تخصيص محتوى الصفحة الرئيسية",
    color: "#37474f",
  },
];

// ===== Quick Actions =====
const quickActions = [
  {
    to: "/admin/products?action=create",
    icon: "➕",
    label: "إضافة منتج",
    color: "#987226",
  },
  {
    to: "/admin/category?action=create",
    icon: "📁",
    label: "إضافة قسم",
    color: "#1565c0",
  },
  {
    to: "/admin/coupons?action=create",
    icon: "🎟️",
    label: "إنشاء كوبون",
    color: "#ad1457",
  },
  { to: "/admin/orders", icon: "📋", label: "عرض الطلبات", color: "#2e7d32" },
];
</script>

<style scoped>
.dashboard-page {
  padding: 28px;
  min-height: 100vh;
  background: #f7f5f0;
  font-family: "Cairo", sans-serif;
  direction: rtl;
}

/* ═══ Header ═══ */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}
.dash-title {
  font-size: 26px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0 0 4px;
}
.dash-subtitle {
  font-size: 14px;
  color: #aaa;
  margin: 0;
  font-weight: 600;
}
.dash-date {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1.5px solid #f0e8d0;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #987226;
  white-space: nowrap;
}

/* ═══ Stats ═══ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1.5px solid #f0e8d0;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
}
.stat-icon {
  font-size: 28px;
  flex-shrink: 0;
  z-index: 1;
}
.stat-body {
  z-index: 1;
}
.stat-label {
  font-size: 12px;
  color: #aaa;
  font-weight: 700;
  margin: 0 0 4px;
}
.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  margin: 0;
}
.stat-bg-icon {
  position: absolute;
  left: -8px;
  bottom: -10px;
  font-size: 64px;
  opacity: 0.06;
  pointer-events: none;
  user-select: none;
}

/* ═══ Section Title ═══ */
.section-title {
  font-size: 17px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #987226;
  border-radius: 4px;
}

/* ═══ Nav Cards ═══ */
.nav-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 36px;
}
.nav-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  border: 1.5px solid #f0e8d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.22s;
  position: relative;
  overflow: hidden;
}
.nav-card:hover {
  border-color: var(--card-color);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.nav-card:hover .nav-card-arrow {
  color: var(--card-color);
  transform: translateX(-4px);
}
.nav-card-icon {
  font-size: 26px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--card-color) 10%, transparent);
  border-radius: 12px;
  z-index: 1;
}
.nav-card-body {
  flex: 1;
  min-width: 0;
  z-index: 1;
}
.nav-card-title {
  font-size: 14px;
  font-weight: 800;
  color: #2a2015;
  margin: 0 0 3px;
}
.nav-card-desc {
  font-size: 12px;
  color: #aaa;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-card-arrow {
  color: #ddd;
  flex-shrink: 0;
  transition: all 0.2s;
  z-index: 1;
}
.nav-card-bg {
  position: absolute;
  left: -10px;
  bottom: -12px;
  font-size: 70px;
  opacity: 0.04;
  pointer-events: none;
  user-select: none;
}

/* ═══ Quick Actions ═══ */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #fff;
  border: 1.5px solid #f0e8d0;
  border-radius: 10px;
  text-decoration: none;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--qa-color);
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.quick-action-btn:hover {
  background: color-mix(in srgb, var(--qa-color) 8%, white);
  border-color: var(--qa-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.qa-icon {
  font-size: 16px;
}

/* ═══ Responsive ═══ */
@media (max-width: 600px) {
  .dashboard-page {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .nav-cards-grid {
    grid-template-columns: 1fr;
  }
  .dash-title {
    font-size: 20px;
  }
}
</style>

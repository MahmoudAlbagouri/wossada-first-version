<template>
  <div class="account-layout">
    <aside class="sidebar">
      <AccountSidebar />
    </aside>

    <main class="main-content">
      <div class="account-card">
        <h1 class="card-title">
          <Icon name="ph:bell-ringing" class="title-icon" />
          الإشعارات
        </h1>

        <!-- فلاتر -->
        <div class="filter-bar">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-btn"
            :class="{ active: activeFilter === f.key }"
            @click="activeFilter = f.key"
          >
            <Icon :name="f.icon" class="filter-icon" />
            {{ f.label }}
            <span v-if="f.count" class="filter-count">{{ f.count }}</span>
          </button>
        </div>

        <!-- قائمة الإشعارات -->
        <div class="notifications-list">
          <TransitionGroup name="notif-anim" tag="div" class="notif-group">
            <div
              v-for="(notif, idx) in filteredNotifications"
              :key="notif.id"
              class="notification-item"
              :class="[notif.type, { unread: !notif.read }]"
              :style="{ animationDelay: `${idx * 60}ms` }"
              @click="markRead(notif)"
            >
              <!-- حالة "غير مقروء" -->
              <span v-if="!notif.read" class="unread-dot"></span>

              <!-- أيقونة ── -->
              <div class="notif-icon-wrap" :class="notif.type">
                <Icon :name="notif.icon" class="notif-icon" />
              </div>

              <!-- المحتوى ── -->
              <div class="notif-content">
                <h3 class="notif-title">{{ notif.title }}</h3>
                <p class="notif-text">{{ notif.text }}</p>
                <time class="notif-time">
                  <Icon name="ph:clock" class="time-icon" />
                  {{ notif.time }}
                </time>
              </div>

              <!-- سهم التفاصيل ── -->
              <Icon name="ph:caret-left" class="notif-arrow" />
            </div>
          </TransitionGroup>

          <!-- فارغ -->
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <Icon name="ph:bell-slash" class="empty-icon" />
            <p>لا توجد إشعارات</p>
          </div>
        </div>

        <!-- تحديد الكل كمقروء -->
        <div v-if="unreadCount > 0" class="mark-all">
          <button class="mark-all-btn" @click="markAllRead">
            <Icon name="ph:checks" />
            تحديد الكل كمقروء ({{ unreadCount }})
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const activeFilter = ref("all");

const notifications = ref([
  {
    id: 1,
    type: "success",
    icon: "ph:check-circle-fill",
    title: "نجاح التسجيل",
    text: "تم تسجيل طلبك بنجاح. سيتم شحن الطلب خلال 24 ساعة.",
    time: "منذ ساعتين",
    read: false,
  },
  {
    id: 2,
    type: "info",
    icon: "ph:truck",
    title: "تحديث حالة الطلب",
    text: "طلبك رقم #1446 تم شحنه. يمكنك تتبع الشحن عبر الرابط.",
    time: "منذ يوم",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    icon: "ph:warning-circle-fill",
    title: "تذكّر!",
    text: "لديك طلب غير مدفوع منذ 3 أيام. يرجى إتمام الدفع لضمان استمرار الطلب.",
    time: "منذ 3 أيام",
    read: false,
  },
  {
    id: 4,
    type: "error",
    icon: "ph:x-circle-fill",
    title: "فشل الدفع",
    text: "فشلت عملية الدفع لطلب #1445. يرجى محاولة استخدام بطاقة أخرى.",
    time: "منذ 5 أيام",
    read: true,
  },
  {
    id: 5,
    type: "success",
    icon: "ph:package",
    title: "تم استلام طلبك",
    text: "تم استلام طلبك #1443 بنجاح. نأمل أن تكون راضياً عن التجربة.",
    time: "منذ أسبوع",
    read: true,
  },
]);

const filters = computed(() => [
  {
    key: "all",
    icon: "ph:list",
    label: "الكل",
    count: notifications.value.length,
  },
  {
    key: "unread",
    icon: "ph:dot-outline",
    label: "غير مقروء",
    count: notifications.value.filter((n) => !n.read).length || null,
  },
  { key: "success", icon: "ph:check-circle", label: "نجاح" },
  { key: "warning", icon: "ph:warning", label: "تحذير" },
  { key: "error", icon: "ph:x-circle", label: "خطأ" },
]);

const filteredNotifications = computed(() => {
  if (activeFilter.value === "all") return notifications.value;
  if (activeFilter.value === "unread")
    return notifications.value.filter((n) => !n.read);
  return notifications.value.filter((n) => n.type === activeFilter.value);
});

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length,
);

const markRead = (n) => {
  n.read = true;
};
const markAllRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};
</script>

<style scoped lang="scss">
.account-layout {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  // background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 60%, #f5faf7 100%);
  padding: 32px 20px 40px;
  gap: 24px;
  direction: rtl;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px 12px 32px;
  }
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
  }
}
.main-content {
  flex: 1;
  min-width: 0;
}

.account-card {
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 24px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 16px 50px rgba(0, 0, 0, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 72px 36px 40px;
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (max-width: 600px) {
    padding: 68px 16px 28px;
    border-radius: 18px;
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-title {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  font-size: 19px;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  background: linear-gradient(
    135deg,
    var(--color-green-primary),
    var(--color-green-hover)
  );
  border-radius: 50px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  .title-icon {
    font-size: 20px;
  }
}

/* ── فلاتر ── */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  direction: rtl;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid rgba(0, 0, 0, 0.07);
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-muted);
  transition: all 0.25s;
  .filter-icon {
    font-size: 14px;
  }

  &.active {
    background: linear-gradient(
      135deg,
      var(--color-green-primary),
      var(--color-green-hover)
    );
    color: white;
    border-color: transparent;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  }
  &:hover:not(.active) {
    border-color: var(--color-green-primary);
    color: var(--color-green-primary);
  }
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
  .active & {
    background: rgba(255, 255, 255, 0.25);
  }
}

/* ── قائمة الإشعارات ── */
.notif-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.25s;
  direction: rtl;
  position: relative;
  animation: notifIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  &.unread {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }

  /* حدود لونية حسب النوع */
  &.success {
    border-right: 4px solid #22c55e;
  }
  &.info {
    border-right: 4px solid #3b82f6;
  }
  &.warning {
    border-right: 4px solid #f59e0b;
  }
  &.error {
    border-right: 4px solid #ef4444;
  }
}

@keyframes notifIn {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notif-anim-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.notif-anim-leave-active {
  transition: all 0.25s ease;
}
.notif-anim-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.notif-anim-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.unread-dot {
  position: absolute;
  top: 18px;
  left: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-green-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.2);
}

/* ── أيقونة الإشعار ── */
.notif-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  &.success {
    background: rgba(34, 197, 94, 0.1);
    .notif-icon {
      color: #16a34a;
    }
  }
  &.info {
    background: rgba(59, 130, 246, 0.1);
    .notif-icon {
      color: #2563eb;
    }
  }
  &.warning {
    background: rgba(245, 158, 11, 0.1);
    .notif-icon {
      color: #d97706;
    }
  }
  &.error {
    background: rgba(239, 68, 68, 0.1);
    .notif-icon {
      color: #dc2626;
    }
  }
}

.notif-icon {
  font-size: 22px;
  display: block;
}

/* ── محتوى ── */
.notif-content {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}
.notif-text {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 8px;
}

.notif-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
  .time-icon {
    font-size: 13px;
  }
}

.notif-arrow {
  font-size: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
  align-self: center;
  opacity: 0.4;
  transition: all 0.2s;
  .notification-item:hover & {
    opacity: 1;
    transform: translateX(-3px);
  }
}

/* ── Empty ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  gap: 12px;
  color: var(--text-muted);
  .empty-icon {
    font-size: 48px;
    opacity: 0.25;
  }
}

/* ── تحديد الكل ── */
.mark-all {
  margin-top: 20px;
  text-align: left;
}

.mark-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.07);
  color: var(--color-green-primary);
  border: 1px solid rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.15);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  &:hover {
    background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12);
  }
}
</style>

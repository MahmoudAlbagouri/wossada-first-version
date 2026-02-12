<template>
  <div class="container">
    <div class="account-layout">
      <!-- الشريط الجانبي -->
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <!-- المحتوى الرئيسي -->
      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">الإشعارات</h1>

          <div class="notifications-list">
            <div class="notification-item success">
              <div class="notification-icon">
                <Icon name="ph:check-circle" class="icon-success" />
              </div>
              <div class="notification-content">
                <h3 class="notification-title">نجاح التسجيل</h3>
                <p class="notification-text">
                  تم تسجيل طلبك بنجاح. سيتم شحن الطلب خلال 24 ساعة.
                </p>
                <p class="notification-time">منذ 2 ساعة</p>
              </div>
            </div>

            <div class="notification-item info">
              <div class="notification-icon">
                <Icon name="ph-arrow-fat-line-up" class="icon-info" />
              </div>
              <div class="notification-content">
                <h3 class="notification-title">تحديث حالة الطلب</h3>
                <p class="notification-text">
                  طلبك رقم #1446 تم شحنه. يمكنك تتبع الشحن عبر الرابط.
                </p>
                <p class="notification-time">منذ 1 يوم</p>
              </div>
            </div>

            <div class="notification-item warning">
              <div class="notification-icon">
                <Icon name="ph:warning-circle" class="icon-warning" />
              </div>
              <div class="notification-content">
                <h3 class="notification-title">تذكّر!</h3>
                <p class="notification-text">
                  لديك طلب غير مدفوع منذ 3 أيام. يرجى إتمام الدفع لضمان استمرار
                  الطلب.
                </p>
                <p class="notification-time">منذ 3 أيام</p>
              </div>
            </div>

            <div class="notification-item error">
              <div class="notification-icon">
                <Icon name="ph:x-circle" class="icon-error" />
              </div>
              <div class="notification-content">
                <h3 class="notification-title">فشل الدفع</h3>
                <p class="notification-text">
                  فشل عملية الدفع لطلب #1445. يرجى محاولة استخدام بطاقة أخرى.
                </p>
                <p class="notification-time">منذ 5 أيام</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AccountSidebar from "@/components/base/AccountSidebar.vue";
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
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--color-green-white);
  box-shadow: var(--shadow-1);

  &.success {
    border-left: 4px solid #4caf50;
  }

  &.info {
    border-left: 4px solid #2196f3;
  }

  &.warning {
    border-left: 4px solid #ff9800;
  }

  &.error {
    border-left: 4px solid #f44336;
  }

  .notification-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(152, 114, 38, 0.1);
  }

  .icon-success {
    font-size: 20px;
    color: #4caf50;
  }

  .icon-info {
    font-size: 20px;
    color: #2196f3;
  }

  .icon-warning {
    font-size: 20px;
    color: #ff9800;
  }

  .icon-error {
    font-size: 20px;
    color: #f44336;
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 8px 0;
  }

  .notification-text {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .notification-time {
    font-size: 12px;
    color: var(--text-muted);
  }
}
</style>

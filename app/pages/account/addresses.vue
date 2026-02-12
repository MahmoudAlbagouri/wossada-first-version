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
          <h1 class="card-title">العناوين</h1>

          <div class="addresses-list">
            <!-- العنوان 1 -->
            <div class="address-card">
              <div class="address-header">
                <span class="address-type">العنوان الرئيسي</span>
              </div>

              <div class="address-details">
                <div class="address-row">
                  <span class="label">الاسم:</span>
                  <span class="value">محمد ناصر</span>
                </div>
                <div class="address-row">
                  <span class="label">الجوال:</span>
                  <span class="value">01110022133</span>
                </div>
                <div class="address-row">
                  <span class="label">العنوان:</span>
                  <span class="value"
                    >شارع الكوارثة، امام كشري مرسى، منطقة 20، القاهرة</span
                  >
                </div>
                <div class="address-row">
                  <span class="label">الحي/المنطقة:</span>
                  <span class="value">المعادي</span>
                </div>
              </div>
              <div class="address-actions">
                <button class="btn edit-btn">
                  <Icon name="ph:pencil-simple" class="btn-icon" />
                  <span>تعديل</span>
                </button>
                <button class="btn delete-btn">
                  <Icon name="ph:trash" class="btn-icon" />
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- العنوان 2 -->
            <div class="address-card">
              <div class="address-header">
                <span class="address-type">العنوان البديل</span>
              </div>

              <div class="address-details">
                <div class="address-row">
                  <span class="label">الاسم:</span>
                  <span class="value">سيد مرسى</span>
                </div>
                <div class="address-row">
                  <span class="label">الجوال:</span>
                  <span class="value">01110022133</span>
                </div>
                <div class="address-row">
                  <span class="label">العنوان:</span>
                  <span class="value"
                    >شارع الكوارثة، امام كشري مرسى，منطقة 20، القاهرة</span
                  >
                </div>
                <div class="address-row">
                  <span class="label">الحي/المنطقة:</span>
                  <span class="value">المعادي</span>
                </div>
              </div>
              <div class="address-actions">
                <button class="btn edit-btn">
                  <Icon name="ph:pencil-simple" class="btn-icon" />
                  <span>تعديل</span>
                </button>
                <button class="btn delete-btn">
                  <Icon name="ph:trash" class="btn-icon" />
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- زر إضافة عنوان جديد -->
            <div class="add-address-card" @click="addNewAddress">
              <Icon name="ph:plus" class="add-icon" />
              <span>اضف عنوان جديد</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const addNewAddress = () => {
  alert("فتح نموذج إضافة عنوان جديد");
};
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

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-card {
  background: var(--color-green-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  box-shadow: var(--shadow-1);

  .address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .address-type {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-green-primary);
    }
  }
  .address-actions {
    display: flex;
    gap: 8px;
  }

  .address-details {
    .address-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      gap: 8px;
      color: var(--text-main);

      .label {
        color: var(--text-muted);
        font-weight: 500;
      }

      .value {
        font-weight: 600;
      }
    }
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  .btn-icon {
    font-size: 16px;
  }

  span {
    white-space: nowrap;
  }
}

.edit-btn {
  background: var(--color-green-light);
  color: var(--color-green-primary);
  border: 1px solid var(--color-green-light-active);

  &:hover {
    background: var(--color-green-light-hover);
  }
}

.delete-btn {
  background: #fde0e0;
  color: #d32f2f;
  border: 1px solid #fbb4b4;

  &:hover {
    background: #fccccc;
  }
}

.add-address-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: var(--color-green-white);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-green-light);
    border-color: var(--color-green-primary);
  }

  .add-icon {
    font-size: 32px;
    color: var(--color-green-primary);
    margin-bottom: 12px;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-green-primary);
  }
}
</style>

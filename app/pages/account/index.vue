<template>
  <div class="container">
    <div class="account-layout">
      <!-- الشريط الجانبي (ثابت) -->
      <aside class="sidebar">
        <AccountSidebar />
      </aside>
      <!-- المحتوى الرئيسي -->
      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">معلومات الحساب</h1>

          <div class="form-grid">
            <!-- رقم الجوال -->
            <div class="form-group">
              <label for="phone" class="form-label">* رقم الجوال</label>
              <div class="input-wrapper">
                <Icon name="ph:phone" class="input-icon" />
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  placeholder="01110022133"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- البريد الإلكتروني -->
            <div class="form-group">
              <label for="email" class="form-label">* البريد الإلكتروني</label>
              <div class="input-wrapper">
                <Icon name="ph:envelope-simple" class="input-icon" />
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="mahmodnasser42@gmail.com"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- الاسم -->
            <div class="form-group">
              <label for="fullName" class="form-label">* الاسم</label>
              <div class="input-wrapper">
                <Icon name="ph:user" class="input-icon" />
                <input
                  id="fullName"
                  v-model="formData.fullName"
                  type="text"
                  placeholder="محمد ناصر"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- كلمة المرور -->
            <div class="form-group">
              <label for="password" class="form-label">* كلمة المرور</label>
              <div class="input-wrapper">
                <Icon name="ph:lock" class="input-icon" />
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="form-input"
                  required
                />
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="togglePassword"
                  aria-label="إظهار كلمة المرور"
                >
                  <Icon
                    :name="showPassword ? 'ph:eye-slash' : 'ph:eye'"
                    class="toggle-icon"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- زر حفظ التغييرات -->
          <BaseButton
            type="submit"
            :full-width="true"
            variant="primary"
            @click="handleSave"
          >
            حفظ التغييرات
          </BaseButton>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const formData = ref({
  phone: "01110022133",
  email: "mahmodnasser42@gmail.com",
  fullName: "محمد ناصر",
  password: "",
});

const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleSave = () => {
  console.log("حفظ المعلومات:", formData.value);
  // TODO: إرسال إلى API
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
  position: relative;
}

.account-card {
  background: var(--color-green-white);
  border-radius: 16px;
  box-shadow: var(--shadow-3);
  padding: 60px 40px 40px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 8px;
  direction: rtl;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-green-white);
}

.input-icon {
  font-size: 20px;
  color: var(--text-muted);
  padding: 14px;
}

.form-input {
  flex: 1;
  padding: 14px 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: transparent;
  direction: rtl;
}

.toggle-password-btn {
  background: none;
  border: none;
  padding: 14px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.3s;

  &:hover {
    color: var(--color-green-primary);
  }
}

.toggle-icon {
  font-size: 20px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>

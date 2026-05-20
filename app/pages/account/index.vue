<template>
  <div class="account-layout">
    <aside class="sidebar">
      <AccountSidebar />
    </aside>

    <main class="main-content">
      <div class="account-card">
        <h1 class="card-title">
          <Icon name="ph:user-gear" class="title-icon" />
          معلومات الحساب
        </h1>

        <!-- رسالة النجاح -->
        <Transition name="toast-pop">
          <div v-if="savedSuccess" class="toast-success">
            <Icon name="ph:check-circle-fill" class="toast-icon" />
            تم حفظ التغييرات بنجاح
          </div>
        </Transition>

        <!-- رسالة الخطأ -->
        <Transition name="toast-pop">
          <div v-if="storeError" class="toast-error">
            <Icon name="ph:warning-circle-fill" class="toast-icon" />
            {{ storeError }}
          </div>
        </Transition>

        <div v-if="isLoading" class="loading-state">
          <Icon name="svg-spinners:ring-resize" class="spin-icon" />
          جاري تحميل البيانات...
        </div>

        <div v-else class="form-grid">
          <!-- الاسم الكامل -->
          <div class="form-group">
            <label for="fullName" class="form-label">
              <Icon name="ph:user" class="label-icon" /> الاسم الكامل *
            </label>
            <div
              class="input-wrapper"
              :class="{ focused: focused === 'fullName' }"
            >
              <Icon name="ph:user" class="input-icon" />
              <input
                id="fullName"
                v-model="formData.name"
                type="text"
                placeholder="الاسم الكامل"
                class="form-input"
                @focus="focused = 'fullName'"
                @blur="focused = null"
              />
            </div>
          </div>

          <!-- البريد الإلكتروني -->
          <div class="form-group">
            <label for="email" class="form-label">
              <Icon name="ph:envelope-simple" class="label-icon" /> البريد
              الإلكتروني *
            </label>
            <div
              class="input-wrapper"
              :class="{ focused: focused === 'email' }"
            >
              <Icon name="ph:envelope-simple" class="input-icon" />
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="example@mail.com"
                class="form-input"
                disabled
                @focus="focused = 'email'"
                @blur="focused = null"
              />
            </div>
            <small class="hint-text">لا يمكن تغيير البريد الإلكتروني</small>
          </div>

          <!-- رقم الجوال -->
          <div class="form-group">
            <label for="phone" class="form-label">
              <Icon name="ph:phone" class="label-icon" /> رقم الجوال *
            </label>
            <div
              class="input-wrapper"
              :class="{ focused: focused === 'phone' }"
            >
              <Icon name="ph:phone" class="input-icon" />
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                class="form-input"
                disabled
                @focus="focused = 'phone'"
                @blur="focused = null"
              />
              <span class="phone-badge">+20</span>
            </div>
          </div>

          <!-- كلمة المرور -->
          <div class="form-group">
            <label for="password" class="form-label">
              <Icon name="ph:lock" class="label-icon" /> كلمة المرور الجديدة
            </label>
            <div
              class="input-wrapper"
              :class="{ focused: focused === 'password' }"
            >
              <Icon name="ph:lock" class="input-icon" />
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="اتركها فارغة إذا لم ترد التغيير"
                class="form-input"
                @focus="focused = 'password'"
                @blur="focused = null"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <Icon
                  :name="showPassword ? 'ph:eye-slash' : 'ph:eye'"
                  class="toggle-icon"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- أزرار -->
        <div class="form-actions">
          <button
            class="btn-reset"
            type="button"
            @click="resetForm"
            :disabled="isSaving"
          >
            <Icon name="ph:arrow-counter-clockwise" />
            إلغاء
          </button>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="isSaving"
            @click="handleSave"
          >
            <Icon name="ph:floppy-disk" class="btn-icon" />
            حفظ التغييرات
          </BaseButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUsersStore } from "@/stores/users"; // تأكد من المسار الصحيح
import BaseButton from "@/components/base/BaseButton.vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

definePageMeta({ middleware: ["auth"] });

const usersStore = useUsersStore();
const {
  currentUser,
  saving: isSaving,
  error: storeError,
  loading: isLoading,
} = storeToRefs(usersStore);

const focused = ref(null);
const showPassword = ref(false);
const savedSuccess = ref(false);

// حالة الفورم
const formData = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
});

// جلب البيانات عند تحميل الصفحة
onMounted(async () => {
  await usersStore.fetchProfile();
  if (currentUser.value) {
    fillForm(currentUser.value);
  }
});

const fillForm = (user) => {
  formData.name = user.name || "";
  formData.email = user.email || "";
  // إزالة +20 إذا كانت موجودة مسبقاً لتجنب التكرار عند العرض، أو التعامل معها في الـ UI
  formData.phone = user.phone ? user.phone.replace("+20", "") : "";
  formData.password = ""; // لا نعرض كلمة المرور
};

const resetForm = () => {
  if (currentUser.value) {
    fillForm(currentUser.value);
  }
  savedSuccess.value = false;
};

const handleSave = async () => {
  // التحقق البسيط
  if (!formData.name || !formData.phone) {
    notify?.error?.("يرجى ملء الحقول المطلوبة");
    return;
  }

  const payload = {
    name: formData.name,
    phone: formData.phone.startsWith("0")
      ? `+20${formData.phone.substring(1)}`
      : `+20${formData.phone}`, // تنسيق الرقم
    email: formData.email,
  };

  // إضافة كلمة المرور فقط إذا تم إدخالها
  if (formData.password && formData.password.length > 0) {
    payload.password = formData.password;
  }

  const result = await usersStore.updateProfile(payload);

  if (result.success) {
    savedSuccess.value = true;
    formData.password = ""; // مسح حقل الباسورد بعد الحفظ الناجح
    setTimeout(() => (savedSuccess.value = false), 3000);
    notify?.success?.("تم تحديث البيانات بنجاح");
  } else {
    notify?.error?.(result.error || "حدث خطأ أثناء الحفظ");
  }
};
</script>

<style scoped lang="scss">
/* نفس الـ CSS السابق مع إضافة بسيطة للـ Error Toast و Loading */

.account-layout {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
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
  padding: 72px 40px 44px;
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (max-width: 600px) {
    padding: 68px 20px 32px;
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

.toast-success,
.toast-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 14px;
  margin-bottom: 28px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;

  .toast-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
}

.toast-success {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #16a34a;
  border-color: rgba(34, 197, 94, 0.2);
}

.toast-error {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.2);
}

.toast-pop-enter-active {
  animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-pop-leave-active {
  transition: all 0.3s ease;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(-14px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-muted);
  .spin-icon {
    font-size: 24px;
    animation: spin 1s linear infinite;
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
  margin-bottom: 32px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  direction: rtl;
  .label-icon {
    font-size: 15px;
  }
}

.hint-text {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: -4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);

  &.focused {
    border-color: var(--color-green-primary);
    box-shadow:
      0 0 0 3px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12),
      0 2px 8px rgba(0, 0, 0, 0.05);
    background: white;
    .input-icon {
      color: var(--color-green-primary);
    }
  }

  &:hover:not(.focused) {
    border-color: #a0aec0;
  }
}

.input-icon {
  font-size: 19px;
  color: var(--text-muted);
  padding: 13px 12px 13px 8px;
  flex-shrink: 0;
  transition: color 0.25s;
}

.form-input {
  flex: 1;
  padding: 13px 8px 13px 0;
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  direction: rtl;
  color: var(--text-main);
  font-weight: 500;
  &::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.02);
    color: var(--text-muted);
    cursor: not-allowed;
  }
}

.phone-badge {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-green-primary);
  padding: 0 12px;
  flex-shrink: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  margin-right: 2px;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 13px 12px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  transition: color 0.2s;
  &:hover {
    color: var(--color-green-primary);
  }
}
.toggle-icon {
  font-size: 19px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  direction: rtl;
  @media (max-width: 480px) {
    flex-direction: column;
  }
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 13px 22px;
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  &:hover:not(:disabled) {
    border-color: #a0aec0;
    color: var(--text-main);
    background: white;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    justify-content: center;
  }
}

.btn-icon {
  font-size: 18px;
}
</style>

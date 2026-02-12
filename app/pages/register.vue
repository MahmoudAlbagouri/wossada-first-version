<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">إنشاء حساب</h1>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- حقل الاسم الكامل -->
        <BaseInput
          v-model="formData.fullName"
          label="الاسم الكامل *"
          id="fullName"
          type="text"
          placeholder="أدخل اسمك الكامل"
          icon="ph:user"
          :required="true"
        />

        <!-- حقل البريد الإلكتروني -->
        <BaseInput
          v-model="formData.email"
          label="البريد الإلكتروني *"
          id="email"
          type="email"
          placeholder="mahmodnasser42@gmail.com"
          icon="ph:envelope-simple"
          :required="true"
          :show-check="true"
        />

        <!-- حقل رقم الجوال -->
        <BaseInput
          v-model="formData.phone"
          label="رقم الجوال *"
          id="phone"
          type="tel"
          placeholder="010XXXXXXXX"
          icon="ph:phone"
          :required="true"
        />

        <!-- حقل كلمة المرور -->
        <BaseInput
          v-model="formData.password"
          label="كلمة المرور *"
          id="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="ph:lock"
          :required="true"
          :show-password-toggle="true"
          :password-visible="showPassword"
          @toggle-password="togglePassword"
        />

        <!-- حقل تأكيد كلمة المرور -->
        <BaseInput
          v-model="formData.confirmPassword"
          label="تأكيد كلمة المرور *"
          id="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="ph:lock"
          :required="true"
          :show-password-toggle="true"
          :password-visible="showConfirmPassword"
          @toggle-password="toggleConfirmPassword"
        />

        <!-- شروط الاستخدام -->
        <BaseCheckbox
          v-model="formData.termsAccepted"
          id="terms"
          label="أوافق على الشروط والأحكام وسياسة الخصوصية"
        />

        <!-- زر إنشاء الحساب -->
        <BaseButton type="submit" :full-width="true" variant="primary">
          إنشاء حساب
        </BaseButton>

        <!-- فاصل -->
        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <!-- التسجيل عبر Google & Facebook -->
        <div class="social-login">
          <SocialButton
            platform="google"
            label="Google"
            @click="registerWith('google')"
          />
          <SocialButton
            platform="facebook"
            label="Facebook"
            @click="registerWith('facebook')"
          />
        </div>

        <!-- لديك حساب بالفعل؟ -->
        <p class="login-prompt">
          لديك حساب بالفعل؟
          <NuxtLink to="/login" class="link-text">تسجيل الدخول</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCheckbox from "@/components/base/BaseCheckbox.vue";
import SocialButton from "@/components/base/SocialButton.vue";

const formData = ref({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleRegister = () => {
  if (!formData.value.termsAccepted) {
    alert("يرجى الموافقة على الشروط والأحكام");
    return;
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    alert("كلمة المرور وتأكيدها غير متطابقين");
    return;
  }
  console.log("إنشاء حساب:", formData.value);
  // TODO: تنفيذ منطق التسجيل الفعلي
};

const registerWith = (provider) => {
  console.log(`إنشاء حساب عبر ${provider}`);
  // TODO: تكامل مع OAuth
};
</script>

<style scoped lang="scss">
.register-page {
  width: 700px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-green-white);
  box-shadow: var(--shadow-3);
  border-radius: 16px;
  padding: 40px 30px;
}

.register-card {
  width: 80%;
  text-align: right;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 32px 0;
  text-align: center;
}

/* شروط الاستخدام */
:deep(.base-checkbox-wrapper) {
  margin-bottom: 24px;

  .checkbox-text {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.5;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  padding: 0 16px;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.social-login {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin: 24px 0 0 0;

  .link-text {
    color: var(--color-green-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;

    &:hover {
      color: var(--color-green-hover);
    }
  }
}
</style>

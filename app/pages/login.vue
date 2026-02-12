<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">تسجيل الدخول</h1>

      <form @submit.prevent="handleLogin" class="login-form">
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

        <!-- رابط نسيت كلمة المرور -->
        <div class="forgit-remember">
          <BaseCheckbox
            v-model="formData.termsAccepted"
            id="terms"
            label="تذكرني"
          />

          <div class="forgot-link">
            <NuxtLink to="/forgot-password" class="link-text">
              نسيت كلمة المرور؟
            </NuxtLink>
          </div>
        </div>

        <!-- زر تسجيل الدخول -->
        <BaseButton type="submit" :full-width="true" variant="primary">
          تسجيل الدخول
        </BaseButton>

        <!-- فاصل -->
        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <!-- تسجيل الدخول عبر Google & Apple -->
        <div class="social-login">
          <SocialButton
            platform="google"
            label="Google"
            @click="loginWith('google')"
          />
          <SocialButton
            platform="facebook"
            label="Facebook"
            @click="loginWith('facebook')"
          />
        </div>

        <!-- ليس لديك حساب؟ -->
        <p class="signup-prompt">
          عميل جديد؟
          <NuxtLink to="/register" class="link-text">أنشئ حساب</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import SocialButton from "@/components/base/SocialButton.vue";

const formData = ref({
  email: "",
  password: "",
  termsAccepted: ref(false),
});

const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = () => {
  console.log("تسجيل دخول:", formData.value);
};

const loginWith = (provider) => {
  console.log(`تسجيل دخول عبر ${provider}`);
};
</script>

<style scoped lang="scss">
.login-page {
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

.login-card {
  width: 80%;
  text-align: right;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 32px 0;
  text-align: center;
}
.forgit-remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .forgot-link {
    text-align: left;
    margin-bottom: 24px;
  }

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

.signup-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin: 24px 0 0 0;
}

.phone-login {
  text-align: center;
  margin-top: 20px;
}

.phone-link {
  color: var(--color-green-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;

  &:hover {
    color: var(--color-green-hover);
  }
}
</style>

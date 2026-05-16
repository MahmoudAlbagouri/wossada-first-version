<template>
  <div class="login-page">
    <!-- خلفية تفاعلية -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="login-card">
      <!-- شعار / هيدر -->
      <div class="card-header">
        <div class="logo-icon">
          <Icon name="ph:storefront" class="logo-svg" />
        </div>
        <h1 class="login-title">أهلاً بعودتك</h1>
        <p class="login-subtitle">سجّل دخولك للمتابعة إلى متجر وسادة</p>
      </div>

      <!-- خطأ من السيرفر -->
      <Transition name="error-pop">
        <div v-if="serverError" class="server-error-message">
          <Icon name="ph:warning-circle" class="error-icon" />
          {{ serverError }}
        </div>
      </Transition>

      <form @submit.prevent="onSubmit" class="login-form">
        <!-- حقل المعرّف -->
        <div class="identifier-input-wrapper">
          <BaseInput
            v-model="identifier"
            label="البريد الإلكتروني أو رقم الهاتف *"
            id="identifier"
            type="text"
            placeholder="example@mail.com أو 01xxxxxxxxx"
            icon="ph:envelope-simple"
            :error="errors.identifier"
            :disabled="isSubmitting"
            class="identifier-field"
          />
          <Transition name="badge-pop">
            <span v-if="isPhoneNumber(identifier)" class="country-code">
              <img src="https://flagcdn.com/w20/eg.png" alt="EG" class="flag" />
              +20
            </span>
          </Transition>
        </div>

        <!-- كلمة المرور -->
        <BaseInput
          v-model="password"
          label="كلمة المرور *"
          id="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="ph:lock"
          :show-password-toggle="true"
          :password-visible="showPassword"
          :error="errors.password"
          :disabled="isSubmitting"
          @toggle-password="togglePassword"
        />

        <!-- تذكرني / نسيت كلمة المرور -->
        <div class="forgit-remember">
          <BaseCheckbox v-model="rememberMe" id="remember" label="تذكرني" />
          <NuxtLink to="/forgot-password" class="link-text">
            <Icon name="ph:key" class="link-icon" />
            نسيت كلمة المرور؟
          </NuxtLink>
        </div>

        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :loading="isSubmitting"
        >
          <Icon name="ph:sign-in" class="btn-icon" />
          تسجيل الدخول
        </BaseButton>

        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <p class="signup-prompt">
          عميل جديد؟
          <NuxtLink to="/register" class="link-text highlight">
            أنشئ حساباً الآن
            <Icon name="ph:arrow-left" class="arrow-icon" />
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { nextTick } from "vue";

definePageMeta({ middleware: ["guest"] });

useSeoMeta({
  title: "تسجيل الدخول - متجر وسادة",
  description:
    "سجل دخولك الآن لمتابعة طلباتك والحصول على أفضل العروض من متجر وسادة.",
});

const authStore = useAuthStore();
const serverError = ref("");
const showPassword = ref(false);

const isPhoneNumber = (val) => {
  if (!val) return false;
  return /^(\+20|01)[0-9]{8,10}$/.test(val.replace(/\s/g, ""));
};

const schema = yup.object({
  identifier: yup
    .string()
    .required("البريد الإلكتروني أو رقم الهاتف مطلوب")
    .min(3, "يجب إدخال بيانات صحيحة"),
  password: yup
    .string()
    .required("كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { identifier: "", password: "", rememberMe: false },
});

const { value: identifier } = useField("identifier");
const { value: password } = useField("password");
const { value: rememberMe } = useField("rememberMe");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = "";
  let finalIdentifier = values.identifier.trim();
  if (/^01[0-9]{9}$/.test(finalIdentifier)) {
    finalIdentifier = `+20${finalIdentifier.substring(1)}`;
  }
  try {
    const result = await authStore.login({
      email: finalIdentifier,
      password: values.password,
    });
    if (result.success) {
      await nextTick();
      const tokenCookie = useCookie("auth_token");
      if (tokenCookie.value) return navigateTo("/");
      else
        serverError.value =
          "حدث خطأ في حفظ بيانات تسجيل الدخول، يرجى المحاولة مرة أخرى.";
    } else {
      serverError.value = result.error || "بيانات الدخول غير صحيحة";
    }
  } catch (e) {
    console.error("Login error:", e);
    serverError.value =
      "حدث خطأ في الاتصال بالسيرفر، يرجى التأكد من تشغيل الباك إند.";
  }
});
</script>

<style scoped lang="scss">
/* ═══════════════════════════════════════════
   الصفحة الرئيسية
═══════════════════════════════════════════ */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  // background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 50%, #f5faf7 100%);
}

/* ═══════════════════════════════════════════
   أشكال الخلفية المتحركة
═══════════════════════════════════════════ */
.bg-shapes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: floatShape 12s ease-in-out infinite;
}

.shape-1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  top: -120px;
  right: -100px;
  animation-delay: 0s;
}
.shape-2 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  bottom: -80px;
  left: -60px;
  animation-delay: -4s;
}
.shape-3 {
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, #68d391, transparent);
  top: 30%;
  left: 8%;
  animation-delay: -8s;
  opacity: 0.08;
}
.shape-4 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  top: 15%;
  right: 12%;
  animation-delay: -2s;
  opacity: 0.1;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-15px, 20px) scale(0.97);
  }
}

/* ═══════════════════════════════════════════
   البطاقة الرئيسية
═══════════════════════════════════════════ */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  padding: 48px 40px 40px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 480px) {
    padding: 36px 24px 32px;
    border-radius: 20px;
    margin: 0 4px;
  }
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══════════════════════════════════════════
   هيدر البطاقة
═══════════════════════════════════════════ */
.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  background: linear-gradient(
    135deg,
    var(--color-green-primary) 0%,
    var(--color-green-hover) 100%
  );
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.08);
  animation: logoFloat 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
    border-radius: inherit;
  }
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.logo-svg {
  font-size: 32px;
  color: white;
  position: relative;
  z-index: 1;
}

.login-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* ═══════════════════════════════════════════
   رسالة الخطأ
═══════════════════════════════════════════ */
.server-error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fff5f5, #fee2e2);
  color: #dc2626;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border: 1px solid #fecaca;
  direction: rtl;

  .error-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
}

.error-pop-enter-active {
  animation: errorShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.error-pop-leave-active {
  transition: all 0.3s ease;
}
.error-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes errorShake {
  0%,
  100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-6px);
  }
  30% {
    transform: translateX(6px);
  }
  45% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(4px);
  }
  75% {
    transform: translateX(-2px);
  }
}

/* ═══════════════════════════════════════════
   حقل المعرّف
═══════════════════════════════════════════ */
.identifier-input-wrapper {
  position: relative;

  .identifier-field {
    width: 100%;
  }

  .country-code {
    position: absolute;
    top: 46px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    font-size: 13px;
    color: var(--color-green-primary);
    pointer-events: none;
    z-index: 10;
    background: var(--color-green-white, #fff);
    padding: 2px 6px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    .flag {
      width: 16px;
      border-radius: 2px;
    }
  }
}

.badge-pop-enter-active {
  animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
  transition: all 0.2s ease;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* ═══════════════════════════════════════════
   صف تذكرني / نسيت كلمة المرور
═══════════════════════════════════════════ */
.forgit-remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
}

/* ═══════════════════════════════════════════
   الروابط
═══════════════════════════════════════════ */
.link-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-green-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s ease;

  .link-icon,
  .arrow-icon {
    font-size: 14px;
  }

  &:hover {
    color: var(--color-green-dark);
    gap: 7px;
  }

  &.highlight {
    font-size: 15px;
    padding: 6px 14px;
    background: linear-gradient(
      135deg,
      rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.08),
      rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.04)
    );
    border-radius: 20px;
    border: 1px solid rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.15);
    &:hover {
      background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12);
    }
  }
}

/* ═══════════════════════════════════════════
   الفاصل
═══════════════════════════════════════════ */
.divider {
  display: flex;
  align-items: center;
  margin: 28px 0 20px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(to left, transparent, #e2e8f0, transparent);
  }

  .divider-text {
    padding: 0 16px;
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
  }
}

/* ═══════════════════════════════════════════
   فقرة التسجيل
═══════════════════════════════════════════ */
.signup-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* أيقونة الزر */
.btn-icon {
  font-size: 18px;
}
</style>

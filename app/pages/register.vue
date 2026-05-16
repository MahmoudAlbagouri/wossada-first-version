<template>
  <div class="register-page">
    <!-- خلفية تفاعلية -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="register-card">
      <!-- هيدر -->
      <div class="card-header">
        <div class="logo-icon">
          <Icon name="ph:user-plus" class="logo-svg" />
        </div>
        <h1 class="register-title">إنشاء حساب جديد</h1>
        <p class="register-subtitle">
          انضم إلى متجر وسادة واستمتع بأفضل العروض
        </p>
      </div>

      <!-- خطوات بصرية -->
      <div class="steps-indicator">
        <div class="step active">
          <span class="step-num">١</span>
          <span class="step-label">البيانات الشخصية</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <span class="step-num">٢</span>
          <span class="step-label">التواصل</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-num">٣</span>
          <span class="step-label">الأمان</span>
        </div>
      </div>

      <!-- خطأ من السيرفر -->
      <Transition name="error-pop">
        <div v-if="serverError" class="server-error-message">
          <Icon name="ph:warning-circle" class="error-icon" />
          {{ serverError }}
        </div>
      </Transition>

      <form @submit.prevent="onSubmit" class="register-form">
        <!-- قسم: البيانات الشخصية -->
        <div class="form-section">
          <div class="section-label">
            <Icon name="ph:user" class="section-icon" />
            البيانات الشخصية
          </div>
          <div class="name-grid">
            <BaseInput
              v-model="firstName"
              label="الاسم الأول *"
              id="firstName"
              placeholder="أدخل اسمك الأول"
              icon="ph:user"
              :error="errors.firstName"
              :disabled="isSubmitting"
            />
            <BaseInput
              v-model="lastName"
              label="الاسم الأخير *"
              id="lastName"
              placeholder="أدخل اسمك الأخير"
              icon="ph:user"
              :error="errors.lastName"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- قسم: بيانات التواصل -->
        <div class="form-section">
          <div class="section-label">
            <Icon name="ph:address-book" class="section-icon" />
            بيانات التواصل
          </div>

          <BaseInput
            v-model="email"
            label="البريد الإلكتروني *"
            id="email"
            type="email"
            placeholder="example@mail.com"
            icon="ph:envelope-simple"
            :error="errors.email"
            :disabled="isSubmitting"
          />

          <div class="phone-input-wrapper">
            <BaseInput
              v-model="phone"
              label="رقم الجوال *"
              id="phone"
              type="tel"
              placeholder="01xxxxxxxxx"
              icon="ph:phone"
              :error="errors.phone"
              :disabled="isSubmitting"
              class="phone-field"
            />
            <span class="country-code">
              <img src="https://flagcdn.com/w20/eg.png" alt="EG" class="flag" />
              +20
            </span>
          </div>
        </div>

        <!-- قسم: الأمان -->
        <div class="form-section">
          <div class="section-label">
            <Icon name="ph:shield-check" class="section-icon" />
            كلمة المرور
          </div>

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
            @toggle-password="showPassword = !showPassword"
          />

          <!-- مؤشر قوة كلمة المرور -->
          <div v-if="password" class="password-strength">
            <div class="strength-bars">
              <span
                v-for="i in 4"
                :key="i"
                class="strength-bar"
                :class="{
                  active: passwordStrength >= i,
                  [`level-${passwordStrength}`]: passwordStrength >= i,
                }"
              ></span>
            </div>
            <span class="strength-label" :class="`level-${passwordStrength}`">
              {{ strengthLabel }}
            </span>
          </div>

          <BaseInput
            v-model="confirmPassword"
            label="تأكيد كلمة المرور *"
            id="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="ph:lock"
            :show-password-toggle="true"
            :password-visible="showConfirmPassword"
            :error="errors.confirmPassword"
            :disabled="isSubmitting"
            @toggle-password="showConfirmPassword = !showConfirmPassword"
          />
        </div>

        <!-- الشروط والأحكام -->
        <div class="checkbox-container">
          <BaseCheckbox
            v-model="termsAccepted"
            id="terms"
            label="أوافق على الشروط والأحكام وسياسة الخصوصية"
          />
          <Transition name="error-pop">
            <p v-if="errors.termsAccepted" class="error-text">
              <Icon name="ph:warning" />
              {{ errors.termsAccepted }}
            </p>
          </Transition>
        </div>

        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :loading="isSubmitting"
        >
          <Icon name="ph:rocket-launch" class="btn-icon" />
          إنشاء الحساب
        </BaseButton>

        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <p class="login-prompt">
          لديك حساب بالفعل؟
          <NuxtLink to="/login" class="link-text">
            تسجيل الدخول
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
import { computed } from "vue";

definePageMeta({ middleware: ["guest"] });

const authStore = useAuthStore();
const serverError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// مؤشر قوة كلمة المرور
const passwordStrength = computed(() => {
  const val = password.value || "";
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
});

const strengthLabel = computed(() => {
  const labels = ["", "ضعيفة", "مقبولة", "جيدة", "قوية جداً"];
  return labels[passwordStrength.value] || "";
});

const schema = yup.object({
  firstName: yup
    .string()
    .required("الاسم الأول مطلوب")
    .min(2, "الاسم قصير جداً"),
  lastName: yup
    .string()
    .required("الاسم الأخير مطلوب")
    .min(2, "الاسم قصير جداً"),
  email: yup.string().required("البريد مطلوب").email("بريد غير صحيح"),
  phone: yup
    .string()
    .required("رقم الجوال مطلوب")
    .matches(
      /^(01)[0125][0-9]{8}$/,
      "رقم جوال غير صحيح (يجب أن يكون مثل 010xxxxxxxx)",
    ),
  password: yup
    .string()
    .required("كلمة المرور مطلوبة")
    .min(6, "6 أحرف على الأقل"),
  confirmPassword: yup
    .string()
    .required("تأكيد كلمة المرور مطلوب")
    .oneOf([yup.ref("password")], "كلمات المرور غير متطابقة"),
  termsAccepted: yup.boolean().oneOf([true], "يجب الموافقة على الشروط"),
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  },
});

const { value: firstName } = useField("firstName");
const { value: lastName } = useField("lastName");
const { value: email } = useField("email");
const { value: phone } = useField("phone");
const { value: password } = useField("password");
const { value: confirmPassword } = useField("confirmPassword");
const { value: termsAccepted } = useField("termsAccepted");

const onSubmit = handleSubmit(async (values) => {
  serverError.value = "";
  let formattedPhone = values.phone.trim();
  if (formattedPhone.startsWith("0"))
    formattedPhone = formattedPhone.substring(1);
  const finalPhone = `+20${formattedPhone}`;

  const result = await authStore.register({
    name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    email: values.email,
    phone: finalPhone,
    password: values.password,
    confirmPassword: values.confirmPassword,
  });

  if (result.success) await navigateTo("/");
  else serverError.value = result.error || "فشل إنشاء الحساب";
});
</script>

<style scoped lang="scss">
/* ═══════════════════════════════════════════
   الصفحة الرئيسية
═══════════════════════════════════════════ */
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
  // background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 50%, #f5faf7 100%);
}

/* ═══════════════════════════════════════════
   أشكال الخلفية
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
  opacity: 0.1;
  animation: floatShape 14s ease-in-out infinite;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  top: -180px;
  left: -120px;
  animation-delay: 0s;
}
.shape-2 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  bottom: -100px;
  right: -80px;
  animation-delay: -5s;
}
.shape-3 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, #68d391, transparent);
  top: 40%;
  right: 5%;
  animation-delay: -9s;
  opacity: 0.07;
}
.shape-4 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  top: 10%;
  left: 8%;
  animation-delay: -3s;
  opacity: 0.08;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(25px, -35px) scale(1.04);
  }
  66% {
    transform: translate(-18px, 22px) scale(0.96);
  }
}

/* ═══════════════════════════════════════════
   البطاقة
═══════════════════════════════════════════ */
.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 28px;
  padding: 48px 44px 40px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(0, 0, 0, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 600px) {
    padding: 36px 20px 32px;
    border-radius: 20px;
    margin: 0 4px;
  }
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(36px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══════════════════════════════════════════
   الهيدر
═══════════════════════════════════════════ */
.card-header {
  text-align: center;
  margin-bottom: 32px;
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
  margin-bottom: 18px;
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
  font-size: 30px;
  color: white;
  position: relative;
  z-index: 1;
}

.register-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.register-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ═══════════════════════════════════════════
   مؤشر الخطوات
═══════════════════════════════════════════ */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 32px;
  direction: rtl;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  opacity: 0.35;
  transition: opacity 0.3s;

  &.active {
    opacity: 1;
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-muted);
    transition: all 0.3s;
  }

  &.active .step-num {
    background: linear-gradient(
      135deg,
      var(--color-green-primary),
      var(--color-green-hover)
    );
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .step-label {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  &.active .step-label {
    color: var(--color-green-primary);
    font-weight: 600;
  }
}

.step-line {
  flex: 1;
  max-width: 48px;
  height: 2px;
  background: linear-gradient(to left, var(--color-green-primary), #e5e7eb);
  margin: 0 4px;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* ═══════════════════════════════════════════
   الأقسام
═══════════════════════════════════════════ */
.form-section {
  margin-bottom: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-green-primary);
  margin-bottom: 14px;
  padding: 8px 12px;
  background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.06);
  border-radius: 10px;
  border-right: 3px solid var(--color-green-primary);
  direction: rtl;

  .section-icon {
    font-size: 16px;
  }
}

/* ═══════════════════════════════════════════
   شبكة الاسم
═══════════════════════════════════════════ */
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

/* ═══════════════════════════════════════════
   حقل الهاتف
═══════════════════════════════════════════ */
.phone-input-wrapper {
  position: relative;

  .phone-field {
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

/* ═══════════════════════════════════════════
   مؤشر قوة كلمة المرور
═══════════════════════════════════════════ */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -14px 0 16px;
  padding: 0 4px;
  direction: rtl;
}

.strength-bars {
  display: flex;
  gap: 5px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: #e5e7eb;
  transition: all 0.4s ease;

  &.active {
    &.level-1 {
      background: #ef4444;
    }
    &.level-2 {
      background: #f97316;
    }
    &.level-3 {
      background: #eab308;
    }
    &.level-4 {
      background: #22c55e;
    }
  }
}

.strength-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  &.level-1 {
    color: #ef4444;
  }
  &.level-2 {
    color: #f97316;
  }
  &.level-3 {
    color: #eab308;
  }
  &.level-4 {
    color: #22c55e;
  }
}

/* ═══════════════════════════════════════════
   رسائل الخطأ
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
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

/* ═══════════════════════════════════════════
   الشروط
═══════════════════════════════════════════ */
.checkbox-container {
  margin-bottom: 28px;

  .error-text {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #dc2626;
    font-size: 12px;
    margin-top: 6px;
    direction: rtl;
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
   روابط وفقرة الدخول
═══════════════════════════════════════════ */
.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.link-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-green-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s ease;

  .arrow-icon {
    font-size: 14px;
  }
  &:hover {
    color: var(--color-green-dark);
    gap: 7px;
  }
}

.btn-icon {
  font-size: 18px;
}
</style>

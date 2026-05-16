<template>
  <div class="send-link-page">
    <!-- خلفية -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="send-link-card">
      <!-- هيدر -->
      <div class="card-header">
        <div class="logo-icon">
          <Icon name="ph:paper-plane-tilt" class="logo-svg" />
        </div>
        <h1 class="send-link-title">نسيت كلمة المرور؟</h1>
        <p class="send-link-subtitle">
          أدخل بريدك الإلكتروني وسنرسل لك كود التحقق لإعادة تعيين كلمة المرور
        </p>
      </div>

      <!-- حقل البريد -->
      <div class="email-wrapper">
        <BaseInput
          v-model="formData.email"
          label="البريد الإلكتروني *"
          id="email"
          type="email"
          placeholder="example@mail.com"
          icon="ph:envelope-simple"
          :required="true"
          :show-check="isValidEmail"
          :error="fieldError"
        />

        <!-- بادج حالة البريد -->
        <Transition name="badge-pop">
          <div v-if="isValidEmail && !fieldError" class="valid-badge">
            <Icon name="ph:check-circle-fill" class="badge-icon" />
            بريد صحيح
          </div>
        </Transition>
      </div>

      <!-- رسالة خطأ من السيرفر -->
      <Transition name="error-pop">
        <div v-if="serverError" class="server-error-message">
          <Icon name="ph:warning-circle" class="error-icon" />
          {{ serverError }}
        </div>
      </Transition>

      <BaseButton
        type="button"
        :full-width="true"
        variant="primary"
        :loading="isLoading"
        @click="handleSend"
      >
        <Icon name="ph:paper-plane-right" class="btn-icon" />
        إرسال كود التحقق
      </BaseButton>

      <!-- خطوات توضيحية -->
      <div class="steps-hint">
        <div class="hint-step">
          <span class="hint-num">١</span>
          <span class="hint-text">أدخل بريدك الإلكتروني</span>
        </div>
        <div class="hint-arrow"><Icon name="ph:arrow-left" /></div>
        <div class="hint-step">
          <span class="hint-num">٢</span>
          <span class="hint-text">تحقق من الكود</span>
        </div>
        <div class="hint-arrow"><Icon name="ph:arrow-left" /></div>
        <div class="hint-step">
          <span class="hint-num">٣</span>
          <span class="hint-text">عيّن كلمة مرور جديدة</span>
        </div>
      </div>

      <div class="divider">
        <span class="divider-text">أو</span>
      </div>

      <p class="login-prompt">
        تذكرت كلمة المرور؟
        <NuxtLink to="/login" class="link-text">
          تسجيل الدخول
          <Icon name="ph:arrow-left" class="arrow-icon" />
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const formData = ref({ email: "" });
const isLoading = ref(false);
const serverError = ref("");
const fieldError = ref("");
const router = useRouter();

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.value.email);
});

const handleSend = async () => {
  serverError.value = "";
  fieldError.value = "";

  if (!formData.value.email.trim()) {
    fieldError.value = "يرجى إدخال البريد الإلكتروني";
    return;
  }
  if (!isValidEmail.value) {
    fieldError.value = "يرجى إدخال بريد إلكتروني صحيح";
    return;
  }

  isLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await router.push({
      path: "/verify-email",
      query: { email: formData.value.email },
    });
  } catch (err) {
    serverError.value = "حدث خطأ أثناء إرسال الكود. يرجى المحاولة لاحقًا.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.send-link-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  // background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 50%, #f5faf7 100%);
}

/* ── خلفية ── */
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
  animation: floatShape 11s ease-in-out infinite;
}

.shape-1 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.09;
  bottom: -100px;
  right: -80px;
  animation-delay: 0s;
}
.shape-2 {
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.08;
  top: -60px;
  left: -50px;
  animation-delay: -4s;
}
.shape-3 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #68d391, transparent);
  opacity: 0.07;
  top: 50%;
  right: 6%;
  animation-delay: -8s;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(18px, -25px) scale(1.04);
  }
  66% {
    transform: translate(-12px, 16px) scale(0.97);
  }
}

/* ── البطاقة ── */
.send-link-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 28px;
  padding: 48px 40px 40px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 480px) {
    padding: 36px 20px 32px;
    border-radius: 20px;
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

/* ── الهيدر ── */
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
    var(--color-green-primary),
    var(--color-green-hover)
  );
  border-radius: 20px;
  margin-bottom: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: logoFloat 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  }
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(-8deg);
  }
}

.logo-svg {
  font-size: 30px;
  color: white;
  position: relative;
  z-index: 1;
}

.send-link-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 8px;
  letter-spacing: -0.4px;
}

.send-link-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.7;
  direction: rtl;
}

/* ── بادج البريد الصحيح ── */
.email-wrapper {
  position: relative;
}

.valid-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  .badge-icon {
    font-size: 14px;
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
@keyframes badgePop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ── خطوات توضيحية ── */
.steps-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 28px 0 0;
  direction: rtl;
  flex-wrap: wrap;
}

.hint-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.hint-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-green-primary),
    var(--color-green-hover)
  );
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.hint-text {
  font-weight: 500;
}

.hint-arrow {
  color: var(--text-muted);
  font-size: 13px;
  opacity: 0.5;
  transform: scaleX(-1);
}

/* ── رسالة خطأ السيرفر ── */
.server-error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fff5f5, #fee2e2);
  color: #dc2626;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #fecaca;
  direction: rtl;
  .error-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
}

.error-pop-enter-active {
  animation: errorShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.error-pop-leave-active {
  transition: all 0.25s ease;
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

/* ── فاصل ── */
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

/* ── روابط ── */
.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  transition: all 0.25s;
  .arrow-icon {
    font-size: 13px;
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

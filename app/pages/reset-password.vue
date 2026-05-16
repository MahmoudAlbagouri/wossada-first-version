<template>
  <div class="reset-page">
    <!-- خلفية تفاعلية -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="reset-card">
      <!-- هيدر -->
      <div class="card-header">
        <div class="logo-icon">
          <Icon name="ph:lock-key" class="logo-svg" />
        </div>
        <h1 class="reset-title">إعادة تعيين كلمة المرور</h1>
        <p class="reset-subtitle">أدخل كلمة مرور جديدة وقوية لحسابك</p>
      </div>

      <form @submit.prevent="handleReset" class="reset-form">
        <!-- كلمة المرور الجديدة -->
        <BaseInput
          v-model="formData.newPassword"
          label="كلمة المرور الجديدة *"
          id="newPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="ph:lock"
          :required="true"
          :show-password-toggle="true"
          :password-visible="showPassword"
          @toggle-password="togglePassword"
        />

        <!-- مؤشر قوة كلمة المرور -->
        <div v-if="formData.newPassword" class="password-strength">
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

        <!-- تأكيد كلمة المرور -->
        <BaseInput
          v-model="formData.confirmPassword"
          label="تأكيد كلمة المرور *"
          id="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="ph:lock-laminated"
          :required="true"
          :show-password-toggle="true"
          :password-visible="showConfirmPassword"
          @toggle-password="toggleConfirmPassword"
        />

        <!-- تطابق كلمات المرور -->
        <Transition name="fade-slide">
          <div
            v-if="formData.confirmPassword && formData.newPassword"
            class="match-indicator"
            :class="passwordsMatch ? 'match' : 'no-match'"
          >
            <Icon
              :name="
                passwordsMatch ? 'ph:check-circle-fill' : 'ph:x-circle-fill'
              "
              class="match-icon"
            />
            {{
              passwordsMatch
                ? "كلمتا المرور متطابقتان"
                : "كلمتا المرور غير متطابقتين"
            }}
          </div>
        </Transition>

        <!-- رسالة خطأ -->
        <Transition name="error-pop">
          <div v-if="localError" class="server-error-message">
            <Icon name="ph:warning-circle" class="error-icon" />
            {{ localError }}
          </div>
        </Transition>

        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :loading="isLoading"
        >
          <Icon name="ph:lock-key-open" class="btn-icon" />
          تحديث كلمة المرور
        </BaseButton>

        <p class="login-prompt">
          تذكرت كلمة المرور؟
          <NuxtLink to="/login" class="link-text">
            تسجيل الدخول
            <Icon name="ph:arrow-left" class="arrow-icon" />
          </NuxtLink>
        </p>
      </form>
    </div>

    <!-- بوب أب النجاح -->
    <SuccessPopup
      v-if="showSuccess"
      message="تم تغيير كلمة المرور بنجاح"
      @close="redirectToHome"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const formData = ref({ newPassword: "", confirmPassword: "" });
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const showSuccess = ref(false);
const localError = ref("");
const router = useRouter();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const passwordStrength = computed(() => {
  const val = formData.value.newPassword;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
});

const strengthLabel = computed(() => {
  return (
    ["", "ضعيفة", "مقبولة", "جيدة", "قوية جداً"][passwordStrength.value] || ""
  );
});

const passwordsMatch = computed(
  () =>
    formData.value.newPassword &&
    formData.value.confirmPassword &&
    formData.value.newPassword === formData.value.confirmPassword,
);

const handleReset = async () => {
  localError.value = "";
  if (!formData.value.newPassword || !formData.value.confirmPassword) {
    localError.value = "يرجى ملء جميع الحقول";
    return;
  }
  if (!passwordsMatch.value) {
    localError.value = "كلمة المرور وتأكيدها غير متطابقين";
    return;
  }
  isLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showSuccess.value = true;
  } catch (err) {
    localError.value = "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة لاحقًا.";
  } finally {
    isLoading.value = false;
  }
};

const redirectToHome = () => {
  showSuccess.value = false;
  setTimeout(() => router.push("/"), 1000);
};

onMounted(() => {
  if (showSuccess.value) setTimeout(redirectToHome, 3000);
});
</script>

<style scoped lang="scss">
.reset-page {
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
  animation: floatShape 12s ease-in-out infinite;
}

.shape-1 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.1;
  top: -100px;
  right: -80px;
  animation-delay: 0s;
}
.shape-2 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.08;
  bottom: -60px;
  left: -50px;
  animation-delay: -5s;
}
.shape-3 {
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, #68d391, transparent);
  opacity: 0.07;
  top: 35%;
  left: 6%;
  animation-delay: -9s;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(18px, -28px) scale(1.04);
  }
  66% {
    transform: translate(-14px, 18px) scale(0.97);
  }
}

/* ── البطاقة ── */
.reset-card {
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
.reset-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 6px;
  letter-spacing: -0.4px;
}
.reset-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ── مؤشر قوة كلمة المرور ── */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -12px 0 18px;
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

/* ── مؤشر تطابق كلمات المرور ── */
.match-indicator {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 10px;
  margin: -8px 0 16px;
  direction: rtl;

  &.match {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
  &.no-match {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.15);
  }

  .match-icon {
    font-size: 16px;
    flex-shrink: 0;
  }
}

/* ── رسالة الخطأ ── */
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

.fade-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── روابط ── */
.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 24px;
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

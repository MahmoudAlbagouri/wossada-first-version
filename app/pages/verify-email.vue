<template>
  <div class="verify-page">
    <!-- خلفية -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="verify-card">
      <!-- هيدر -->
      <div class="card-header">
        <div class="logo-icon">
          <Icon name="ph:envelope-open" class="logo-svg" />
        </div>
        <h1 class="verify-title">تأكيد البريد الإلكتروني</h1>
        <p class="verify-subtitle">
          أرسلنا كود التأكيد إلى
          <span class="email-highlight">{{ email }}</span>
        </p>
      </div>

      <!-- حقول الكود -->
      <div class="code-inputs" dir="ltr">
        <input
          v-for="(digit, index) in code"
          :key="index"
          v-model="code[index]"
          type="tel"
          inputmode="numeric"
          maxlength="1"
          class="code-digit"
          :class="{ filled: code[index], error: hasError }"
          :ref="(el) => (inputRefs[index] = el)"
          @input="handleInput(index, $event)"
          @keydown="handleKeyDown(index, $event)"
          @paste="handlePaste($event)"
        />
      </div>

      <!-- شريط التقدم / العداد -->
      <div class="timer-section">
        <div class="timer-ring">
          <svg viewBox="0 0 56 56" class="ring-svg">
            <circle cx="28" cy="28" r="24" class="ring-track" />
            <circle
              cx="28"
              cy="28"
              r="24"
              class="ring-progress"
              :style="{ strokeDashoffset: ringOffset }"
            />
          </svg>
          <span class="timer-num">{{ formattedTime }}</span>
        </div>
        <div class="timer-labels">
          <p class="timer-text">سينتهي الكود خلال</p>
          <button
            type="button"
            class="resend-btn"
            :class="{ 'can-resend': timer <= 0 }"
            @click="handleResend"
          >
            <Icon name="ph:arrow-clockwise" class="resend-icon" />
            {{ timer <= 0 ? "أعد إرسال الكود الآن" : "أعد إرسال الكود" }}
          </button>
        </div>
      </div>

      <!-- رسالة الخطأ -->
      <Transition name="error-pop">
        <div v-if="showError" class="server-error-message">
          <Icon name="ph:warning-circle" class="error-icon" />
          {{ errorMessage }}
        </div>
      </Transition>

      <BaseButton
        type="button"
        :full-width="true"
        variant="primary"
        :loading="isLoading"
        @click="handleSubmit"
      >
        <Icon name="ph:check-fat" class="btn-icon" />
        تأكيد الكود
      </BaseButton>

      <p class="login-prompt">
        لديك حساب بالفعل؟
        <NuxtLink to="/login" class="link-text">
          تسجيل الدخول
          <Icon name="ph:arrow-left" class="arrow-icon" />
        </NuxtLink>
      </p>
    </div>

    <!-- بوب أب الخطأ -->
    <ErrorPopup
      v-if="showError && usePopup"
      :message="errorMessage"
      @close="showError = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";

const route = useRouter();
const email = route.currentRoute.value.query.email || "example@example.com";

const TIMER_MAX = 54;
const code = ref(["", "", "", ""]);
const inputRefs = ref([]);
const timer = ref(TIMER_MAX);
const isLoading = ref(false);
const showError = ref(false);
const hasError = ref(false);
const errorMessage = ref("");
const usePopup = ref(false);
let interval = null;

const formattedTime = computed(() => {
  const secs = timer.value % 60;
  return `${secs.toString().padStart(2, "0")}`;
});

// حساب strokeDashoffset لمؤشر الدائرة
const ringOffset = computed(() => {
  const circumference = 2 * Math.PI * 24; // ~150.8
  const ratio = timer.value / TIMER_MAX;
  return circumference * (1 - ratio);
});

onMounted(() => {
  startTimer();
  nextTick(() => {
    if (inputRefs.value[0]) inputRefs.value[0].focus();
  });
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

const startTimer = () => {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) clearInterval(interval);
  }, 1000);
};

const handleInput = (index, event) => {
  hasError.value = false;
  const value = event.target.value.replace(/\D/g, "").slice(-1);
  code.value[index] = value;
  if (value && index < 3) {
    nextTick(() => inputRefs.value[index + 1]?.focus());
  }
  // إذا اكتملت الخانات، أرسل تلقائياً
  if (index === 3 && value && code.value.every((d) => d)) {
    setTimeout(handleSubmit, 300);
  }
};

const handleKeyDown = (index, event) => {
  if (event.key === "Backspace" && !code.value[index] && index > 0) {
    code.value[index - 1] = "";
    nextTick(() => inputRefs.value[index - 1]?.focus());
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pasted = event.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 4);
  pasted.split("").forEach((char, i) => {
    if (i < 4) code.value[i] = char;
  });
  nextTick(() => inputRefs.value[Math.min(pasted.length, 3)]?.focus());
};

const handleSubmit = async () => {
  const fullCode = code.value.join("");
  if (fullCode.length !== 4) {
    hasError.value = true;
    showError.value = true;
    errorMessage.value = "يرجى إدخال جميع أرقام الكود";
    return;
  }
  isLoading.value = true;
  showError.value = false;
  hasError.value = false;
  try {
    if (fullCode === "2345") {
      await route.push({ path: "/reset-password", query: { email } });
    } else {
      throw new Error("الكود غير صحيح");
    }
  } catch (err) {
    hasError.value = true;
    showError.value = true;
    errorMessage.value =
      err.message || "الكود غير صحيح. يرجى المحاولة مرة أخرى.";
    code.value = ["", "", "", ""];
    nextTick(() => inputRefs.value[0]?.focus());
  } finally {
    isLoading.value = false;
  }
};

const handleResend = () => {
  if (timer.value <= 0) {
    timer.value = TIMER_MAX;
    startTimer();
    code.value = ["", "", "", ""];
    showError.value = false;
    nextTick(() => inputRefs.value[0]?.focus());
  } else {
    showError.value = true;
    errorMessage.value = `يمكنك إعادة الإرسال بعد ${formattedTime.value} ثانية`;
  }
};
</script>

<style scoped lang="scss">
.verify-page {
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
  animation: floatShape 13s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.09;
  top: -120px;
  left: -100px;
  animation-delay: 0s;
}
.shape-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, var(--color-green-primary), transparent);
  opacity: 0.08;
  bottom: -70px;
  right: -60px;
  animation-delay: -6s;
}
.shape-3 {
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, #68d391, transparent);
  opacity: 0.07;
  top: 30%;
  right: 7%;
  animation-delay: -3s;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -28px) scale(1.04);
  }
  66% {
    transform: translate(-14px, 18px) scale(0.97);
  }
}

/* ── البطاقة ── */
.verify-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 28px;
  padding: 48px 36px 40px;
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

.verify-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 8px;
  letter-spacing: -0.4px;
}

.verify-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
  direction: rtl;

  .email-highlight {
    color: var(--color-green-primary);
    font-weight: 700;
    display: inline-block;
    word-break: break-all;
  }
}

/* ── حقول الكود ── */
.code-inputs {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 32px;
}

.code-digit {
  width: 62px;
  height: 68px;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  outline: none;
  color: var(--text-main);
  caret-color: var(--color-green-primary);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(0, 0, 0, 0.03);

  &:focus {
    border-color: var(--color-green-primary);
    box-shadow:
      0 0 0 3px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    background: white;
    transform: translateY(-2px) scale(1.04);
  }

  &.filled {
    border-color: var(--color-green-primary);
    background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.05);
    color: var(--color-green-primary);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    animation: codeShake 0.4s ease;
  }

  @media (max-width: 400px) {
    width: 52px;
    height: 58px;
    font-size: 22px;
    border-radius: 12px;
    gap: 10px;
  }
}

@keyframes codeShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* ── قسم العداد ── */
.timer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 28px;
  direction: rtl;
}

.timer-ring {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3.5;
}

.ring-progress {
  fill: none;
  stroke: var(--color-green-primary);
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-dasharray: 150.8;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1s linear;
}

.timer-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-green-primary);
}

.timer-labels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timer-text {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.resend-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: not-allowed;
  padding: 0;
  transition: all 0.25s;
  opacity: 0.55;
  .resend-icon {
    font-size: 14px;
  }

  &.can-resend {
    color: var(--color-green-primary);
    cursor: pointer;
    opacity: 1;
    &:hover {
      color: var(--color-green-dark);
      .resend-icon {
        transform: rotate(-30deg);
      }
    }
    .resend-icon {
      transition: transform 0.3s;
    }
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

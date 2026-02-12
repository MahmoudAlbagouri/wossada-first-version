<template>
  <div class="verify-page">
    <div class="verify-card">
      <h1 class="verify-title">تأكيد البريد الإلكتروني</h1>

      <p class="verify-subtitle">
        أرسلنا كود تأكيد إلى <span class="email-highlight">{{ email }}</span>
      </p>

      <!-- حقول إدخال الكود (4 أرقام) -->
      <div class="code-inputs">
        <input
          v-for="(digit, index) in code"
          :key="index"
          v-model="code[index]"
          type="tel"
          inputmode="numeric"
          maxlength="1"
          @input="handleInput(index, $event)"
          @keydown="handleKeyDown(index, $event)"
          class="code-digit"
          :ref="(el) => (inputRefs[index] = el)"
        />
      </div>

      <!-- عداد التوقيت -->
      <div class="timer">
        <span class="timer-text">سيتنتهي الكود بعد</span>
        <span class="timer-countdown">{{ formattedTime }}</span>
      </div>

      <!-- زر إرسال الكود -->
      <BaseButton
        type="button"
        :full-width="true"
        variant="primary"
        @click="handleSubmit"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">إرسال الكود</span>
        <span v-else>جاري التحقق...</span>
      </BaseButton>

      <!-- رابط إعادة الإرسال -->
      <p class="resend-link">
        لم تصلك الرسالة؟
        <button type="button" class="resend-btn" @click="handleResend">
          أعد إرسال الكود
        </button>
      </p>

      <!-- رابط تسجيل الدخول -->
      <p class="login-prompt">
        لديك حساب بالفعل؟
        <NuxtLink to="/login" class="link-text">تسجيل الدخول</NuxtLink>
      </p>
    </div>

    <!-- بوب أب الخطأ -->
    <ErrorPopup
      v-if="showError"
      :message="errorMessage"
      @close="showError = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "@/components/base/BaseButton.vue";
import ErrorPopup from "@/components/base/ErrorPopup.vue";

const route = useRouter();
const email = route.currentRoute.value.query.email || "example@example.com";

const code = ref(["", "", "", ""]);
const inputRefs = ref([]);
const timer = ref(54);
const isLoading = ref(false);
const showError = ref(false);
const errorMessage = ref("");
let interval = null;

const formattedTime = computed(() => {
  const mins = Math.floor(timer.value / 60);
  const secs = timer.value % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
  interval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

const handleInput = (index, event) => {
  const value = event.target.value;
  if (/^\d$/.test(value)) {
    code.value[index] = value;
    if (index < 3 && value) {
      nextTick(() => {
        if (inputRefs.value[index + 1]) inputRefs.value[index + 1].focus();
      });
    }
  } else {
    code.value[index] = "";
  }
};

const handleKeyDown = (index, event) => {
  if (event.key === "Backspace" && !code.value[index] && index > 0) {
    code.value[index - 1] = "";
    nextTick(() => {
      if (inputRefs.value[index - 1]) inputRefs.value[index - 1].focus();
    });
  }
};

const handleSubmit = async () => {
  const fullCode = code.value.join("");
  if (fullCode.length !== 4) {
    showError.value = true;
    errorMessage.value = "يرجى إدخال جميع أرقام الكود";
    return;
  }

  isLoading.value = true;
  showError.value = false;

  try {
    // ✅ التحقق من الكود (الكود الثابت: 2345)
    if (fullCode === "2345") {
      // ✅ التنقل إلى صفحة إعادة تعيين كلمة المرور
      await route.push({
        path: "/reset-password",
        query: { email: email },
      });
    } else {
      throw new Error("الكود غير صحيح");
    }
  } catch (err) {
    console.error("فشل التحقق من الكود:", err);
    showError.value = true;
    errorMessage.value =
      err.message || "الكود غير صحيح. يرجى المحاولة مرة أخرى.";
  } finally {
    isLoading.value = false;
  }
};

const handleResend = () => {
  if (timer.value <= 0) {
    timer.value = 54;
    startTimer();
    // في التطبيق الحقيقي: أعد إرسال الكود إلى الخادم
  } else {
    showError.value = true;
    errorMessage.value = `يمكنك إعادة الإرسال بعد ${formattedTime.value}`;
  }
};
</script>

<style scoped lang="scss">
.verify-page {
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

.verify-card {
  width: 80%;
  text-align: right;
}

.verify-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 16px 0;
  text-align: center;
}

.verify-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 32px 0;
  text-align: center;

  .email-highlight {
    color: var(--color-green-primary);
    font-weight: 600;
  }
}

.code-inputs {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 32px;
}

.code-digit {
  width: 60px;
  height: 60px;
  font-size: 24px;
  text-align: center;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--color-green-white);
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: var(--color-green-primary);
    box-shadow: 0 0 0 3px rgba(152, 114, 38, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.timer-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.timer-countdown {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-green-primary);
}

.resend-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;

  .resend-btn {
    background: none;
    border: none;
    color: var(--color-green-primary);
    font-weight: 600;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.3s;

    &:hover {
      color: var(--color-green-hover);
    }
  }
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

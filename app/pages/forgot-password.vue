<template>
  <div class="send-link-page">
    <div class="send-link-card">
      <h1 class="send-link-title">إعادة إرسال رابط التأكيد</h1>

      <p class="send-link-subtitle">
        أدخل بريدك الإلكتروني الذي سجلت به، وسنرسل لك رابط تأكيد جديد.
      </p>

      <!-- حقل البريد الإلكتروني -->
      <BaseInput
        v-model="formData.email"
        label="البريد الإلكتروني *"
        id="email"
        type="email"
        placeholder="mahmodnasser42@gmail.com"
        icon="ph:envelope-simple"
        :required="true"
        :show-check="isValidEmail"
      />

      <!-- زر إرسال الرابط -->
      <BaseButton
        type="button"
        :full-width="true"
        variant="primary"
        @click="handleSend"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">إرسال الكود</span>
        <span v-else>جاري الإرسال...</span>
      </BaseButton>

      <!-- رسالة خطأ -->
      <p v-if="error" class="error-message">{{ error }}</p>

      <!-- رابط تسجيل الدخول -->
      <p class="login-prompt">
        لديك حساب بالفعل؟
        <NuxtLink to="/login" class="link-text">تسجيل الدخول</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const formData = ref({
  email: "",
});

const isLoading = ref(false);
const error = ref("");
const router = useRouter();

// التحقق من صحة البريد الإلكتروني
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.value.email);
});

const handleSend = async () => {
  // إعادة تعيين الأخطاء
  error.value = "";

  // التحقق من الحقل
  if (!formData.value.email.trim()) {
    error.value = "يرجى إدخال البريد الإلكتروني";
    return;
  }

  if (!isValidEmail.value) {
    error.value = "يرجى إدخال بريد إلكتروني صحيح";
    return;
  }

  isLoading.value = true;

  try {
    // ✅ محاكاة إرسال الطلب إلى الخادم
    // في التطبيق الحقيقي، استبدل هذا بـ:
    // await $fetch('/api/send-verification', { method: 'POST', body: { email: formData.value.email } })

    await new Promise((resolve) => setTimeout(resolve, 1000)); // محاكاة التأخير

    // ✅ التنقل إلى صفحة التحقق مع تمرير البريد
    await router.push({
      path: "/verify-email",
      query: { email: formData.value.email },
    });
  } catch (err) {
    console.error("فشل إرسال رابط التأكيد:", err);
    error.value = "حدث خطأ أثناء إرسال الكود. يرجى المحاولة لاحقًا.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.send-link-page {
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

.send-link-card {
  width: 80%;
  text-align: right;
}

.send-link-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 16px 0;
  text-align: center;
}

.send-link-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 32px 0;
  text-align: center;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
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

<template>
  <div class="reset-page">
    <div class="reset-card">
      <h1 class="reset-title">إعادة تعيين كلمة المرور</h1>

      <form @submit.prevent="handleReset" class="reset-form">
        <!-- حقل كلمة المرور الجديدة -->
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

        <!-- زر إعادة التعيين -->
        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">تحديث كلمة المرور</span>
          <span v-else>جاري التحديث...</span>
        </BaseButton>

        <!-- رابط تسجيل الدخول -->
        <p class="login-prompt">
          لديك حساب بالفعل؟
          <NuxtLink to="/login" class="link-text">تسجيل الدخول</NuxtLink>
        </p>
      </form>

      <!-- بوب أب النجاح -->
      <SuccessPopup
        v-if="showSuccess"
        message="تم تغيير كلمة المرور بنجاح"
        @close="redirectToHome"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import SuccessPopup from "@/components/base/SuccessPopup.vue";

const formData = ref({
  newPassword: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const showSuccess = ref(false);
const router = useRouter();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleReset = async () => {
  if (!formData.value.newPassword || !formData.value.confirmPassword) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  if (formData.value.newPassword !== formData.value.confirmPassword) {
    alert("كلمة المرور وتأكيدها غير متطابقين");
    return;
  }

  isLoading.value = true;

  try {
    // ✅ محاكاة تحديث كلمة المرور
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // ✅ عرض بوب أب النجاح
    showSuccess.value = true;
  } catch (err) {
    console.error("فشل تحديث كلمة المرور:", err);
    alert("حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة لاحقًا.");
  } finally {
    isLoading.value = false;
  }
};

// ✅ التوجيه إلى الصفحة الرئيسية بعد 3 ثوانٍ
const redirectToHome = () => {
  showSuccess.value = false;
  setTimeout(() => {
    router.push("/");
  }, 1000);
};

// عند فتح البوب أب، بدء العد التنازلي تلقائيًا
onMounted(() => {
  if (showSuccess.value) {
    setTimeout(() => {
      redirectToHome();
    }, 3000);
  }
});
</script>

<style scoped lang="scss">
.reset-page {
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

.reset-card {
  width: 80%;
  text-align: right;
}

.reset-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 32px 0;
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

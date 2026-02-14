<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">إنشاء حساب</h1>

      <div v-if="serverError" class="server-error-message">
        {{ serverError }}
      </div>

      <form @submit.prevent="onSubmit" class="register-form">
        <BaseInput
          v-model="fullName"
          label="الاسم الكامل *"
          id="fullName"
          placeholder="أدخل اسمك الكامل"
          icon="ph:user"
          :error="errors.fullName"
          :disabled="isSubmitting"
        />

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

        <BaseInput
          v-model="phone"
          label="رقم الجوال *"
          id="phone"
          type="tel"
          placeholder="010XXXXXXXX"
          icon="ph:phone"
          :error="errors.phone"
          :disabled="isSubmitting"
        />

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

        <div class="checkbox-container">
          <BaseCheckbox
            v-model="termsAccepted"
            id="terms"
            label="أوافق على الشروط والأحكام وسياسة الخصوصية"
          />
          <p v-if="errors.termsAccepted" class="error-text">
            {{ errors.termsAccepted }}
          </p>
        </div>

        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :loading="isSubmitting"
        >
          إنشاء حساب
        </BaseButton>

        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <p class="login-prompt">
          لديك حساب بالفعل؟
          <NuxtLink to="/login" class="link-text">تسجيل الدخول</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

definePageMeta({ middleware: ["guest"] });

const authStore = useAuthStore();
const serverError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 1. شروط التحقق
const schema = yup.object({
  fullName: yup
    .string()
    .required("الاسم الكامل مطلوب")
    .min(3, "الاسم قصير جداً"),
  email: yup.string().required("البريد مطلوب").email("بريد غير صحيح"),
  phone: yup
    .string()
    .required("رقم الجوال مطلوب")
    .matches(/^[0-9]+$/, "أرقام فقط"),
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
  initialValues: { termsAccepted: false },
});

const { value: fullName } = useField("fullName");
const { value: email } = useField("email");
const { value: phone } = useField("phone");
const { value: password } = useField("password");
const { value: confirmPassword } = useField("confirmPassword");
const { value: termsAccepted } = useField("termsAccepted");

const onSubmit = handleSubmit(async (values) => {
  serverError.value = "";

  // تقسيم الاسم (لأن السيرفر يطلب firstName و lastName)
  const nameParts = values.fullName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const result = await authStore.register({
    firstName,
    lastName,
    email: values.email,
    phone: values.phone,
    password: values.password,
  });

  if (result.success) {
    navigateTo("/");
  } else {
    serverError.value = result.error;
  }
});
</script>

<style scoped lang="scss">
.register-page {
  width: 700px;
  max-width: 100%;
  margin: 40px auto;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-green-white);
  box-shadow: var(--shadow-3);
  border-radius: 16px;
  padding: 40px 30px;
}
.register-card {
  width: 85%;
  text-align: right;
}
.register-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 32px;
  text-align: center;
}

.server-error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.checkbox-container {
  margin-bottom: 24px;
  .error-text {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #eee;
  }
  .divider-text {
    padding: 0 16px;
    font-size: 14px;
    color: var(--text-muted);
  }
}

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 24px;
  .link-text {
    color: var(--color-green-primary);
    text-decoration: none;
    font-weight: 600;
  }
}
</style>

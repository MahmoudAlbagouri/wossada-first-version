<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">تسجيل الدخول</h1>

      <div v-if="serverError" class="server-error-message">
        {{ serverError }}
      </div>

      <form @submit.prevent="onSubmit" class="login-form">
        <!-- البريد أو الهاتف مع بادئة +20 ديناميكية -->
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
          <!-- عرض البادئة فقط إذا كان الحقل يحتوي على أرقام (رقم هاتف) -->
          <span v-if="isPhoneNumber(identifier)" class="country-code">+20</span>
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
          <div class="forgot-link">
            <NuxtLink to="/forgot-password" class="link-text"
              >نسيت كلمة المرور؟</NuxtLink
            >
          </div>
        </div>

        <BaseButton
          type="submit"
          :full-width="true"
          variant="primary"
          :loading="isSubmitting"
        >
          تسجيل الدخول
        </BaseButton>

        <div class="divider">
          <span class="divider-text">أو</span>
        </div>

        <p class="signup-prompt">
          عميل جديد؟
          <NuxtLink to="/register" class="link-text">أنشئ حساب</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { nextTick } from "vue";

definePageMeta({
  middleware: ["guest"],
});

useSeoMeta({
  title: "تسجيل الدخول - متجر وسادة",
  description:
    "سجل دخولك الآن لمتابعة طلباتك والحصول على أفضل العروض من متجر وسادة.",
});

const authStore = useAuthStore();
const serverError = ref("");
const showPassword = ref(false);

// دالة مساعدة للتحقق مما إذا كان المدخل رقم هاتف مصري
const isPhoneNumber = (val) => {
  if (!val) return false;
  // يتحقق إذا كان يبدأ بـ 01 أو +20 أو أرقام فقط
  return /^(\+20|01)[0-9]{8,10}$/.test(val.replace(/\s/g, ""));
};

// مخطط التحقق
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
  initialValues: {
    identifier: "",
    password: "",
    rememberMe: false,
  },
});

const { value: identifier } = useField("identifier");
const { value: password } = useField("password");
const { value: rememberMe } = useField("rememberMe");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const onSubmit = handleSubmit(async (values) => {
  serverError.value = "";

  // ✅ معالجة الرقم قبل الإرسال
  let finalIdentifier = values.identifier.trim();

  // إذا كان الرقم يبدو كهاتف مصري (يبدأ بـ 01...)
  if (/^01[0-9]{9}$/.test(finalIdentifier)) {
    // حذف الصفر الأول وإضافة +20
    finalIdentifier = `+20${finalIdentifier.substring(1)}`;
  }
  // إذا كان المستخدم أدخل +20 بالفعل، نتركه كما هو
  // إذا كان بريداً إلكترونياً، نتركه كما هو

  try {
    const result = await authStore.login({
      email: finalIdentifier, // إرسال المعالج
      password: values.password,
    });

    if (result.success) {
      await nextTick();
      const tokenCookie = useCookie("auth_token");

      if (tokenCookie.value) {
        return navigateTo("/");
      } else {
        serverError.value =
          "حدث خطأ في حفظ بيانات تسجيل الدخول، يرجى المحاولة مرة أخرى.";
      }
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
.login-page {
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

.login-card {
  width: 80%;
  text-align: right;
}

.login-title {
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
  border: 1px solid #fecaca;
  animation: shake 0.5s ease-in-out;
}

/* تنسيق حاوية حقل التعريف لإظهار كود الدولة */
.identifier-input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;

  .identifier-field {
    width: 100%;
  }

  .country-code {
    position: absolute;
    top: 50%;
    /* ضبط المكان بناءً على اتجاه الصفحة RTL */
    right: 45px; /* تعديل حسب مكان الأيقونة في BaseInput الخاص بك */
    transform: translateY(-50%);
    font-weight: bold;
    color: var(--text-main);
    pointer-events: none;
    z-index: 10;
    background: var(--color-green-white);
    padding: 0 4px;
  }
}

.forgit-remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .link-text {
    color: var(--color-green-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-green-dark);
    }
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

.signup-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 24px;

  .link-text {
    color: var(--color-green-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-green-dark);
    }
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>

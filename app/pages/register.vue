<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">إنشاء حساب جديد</h1>

      <div v-if="serverError" class="server-error-message">
        {{ serverError }}
      </div>

      <form @submit.prevent="onSubmit" class="register-form">
        <!-- الاسم الأول -->
        <BaseInput
          v-model="firstName"
          label="الاسم الأول *"
          id="firstName"
          placeholder="أدخل اسمك الأول"
          icon="ph:user"
          :error="errors.firstName"
          :disabled="isSubmitting"
        />

        <!-- الاسم الأخير -->
        <BaseInput
          v-model="lastName"
          label="الاسم الأخير *"
          id="lastName"
          placeholder="أدخل اسمك الأخير"
          icon="ph:user"
          :error="errors.lastName"
          :disabled="isSubmitting"
        />

        <!-- البريد الإلكتروني -->
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

        <!-- رقم الجوال مع بادئة +20 -->
        <div class="phone-input-wrapper">
          <BaseInput
            v-model="phone"
            label="رقم الجوال *"
            id="phone"
            type="tel"
            placeholder="10XXXXXXXX"
            icon="ph:phone"
            :error="errors.phone"
            :disabled="isSubmitting"
            class="phone-field"
          />
          <!-- عرض البادئة بشكل جمالي بجانب الحقل -->
          <span class="country-code">+20</span>
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
          @toggle-password="showPassword = !showPassword"
        />

        <!-- تأكيد كلمة المرور -->
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

        <!-- الموافقة على الشروط -->
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

definePageMeta({
  middleware: ["guest"],
});

const authStore = useAuthStore();
const serverError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// مخطط التحقق
// لاحظ: regex يتحقق من أن الرقم يبدأ بـ 1 وليس 0 لأننا سنضيف +20 لاحقاً
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
    // تعديل الريجيكس ليتقبل الأرقام المصرية بدون الصفر في البداية (مثلاً 10xxxxxxx)
    // أو يمكن تركه كما هو إذا كنت تريد من المستخدم إدخال 010 وسنقوم بحذف الصفر برمجياً
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

  // ✅ معالجة رقم الهاتف:
  // 1. نأخذ الرقم المدخل
  let formattedPhone = values.phone.trim();

  // 2. إذا كان المستخدم أدخل الرقم بصيغة 010... نحذف الصفر الأول ليصبح 10...
  if (formattedPhone.startsWith("0")) {
    formattedPhone = formattedPhone.substring(1);
  }

  // 3. نضيف كود الدولة +20 في البداية
  const finalPhone = `+20${formattedPhone}`;

  // ✅ الآن values تحتوي على جميع الحقول بشكل صحيح
  const result = await authStore.register({
    name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    email: values.email,
    phone: finalPhone, // إرسال الرقم بالتنسيق المطلوب للباك إند (+2010...)
    password: values.password,
    confirmPassword: values.confirmPassword,
  });

  if (result.success) {
    await navigateTo("/");
  } else {
    serverError.value = result.error || "فشل إنشاء الحساب";
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
  border: 1px solid #fecaca;
  animation: shake 0.5s ease-in-out;
}

/* تنسيق حاوية رقم الهاتف لإظهار كود الدولة */
.phone-input-wrapper {
  position: relative;
  margin-bottom: 1.5rem; /* مسافة مكافئة لـ BaseInput */

  .phone-field {
    width: 100%;
  }

  .country-code {
    position: absolute;
    top: 50%;
    left: 15px; /* ضبط المكان حسب اتجاه الصفحة RTL/LTR */
    transform: translateY(-50%);
    font-weight: bold;
    color: var(--text-main);
    pointer-events: none;
    z-index: 10;

    /* إذا كانت الصفحة RTL، قد تحتاج لتعديل left/right حسب تصميم BaseInput */
    [dir="rtl"] & {
      left: auto;
      right: 45px; /* تعديل بناءً على مكان الأيقونة في BaseInput */
    }
  }
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

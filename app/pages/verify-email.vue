<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' });

const { t } = useI18n();
const authService = useAuthService();
const reset = usePasswordReset();
const toast = useToast();

usePageSeo({ title: t('auth.verifyTitle'), noindex: true });

// Opened directly (refresh / bookmark): start the flow again.
if (!reset.value.email) await navigateTo('/forgot-password', { replace: true });

const code = ref('');
const error = ref<string | undefined>();
const verifying = ref(false);
const cooldown = ref(60);
let timer: ReturnType<typeof setInterval> | undefined;

function startCooldown() {
  cooldown.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) clearInterval(timer);
  }, 1000);
}
onMounted(startCooldown);
onBeforeUnmount(() => clearInterval(timer));

watch(code, () => (error.value = undefined));

async function verify() {
  if (code.value.length !== OTP_LENGTH || verifying.value) {
    error.value = t('validation.otp', { length: OTP_LENGTH });
    return;
  }
  verifying.value = true;
  try {
    await authService.verifyOtp(reset.value.email, code.value);
    reset.value = { ...reset.value, otp: code.value };
    await navigateTo('/reset-password');
  } catch (e) {
    error.value = toast.errorMessage(e);
  } finally {
    verifying.value = false;
  }
}

async function resend() {
  try {
    await authService.forgotPassword(reset.value.email);
    toast.success(t('auth.codeResent'));
    code.value = '';
    startCooldown();
  } catch (e) {
    toast.fromError(e);
  }
}
</script>

<template>
  <AuthCard :title="t('auth.verifyTitle')" :subtitle="t('auth.verifySubtitle', { email: reset.email })" icon="ph:envelope-open">
    <form novalidate @submit.prevent="verify">
      <OtpInput v-model="code" :length="OTP_LENGTH" :error="error" :disabled="verifying" @complete="verify" />
      <BaseButton type="submit" size="lg" block :loading="verifying" icon="ph:shield-check">{{ t('auth.verify') }}</BaseButton>
      <p class="resend">
        {{ t('auth.noCode') }}
        <button v-if="cooldown <= 0" type="button" class="resend__btn" @click="resend">{{ t('auth.resend') }}</button>
        <span v-else class="text-subtle">{{ t('auth.resendIn', { seconds: cooldown }) }}</span>
      </p>
    </form>
    <template #footer>
      <NuxtLink to="/forgot-password">{{ t('auth.changeEmail') }}</NuxtLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.resend {
  font-size: var(--text-sm);
  text-align: center;
  color: var(--color-text-muted);
}
.resend__btn {
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
.resend__btn:hover {
  text-decoration: underline;
}
</style>

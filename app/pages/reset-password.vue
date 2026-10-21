<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' });

const { t } = useI18n();
const authService = useAuthService();
const reset = usePasswordReset();
const toast = useToast();
const v = useValidators();

usePageSeo({ title: t('auth.resetTitle'), noindex: true });

if (!reset.value.email || !reset.value.otp) await navigateTo('/forgot-password', { replace: true });

const { values, errors, submitting, formError, handleSubmit } = useForm(() => ({ newPassword: '', confirmPassword: '' }), {
  newPassword: [v.required(), v.password()],
  confirmPassword: [v.required(), v.sameAs('newPassword')],
});

const submit = handleSubmit(async (form) => {
  await authService.resetPassword({ email: reset.value.email, otp: reset.value.otp, ...form });
  reset.value = { email: '', otp: '' };
  toast.success(t('auth.passwordReset'));
  await navigateTo('/login');
});
</script>

<template>
  <AuthCard :title="t('auth.resetTitle')" :subtitle="t('auth.resetSubtitle')" icon="ph:lock-key-open">
    <form novalidate @submit="submit">
      <BaseInput
        v-model="values.newPassword"
        type="password"
        :label="t('account.newPassword')"
        icon="ph:lock-simple"
        autocomplete="new-password"
        :hint="t('auth.passwordHint')"
        :error="errors.newPassword"
        required
      />
      <BaseInput
        v-model="values.confirmPassword"
        type="password"
        :label="t('auth.confirmPassword')"
        icon="ph:lock-simple"
        autocomplete="new-password"
        :error="errors.confirmPassword"
        required
      />
      <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>
      <BaseButton type="submit" size="lg" block :loading="submitting" icon="ph:check">{{ t('auth.savePassword') }}</BaseButton>
    </form>
  </AuthCard>
</template>

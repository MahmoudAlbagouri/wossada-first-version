<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' });

const { t } = useI18n();
const authService = useAuthService();
const reset = usePasswordReset();
const v = useValidators();

usePageSeo({ title: t('auth.forgotTitle'), noindex: true });

const { values, errors, submitting, formError, handleSubmit } = useForm(() => ({ email: reset.value.email }), {
  email: [v.required(), v.email()],
});

const submit = handleSubmit(async ({ email }) => {
  const normalized = email.trim().toLowerCase();
  await authService.forgotPassword(normalized);
  reset.value = { email: normalized, otp: '' };
  await navigateTo('/verify-email');
});
</script>

<template>
  <AuthCard :title="t('auth.forgotTitle')" :subtitle="t('auth.forgotSubtitle')" icon="ph:key">
    <form novalidate @submit="submit">
      <BaseInput
        v-model="values.email"
        type="email"
        :label="t('auth.email')"
        icon="ph:envelope-simple"
        autocomplete="email"
        dir="ltr"
        :error="errors.email"
        required
      />
      <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>
      <BaseButton type="submit" size="lg" block :loading="submitting" icon="ph:paper-plane-tilt">{{ t('auth.sendCode') }}</BaseButton>
    </form>
    <template #footer>
      <NuxtLink to="/login">{{ t('auth.backToLogin') }}</NuxtLink>
    </template>
  </AuthCard>
</template>

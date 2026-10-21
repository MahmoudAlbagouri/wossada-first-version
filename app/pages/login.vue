<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' });

const { t } = useI18n();
const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const v = useValidators();

usePageSeo({ title: t('auth.loginTitle'), noindex: true });

const redirect = computed(() => {
  const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  // Only same-site paths (never `//evil.com`).
  return target.startsWith('/') && !target.startsWith('//') ? target : '/';
});

const { values, errors, submitting, formError, handleSubmit } = useForm(() => ({ identifier: '', password: '' }), {
  identifier: [v.required(t('auth.identifierRequired'))],
  password: [v.required(t('auth.passwordRequired'))],
});

const submit = handleSubmit(async ({ identifier, password }) => {
  const user = await auth.login(identifier.trim(), password);
  toast.success(t('auth.welcomeBack', { name: user.name }));
  await navigateTo(user.role === 'admin' && redirect.value === '/' ? '/admin' : redirect.value);
});
</script>

<template>
  <AuthCard :title="t('auth.loginTitle')" :subtitle="t('auth.loginSubtitle')">
    <form novalidate @submit="submit">
      <BaseInput
        v-model="values.identifier"
        :label="t('auth.identifier')"
        :placeholder="t('auth.identifierPlaceholder')"
        icon="ph:user"
        autocomplete="username"
        dir="ltr"
        :error="errors.identifier"
        required
      />
      <BaseInput
        v-model="values.password"
        type="password"
        :label="t('auth.password')"
        icon="ph:lock-simple"
        autocomplete="current-password"
        :error="errors.password"
        required
      />
      <NuxtLink to="/forgot-password" class="forgot">{{ t('auth.forgotPassword') }}</NuxtLink>
      <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>
      <BaseButton type="submit" size="lg" block :loading="submitting" icon-end="ph:arrow-right">{{ t('auth.login') }}</BaseButton>
    </form>
    <template #footer>
      {{ t('auth.noAccount') }}
      <NuxtLink :to="{ path: '/register', query: route.query }">{{ t('auth.createAccount') }}</NuxtLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.forgot {
  align-self: flex-end;
  margin-block-start: calc(var(--space-2) * -1);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}
.forgot:hover {
  text-decoration: underline;
}
</style>

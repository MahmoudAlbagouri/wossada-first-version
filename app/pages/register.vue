<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' });

const { t } = useI18n();
const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const v = useValidators();

usePageSeo({ title: t('auth.registerTitle'), noindex: true });

const { values, errors, submitting, formError, handleSubmit } = useForm(
  () => ({ name: '', email: '', phone: '', password: '', confirmPassword: '' }),
  {
    name: [v.required(), v.minLength(3), v.maxLength(100)],
    email: [v.required(), v.email()],
    phone: [v.required(), v.phone()],
    password: [v.required(), v.password()],
    confirmPassword: [v.required(), v.sameAs('password')],
  },
);

const submit = handleSubmit(async (form) => {
  const user = await auth.register({ ...form, email: form.email.trim().toLowerCase() });
  toast.success(t('auth.welcome', { name: user.name }));
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')
    ? route.query.redirect
    : '/';
  await navigateTo(redirect);
});
</script>

<template>
  <AuthCard :title="t('auth.registerTitle')" :subtitle="t('auth.registerSubtitle')">
    <form novalidate @submit="submit">
      <BaseInput v-model="values.name" :label="t('auth.name')" icon="ph:user" autocomplete="name" :error="errors.name" required />
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
      <BaseInput
        v-model="values.phone"
        type="tel"
        :label="t('auth.phone')"
        :placeholder="t('auth.phonePlaceholder')"
        icon="ph:phone"
        autocomplete="tel"
        inputmode="tel"
        dir="ltr"
        :error="errors.phone"
        required
      />
      <BaseInput
        v-model="values.password"
        type="password"
        :label="t('auth.password')"
        icon="ph:lock-simple"
        autocomplete="new-password"
        :hint="t('auth.passwordHint')"
        :error="errors.password"
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
      <BaseButton type="submit" size="lg" block :loading="submitting" icon-end="ph:arrow-right">{{ t('auth.createAccount') }}</BaseButton>
      <p class="terms">
        {{ t('auth.agree') }}
        <NuxtLink to="/terms">{{ t('nav.terms') }}</NuxtLink> · <NuxtLink to="/privacy">{{ t('nav.privacy') }}</NuxtLink>
      </p>
    </form>
    <template #footer>
      {{ t('auth.haveAccount') }}
      <NuxtLink :to="{ path: '/login', query: route.query }">{{ t('auth.login') }}</NuxtLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.terms {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  text-align: center;
}
.terms a {
  color: var(--color-primary);
}
</style>

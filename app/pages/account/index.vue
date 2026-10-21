<script setup lang="ts">
const { t } = useI18n();
const { date } = useLocalized();
const auth = useAuthStore();
const shop = useShopService();
const toast = useToast();
const v = useValidators();

useHead({ title: t('account.profile') });

const profile = useForm(() => ({ name: auth.user?.name ?? '' }), {
  name: [v.required(), v.minLength(3), v.maxLength(100)],
});
watch(
  () => auth.user?.name,
  (name) => name && !profile.values.name && (profile.values.name = name),
  { immediate: true },
);

const saveProfile = profile.handleSubmit(async ({ name }) => {
  auth.user = await shop.updateProfile({ name });
  toast.success(t('account.profileSaved'));
});

const password = useForm(() => ({ currentPassword: '', password: '', confirmPassword: '' }), {
  currentPassword: [v.required()],
  password: [v.required(), v.password()],
  confirmPassword: [v.required(), v.sameAs('password')],
});

const savePassword = password.handleSubmit(async ({ currentPassword, password: newPassword }) => {
  await shop.updateProfile({ currentPassword, password: newPassword });
  password.reset();
  toast.success(t('account.passwordChanged'));
});
</script>

<template>
  <div class="stack" style="--stack-gap: var(--space-8)">
    <AccountSection :title="t('account.profile')" :description="t('account.profileHint')">
      <form class="form-grid" novalidate @submit="saveProfile">
        <BaseInput v-model="profile.values.name" :label="t('auth.name')" icon="ph:user" autocomplete="name" :error="profile.errors.name" required />
        <BaseInput :model-value="auth.user?.email ?? ''" :label="t('auth.email')" icon="ph:envelope-simple" dir="ltr" readonly disabled />
        <BaseInput :model-value="auth.user?.phone ?? ''" :label="t('auth.phone')" icon="ph:phone" dir="ltr" readonly disabled />
        <BaseInput :model-value="date(auth.user?.createdAt)" :label="t('account.memberSince')" icon="ph:calendar-blank" readonly disabled />
        <BaseAlert v-if="profile.formError.value" tone="danger" class="form-grid__full">{{ profile.formError.value }}</BaseAlert>
        <div class="form-grid__full">
          <BaseButton type="submit" :loading="profile.submitting.value" icon="ph:check">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </AccountSection>

    <AccountSection :title="t('account.changePassword')" :description="t('account.changePasswordHint')">
      <form class="form-grid" novalidate @submit="savePassword">
        <BaseInput
          v-model="password.values.currentPassword"
          type="password"
          :label="t('account.currentPassword')"
          autocomplete="current-password"
          :error="password.errors.currentPassword"
          class="form-grid__full"
          required
        />
        <BaseInput
          v-model="password.values.password"
          type="password"
          :label="t('account.newPassword')"
          autocomplete="new-password"
          :hint="t('auth.passwordHint')"
          :error="password.errors.password"
          required
        />
        <BaseInput
          v-model="password.values.confirmPassword"
          type="password"
          :label="t('auth.confirmPassword')"
          autocomplete="new-password"
          :error="password.errors.confirmPassword"
          required
        />
        <BaseAlert v-if="password.formError.value" tone="danger" class="form-grid__full">{{ password.formError.value }}</BaseAlert>
        <div class="form-grid__full">
          <BaseButton type="submit" :loading="password.submitting.value" icon="ph:lock-key">{{ t('account.updatePassword') }}</BaseButton>
        </div>
      </form>
    </AccountSection>
  </div>
</template>

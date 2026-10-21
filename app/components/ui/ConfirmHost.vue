<script setup lang="ts">
const { state, settle } = useConfirm();
const { t } = useI18n();

const open = computed({
  get: () => state.value.open,
  set: (value) => {
    if (!value) settle(false);
  },
});
</script>

<template>
  <BaseModal v-model="open" size="sm" hide-close>
    <div class="confirm">
      <div class="confirm__icon" :class="`confirm__icon--${state.tone ?? 'primary'}`" aria-hidden="true">
        <Icon :name="state.icon ?? (state.tone === 'danger' ? 'ph:warning' : 'ph:question')" />
      </div>
      <h2 class="confirm__title">{{ state.title }}</h2>
      <p v-if="state.message" class="confirm__message">{{ state.message }}</p>
    </div>
    <template #footer>
      <BaseButton variant="outline" @click="settle(false)">{{ state.cancelText ?? t('common.cancel') }}</BaseButton>
      <BaseButton :variant="state.tone === 'danger' ? 'danger' : 'primary'" autofocus @click="settle(true)">
        {{ state.confirmText ?? t('common.confirm') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding-block-start: var(--space-4);
}
.confirm__icon {
  display: grid;
  place-items: center;
  inline-size: 4rem;
  block-size: 4rem;
  border-radius: 50%;
  font-size: 2rem;
  animation: pop var(--duration-slow) var(--ease-spring);
}
.confirm__icon--primary {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.confirm__icon--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.confirm__title {
  font-size: var(--text-xl);
}
.confirm__message {
  color: var(--color-text-muted);
}
</style>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; icon?: string }>();
</script>

<template>
  <div class="auth-card">
    <header class="auth-card__head">
      <span v-if="icon" class="auth-card__icon" aria-hidden="true"><Icon :name="icon" /></span>
      <h1 class="auth-card__title">{{ title }}</h1>
      <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="auth-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.auth-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.auth-card__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.auth-card__icon {
  display: grid;
  place-items: center;
  inline-size: 3.5rem;
  block-size: 3.5rem;
  margin-block-end: var(--space-2);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--gold-50), var(--gold-100));
  color: var(--color-primary);
  font-size: 1.75rem;
  animation: pop 0.6s var(--ease-spring);
}
.auth-card__title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-black);
}
.auth-card__subtitle {
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}
.auth-card__footer {
  padding-block-start: var(--space-5);
  border-block-start: 1px solid var(--color-border);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.auth-card__footer :deep(a) {
  color: var(--color-primary);
  font-weight: var(--weight-bold);
}
.auth-card :deep(form) {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>

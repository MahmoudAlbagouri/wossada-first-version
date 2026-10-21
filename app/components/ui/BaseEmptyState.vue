<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
    compact?: boolean;
  }>(),
  { icon: 'ph:package' },
);
</script>

<template>
  <div class="empty" :class="{ 'empty--compact': compact }">
    <div class="empty__icon" aria-hidden="true">
      <Icon :name="icon" />
    </div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: clamp(2.5rem, 2rem + 4vw, 5rem) var(--space-4);
  animation: fade-up var(--duration-slow) var(--ease-out);
}
.empty--compact {
  padding-block: var(--space-10);
}
.empty__icon {
  display: grid;
  place-items: center;
  inline-size: 5.5rem;
  block-size: 5.5rem;
  margin-block-end: var(--space-2);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--gold-50), var(--gold-100));
  color: var(--color-primary);
  font-size: 2.5rem;
  box-shadow: inset 0 0 0 8px rgb(255 255 255 / 0.6);
  animation: float 5s ease-in-out infinite;
}
.empty--compact .empty__icon {
  inline-size: 4rem;
  block-size: 4rem;
  font-size: 1.75rem;
}
.empty__title {
  font-size: var(--text-xl);
}
.empty__description {
  max-inline-size: 42ch;
  color: var(--color-text-muted);
}
.empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-block-start: var(--space-3);
}
</style>

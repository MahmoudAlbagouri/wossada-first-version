<script setup lang="ts">
import { NuxtLink } from '#components';

defineProps<{
  to?: string;
  icon?: string;
  label: string;
  /** Badge number (cart items, saved products). */
  count?: number;
  /** Show the text label next to the icon on desktop. */
  showLabel?: boolean;
}>();
</script>

<template>
  <component :is="to ? NuxtLink : 'button'" :to="to" :type="to ? undefined : 'button'" class="action" :aria-label="label">
    <span class="action__icon">
      <slot name="icon"><Icon :name="icon!" aria-hidden="true" /></slot>
      <span v-if="count" :key="count" class="action__count" aria-hidden="true">{{ count > 99 ? '99+' : count }}</span>
    </span>
    <span v-if="showLabel" class="action__label hide-mobile line-clamp-1"><slot>{{ label }}</slot></span>
  </component>
</template>

<style scoped>
.action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-block-size: 2.75rem;
  padding-inline: var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.action:hover {
  background: var(--color-primary-softer);
  color: var(--color-primary);
}
.action__icon {
  position: relative;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
}
.action__count {
  position: absolute;
  inset-block-start: -0.35rem;
  inset-inline-end: -0.55rem;
  display: grid;
  place-items: center;
  min-inline-size: 1.2rem;
  block-size: 1.2rem;
  padding-inline: 0.25rem;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-surface);
  background: var(--color-danger);
  color: #fff;
  font-size: 0.65rem;
  font-weight: var(--weight-bold);
  line-height: 1;
  animation: pop var(--duration-slow) var(--ease-spring);
}
.action__label {
  max-inline-size: 9rem;
}
</style>

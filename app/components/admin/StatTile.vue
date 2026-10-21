<script setup lang="ts">
import { NuxtLink } from '#components';

defineProps<{ label: string; value: string; icon: string; to?: string; hint?: string }>();
</script>

<template>
  <component :is="to ? NuxtLink : 'div'" :to="to" class="tile card">
    <span class="tile__icon" aria-hidden="true"><Icon :name="icon" /></span>
    <span class="tile__label">{{ label }}</span>
    <strong class="tile__value">{{ value }}</strong>
    <span v-if="hint" class="tile__hint">{{ hint }}</span>
  </component>
</template>

<style scoped>
.tile {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'icon label'
    'icon value'
    'icon hint';
  column-gap: var(--space-3);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}
a.tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.tile__icon {
  grid-area: icon;
  display: grid;
  place-items: center;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-softer);
  color: var(--color-primary);
  font-size: 1.5rem;
}
.tile__label {
  grid-area: label;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.tile__value {
  grid-area: value;
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  line-height: 1.2;
}
.tile__hint {
  grid-area: hint;
  font-size: var(--text-2xs);
  color: var(--color-text-subtle);
}
</style>

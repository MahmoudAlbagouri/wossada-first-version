<script setup lang="ts">
import type { Tone } from '~/utils/order-status';

withDefaults(
  defineProps<{
    tone?: Tone;
    size?: 'sm' | 'md';
    icon?: string;
    /** Small colored dot before the label (statuses). */
    dot?: boolean;
    /** Solid background instead of the soft tint. */
    solid?: boolean;
  }>(),
  { tone: 'neutral', size: 'md' },
);
</script>

<template>
  <span class="badge" :class="[`badge--${tone}`, `badge--${size}`, { 'badge--solid': solid }]">
    <span v-if="dot" class="badge__dot" aria-hidden="true" />
    <Icon v-else-if="icon" :name="icon" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  --tone: var(--stone-600);
  --tone-soft: var(--stone-100);
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.3em 0.75em;
  border-radius: var(--radius-full);
  background: var(--tone-soft);
  color: var(--tone);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: 1.2;
  white-space: nowrap;
}
.badge--sm {
  font-size: var(--text-2xs);
  padding: 0.25em 0.6em;
}
.badge--solid {
  background: var(--tone);
  color: #fff;
}
.badge--primary {
  --tone: var(--gold-700);
  --tone-soft: var(--gold-100);
}
.badge--info {
  --tone: var(--color-info);
  --tone-soft: var(--color-info-soft);
}
.badge--success {
  --tone: var(--color-success);
  --tone-soft: var(--color-success-soft);
}
.badge--warning {
  --tone: var(--color-warning);
  --tone-soft: var(--color-warning-soft);
}
.badge--danger {
  --tone: var(--color-danger);
  --tone-soft: var(--color-danger-soft);
}
.badge__dot {
  inline-size: 0.5em;
  block-size: 0.5em;
  border-radius: 50%;
  background: currentColor;
}
</style>

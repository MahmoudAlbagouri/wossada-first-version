<script setup lang="ts">
type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const props = withDefaults(defineProps<{ tone?: AlertTone; title?: string; icon?: string }>(), { tone: 'info' });

const ICONS: Record<AlertTone, string> = {
  info: 'ph:info',
  success: 'ph:check-circle',
  warning: 'ph:warning',
  danger: 'ph:warning-octagon',
};
const iconName = computed(() => props.icon ?? ICONS[props.tone]);
</script>

<template>
  <div class="alert" :class="`alert--${tone}`" :role="tone === 'danger' ? 'alert' : 'status'">
    <Icon :name="iconName" class="alert__icon" aria-hidden="true" />
    <div class="alert__body">
      <p v-if="title" class="alert__title">{{ title }}</p>
      <div class="alert__text"><slot /></div>
    </div>
    <slot name="action" />
  </div>
</template>

<style scoped>
.alert {
  --tone: var(--color-info);
  --tone-soft: var(--color-info-soft);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--tone-soft);
  border: 1px solid color-mix(in srgb, var(--tone) 20%, transparent);
  color: var(--color-text);
  font-size: var(--text-sm);
}
.alert--success {
  --tone: var(--color-success);
  --tone-soft: var(--color-success-soft);
}
.alert--warning {
  --tone: var(--color-warning);
  --tone-soft: var(--color-warning-soft);
}
.alert--danger {
  --tone: var(--color-danger);
  --tone-soft: var(--color-danger-soft);
}
.alert__icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--tone);
}
.alert__body {
  flex: 1;
  min-inline-size: 0;
}
.alert__title {
  font-weight: var(--weight-bold);
  margin-block-end: 2px;
}
.alert__text {
  color: var(--color-text-muted);
}
</style>

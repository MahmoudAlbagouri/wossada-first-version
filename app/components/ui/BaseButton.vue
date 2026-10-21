<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    /** Renders a NuxtLink instead of a button. */
    to?: RouteLocationRaw;
    href?: string;
    icon?: string;
    iconEnd?: string;
    /** Square button that only shows `icon` (requires `label` for a11y). */
    iconOnly?: boolean;
    label?: string;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);

const component = computed(() => (props.to ? NuxtLink : props.href ? 'a' : 'button'));
const isDisabled = computed(() => props.disabled || props.loading);

/** Left/right arrows point the other way in RTL. */
const directional = (name?: string) => (name && /(arrow|caret)-(left|right)/.test(name) ? 'flip-rtl' : undefined);
</script>

<template>
  <component
    :is="component"
    :to="to"
    :href="href"
    :type="to || href ? undefined : type"
    :disabled="!to && !href ? isDisabled : undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    :title="iconOnly ? label : undefined"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'btn--icon': iconOnly, 'is-loading': loading }]"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <Icon v-else-if="icon" :name="icon" class="btn__icon" :class="directional(icon)" aria-hidden="true" />
    <span v-if="!iconOnly" class="btn__label"><slot>{{ label }}</slot></span>
    <Icon v-if="iconEnd && !iconOnly" :name="iconEnd" class="btn__icon btn__icon--end" :class="directional(iconEnd)" aria-hidden="true" />
  </component>
</template>

<style scoped>
.btn {
  --btn-h: 2.75rem;
  --btn-px: 1.25rem;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-block-size: var(--btn-h);
  padding-inline: var(--btn-px);
  border-radius: var(--radius-full);
  border: 1.5px solid transparent;
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  transition:
    background-color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-fast) ease;
  -webkit-tap-highlight-color: transparent;
}

.btn:active:not(:disabled):not([aria-disabled='true']) {
  transform: scale(0.97);
}

.btn:disabled,
.btn[aria-disabled='true'] {
  opacity: 0.55;
  pointer-events: none;
}

.btn--sm {
  --btn-h: 2.25rem;
  --btn-px: 0.9rem;
  font-size: var(--text-xs);
}
.btn--lg {
  --btn-h: 3.25rem;
  --btn-px: 1.75rem;
  font-size: var(--text-base);
}

.btn--block {
  inline-size: 100%;
}

.btn--icon {
  inline-size: var(--btn-h);
  padding: 0;
}

.btn--primary {
  background: linear-gradient(135deg, var(--gold-500), var(--gold-700));
  color: var(--color-on-primary);
  box-shadow: 0 6px 16px rgb(152 114 38 / 0.28);
}
@media (hover: hover) {
  .btn--primary:hover {
    box-shadow: var(--shadow-gold);
    filter: brightness(1.05);
  }
}

.btn--secondary {
  background: var(--color-primary-soft);
  color: var(--gold-800);
}
.btn--secondary:hover {
  background: var(--gold-200);
}

.btn--outline {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.btn--outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.btn--ghost:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.btn--danger:hover {
  filter: brightness(1.08);
}

.btn--link {
  --btn-px: 0;
  min-block-size: auto;
  background: none;
  color: var(--color-primary);
  border-radius: var(--radius-xs);
}
.btn--link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.btn__icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.btn__spinner {
  inline-size: 1.1em;
  block-size: 1.1em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  animation: spin 0.7s linear infinite;
}
</style>

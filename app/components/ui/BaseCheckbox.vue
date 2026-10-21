<script setup lang="ts">
const model = defineModel<boolean>({ default: false });

defineProps<{
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Renders as a toggle switch instead of a checkbox. */
  switch?: boolean;
}>();
</script>

<template>
  <label class="check" :class="{ 'check--switch': $props.switch, 'is-disabled': disabled }">
    <input v-model="model" type="checkbox" class="check__input" :disabled="disabled" />
    <span class="check__box" aria-hidden="true">
      <Icon v-if="!$props.switch" name="ph:check-bold" class="check__tick" />
      <span v-else class="check__thumb" />
    </span>
    <span v-if="label || $slots.default" class="check__text">
      <span class="check__label"><slot>{{ label }}</slot></span>
      <span v-if="description" class="check__description">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped>
.check {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.check.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.check__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.check__box {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 1.35rem;
  block-size: 1.35rem;
  margin-block-start: 0.1rem;
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-xs);
  background: var(--color-surface);
  transition:
    background-color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out);
}
.check__tick {
  font-size: 0.85rem;
  color: #fff;
  transform: scale(0);
  transition: transform var(--duration-base) var(--ease-spring);
}
.check__input:checked + .check__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.check__input:checked + .check__box .check__tick {
  transform: scale(1);
}
.check__input:focus-visible + .check__box {
  box-shadow: var(--ring);
}

/* Switch variant */
.check--switch .check__box {
  inline-size: 2.6rem;
  block-size: 1.5rem;
  border-radius: var(--radius-full);
  background: var(--stone-200);
  border-color: transparent;
  place-items: center start;
  padding: 0 3px;
}
.check__thumb {
  inline-size: 1.1rem;
  block-size: 1.1rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-base) var(--ease-spring);
}
.check--switch .check__input:checked + .check__box {
  background: var(--color-primary);
}
.check--switch .check__input:checked + .check__box .check__thumb {
  transform: translateX(1.1rem);
}
:dir(rtl) .check--switch .check__input:checked + .check__box .check__thumb {
  transform: translateX(-1.1rem);
}

.check__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.check__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
.check__description {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
</style>

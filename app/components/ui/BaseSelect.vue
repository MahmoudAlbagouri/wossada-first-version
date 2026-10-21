<script setup lang="ts" generic="T extends string | number">
const model = defineModel<T | '' | null | undefined>();

withDefaults(
  defineProps<{
    label?: string;
    options: { value: T; label: string; disabled?: boolean }[];
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: string;
  }>(),
  {},
);

</script>

<template>
  <!-- The label wraps the control: no generated ids needed (SSR-safe). -->
  <label class="field" :class="{ 'has-error': error }">
    <span v-if="label" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true">*</span>
    </span>
    <span class="field__control">
      <Icon v-if="icon" :name="icon" class="field__icon" aria-hidden="true" />
      <select
        v-model="model"
        class="field__select"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error || undefined"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
          {{ option.label }}
        </option>
      </select>
      <Icon name="ph:caret-down" class="field__caret" aria-hidden="true" />
    </span>
    <span v-if="error" class="field__error" role="alert">{{ error }}</span>
    <span v-else-if="hint" class="field__hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-inline-size: 0;
}
.field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.field__required {
  color: var(--color-danger);
  margin-inline-start: 2px;
}
.field__control {
  position: relative;
  display: flex;
  align-items: center;
  min-block-size: 3rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out);
}
.field__control:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}
.has-error .field__control {
  border-color: var(--color-danger);
}
.field__icon {
  position: absolute;
  inset-inline-start: var(--space-4);
  font-size: 1.2rem;
  color: var(--color-text-subtle);
  pointer-events: none;
}
.field__select {
  appearance: none;
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 2.9rem;
  padding-inline: var(--space-4) 2.5rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
  cursor: pointer;
}
.field__icon ~ .field__select {
  padding-inline-start: 2.75rem;
}
.field__caret {
  position: absolute;
  inset-inline-end: var(--space-4);
  color: var(--color-text-subtle);
  pointer-events: none;
}
.field__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
}
.field__hint {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
</style>

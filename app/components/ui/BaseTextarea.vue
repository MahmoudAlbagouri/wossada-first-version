<script setup lang="ts">
const model = defineModel<string | null | undefined>();

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    rows?: number;
    maxlength?: number;
    required?: boolean;
    disabled?: boolean;
    dir?: 'ltr' | 'rtl' | 'auto';
  }>(),
  { rows: 4 },
);

const length = computed(() => (model.value ?? '').length);
</script>

<template>
  <!-- The label wraps the control: no generated ids needed (SSR-safe). -->
  <label class="field" :class="{ 'has-error': error }">
    <span v-if="label" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true">*</span>
    </span>
    <textarea
      v-model="model"
      class="field__textarea"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :disabled="disabled"
      :dir="dir"
      :aria-invalid="!!error || undefined"
    />
    <span class="field__footer">
      <span v-if="error" class="field__error" role="alert">{{ error }}</span>
      <span v-else-if="hint" class="field__hint">{{ hint }}</span>
      <span v-if="props.maxlength" class="field__count">{{ length }} / {{ props.maxlength }}</span>
    </span>
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
.field__textarea {
  inline-size: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  resize: vertical;
  min-block-size: 6rem;
  line-height: var(--leading-normal);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out);
}
.field__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}
.has-error .field__textarea {
  border-color: var(--color-danger);
}
.field__footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: var(--text-xs);
}
.field__error {
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
}
.field__hint,
.field__count {
  color: var(--color-text-subtle);
}
.field__count {
  margin-inline-start: auto;
}
</style>

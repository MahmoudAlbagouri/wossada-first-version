<script setup lang="ts" generic="T extends string | number | null | undefined">
const model = defineModel<T>();

const props = withDefaults(
  defineProps<{
    label?: string;
    type?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    icon?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    autocomplete?: string;
    inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search' | 'url';
    /** Force direction (e.g. `ltr` for emails, phones, codes). */
    dir?: 'ltr' | 'rtl' | 'auto';
    min?: number | string;
    max?: number | string;
    step?: number | string;
    maxlength?: number;
  }>(),
  { type: 'text' },
);

// `class`/`style` style the field; every other attribute goes to the <input>.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const showPassword = ref(false);
const isPassword = computed(() => props.type === 'password');
const actualType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type));
const { t } = useI18n();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  model.value = (props.type === 'number' ? (target.value === '' ? null : Number(target.value)) : target.value) as T;
}
</script>

<template>
  <!-- The label wraps the control: no generated ids needed (SSR-safe). -->
  <label class="field" :class="[attrs.class, { 'has-error': error, 'is-disabled': disabled }]" :style="attrs.style as string">
    <span v-if="label" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true">*</span>
    </span>

    <span class="field__control">
      <Icon v-if="icon" :name="icon" class="field__icon" aria-hidden="true" />
      <slot name="prefix" />
      <input
        v-bind="inputAttrs"
        :value="model ?? ''"
        :type="actualType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="$props.readonly"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :dir="dir"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        :lang="type === 'number' ? 'en' : undefined"
        :aria-invalid="!!error || undefined"
        class="field__input"
        @input="onInput"
      />
      <slot name="suffix" />
      <button
        v-if="isPassword"
        type="button"
        class="field__toggle"
        :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
        @click.prevent="showPassword = !showPassword"
      >
        <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" />
      </button>
    </span>

    <Transition name="slide-up">
      <span v-if="error" class="field__error" role="alert">
        <Icon name="ph:warning-circle" aria-hidden="true" />{{ error }}
      </span>
      <span v-else-if="hint" class="field__hint">{{ hint }}</span>
    </Transition>
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
  color: var(--color-text);
}

.field__required {
  color: var(--color-danger);
  margin-inline-start: 2px;
}

.field__control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-block-size: 3rem;
  padding-inline: var(--space-4);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    background-color var(--duration-fast) ease;
}

.field__control:hover {
  border-color: var(--color-border-strong);
}

.field__control:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}

.has-error .field__control {
  border-color: var(--color-danger);
  background: var(--color-danger-soft);
}

.is-disabled .field__control {
  background: var(--color-surface-muted);
  opacity: 0.7;
}

.field__icon {
  font-size: 1.25rem;
  color: var(--color-text-subtle);
  flex-shrink: 0;
}

.field__control:focus-within .field__icon {
  color: var(--color-primary);
}

.field__input {
  flex: 1;
  min-inline-size: 0;
  block-size: 100%;
  min-block-size: 2.75rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
}

.field__input::placeholder {
  color: var(--color-text-subtle);
}

.field__input:disabled {
  cursor: not-allowed;
}

.field__toggle {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-subtle);
  font-size: 1.15rem;
}

.field__toggle:hover {
  color: var(--color-primary);
  background: var(--color-primary-softer);
}

.field__error,
.field__hint {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
}

.field__error {
  color: var(--color-danger);
  font-weight: var(--weight-semibold);
}

.field__hint {
  color: var(--color-text-subtle);
}
</style>

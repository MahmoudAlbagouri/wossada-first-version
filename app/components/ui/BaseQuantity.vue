<script setup lang="ts">
const model = defineModel<number>({ required: true });

const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md';
  }>(),
  { min: 1, max: 100, size: 'md' },
);

const { t } = useI18n();

function set(value: number) {
  const next = Math.min(props.max, Math.max(props.min, Math.round(value) || props.min));
  if (next !== model.value) model.value = next;
}
</script>

<template>
  <div class="qty" :class="[`qty--${size}`, { 'is-loading': loading }]">
    <button
      type="button"
      class="qty__btn"
      :disabled="disabled || loading || model <= min"
      :aria-label="t('cart.decrease')"
      @click="set(model - 1)"
    >
      <Icon name="ph:minus-bold" />
    </button>
    <input
      class="qty__input"
      type="number"
      inputmode="numeric"
      :value="model"
      :min="min"
      :max="max"
      :disabled="disabled || loading"
      :aria-label="t('cart.quantity')"
      @change="set(Number(($event.target as HTMLInputElement).value))"
    />
    <button
      type="button"
      class="qty__btn"
      :disabled="disabled || loading || model >= max"
      :aria-label="t('cart.increase')"
      @click="set(model + 1)"
    >
      <Icon name="ph:plus-bold" />
    </button>
  </div>
</template>

<style scoped>
.qty {
  --qty-h: 2.75rem;
  display: inline-flex;
  align-items: center;
  block-size: var(--qty-h);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  overflow: hidden;
  transition: opacity var(--duration-fast) ease;
}
.qty--sm {
  --qty-h: 2.25rem;
}
.qty.is-loading {
  opacity: 0.6;
}
.qty__btn {
  display: grid;
  place-items: center;
  inline-size: var(--qty-h);
  block-size: 100%;
  color: var(--color-text-muted);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.qty__btn:hover:not(:disabled) {
  background: var(--color-primary-softer);
  color: var(--color-primary);
}
.qty__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.qty__input {
  inline-size: 2.5rem;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-weight: var(--weight-bold);
  -moz-appearance: textfield;
  appearance: textfield;
}
.qty__input::-webkit-outer-spin-button,
.qty__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

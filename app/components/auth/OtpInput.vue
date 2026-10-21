<script setup lang="ts">
const model = defineModel<string>({ default: '' });
const props = withDefaults(defineProps<{ length?: number; error?: string; disabled?: boolean }>(), { length: 5 });
const emit = defineEmits<{ complete: [code: string] }>();

const { t } = useI18n();
const inputs = ref<HTMLInputElement[]>([]);
const digits = computed(() => Array.from({ length: props.length }, (_, i) => model.value[i] ?? ''));

function setDigits(next: string[]) {
  model.value = next.join('').slice(0, props.length);
  if (model.value.length === props.length) emit('complete', model.value);
}

function onInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, '');
  const next = [...digits.value];
  // Typing or pasting several digits fills the following boxes.
  value.split('').forEach((digit, offset) => {
    if (index + offset < props.length) next[index + offset] = digit;
  });
  if (!value) next[index] = '';
  target.value = next[index] ?? '';
  setDigits(next);
  if (value) inputs.value[Math.min(index + value.length, props.length - 1)]?.focus();
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus();
  }
}

function onPaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, props.length);
  if (!pasted) return;
  event.preventDefault();
  setDigits(pasted.split(''));
  inputs.value[Math.min(pasted.length, props.length - 1)]?.focus();
}

onMounted(() => inputs.value[0]?.focus());
</script>

<template>
  <div class="otp">
    <div class="otp__boxes" dir="ltr" role="group" :aria-label="t('auth.otpLabel')" @paste="onPaste">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        :ref="(el) => el && (inputs[index] = el as HTMLInputElement)"
        :value="digit"
        class="otp__box"
        :class="{ 'is-filled': digit, 'has-error': error }"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="1"
        :disabled="disabled"
        :aria-label="t('auth.otpDigit', { n: index + 1 })"
        @input="onInput(index, $event)"
        @keydown="onKeydown(index, $event)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>
    <p v-if="error" class="otp__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.otp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}
.otp__boxes {
  display: flex;
  justify-content: center;
  gap: clamp(0.4rem, 0.2rem + 1vw, 0.75rem);
}
.otp__box {
  inline-size: clamp(2.9rem, 2.4rem + 2vw, 3.6rem);
  block-size: clamp(3.4rem, 3rem + 2vw, 4.1rem);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  text-align: center;
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-spring);
}
.otp__box:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--ring);
  transform: translateY(-2px);
}
.otp__box.is-filled {
  border-color: var(--color-primary);
  background: var(--color-primary-softer);
}
.otp__box.has-error {
  border-color: var(--color-danger);
  animation: shake 0.4s ease;
}
.otp__error {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-danger);
}
@keyframes shake {
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
</style>

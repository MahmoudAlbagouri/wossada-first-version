<template>
  <div class="quantity-input">
    <button
      class="qty-btn minus"
      :disabled="modelValue <= min"
      @click="$emit('update:modelValue', modelValue - 1)"
      aria-label="تقليل الكمية"
    >
      <Icon name="ph:minus" class="qty-icon" />
    </button>
    <span class="qty-value">{{ modelValue }}</span>
    <button
      class="qty-btn plus"
      :disabled="max && modelValue >= max"
      @click="$emit('update:modelValue', modelValue + 1)"
      aria-label="زيادة الكمية"
    >
      <Icon name="ph:plus" class="qty-icon" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: null, // لا حد أقصى إذا لم يُحدد
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped lang="scss">
.quantity-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100px;

  .qty-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--color-green-light);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--color-green-primary);

    &:hover:not(:disabled) {
      background: var(--color-green-light-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-icon {
      font-size: 16px;
    }
  }

  .qty-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    width: 24px;
    text-align: center;
  }
}
</style>

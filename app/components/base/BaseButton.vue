<template>
  <button
    :type="type"
    class="base-button"
    :class="{ 'full-width': fullWidth, primary: variant === 'primary' }"
    :disabled="disabled || loading"
  >
    <template v-if="loading"> جاري التحقق... </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: "button" },
  fullWidth: { type: Boolean, default: false },
  variant: { type: String, default: "primary" },
  loading: { type: Boolean, default: false }, // إضافة خاصية التحميل
  disabled: { type: Boolean, default: false }, // إضافة خاصية التعطيل
});
</script>

<style scoped lang="scss">
/* نفس الـ CSS الخاص بك تماماً بدون تغيير */
.base-button {
  padding: 8px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important; /* لمنع الـ hover effect أثناء التحميل */
  }

  &.full-width {
    width: 100%;
  }

  &.primary {
    background: var(--color-green-primary);
    color: white;
    &:hover {
      background: var(--color-green-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(152, 114, 38, 0.3);
    }

    &:active {
      transform: translateY(0);
      background: var(--color-green-active);
    }
  }
}
</style>

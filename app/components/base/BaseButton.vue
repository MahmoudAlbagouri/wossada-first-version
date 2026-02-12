<template>
  <button
    :type="type"
    class="base-button"
    :class="{ 'full-width': fullWidth, primary: variant === 'primary' }"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "button",
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: "primary", // primary | secondary
  },
});
</script>

<style scoped lang="scss">
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

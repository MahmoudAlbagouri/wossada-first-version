<template>
  <button
    :type="type"
    class="base-button"
    :class="[
      `variant-${variant}`,
      { 'full-width': fullWidth, 'is-loading': loading },
    ]"
    :disabled="disabled || loading"
  >
    <span class="btn-content" :class="{ hidden: loading }">
      <slot />
    </span>

    <span v-if="loading" class="loading-state">
      <span class="spinner"></span>
      جاري التحقق...
    </span>

    <!-- تأثير ripple -->
    <span class="ripple-container" aria-hidden="true"></span>
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: "button" },
  fullWidth: { type: Boolean, default: false },
  variant: { type: String, default: "primary" },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
</script>

<style scoped lang="scss">
.base-button {
  position: relative;
  overflow: hidden;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.2px;

  &.full-width {
    width: 100%;
  }

  /* حالة التحميل */
  &.is-loading {
    cursor: wait;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* ── variant: primary ── */
  &.variant-primary {
    background: linear-gradient(
      135deg,
      var(--color-green-primary) 0%,
      var(--color-green-hover) 100%
    );
    color: white;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.18),
        0 2px 4px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      filter: brightness(1.05);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      filter: brightness(0.97);
    }
  }

  /* ── variant: outline ── */
  &.variant-outline {
    background: transparent;
    color: var(--color-green-primary);
    border: 2px solid var(--color-green-primary);

    &:hover:not(:disabled) {
      background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.06);
      transform: translateY(-2px);
    }
  }
}

/* محتوى الزر */
.btn-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;

  &.hidden {
    opacity: 0;
  }
}

/* حالة التحميل */
.loading-state {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div
    class="base-input-wrapper"
    :class="{
      'has-error': error,
      'has-value': !!modelValue,
      'is-focused': isFocused,
    }"
  >
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>

    <div
      class="input-container"
      :class="{ 'error-border': error, focused: isFocused, disabled: disabled }"
    >
      <Icon :name="icon" class="input-icon" />

      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="form-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- أيقونة الصح عند القيمة الصحيحة -->
      <Transition name="check-pop">
        <Icon
          v-if="showCheck && modelValue && !error && !isFocused"
          name="ph:check-circle-fill"
          class="input-check"
        />
      </Transition>

      <!-- زر إظهار كلمة المرور -->
      <button
        v-if="showPasswordToggle"
        type="button"
        class="toggle-password-btn"
        @click="$emit('toggle-password')"
        :aria-label="
          passwordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
        "
        tabindex="-1"
      >
        <Icon
          :name="passwordVisible ? 'ph:eye-slash' : 'ph:eye'"
          class="toggle-icon"
        />
      </button>
    </div>

    <!-- رسالة الخطأ -->
    <Transition name="fade-slide">
      <span v-if="error" class="error-message">
        <Icon name="ph:warning-circle" class="error-icon" />
        {{ error }}
      </span>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  id: { type: String, required: true },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  icon: { type: String, required: true },
  required: { type: Boolean, default: false },
  showCheck: { type: Boolean, default: false },
  showPasswordToggle: { type: Boolean, default: false },
  passwordVisible: { type: Boolean, default: false },
  error: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});

defineEmits(["update:modelValue", "toggle-password"]);

const isFocused = ref(false);
</script>

<style scoped lang="scss">
.base-input-wrapper {
  margin-bottom: 20px;
  position: relative;
}

/* ── Label ── */
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  direction: rtl;
  transition: color 0.25s;

  .is-focused & {
    color: var(--color-green-primary);
  }
  .has-error & {
    color: #dc2626;
  }
}

/* ── Container ── */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);

  &.focused {
    border-color: var(--color-green-primary);
    box-shadow:
      0 0 0 3px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    background: white;
  }

  &.error-border {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);

    .input-icon {
      color: #ef4444;
    }
  }

  &.disabled {
    opacity: 0.55;
    background: #f8fafc;
    cursor: not-allowed;
  }

  &:hover:not(.focused):not(.error-border):not(.disabled) {
    border-color: #a0aec0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
}

/* ── Icon ── */
.input-icon {
  font-size: 20px;
  color: var(--text-muted);
  padding: 14px 14px 14px 10px;
  flex-shrink: 0;
  transition: color 0.25s;

  .focused & {
    color: var(--color-green-primary);
  }
}

/* ── Input ── */
.form-input {
  flex: 1;
  padding: 14px 10px 14px 0;
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  direction: rtl;
  width: 100%;
  color: var(--text-main);
  font-weight: 500;

  &::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

/* ── Check icon ── */
.input-check {
  font-size: 20px;
  color: #22c55e;
  padding: 0 10px;
  flex-shrink: 0;
}

.check-pop-enter-active {
  animation: checkPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-pop-leave-active {
  transition: all 0.2s ease;
}
.check-pop-enter-from,
.check-pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@keyframes checkPop {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ── Password toggle ── */
.toggle-password-btn {
  background: none;
  border: none;
  padding: 14px 14px 14px 12px;
  cursor: pointer;
  color: var(--text-muted);
  transition:
    color 0.2s,
    transform 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--color-green-primary);
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
}

.toggle-icon {
  font-size: 20px;
  display: block;
}

/* ── Error message ── */
.error-message {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #dc2626;
  font-size: 12px;
  margin-top: 7px;
  text-align: right;
  font-weight: 500;
  direction: rtl;

  .error-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
}

/* ── Animations ── */
.fade-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

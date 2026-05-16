<template>
  <div class="base-checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <label class="checkbox-label" :for="id">
      <div class="checkbox-container">
        <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          class="checkbox-input"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <span class="checkbox-custom">
          <Transition name="check-anim">
            <Icon
              v-if="modelValue"
              name="ph:check-bold"
              class="checkbox-icon"
            />
          </Transition>
        </span>
      </div>
      <span class="checkbox-text" v-if="label">{{ label }}</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: "" },
  id: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped lang="scss">
.base-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;

  &.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  direction: rtl;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.5;

  &:hover .checkbox-custom {
    border-color: var(--color-green-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.1);
  }
}

.checkbox-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 2;

  &:focus + .checkbox-custom {
    outline: 2px solid var(--color-green-primary);
    outline-offset: 2px;
  }
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color, #d1d5db);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);

  .checkbox-input:checked + & {
    background: linear-gradient(
      135deg,
      var(--color-green-primary),
      var(--color-green-hover)
    );
    border-color: transparent;
    box-shadow: 0 3px 10px
      rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.35);
    transform: scale(1.05);
  }
}

.checkbox-icon {
  font-size: 13px;
  color: white;
  pointer-events: none;
  display: block;
}

/* أنيميشن علامة الصح */
.check-anim-enter-active {
  animation: checkBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-anim-leave-active {
  transition: all 0.15s ease;
}
.check-anim-enter-from,
.check-anim-leave-to {
  opacity: 0;
  transform: scale(0) rotate(-10deg);
}

@keyframes checkBounce {
  from {
    opacity: 0;
    transform: scale(0) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.checkbox-text:empty {
  display: none;
}
</style>

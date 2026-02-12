<template>
  <div class="base-checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <label class="checkbox-label" :for="id">
      <div class="checkbox-container">
        <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          @change="$emit('update:modelValue', $event.target.checked)"
          class="checkbox-input"
        />
        <span class="checkbox-custom">
          <Icon v-if="modelValue" name="ph:check" class="checkbox-icon" />
        </span>
      </div>
      <span class="checkbox-text" v-if="label">{{ label }}</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped lang="scss">
.base-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  direction: rtl;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.5;
}

.checkbox-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--color-green-white);
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

  .checkbox-input:checked + & {
    background: var(--color-green-primary);
    border-color: var(--color-green-primary);
  }

  .checkbox-input:hover:not(:disabled) + & {
    border-color: var(--color-green-primary);
  }

  .checkbox-input:focus + & {
    outline: 2px solid var(--color-green-light-active);
    outline-offset: 2px;
  }
}

.checkbox-icon {
  font-size: 12px;
  color: white;
  pointer-events: none;
}

.checkbox-text {
  &:empty {
    display: none;
  }
}
</style>

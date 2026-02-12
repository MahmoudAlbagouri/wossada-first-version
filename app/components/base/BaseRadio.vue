<template>
  <div class="base-radio-wrapper" :class="{ 'is-disabled': disabled }">
    <label class="radio-label" :for="id">
      <div class="radio-container">
        <input
          :id="id"
          type="radio"
          :name="name"
          :value="value"
          :checked="modelValue === value"
          :disabled="disabled"
          @change="$emit('update:modelValue', value)"
          class="radio-input"
        />
        <span class="radio-custom"></span>
      </div>
      <span class="radio-text" v-if="label">{{ label }}</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  value: {
    type: [String, Number, Boolean],
    required: true,
  },
  name: {
    type: String,
    required: true,
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
.base-radio-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.radio-label {
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

.radio-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.radio-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  background: var(--color-green-white);
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

  .radio-input:checked + & {
    background: var(--color-green-primary);
    border-color: var(--color-green-primary);
  }

  .radio-input:hover:not(:disabled) + & {
    border-color: var(--color-green-primary);
  }

  .radio-input:focus + & {
    outline: 2px solid var(--color-green-light-active);
    outline-offset: 2px;
  }

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .radio-input:checked + &::after {
    opacity: 1;
  }
}

.radio-text {
  &:empty {
    display: none;
  }
}
</style>

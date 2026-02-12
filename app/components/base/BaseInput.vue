<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="input-container">
      <Icon :name="icon" class="input-icon" />
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        class="form-input"
      />
      <Icon
        v-if="showCheck && modelValue"
        name="ph:check-circle"
        class="input-check"
      />
      <button
        v-if="showPasswordToggle"
        type="button"
        class="toggle-password-btn"
        @click="$emit('toggle-password')"
        aria-label="إظهار كلمة المرور"
      >
        <Icon
          :name="passwordVisible ? 'ph:eye-slash' : 'ph:eye'"
          class="toggle-icon"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  showCheck: {
    type: Boolean,
    default: false,
  },
  showPasswordToggle: {
    type: Boolean,
    default: false,
  },
  passwordVisible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue", "toggle-password"]);
</script>

<style scoped lang="scss">
.base-input-wrapper {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 8px;
  direction: rtl;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-green-white);
}

.input-icon {
  font-size: 20px;
  color: var(--text-muted);
  padding: 14px 16px;
}

.input-check {
  font-size: 20px;
  color: #4caf50;
  padding: 14px 16px;
}

.form-input {
  flex: 1;
  padding: 14px 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: transparent;
  direction: rtl;
  width: 100%;
}

.toggle-password-btn {
  background: none;
  border: none;
  padding: 14px 16px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.3s;

  &:hover {
    color: var(--color-green-primary);
  }
}

.toggle-icon {
  font-size: 20px;
}
</style>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>

    <div class="input-container" :class="{ 'error-border': error }">
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
        v-if="showCheck && modelValue && !error"
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

    <Transition name="fade-slide">
      <span v-if="error" class="error-message">{{ error }}</span>
    </Transition>
  </div>
</template>

<script setup>
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
  error: { type: String, default: "" }, // إضافة خاصية الخطأ هنا
});

defineEmits(["update:modelValue", "toggle-password"]);
</script>

<style scoped lang="scss">
.base-input-wrapper {
  margin-bottom: 24px;
  position: relative;
}

/* ... بقية التنسيقات الخاصة بك كما هي ... */

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-green-white);
  transition: border-color 0.3s ease;

  // إضافة ستايل الحواف عند وجود خطأ
  &.error-border {
    border-color: #dc2626;
  }
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 6px;
  text-align: right;
  font-weight: 500;
}

/* أنيميشن بسيط لظهور رسالة الخطأ */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 8px;
  direction: rtl;
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

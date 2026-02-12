<template>
  <div class="popup-overlay" @click="$emit('close')">
    <div class="popup-content success-popup" @click.stop>
      <div class="popup-icon">
        <Icon name="ph:check-circle-fill" class="icon-success" />
      </div>
      <h3 class="popup-title">تم بنجاح!</h3>
      <p class="popup-message">{{ message }}</p>
      <button class="popup-btn" @click="$emit('close')">موافق</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: "تمت العملية بنجاح",
  },
});
defineEmits(["close"]);
</script>

<style scoped lang="scss">
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.popup-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-4);
}

.popup-icon {
  margin-bottom: 16px;
}

.icon-success {
  font-size: 48px;
  color: #4caf50;
}

.popup-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 12px 0;
}

.popup-message {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.popup-btn {
  background: var(--color-green-primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-green-hover);
    transform: translateY(-2px);
  }
}
</style>

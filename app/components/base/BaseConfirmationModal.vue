<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <div class="modal-header">
            <Icon :name="icon" class="warning-icon" />
            <h3>{{ title }}</h3>
          </div>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button @click="close" class="btn-cancel">
              <Icon name="ph:x" class="btn-icon" />
              {{ cancelText }}
            </button>
            <button @click="confirm" class="btn-confirm">
              <Icon name="ph:check" class="btn-icon" />
              {{ confirmText }}
            </button>
          </div>
          <div v-if="whatsappNumber" class="whatsapp-contact">
            <a
              :href="`https://wa.me/${whatsappNumber}`"
              target="_blank"
              rel="noopener noreferrer"
              class="whatsapp-link"
            >
              <Icon name="ph:whatsapp-logo" class="whatsapp-icon" />
              اتصل بنا عبر الواتساب
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  // التحكم في العرض/الإخفاء
  modelValue: {
    type: Boolean,
    required: true,
  },
  // التخصيص
  title: {
    type: String,
    default: "تأكيد الإجراء",
  },
  message: {
    type: String,
    default: "هل أنت متأكد من هذا الإجراء؟",
  },
  confirmText: {
    type: String,
    default: "تأكيد",
  },
  cancelText: {
    type: String,
    default: "إلغاء",
  },
  icon: {
    type: String,
    default: "ph:warning-circle",
  },
  whatsappNumber: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const close = () => {
  emit("update:modelValue", false);
};

const confirm = () => {
  emit("confirm");
  close();
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--color-green-white);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .warning-icon {
    font-size: 48px;
    color: #ff9800; /* برتقالي محايد */
  }

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
  }
}

.modal-message {
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;

  button {
    flex: 1;
    padding: 10px 16px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;

    .btn-icon {
      font-size: 18px;
    }
  }

  .btn-cancel {
    background: var(--color-green-light);
    color: var(--color-green-primary);
    border: 1px solid var(--color-green-primary);

    &:hover {
      background: rgba(76, 175, 80, 0.15);
    }
  }

  .btn-confirm {
    background: rgb(246, 83, 83);
    color: white;
    border: none;

    &:hover {
      opacity: 0.9;
    }
  }
}

.whatsapp-contact {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  .whatsapp-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #25d366;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }

    .whatsapp-icon {
      font-size: 20px;
    }
  }
}

/* === حركات === */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content {
  animation: modalSlideIn 0.3s ease forwards;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

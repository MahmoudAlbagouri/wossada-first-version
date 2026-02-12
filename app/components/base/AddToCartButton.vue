<template>
  <div class="add-to-cart-wrapper">
    <!-- الزر الافتراضي -->
    <button
      v-if="!showCounter"
      class="add-to-cart-btn"
      @click="activateCounter"
    >
      أضف إلى السلة
    </button>

    <!-- العداد -->
    <div v-else class="quantity-counter">
      <button
        class="qty-btn"
        :class="{ 'delete-btn': quantity === 1 }"
        @click="handleQtyAction"
        :aria-label="quantity === 1 ? 'حذف المنتج' : 'تقليل الكمية'"
      >
        <Icon
          :name="quantity === 1 ? 'ph:trash' : 'ph:minus'"
          class="qty-icon"
        />
      </button>

      <span class="qty-value">{{ quantity }}</span>

      <button
        class="qty-btn plus"
        :disabled="max && quantity >= max"
        @click="increaseQuantity"
        aria-label="زيادة الكمية"
      >
        <Icon name="ph:plus" class="qty-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  initialQuantity: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:quantity", "added", "removed"]);

const showCounter = ref(false);
const quantity = ref(props.initialQuantity);

const activateCounter = () => {
  showCounter.value = true;
  emit("added", quantity.value);
};

const increaseQuantity = () => {
  if (props.max && quantity.value >= props.max) return;
  quantity.value++;
  emit("update:quantity", quantity.value);
};

const handleQtyAction = () => {
  if (quantity.value === 1) {
    // حذف المنتج
    emit("removed");
    showCounter.value = false;
    quantity.value = 1; // إعادة التعيين لتجنب مشاكل الـ v-model
  } else {
    // تقليل الكمية
    quantity.value--;
    emit("update:quantity", quantity.value);
  }
};
</script>

<style scoped lang="scss">
.add-to-cart-wrapper {
  width: 100%;
}

/* زر الإضافة */
.add-to-cart-btn {
  width: 100%;
  padding: 6px 12px;
  color: var(--color-green-primary);
  background-color: var(--color-green-white);
  border: 2px solid var(--color-green-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.4s ease;
  }

  &:hover {
    background: var(--color-green-hover);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(152, 114, 38, 0.3);
    color: var(--color-green-white);
  }

  &:active {
    transform: translateY(0);
    background: var(--color-green-active);
  }

  &:hover:before {
    left: 100%;
  }
}

/* العداد */
.quantity-counter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: var(--color-green-light-hover);
  color: var(--color-green-primary);
  background-color: var(--color-green-white);
  border: 2px solid var(--color-green-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  .qty-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--color-green-light-active);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--color-green-primary);
    position: relative;

    &:hover:not(:disabled) {
      background: var(--color-green-light-hover);
    }

    &.delete-btn {
      background: #fde0e0;
      color: #d32f2f;

      &:hover {
        background: #fccccc;
      }
    }

    .qty-icon {
      font-size: 16px;
    }

    .btn-text {
      font-size: 12px;
      font-weight: 600;
      margin-left: 4px;
      white-space: nowrap;
    }
  }

  .qty-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    width: 24px;
    text-align: center;
  }

  .plus {
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>

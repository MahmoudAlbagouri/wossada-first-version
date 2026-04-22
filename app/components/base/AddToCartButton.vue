<template>
  <div class="add-to-cart-wrapper" @click.stop>
    <button
      v-if="!showCounter"
      class="add-to-cart-btn"
      @click="activateCounter"
      :disabled="cartStore.loading"
    >
      {{ cartStore.loading ? "جاري..." : "أضف إلى السلة" }}
    </button>

    <div v-else class="quantity-counter">
      <button
        class="qty-btn"
        :class="{ 'delete-btn': quantity === 1 }"
        @click="handleQtyAction"
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
      >
        <Icon name="ph:plus" class="qty-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";

const props = defineProps({
  productId: { type: String, required: true },
  variantId: { type: String, default: null },
  initialQuantity: { type: Number, default: 1 },
  max: { type: Number, default: null },
});

const cartStore = useCartStore();
const showCounter = ref(false);
const quantity = ref(props.initialQuantity);

// ✅ دالة موحدة للبحث عن الـ item في السلة
const findCartItem = () => {
  return cartStore.items.find(
    (i) => i.productId === props.productId || i.product?.id === props.productId,
  );
};

const updateStateFromStore = () => {
  const item = findCartItem();
  if (item) {
    showCounter.value = true;
    quantity.value = item.quantity;
  } else {
    showCounter.value = false;
    quantity.value = props.initialQuantity;
  }
};

// راقب أي تغيير في عناصر السلة لتحديث العداد فوراً
watch(
  () => cartStore.items,
  () => {
    updateStateFromStore();
  },
  { deep: true },
);

onMounted(() => {
  updateStateFromStore();
});

const activateCounter = async (e) => {
  if (e) e.stopPropagation();

  const res = await cartStore.addToCart(props.productId, 1, props.variantId);
  if (res?.success) {
    showCounter.value = true;
  }
};

// دالة زيادة الكمية
const increaseQuantity = async () => {
  if (props.max && quantity.value >= props.max) return;
  const item = findCartItem(); // ✅ استخدام الدالة الموحدة
  if (item) {
    await cartStore.updateQuantity(item.id, quantity.value + 1);
  }
};

// دالة تقليل الكمية أو الحذف
const handleQtyAction = async () => {
  const item = findCartItem(); // ✅ استخدام الدالة الموحدة
  if (!item) return;

  if (quantity.value === 1) {
    await cartStore.removeItem(item.id);
  } else {
    await cartStore.updateQuantity(item.id, quantity.value - 1);
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
  padding: 3px 12px;

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

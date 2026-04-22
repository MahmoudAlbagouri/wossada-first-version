<template>
  <div class="container">
    <div class="account-layout">
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">سلة المنتجات</h1>

          <div
            v-if="cartStore.loading && !cartStore.items.length"
            class="loading-state"
          >
            <div class="spinner"></div>
            <p>جاري تحميل محتويات السلة...</p>
          </div>

          <div v-else-if="cartStore.items.length === 0" class="empty-cart">
            <Icon name="ph:shopping-cart-light" class="empty-icon" />
            <p>سلتك فارغة حالياً، ابدأ بالتسوق الآن!</p>
            <NuxtLink to="/products" class="shop-now-btn"
              >تصفح المنتجات</NuxtLink
            >
          </div>

          <div v-else class="cart-items">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="cart-item"
            >
              <div class="image-title">
                <div class="item-image">
                  <img
                    :src="
                      item.product?.mainImage ||
                      '/images/products/placeholder.jpg'
                    "
                    :alt="item.product?.name"
                  />
                </div>

                <div class="item-info">
                  <h3 class="item-title">
                    {{ item.product?.name || "منتج غير معروف" }}
                  </h3>
                  <p class="item-price">
                    {{ item.product?.price }} ج.م × {{ item.quantity }} قطعة
                  </p>
                </div>
              </div>

              <div class="quantity-remove">
                <QuantityInput
                  :modelValue="item.quantity"
                  @update:modelValue="
                    (newVal) => cartStore.updateQuantity(item.id, newVal)
                  "
                  :min="1"
                  :max="item.product?.stock || 50"
                />

                <button
                  class="remove-btn"
                  @click="cartStore.removeItem(item.id)"
                  :disabled="cartStore.loading"
                >
                  <Icon name="ph:trash" class="remove-icon" />
                  حذف
                </button>
              </div>
            </div>

            <div class="cart-total">
              <div class="total-row">
                <span>إجمالي المجموع:</span>
                <span class="total-amount"
                  >ج.م {{ cartStore.total.toLocaleString() }}</span
                >
              </div>

              <div class="cart-actions">
                <button class="checkout-btn" @click="handleCheckout">
                  إتمام عملية الشراء
                </button>
                <button class="clear-btn" @click="cartStore.clearCart">
                  مسح السلة
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import QuantityInput from "@/components/base/QuantityInput.vue";

definePageMeta({
  middleware: ["auth"],
});

const cartStore = useCartStore();

// جلب البيانات فور تحميل الصفحة
onMounted(() => {
  cartStore.fetchCart();
});

const handleCheckout = () => {
  // التوجه لصفحة الدفع
  navigateTo("/checkout");
};
</script>

<style scoped lang="scss">
.account-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-body);
  padding: 20px;
  gap: 24px;
  padding-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.main-content {
  flex: 1;
}

.account-card {
  background: var(--color-green-white);
  border-radius: 16px;
  box-shadow: var(--shadow-3);
  padding: 60px 40px 40px;
  position: relative;
  min-height: 300px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-green-primary);
  text-align: center;
  position: absolute;
  top: -20px;
  background: var(--color-green-light);
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 12px;
  padding: 10px;
}

/* حالات التحميل والسلة الفارغة */
.loading-state,
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
  color: var(--color-green-primary);
  opacity: 0.5;
}

.shop-now-btn {
  margin-top: 15px;
  padding: 10px 25px;
  background: var(--color-green-primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--color-green-white);
  align-items: center;
  box-shadow: var(--shadow-1);
  flex-wrap: wrap;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }

  .image-title {
    display: flex;
    align-items: center;
    gap: 16px;
    @media screen and (max-width: 768px) {
      flex-direction: column;
    }
  }

  .item-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--color-green-light);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .item-info {
    .item-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 5px;
    }
    .item-price {
      font-size: 14px;
      color: var(--text-muted);
    }
  }

  .quantity-remove {
    display: flex;
    align-items: center;
    gap: 15px;
    @media screen and (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }
  }

  .remove-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fde0e0;
    color: #d32f2f;
    border: 1px solid #fbb4b4;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      background: #fccccc;
    }
  }
}

.cart-total {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid var(--color-green-light);

  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-green-primary);
    margin-bottom: 20px;
  }

  .cart-actions {
    display: flex;
    gap: 12px;
    @media (max-width: 480px) {
      flex-direction: column;
    }
  }

  .checkout-btn {
    flex: 2;
    padding: 16px;
    background: var(--color-green-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      background: var(--color-green-hover);
      transform: translateY(-2px);
    }
  }

  .clear-btn {
    flex: 1;
    padding: 16px;
    background: transparent;
    color: #d32f2f;
    border: 1px solid #fbb4b4;
    border-radius: 12px;
    cursor: pointer;
    &:hover {
      background: #fff5f5;
    }
  }
}

/* Spinner بسيط للحميل */
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-green-light);
  border-top-color: var(--color-green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

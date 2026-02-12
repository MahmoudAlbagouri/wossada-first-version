<template>
  <div class="container">
    <div class="account-layout">
      <!-- الشريط الجانبي -->
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <!-- المحتوى الرئيسي -->
      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">سلة المنتجات</h1>

          <div class="cart-items">
            <div class="cart-item">
              <div class="image-title">
                <div class="item-image">
                  <img src="/images/products/product1.jpg" alt="ترابيزة قهوة" />
                </div>

                <div class="item-info">
                  <h3 class="item-title">* 40" 200 كونتر خشب قهوة ترابيزة</h3>
                  <p class="item-price">
                    ج.م 2800 = 1400 * قطعة {{ quantities[1] }}
                  </p>
                </div>
              </div>

              <!-- ✅ استخدام المكون الجديد -->
              <div class="quantity-remove">
                <QuantityInput v-model="quantities[1]" :min="1" :max="10" />

                <button class="remove-btn">
                  <Icon name="ph:trash" class="remove-icon" />
                  حذف
                </button>
              </div>
            </div>

            <div class="cart-item">
              <div class="item-image">
                <img src="/images/products/product1.jpg" alt="ترابيزة قهوة" />
              </div>

              <div class="item-info">
                <h3 class="item-title">* 40" 200 كونتر خشب قهوة ترابيزة</h3>
                <p class="item-price">
                  ج.م 2800 = 1400 * قطعة {{ quantities[2] }}
                </p>
              </div>

              <!-- ✅ استخدام المكون الجديد -->
              <QuantityInput v-model="quantities[2]" :min="1" :max="10" />

              <button class="remove-btn">
                <Icon name="ph:trash" class="remove-icon" />
                حذف
              </button>
            </div>

            <div class="cart-item">
              <div class="item-image">
                <img src="/images/products/product1.jpg" alt="ترابيزة قهوة" />
              </div>

              <div class="item-info">
                <h3 class="item-title">* 32" 160 كونتر خشب قهوة ترابيزة</h3>
                <p class="item-price">
                  ج.م 2000 = 1000 * قطعة {{ quantities[3] }}
                </p>
              </div>

              <!-- ✅ استخدام المكون الجديد -->
              <QuantityInput v-model="quantities[3]" :min="1" :max="10" />

              <button class="remove-btn">
                <Icon name="ph:trash" class="remove-icon" />
                حذف
              </button>
            </div>

            <!-- مجموع السلة -->
            <div class="cart-total">
              <div class="total-row">
                <span>المجموع:</span>
                <span class="total-amount">ج.م {{ calculateTotal }}</span>
              </div>
              <button class="checkout-btn">الان طلب</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import QuantityInput from "@/components/base/QuantityInput.vue";

const quantities = ref({
  1: 2,
  2: 2,
  3: 2,
});

// ✅ حساب المجموع تلقائيًا
const calculateTotal = computed(() => {
  // أسعار وهمية للمنتجات
  const prices = { 1: 1400, 2: 1400, 3: 1000 };
  let total = 0;
  for (const id in quantities.value) {
    total += prices[id] * quantities.value[id];
  }
  return total.toLocaleString();
});
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
    align-items: center;
  }
  .quantity-remove,
  .image-title {
    display: flex;
    align-items: center;
    gap: 10px;
    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: center;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .item-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin: 0 0 8px 0;
    }

    .item-price {
      font-size: 14px;
      color: var(--text-muted);
    }
  }

  /* ✅ إزالة CSS القديم لـ item-quantity لأننا نستخدم المكون الآن */

  .remove-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #fde0e0;
    color: #d32f2f;
    border: 1px solid #fbb4b4;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    .remove-icon {
      font-size: 16px;
    }

    &:hover {
      background: #fccccc;
    }
  }
}

.cart-total {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);

  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-green-primary);
    margin-bottom: 24px;

    .total-amount {
      font-size: 20px;
    }
  }

  .checkout-btn {
    width: 100%;
    padding: 16px;
    background: var(--color-green-primary);
    color: var(--color-green-white);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--color-green-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(152, 114, 38, 0.3);
    }

    &:active {
      transform: translateY(0);
      background: var(--color-green-active);
    }
  }
}
</style>

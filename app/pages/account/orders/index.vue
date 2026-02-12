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
          <h1 class="card-title">طلباتي</h1>

          <div class="orders-list">
            <!-- الطلب 1 -->
            <div class="order-card">
              <div class="order-header">
                <span class="order-status delivered">تم التسليم</span>
                <span class="order-number">1212#</span>
              </div>

              <div class="order-meta">
                <span class="order-date">1446 الفعده دو 20</span>
                <Icon name="ph:calendar" class="meta-icon" />
              </div>

              <div class="order-products">
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
              </div>

              <div class="order-summary">
                <div class="summary-row">
                  <span>المجموع:</span>
                  <span class="total-price">ريال 18,000</span>
                </div>
                <div class="summary-row">
                  <span>الدفع:</span>
                  <span class="payment-status paid">مدفوع</span>
                </div>
              </div>

              <div class="order-actions">
                <button
                  class="btn details-btn"
                  @click="viewOrderDetails('1212')"
                >
                  <Icon name="ph:file-text" class="btn-icon" />
                  تفاصيل الطلب
                </button>
                <button class="btn cancel-btn disabled">
                  <Icon name="ph:x" class="btn-icon" />
                  إلغاء الطلب
                </button>
              </div>
            </div>

            <!-- الطلب 2 -->
            <div class="order-card">
              <div class="order-header">
                <span class="order-status processing">قيد التجهيز</span>
                <span class="order-number">1213#</span>
              </div>

              <div class="order-meta">
                <span class="order-date">1446 الفعده دو 19</span>
                <Icon name="ph:calendar" class="meta-icon" />
              </div>

              <div class="order-products">
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
              </div>

              <div class="order-summary">
                <div class="summary-row">
                  <span>المجموع:</span>
                  <span class="total-price">ريال 15,500</span>
                </div>
                <div class="summary-row">
                  <span>الدفع:</span>
                  <span class="payment-status unpaid">غير مدفوع</span>
                </div>
              </div>

              <div class="order-actions">
                <button
                  class="btn details-btn"
                  @click="viewOrderDetails('1212')"
                >
                  <Icon name="ph:file-text" class="btn-icon" />
                  تفاصيل الطلب
                </button>
                <button class="btn cancel-btn">
                  <Icon name="ph:x" class="btn-icon" />
                  إلغاء الطلب
                </button>
              </div>
            </div>

            <!-- الطلب 3 -->
            <div class="order-card">
              <div class="order-header">
                <span class="order-status shipping">قيد الشحن</span>
                <span class="order-number">1214#</span>
              </div>

              <div class="order-meta">
                <span class="order-date">1446 الفعده دو 18</span>
                <Icon name="ph:calendar" class="meta-icon" />
              </div>

              <div class="order-products">
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
                <div class="product-thumb">
                  <img src="/images/products/product1.jpg" alt="منتج" />
                </div>
              </div>

              <div class="order-summary">
                <div class="summary-row">
                  <span>المجموع:</span>
                  <span class="total-price">ريال 22,300</span>
                </div>
                <div class="summary-row">
                  <span>الدفع:</span>
                  <span class="payment-status paid">مدفوع</span>
                </div>
              </div>

              <div class="order-actions">
                <button
                  class="btn details-btn"
                  @click="viewOrderDetails('1212')"
                >
                  <Icon name="ph:file-text" class="btn-icon" />
                  تفاصيل الطلب
                </button>
                <button class="btn cancel-btn disabled">
                  <Icon name="ph:x" class="btn-icon" />
                  إلغاء الطلب
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
import { useRouter } from "vue-router";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const router = useRouter();

const viewOrderDetails = (orderId) => {
  router.push(`/account/orders/${orderId}`);
};
</script>
<script setup></script>

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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: var(--color-green-white);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  box-shadow: var(--shadow-1);

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      &.delivered {
        background: #e8f5e9;
        color: #2e7d32;
      }
      &.processing {
        background: #fff8e1;
        color: #f57c00;
      }
      &.shipping {
        background: #e3f2fd;
        color: #1976d2;
      }
    }

    .order-number {
      font-size: 14px;
      color: var(--text-muted);
    }
  }

  .order-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 16px;

    .meta-icon {
      font-size: 16px;
    }
  }

  .order-products {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .product-thumb {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--color-green-light);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .order-summary {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--text-main);

      .total-price {
        font-weight: 700;
        color: var(--color-green-primary);
      }

      .payment-status {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        &.paid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.unpaid {
          background: #fff8e1;
          color: #f57c00;
        }
      }
    }
  }

  .order-actions {
    display: flex;
    gap: 12px;

    .btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      .btn-icon {
        font-size: 16px;
      }
    }

    .details-btn {
      background: var(--color-green-light);
      color: var(--color-green-primary);
      border: 1px solid var(--color-green-light-active);

      &:hover {
        background: var(--color-green-light-hover);
      }
    }

    .cancel-btn {
      background: #fde0e0;
      color: #d32f2f;
      border: 1px solid #fbb4b4;

      &:hover {
        background: #fccccc;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f5f5f5;
        color: #999;
        border-color: #ddd;
      }
    }
  }
}
</style>

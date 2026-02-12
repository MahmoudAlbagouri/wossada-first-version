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
          <h1 class="card-title">تفاصيل الطلب</h1>

          <!-- رأس الطلب -->
          <div class="order-header-details">
            <div class="header-row">
              <span class="header-label">رقم الطلب:</span>
              <span class="header-value">#{{ order.id }}</span>
            </div>
            <div class="header-row">
              <span class="header-label">حالة الطلب:</span>
              <span class="header-value" :class="`status-${order.status}`">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="header-row">
              <span class="header-label">تاريخ الطلب:</span>
              <span class="header-value">{{ order.date }}</span>
            </div>
          </div>

          <!-- منتجات الطلب -->
          <div class="order-products-details">
            <h2 class="section-title">المنتجات</h2>
            <div class="products-grid">
              <div
                v-for="product in order.products"
                :key="product.id"
                class="product-item"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-price">ج.م {{ product.price }}</p>
                  <p class="product-quantity">الكمية: {{ product.quantity }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ملخص الطلب -->
          <div class="order-summary-details">
            <h2 class="section-title">ملخص الطلب</h2>
            <div class="summary-row">
              <span>المجموع الفرعي:</span>
              <span>ج.م {{ order.subtotal }}</span>
            </div>
            <div class="summary-row">
              <span>الشحن:</span>
              <span>ج.م {{ order.shipping }}</span>
            </div>
            <div class="summary-row total">
              <span>المجموع الكلي:</span>
              <span>ج.م {{ order.total }}</span>
            </div>
          </div>

          <!-- حالة الدفع -->
          <div class="payment-status-details">
            <h2 class="section-title">حالة الدفع</h2>
            <div class="payment-row">
              <span>الحالة:</span>
              <span :class="`payment-status ${order.paymentStatus}`">
                {{ getPaymentStatusText(order.paymentStatus) }}
              </span>
            </div>
          </div>

          <!-- زر العودة -->
          <button class="back-btn" @click="goBack">
            <Icon name="ph:arrow-left" class="back-icon" />
            العودة إلى الطلبات
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const route = useRoute();
const router = useRouter();

// بيانات وهمية للطلب (في التطبيق الحقيقي: اجلبها من API)
const order = ref({
  id: "",
  status: "delivered", // delivered | processing | shipping
  date: "",
  products: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  paymentStatus: "paid", // paid | unpaid
});

onMounted(() => {
  const orderId = route.params.id;
  // ✅ محاكاة جلب البيانات من API
  loadOrderDetails(orderId);
});

const loadOrderDetails = (id) => {
  // بيانات وهمية حسب رقم الطلب
  const mockOrders = {
    1212: {
      id: "1212",
      status: "delivered",
      date: "1446 الفعده دو 20",
      products: [
        {
          id: 1,
          name: '* 36" 180 كونتر خشب قهوة ترابيزة',
          image: "/images/products/product1.jpg",
          price: "9,000",
          quantity: 2,
        },
        {
          id: 2,
          name: '* 40" 200 كونتر خشب قهوة ترابيزة',
          image: "/images/products/product1.jpg",
          price: "9,000",
          quantity: 1,
        },
      ],
      subtotal: 18000,
      shipping: 0,
      total: 18000,
      paymentStatus: "paid",
    },
    1213: {
      id: "1213",
      status: "processing",
      date: "1446 الفعده دو 19",
      products: [
        {
          id: 3,
          name: '* 32" 160 كونتر خشب قهوة ترابيزة',
          image: "/images/products/product1.jpg",
          price: "7,750",
          quantity: 2,
        },
      ],
      subtotal: 15500,
      shipping: 0,
      total: 15500,
      paymentStatus: "unpaid",
    },
    1214: {
      id: "1214",
      status: "shipping",
      date: "1446 الفعده دو 18",
      products: [
        {
          id: 4,
          name: '* 38" 190 كونتر خشب قهوة ترابيزة',
          image: "/images/products/product1.jpg",
          price: "11,150",
          quantity: 2,
        },
      ],
      subtotal: 22300,
      shipping: 0,
      total: 22300,
      paymentStatus: "paid",
    },
  };

  order.value = mockOrders[id] || {
    id: "غير معروف",
    status: "processing",
    date: "غير متوفر",
    products: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    paymentStatus: "unpaid",
  };
};

const getStatusText = (status) => {
  const texts = {
    delivered: "تم التسليم",
    processing: "قيد التجهيز",
    shipping: "قيد الشحن",
  };
  return texts[status] || "غير معروف";
};

const getPaymentStatusText = (status) => {
  return status === "paid" ? "مدفوع" : "غير مدفوع";
};

const goBack = () => {
  router.push("/account/orders");
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

/* رأس الطلب */
.order-header-details {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);

  .header-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    margin-bottom: 12px;

    .header-label {
      color: var(--text-muted);
    }

    .header-value {
      font-weight: 600;
      &.status-delivered {
        color: #2e7d32;
      }
      &.status-processing {
        color: #f57c00;
      }
      &.status-shipping {
        color: #1976d2;
      }
    }
  }
}

/* المنتجات */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 32px 0 16px 0;
}

.products-grid {
  display: grid;
  gap: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-green-white);
  border-radius: 12px;

  .product-image {
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

  .product-info {
    flex: 1;

    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin: 0 0 8px 0;
    }

    .product-price {
      font-size: 14px;
      color: var(--color-green-primary);
      margin: 0 0 4px 0;
    }

    .product-quantity {
      font-size: 14px;
      color: var(--text-muted);
    }
  }
}

/* الملخص */
.order-summary-details {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--text-main);

    &.total {
      font-weight: 700;
      font-size: 18px;
      color: var(--color-green-primary);
    }
  }
}

/* حالة الدفع */
.payment-status-details {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);

  .payment-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;

    .payment-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
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

/* زر العودة */
.back-btn {
  width: 100%;
  margin-top: 32px;
  padding: 16px;
  background: var(--color-green-light);
  color: var(--color-green-primary);
  border: 1px solid var(--color-green-light-active);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .back-icon {
    font-size: 20px;
  }

  &:hover {
    background: var(--color-green-light-hover);
    transform: translateY(-2px);
  }
}
</style>

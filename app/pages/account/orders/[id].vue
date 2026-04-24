<template>
  <div class="container">
    <div class="account-layout">
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">تفاصيل الطلب</h1>

          <div v-if="store.loading" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>

          <div v-else-if="!order" class="error-state">
            <p>لم يتم العثور على تفاصيل الطلب.</p>
            <button class="back-btn" @click="goBack">العودة للقائمة</button>
          </div>

          <div v-else>
            <!-- Order Header Info -->
            <div class="order-header-details">
              <div class="header-grid">
                <div class="header-item">
                  <span class="label">رقم الطلب</span>
                  <span class="value"
                    >#{{ order.orderNumber.split("-").pop() }}</span
                  >
                </div>
                <div class="header-item">
                  <span class="label">التاريخ</span>
                  <span class="value">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="header-item">
                  <span class="label">الحالة</span>
                  <span
                    class="value status-badge"
                    :class="getStatusClass(order.status)"
                  >
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="section-block">
              <h2 class="section-title">عنوان الشحن</h2>
              <div class="address-box">
                <div class="addr-header">
                  <strong>{{ order.shippingAddress?.fullName }}</strong>
                  <span class="phone">{{
                    order.shippingAddress?.phoneNumber
                  }}</span>
                </div>
                <p class="addr-text">
                  {{ order.shippingAddress?.streetAddress }}<br />
                  {{
                    order.shippingAddress?.landmark
                      ? order.shippingAddress.landmark + " - "
                      : ""
                  }}
                  {{ order.shippingAddress?.city?.nameAr }},
                  {{ order.shippingAddress?.city?.governorate?.nameAr }}
                </p>
              </div>
            </div>

            <!-- Products -->
            <div class="section-block">
              <h2 class="section-title">المنتجات</h2>
              <div class="products-list">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="product-row"
                >
                  <div class="prod-img">
                    <img :src="item.product?.mainImage" alt="" />
                  </div>
                  <div class="prod-info">
                    <h3>{{ item.product?.metaTitle || item.product?.name }}</h3>
                    <div class="prod-meta">
                      <span>الكمية: {{ item.quantity }}</span>
                      <span class="price">{{
                        formatPrice(item.priceAtPurchase)
                      }}</span>
                    </div>
                  </div>
                  <div class="prod-total">
                    {{ formatPrice(item.priceAtPurchase * item.quantity) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Summary -->
            <div class="section-block summary-block">
              <h2 class="section-title">ملخص الدفع</h2>
              <div class="summary-rows">
                <div class="row">
                  <span>المجموع الفرعي</span>
                  <span>{{ formatPrice(order.subTotal) }}</span>
                </div>
                <div class="row">
                  <span>الشحن</span>
                  <span>{{ formatPrice(order.shippingFee) }}</span>
                </div>
                <div v-if="order.discountAmount > 0" class="row discount">
                  <span>الخصم ({{ order.couponCode }})</span>
                  <span>- {{ formatPrice(order.discountAmount) }}</span>
                </div>
                <div class="row total">
                  <span>الإجمالي النهائي</span>
                  <span>{{ formatPrice(order.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="actions-footer">
              <button class="back-btn" @click="goBack">
                <Icon name="ph:arrow-right" />
                العودة إلى الطلبات
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import { useOrdersStore } from "@/stores/orders";

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const router = useRouter();
const store = useOrdersStore();

// Fetch specific order details
// ملاحظة: في الـ API الذي أرسلته، لا يوجد endpoint محدد لجلب طلب واحد للمستخدم (مثل /my-orders/:id)،
// لكن عادةً ما يكون موجوداً. إذا لم يكن موجوداً، سنعتمد على الفلترة من قائمة الطلبات المحملة مسبقاً.
// سأفترض وجود endpoint أو سنستخدم البيانات من القائمة إذا كانت محملة.
// للتوضيح، سأستخدم منطق يجلب الطلب من الـ Store إذا كان موجوداً، وإلا يحاول جلبه.

const order = computed(() => {
  return (
    store.orders.find((o) => o.id === route.params.id) || store.currentOrder
  );
});

onMounted(async () => {
  // إذا لم يكن الطلب في القائمة المحلية، نحاول جلبه (إذا توفر الـ endpoint)
  // أو نجلب كل الطلبات ونبحث فيها
  if (!store.orders.length) {
    await store.fetchMyOrders();
  }

  // محاولة جلب تفاصيل محددة إذا توفرت الدالة في الـ Store (يمكن إضافتها لاحقاً)
  // const found = store.orders.find(o => o.id === route.params.id);
  // if (!found) { /* Handle error or fetch single */ }
});

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);
};

const getStatusText = (status) => {
  const map = {
    pending: "قيد المراجعة",
    processing: "جاري التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = {
    pending: "status-pending",
    processing: "status-processing",
    shipped: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return map[status] || "";
};

const goBack = () => {
  router.push("/account/orders");
};
</script>

<style scoped lang="scss">
/* Layout & Card */
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
  min-height: 400px;
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

/* Loading & Error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Header Grid */
.order-header-details {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.header-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}
.header-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.header-item .label {
  font-size: 12px;
  color: #888;
}
.header-item .value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  width: fit-content;
}
.status-pending {
  background: #fffbeb;
  color: #b45309;
}
.status-processing {
  background: #eff6ff;
  color: #1d4ed8;
}
.status-shipped {
  background: #f0fdf4;
  color: #15803d;
}
.status-delivered {
  background: #dcfce7;
  color: #166534;
}
.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

/* Sections */
.section-block {
  margin-bottom: 30px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 15px;
  border-right: 4px solid var(--color-green-primary);
  padding-right: 10px;
}

/* Address */
.address-box {
  background: #f9fafb;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #eee;
}
.addr-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.addr-header strong {
  color: #333;
}
.addr-header .phone {
  direction: ltr;
  color: #555;
  font-size: 14px;
}
.addr-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* Products List */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.product-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
}
.prod-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;
}
.prod-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prod-info {
  flex: 1;
}
.prod-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}
.prod-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}
.prod-meta .price {
  color: var(--color-green-primary);
  font-weight: 600;
}
.prod-total {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 16px;
  min-width: 80px;
  text-align: left;
}

/* Summary */
.summary-block {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}
.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #555;
}
.row.discount {
  color: #059669;
}
.row.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
  font-weight: 800;
  font-size: 18px;
  color: #1a1a2e;
}

/* Footer */
.actions-footer {
  margin-top: 20px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #555;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background: #f5f5f5;
  border-color: #bbb;
  color: #333;
}
</style>

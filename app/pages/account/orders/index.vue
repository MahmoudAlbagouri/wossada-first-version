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

          <!-- Loading State -->
          <div
            v-if="store.loading && !store.orders.length"
            class="loading-state"
          >
            <div class="spinner"></div>
            <p>جاري تحميل طلباتك...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!store.orders.length" class="empty-state">
            <Icon name="ph:shopping-bag-open" class="empty-icon" />
            <p>لا توجد طلبات حالياً</p>
            <NuxtLink to="/products" class="shop-btn">تصفح المنتجات</NuxtLink>
          </div>

          <!-- Orders List -->
          <div v-else class="orders-list">
            <div
              v-for="order in store.orders"
              :key="order.id"
              class="order-card"
            >
              <!-- Header -->
              <div class="order-header">
                <span
                  class="order-status"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusText(order.status) }}
                </span>
                <span class="order-number"
                  >#{{ order.orderNumber.split("-").pop() }}</span
                >
              </div>

              <!-- Meta -->
              <div class="order-meta">
                <Icon name="ph:calendar-blank" class="meta-icon" />
                <span class="order-date">{{
                  formatDate(order.createdAt)
                }}</span>
              </div>

              <!-- Products Preview -->
              <div class="order-products">
                <div
                  v-for="(item, idx) in order.items.slice(0, 3)"
                  :key="idx"
                  class="product-thumb"
                >
                  <img :src="item.product?.mainImage" alt="منتج" />
                </div>
                <div
                  v-if="order.items.length > 3"
                  class="product-thumb more-count"
                >
                  +{{ order.items.length - 3 }}
                </div>
              </div>

              <!-- Summary -->
              <div class="order-summary">
                <div class="summary-row">
                  <span>المجموع:</span>
                  <span class="total-price">{{
                    formatCurrency(order.totalAmount)
                  }}</span>
                </div>
                <div class="summary-row">
                  <span>الدفع:</span>
                  <!-- نفترض الدفع عند الاستلام أو أونلاين بناءً على وجود بيانات، هنا تبسيط -->
                  <span class="payment-status paid">مدفوع / قيد المعالجة</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="order-actions">
                <button
                  class="btn details-btn"
                  @click="viewOrderDetails(order.id)"
                >
                  <Icon name="ph:file-text" class="btn-icon" />
                  تفاصيل الطلب
                </button>

                <button
                  v-if="canCancel(order.status)"
                  class="btn cancel-btn"
                  @click="confirmCancel(order)"
                  :disabled="cancellingId === order.id"
                >
                  <span
                    v-if="cancellingId === order.id"
                    class="mini-spinner"
                  ></span>
                  <Icon v-else name="ph:x" class="btn-icon" />
                  إلغاء الطلب
                </button>
                <button v-else class="btn cancel-btn disabled">
                  <Icon name="ph:x" class="btn-icon" />
                  غير قابل للإلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import { useOrdersStore } from "@/stores/orders";

definePageMeta({ middleware: ["auth"] });

const router = useRouter();
const store = useOrdersStore();

// Local State for UI interactions
const cancellingId = ref(null);
const toast = reactive({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

onMounted(() => {
  store.fetchMyOrders();
});

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
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

const canCancel = (status) => {
  return status === "pending" || status === "processing";
};

const viewOrderDetails = (orderId) => {
  router.push(`/account/orders/${orderId}`);
};

const confirmCancel = async (order) => {
  if (
    !confirm(
      `هل أنت متأكد من إلغاء الطلب رقم #${order.orderNumber.split("-").pop()}؟`,
    )
  )
    return;

  cancellingId.value = order.id;
  const result = await store.cancelOrder(order.id);

  if (result.success) {
    showToast("تم إلغاء الطلب بنجاح");
  } else {
    showToast(result.error || "فشل إلغاء الطلب", "error");
  }
  cancellingId.value = null;
};
</script>

<style scoped lang="scss">
/* Base Layout Styles (Same as provided) */
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

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-muted);
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
.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}
.shop-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: var(--color-green-primary);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}

/* Order Card Styles */
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
  border: 1px solid #eee;
  transition: transform 0.2s;
}
.order-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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
  border: 1px solid #86efac;
}
.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

.order-number {
  font-size: 14px;
  color: var(--text-muted);
  font-family: monospace;
}
.order-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.meta-icon {
  font-size: 16px;
}

.order-products {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
}
.product-thumb {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
  border: 1px solid #eee;
}
.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.more-count {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  color: #555;
  font-weight: bold;
  font-size: 12px;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #eee;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-main);
}
.total-price {
  font-weight: 700;
  color: var(--color-green-primary);
}
.payment-status.paid {
  color: #059669;
  font-weight: 600;
  font-size: 12px;
}

.order-actions {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.details-btn {
  background: var(--color-green-light);
  color: var(--color-green-primary);
  border: 1px solid transparent;
}
.details-btn:hover {
  background: #eaddcf;
}
.cancel-btn {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #ffe4e6;
}
.cancel-btn:hover:not(:disabled) {
  background: #ffe4e6;
}
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.cancel-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #999;
  border-color: #ddd;
}
.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(225, 29, 72, 0.3);
  border-top-color: #e11d48;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.toast.success {
  background: #10b981;
}
.toast.error {
  background: #ef4444;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>

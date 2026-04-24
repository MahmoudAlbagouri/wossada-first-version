<template>
  <div class="orders-page" dir="rtl">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الطلبات</h1>
        <span class="orders-count" v-if="store.orders.length">
          {{ store.orders.length }} طلب
        </span>
      </div>
      <button
        class="btn-refresh"
        @click="store.fetchAdminOrders()"
        :disabled="store.loading"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path
            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          ></path>
        </svg>
        تحديث
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !store.orders.length" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchAdminOrders()">
        إعادة المحاولة
      </button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>التاريخ</th>
            <th>الإجمالي</th>
            <th>الحالة</th>
            <th>تغيير الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in store.orders" :key="order.id" class="order-row">
            <!-- Order Number -->
            <td>
              <span class="order-number"
                >#{{ order.orderNumber.split("-").pop() }}</span
              >
            </td>

            <!-- Customer Info -->
            <td>
              <div class="customer-info">
                <span class="c-name">{{
                  order.user?.name || order.shippingAddress?.fullName
                }}</span>
                <span class="c-phone">{{
                  order.user?.phone || order.shippingAddress?.phoneNumber
                }}</span>
              </div>
            </td>

            <!-- Date -->
            <td class="date-cell">
              {{ formatDate(order.createdAt) }}
            </td>

            <!-- Total -->
            <td class="total-cell">
              {{ formatCurrency(order.totalAmount) }}
              <span v-if="order.couponCode" class="coupon-tag">{{
                order.couponCode
              }}</span>
            </td>

            <!-- Status Badge -->
            <td>
              <span
                class="status-badge"
                :class="store.getStatusClass(order.status)"
              >
                {{ store.getStatusLabel(order.status) }}
              </span>
            </td>

            <!-- Change Status Dropdown -->
            <td>
              <select
                v-model="order.tempStatus"
                @change="handleStatusChange(order)"
                class="status-select"
                :disabled="
                  order.status === 'delivered' || order.status === 'cancelled'
                "
              >
                <option value="pending">قيد المراجعة</option>
                <option value="processing">جاري التجهيز</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </td>

            <!-- Actions -->
            <td class="actions-cell">
              <button
                class="action-btn view-btn"
                title="عرض التفاصيل"
                @click="viewOrderDetails(order)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="!store.orders.length">
            <td colspan="7" class="empty-row">لا توجد طلبات حالياً</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Toast -->
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
const store = useOrdersStore();

onMounted(() => {
  store.fetchAdminOrders();
});

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

// Toast
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// Actions
const handleStatusChange = async (order) => {
  if (order.tempStatus === order.status) return;

  const result = await store.updateOrderStatus(order.id, order.tempStatus);
  if (result.success) {
    order.status = order.tempStatus; // Sync UI
    showToast("تم تحديث حالة الطلب بنجاح");
  } else {
    showToast(result.error || "فشل تحديث الحالة", "error");
    order.tempStatus = order.status; // Revert on error
  }
};

const viewOrderDetails = (order) => {
  // يمكن توجيه المستخدم لصفحة تفاصيل أو فتح مودال
  // navigateTo(`/admin/orders/${order.id}`);
  console.log("Viewing order:", order);
  showToast("ميزة عرض التفاصيل قيد التطوير", "info");
};
</script>

<style scoped>
/* Layout & Base */
.orders-page {
  padding: 24px;
  min-height: 100vh;
  background: #f8f9fb;
  font-family: "Cairo", sans-serif;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}
.orders-count {
  background: #e8f0fe;
  color: #4361ee;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e0e3ef;
  color: #555;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-refresh:hover:not(:disabled) {
  background: #f4f6fb;
  border-color: #4361ee;
  color: #4361ee;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Skeleton & Error */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 80px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e8eaf0 25%, #f0f2f8 50%, #e8eaf0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
.error-state {
  text-align: center;
  padding: 48px;
  color: #e63946;
}
.btn-retry {
  margin-top: 12px;
  padding: 8px 24px;
  border: 2px solid #e63946;
  background: transparent;
  color: #e63946;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Table */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  white-space: nowrap;
}
.orders-table thead th {
  background: #f4f6fb;
  padding: 14px 16px;
  text-align: right;
  font-weight: 700;
  color: #555;
  border-bottom: 1px solid #e8eaf0;
}
.order-row:hover {
  background: #f9fafb;
}
.orders-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f8;
  vertical-align: middle;
}

/* Cells */
.order-number {
  font-family: monospace;
  font-weight: 700;
  color: #4361ee;
}
.customer-info {
  display: flex;
  flex-direction: column;
}
.c-name {
  font-weight: 600;
  color: #1a1a2e;
}
.c-phone {
  font-size: 0.8rem;
  color: #888;
  direction: ltr;
  text-align: right;
}
.date-cell {
  color: #666;
  font-size: 0.85rem;
}
.total-cell {
  font-weight: 700;
  color: #1a1a2e;
}
.coupon-tag {
  display: block;
  font-size: 0.7rem;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  width: fit-content;
}

/* Status Badge */
.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
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
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

/* Select */
.status-select {
  padding: 6px 10px;
  border: 1px solid #e0e3ef;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #444;
  background: #fff;
  cursor: pointer;
  outline: none;
}
.status-select:focus {
  border-color: #4361ee;
}
.status-select:disabled {
  background: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

/* Actions */
.actions-cell {
  width: 60px;
  text-align: center;
}
.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  margin: 0 auto;
}
.view-btn {
  background: #f0f9ff;
  color: #0284c7;
}
.view-btn:hover {
  background: #0284c7;
  color: #fff;
}
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.toast.success {
  background: #2d6a4f;
  color: #fff;
}
.toast.error {
  background: #e63946;
  color: #fff;
}
.toast.info {
  background: #4361ee;
  color: #fff;
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

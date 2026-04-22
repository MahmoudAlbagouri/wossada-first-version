<template>
  <div class="checkout-page">
    <div class="container">
      <!-- Page Title -->
      <h1 class="page-title">إتمام الطلب</h1>

      <div class="checkout-layout">
        <!-- ===== RIGHT SIDE: Delivery + Notes + Payment ===== -->
        <div class="checkout-left">
          <!-- Delivery Address Section -->
          <div class="section-card">
            <h2 class="section-heading">عنوان التسليم</h2>
            <div class="divider"></div>

            <div class="address-list">
              <!-- Address Card 1 -->
              <div class="address-card selected">
                <div class="address-info">
                  <div class="address-top">
                    <span class="address-label">شارع وقفة عرفه</span>
                  </div>
                  <p class="address-city">عزبة خيزه . الجيزه</p>
                  <p class="address-phone">
                    <span class="phone-icon">📱</span>
                    01110022133
                  </p>
                </div>
                <button class="edit-btn">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Address Card 2 -->
              <div class="address-card">
                <div class="address-info">
                  <div class="address-top">
                    <span class="address-label">شارع وقفة عرفه</span>
                  </div>
                  <p class="address-city">عزبة خيزه . الجيزه</p>
                  <p class="address-phone">
                    <span class="phone-icon">📱</span>
                    01110022133
                  </p>
                </div>
                <button class="edit-btn">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Add New Address -->
              <button class="add-address-btn">
                <span class="plus-icon">+</span>
                اضافة عنوان جديد
              </button>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="section-card">
            <h2 class="section-heading">ملاحظات</h2>
            <div class="divider"></div>
            <textarea
              class="notes-textarea"
              placeholder="اكتب ملاحظاتك ....."
              rows="5"
            ></textarea>
          </div>

          <!-- Payment Method Section -->
          <div class="section-card">
            <h2 class="section-heading">طريقة الدفع</h2>
            <div class="divider"></div>

            <div class="payment-options">
              <!-- Option 1 -->
              <label
                class="payment-option"
                :class="{ active: selectedPayment === 'online1' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="online1"
                  v-model="selectedPayment"
                />
                <span class="payment-label">الدفع اونلاين</span>
                <span class="check-icon">
                  <svg
                    v-if="selectedPayment === 'online1'"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>

              <!-- Option 2 -->
              <label
                class="payment-option"
                :class="{ active: selectedPayment === 'online2' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="online2"
                  v-model="selectedPayment"
                />
                <span class="payment-label">الدفع اونلاين</span>
                <span class="check-icon">
                  <svg
                    v-if="selectedPayment === 'online2'"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>

              <!-- Option 3 -->
              <label
                class="payment-option"
                :class="{ active: selectedPayment === 'card' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  v-model="selectedPayment"
                />
                <span class="payment-label">بطاقة الثمان</span>
                <span class="check-icon">
                  <svg
                    v-if="selectedPayment === 'card'"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>

              <!-- Option 4 -->
              <label
                class="payment-option"
                :class="{ active: selectedPayment === 'cash' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  v-model="selectedPayment"
                />
                <span class="payment-label">نقدا عند الأستلام</span>
                <span class="check-icon">
                  <svg
                    v-if="selectedPayment === 'cash'"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- ===== LEFT SIDE: Order Summary ===== -->
        <div class="checkout-right">
          <div class="section-card summary-card">
            <h2 class="section-heading">ملخص الطلب</h2>
            <div class="divider"></div>

            <!-- Order Items -->
            <div class="order-items">
              <div
                v-for="(item, index) in orderItems"
                :key="index"
                class="order-item"
              >
                <div class="item-details">
                  <p class="item-title">{{ item.title }}</p>
                  <p class="item-qty-price">
                    <span class="item-qty">{{ item.qty }} قطعة</span>
                    <span class="item-multiply">*</span>
                    <span class="item-price">{{ item.price }}</span>
                    <span class="item-equals">=</span>
                    <span class="item-total">{{ item.total }} ريال</span>
                  </p>
                </div>
                <div class="item-image">
                  <img :src="item.image" :alt="item.title" />
                </div>
              </div>
            </div>

            <!-- Coupon Row -->
            <div class="coupon-row">
              <button class="coupon-apply-btn" @click="applyCoupon">
                تطبيق
              </button>
              <input
                type="text"
                class="coupon-input"
                placeholder="ادخل كود الخصم"
                v-model="couponCode"
              />
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <div class="total-row">
                <span class="total-amount">{{ subtotal }} ريال</span>
                <span class="total-label">الاجمالي الفرعي</span>
              </div>
              <div class="divider-light"></div>
              <div class="total-row">
                <span class="total-amount">{{ shippingCost }} ريال</span>
                <span class="total-label">رسوم التوصيل</span>
              </div>
              <div class="divider-light"></div>
              <div class="total-row final-total">
                <span class="total-amount final">{{ grandTotal }} ريال</span>
                <span class="total-label final">الاجمالي النهائي</span>
              </div>
            </div>

            <!-- Confirm Button -->
            <button class="confirm-btn">تأكيد الطلب</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Payment selection
const selectedPayment = ref("cash");

// Coupon
const couponCode = ref("");
const applyCoupon = () => {
  // TODO: handle coupon logic
  alert("تم تطبيق الكود: " + couponCode.value);
};

// Order items (dummy data)
const orderItems = ref([
  {
    title: "ترابيزة قهوة خشب كونتر .......",
    qty: 2,
    price: "1200",
    total: "2400",
    image: "/images/products/product1.jpg",
  },
  {
    title: "ترابيزة قهوة خشب كونتر .......",
    qty: 2,
    price: "1200",
    total: "2400",
    image: "/images/products/product2.jpg",
  },
  {
    title: "ترابيزة قهوة خشب كونتر .......",
    qty: 2,
    price: "1200",
    total: "2400",
    image: "/images/products/product3.jpg",
  },
]);

const subtotal = ref(7200);
const shippingCost = ref(50);
const grandTotal = computed(() => subtotal.value + shippingCost.value);
</script>

<style scoped>
/* ======= Page Layout ======= */
.checkout-page {
  min-height: 100vh;
  background-color: var(--bg-body, #fffff5);
  padding: 40px 0 80px;
  font-family: "Cairo", sans-serif;
}

.page-title {
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  color: var(--color-green-primary, #987226);
  margin-bottom: 40px;
  letter-spacing: 0.5px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 30px;
  align-items: start;
}

/* Right col = delivery+notes+payment, Left col = summary */
.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkout-right {
  position: sticky;
  top: 20px;
}

/* ======= Section Card ======= */
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 24px 28px;
  box-shadow: var(--shadow-2, 0px 5px 10px 0px #0000000d);
  border: 1px solid #f0ece2;
}

.section-heading {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-green-primary, #987226);
  text-align: center;
  margin-bottom: 14px;
}

.divider {
  border: none;
  border-top: 1.5px solid #f0ece2;
  margin-bottom: 20px;
}

.divider-light {
  border: none;
  border-top: 1px solid #f0ece2;
  margin: 10px 0;
}

/* ======= Address Cards ======= */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  padding: 14px 18px;
  background: #faf8f3;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.address-card.selected {
  border-color: var(--color-green-primary, #987226);
  background: #fdf9f0;
}

.address-info {
  flex: 1;
  text-align: right;
}

.address-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-green-primary, #987226);
}

.address-city {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin: 4px 0;
}

.address-phone {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-green-primary, #987226);
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
  flex-shrink: 0;
  margin-right: 10px;
}

.edit-btn:hover {
  background: #f0ead8;
}

.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1.5px dashed #c8b98a;
  border-radius: 10px;
  background: transparent;
  color: #888;
  font-size: 15px;
  font-family: "Cairo", sans-serif;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.add-address-btn:hover {
  border-color: var(--color-green-primary, #987226);
  color: var(--color-green-primary, #987226);
}

.plus-icon {
  font-size: 22px;
  line-height: 1;
}

/* ======= Notes ======= */
.notes-textarea {
  width: 100%;
  min-height: 120px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #555;
  background: #faf8f3;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  text-align: right;
}

.notes-textarea:focus {
  border-color: var(--color-green-primary, #987226);
}

/* ======= Payment Options ======= */
.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  cursor: pointer;
  background: #faf8f3;
  transition:
    border-color 0.2s,
    background 0.2s;
  text-align: right;
  gap: 8px;
}

.payment-option input[type="radio"] {
  display: none;
}

.payment-option.active {
  border-color: var(--color-green-primary, #987226);
  background: #fdf9f0;
}

.payment-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.check-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-green-primary, #987226);
}

/* ======= Order Summary ======= */
.summary-card {
  padding: 24px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0ece2;
  gap: 12px;
}

.item-details {
  flex: 1;
  text-align: right;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.5;
}

.item-qty-price {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  font-size: 13px;
  color: var(--color-green-primary, #987226);
  font-weight: 600;
}

.item-qty {
  color: #555;
}

.item-multiply,
.item-equals {
  color: #999;
}

.item-image {
  width: 85px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0ece2;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ======= Coupon ======= */
.coupon-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 16px;
  flex-direction: row-reverse;
}

.coupon-input {
  flex: 1;
  padding: 11px 14px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #555;
  background: #faf8f3;
  outline: none;
  text-align: right;
  transition: border-color 0.2s;
}

.coupon-input:focus {
  border-color: var(--color-green-primary, #987226);
}

.coupon-apply-btn {
  padding: 11px 24px;
  background: var(--color-green-primary, #987226);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.coupon-apply-btn:hover {
  background: var(--color-green-hover, #896722);
}

/* ======= Totals ======= */
.totals-section {
  margin-bottom: 20px;
}

.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #444;
}

.total-amount {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-green-primary, #987226);
}

.total-row.final-total .total-label.final {
  font-size: 18px;
  font-weight: 800;
  color: #222;
}

.total-row.final-total .total-amount.final {
  font-size: 20px;
  font-weight: 800;
}

/* ======= Confirm Button ======= */
.confirm-btn {
  display: block;
  width: 100%;
  padding: 18px;
  background: var(--color-green-primary, #987226);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: "Cairo", sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
}

.confirm-btn:hover {
  background: var(--color-green-hover, #896722);
  transform: translateY(-1px);
}

.confirm-btn:active {
  background: var(--color-green-active, #7a5b1e);
  transform: translateY(0);
}

/* ======= Responsive ======= */
@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr 360px;
  }
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-right {
    position: static;
    order: -1;
  }

  .payment-options {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .payment-options {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: 18px 16px;
  }
}
</style>

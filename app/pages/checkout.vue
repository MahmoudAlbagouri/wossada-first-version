<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">إتمام الطلب</h1>

      <div v-if="isLoadingData" class="loading-overlay">
        <div class="spinner"></div>
        <p>جاري تجهيز بيانات الدفع...</p>
      </div>

      <div v-else class="checkout-layout">
        <!-- RIGHT SIDE: Delivery + Notes + Payment -->
        <div class="checkout-left">
          <!-- Delivery Address Section -->
          <div class="section-card">
            <h2 class="section-heading">عنوان التسليم</h2>
            <div class="divider"></div>

            <div class="address-list">
              <div
                v-for="address in addressStore.addresses"
                :key="address.id"
                class="address-card"
                :class="{ selected: selectedAddressId === address.id }"
                @click="selectedAddressId = address.id"
              >
                <div class="address-info">
                  <div class="address-top">
                    <span class="address-label">{{ address.addressName }}</span>
                    <span v-if="address.isDefault" class="default-badge"
                      >الافتراضي</span
                    >
                  </div>
                  <p class="address-city">
                    {{ address.city?.governorate?.nameAr }} -
                    {{ address.city?.nameAr }}
                  </p>
                  <p class="address-details-text">
                    {{ address.streetAddress }}
                  </p>
                  <p class="address-phone">
                    <span class="phone-icon">📱</span>
                    {{ address.phoneNumber }}
                  </p>
                </div>
                <div
                  class="radio-circle"
                  :class="{ active: selectedAddressId === address.id }"
                ></div>
              </div>

              <NuxtLink to="/account/addresses" class="add-address-btn">
                <span class="plus-icon">+</span>
                إضافة عنوان جديد
              </NuxtLink>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="section-card">
            <h2 class="section-heading">ملاحظات</h2>
            <div class="divider"></div>
            <textarea
              v-model="notes"
              class="notes-textarea"
              placeholder="اكتب ملاحظاتك للسائق أو المتجر (اختياري)..."
              rows="3"
            ></textarea>
          </div>

          <!-- Payment Method Section -->
          <div class="section-card">
            <h2 class="section-heading">طريقة الدفع</h2>
            <div class="divider"></div>
            <div class="payment-options">
              <label
                class="payment-option"
                :class="{ active: paymentMethod === 'cod' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  v-model="paymentMethod"
                />
                <span class="payment-label">نقداً عند الاستلام</span>
                <span class="check-icon" v-if="paymentMethod === 'cod'">✓</span>
              </label>

              <label
                class="payment-option"
                :class="{ active: paymentMethod === 'online' }"
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  v-model="paymentMethod"
                />
                <span class="payment-label">دفع أونلاين (بطاقة)</span>
                <span class="check-icon" v-if="paymentMethod === 'online'"
                  >✓</span
                >
              </label>
            </div>
          </div>
        </div>

        <!-- LEFT SIDE: Order Summary -->
        <div class="checkout-right">
          <div class="section-card summary-card">
            <h2 class="section-heading">ملخص الطلب</h2>
            <div class="divider"></div>

            <!-- Order Items from Cart -->
            <div class="order-items">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="order-item"
              >
                <div class="item-details">
                  <p class="item-title">
                    {{ item.product?.metaTitle || item.product?.name }}
                  </p>
                  <p class="item-qty-price">
                    <span class="item-qty">{{ item.quantity }} × </span>
                    <span class="item-price">{{
                      formatPrice(
                        item.product?.baseDiscountPrice ||
                          item.product?.basePrice,
                      )
                    }}</span>
                  </p>
                </div>
                <div class="item-image">
                  <img
                    :src="item.product?.mainImage"
                    :alt="item.product?.metaTitle"
                  />
                </div>
              </div>
            </div>

            <!-- Coupon Row -->
            <div class="coupon-row">
              <button
                class="coupon-apply-btn"
                @click="validateCoupon"
                :disabled="validatingCoupon"
              >
                {{ validatingCoupon ? "..." : "تطبيق" }}
              </button>
              <input
                type="text"
                class="coupon-input"
                placeholder="أدخل كود الخصم"
                v-model="couponCode"
                :disabled="!!appliedCoupon"
              />
            </div>
            <div v-if="appliedCoupon" class="coupon-success">
              تم تطبيق الكوبون: <strong>{{ appliedCoupon.code }}</strong> (خصم
              {{ appliedCoupon.discountAmount }} ج.م)
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <div class="total-row">
                <span class="total-amount">{{
                  formatPrice(cartStore.total)
                }}</span>
                <span class="total-label">المجموع الفرعي</span>
              </div>
              <div class="divider-light"></div>
              <div class="total-row">
                <span class="total-amount">{{ formatPrice(shippingFee) }}</span>
                <span class="total-label">رسوم التوصيل</span>
              </div>
              <div v-if="discountAmount > 0" class="total-row discount">
                <span class="total-amount"
                  >- {{ formatPrice(discountAmount) }}</span
                >
                <span class="total-label">الخصم</span>
              </div>
              <div class="divider-light"></div>
              <div class="total-row final-total">
                <span class="total-amount final">{{
                  formatPrice(grandTotal)
                }}</span>
                <span class="total-label final">الإجمالي النهائي</span>
              </div>
            </div>

            <!-- Confirm Button -->
            <button
              class="confirm-btn"
              @click="placeOrder"
              :disabled="isSubmitting || !canPlaceOrder"
            >
              <span v-if="isSubmitting">جاري تأكيد الطلب...</span>
              <span v-else>تأكيد الطلب ودفع {{ formatPrice(grandTotal) }}</span>
            </button>

            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useAddressStore } from "@/stores/address";
import { useOrdersStore } from "@/stores/orders";

definePageMeta({ middleware: ["auth"] });

const cartStore = useCartStore();
const addressStore = useAddressStore();
const ordersStore = useOrdersStore();

// State
const selectedAddressId = ref("");
const notes = ref("");
const paymentMethod = ref("cod"); // cod or online
const couponCode = ref("");
const appliedCoupon = ref(null);
const isSubmitting = ref(false);
const isLoadingData = ref(true);
const errorMessage = ref("");
const validatingCoupon = ref(false);

// Computed
const shippingFee = computed(() => {
  // منطق بسيط للشحن: إذا كان العنوان موجوداً، نحسب شحن المحافظة الافتراضي أو ثابت
  // هنا نستخدم قيمة افتراضية للتوضيح، يجب ربطها بمنطق الشحن الحقيقي من الـ API
  const address = addressStore.addresses.find(
    (a) => a.id === selectedAddressId.value,
  );
  if (!address) return 0;
  return address.city?.governorate?.baseShippingCost || 50;
});

const discountAmount = computed(() => appliedCoupon.value?.discountAmount || 0);

const grandTotal = computed(() => {
  let total = cartStore.total + shippingFee.value;
  if (appliedCoupon.value) {
    // إذا كان الكوبون نسبة مئوية، نحسب النسبة من المجموع الفرعي فقط عادةً
    // لكن الـ API يعيد لنا discountAmount جاهزاً في خطوة التحقق
    total -= discountAmount.value;
  }
  return Math.max(0, total);
});

const canPlaceOrder = computed(() => {
  return selectedAddressId.value && cartStore.items.length > 0;
});

// Methods
const formatPrice = (price) => {
  if (!price) return "0 ج.م";
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);
};

const validateCoupon = async () => {
  if (!couponCode.value) return;
  validatingCoupon.value = true;
  errorMessage.value = "";

  try {
    // استخدام endpoint التحقق من الكوبون
    // ملاحظة: الـ API يتطلب amount للتحقق من الحد الأدنى
    const { baseURL, headers } = addressStore._getRequestOptions
      ? addressStore._getRequestOptions()
      : { baseURL: useRuntimeConfig().public.apiBase, headers: {} }; // Fallback simple logic

    // نحتاج لاستخدام $fetch مباشرة هنا لأن useApi قد لا يكون متاحاً بنفس الطريقة في كل المكونات
    // أو نستخدم نفس نمط الـ Stores
    const config = useRuntimeConfig();
    const token = useCookie("auth_token").value;

    const response = await $fetch(
      `${config.public.apiBase}/coupons/validate?code=${couponCode.value}&amount=${cartStore.total}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.success && response.data) {
      appliedCoupon.value = {
        code: couponCode.value,
        discountAmount: response.data.discountAmount,
      };
      // showToast("تم تطبيق الكوبون بنجاح", "success");
    } else {
      appliedCoupon.value = null;
      errorMessage.value = "كود الخصم غير صالح أو لا ينطبق على هذا الطلب.";
    }
  } catch (err) {
    appliedCoupon.value = null;
    errorMessage.value = err?.data?.message || "حدث خطأ في التحقق من الكوبون.";
  } finally {
    validatingCoupon.value = false;
  }
};

const placeOrder = async () => {
  if (!canPlaceOrder.value) return;
  isSubmitting.value = true;
  errorMessage.value = "";

  const payload = {
    addressId: selectedAddressId.value,
    items: cartStore.items.map((item) => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity,
    })),
    couponCode: appliedCoupon.value ? appliedCoupon.value.code : null,
    // notes: notes.value // إذا كان الـ API يدعم الملاحظات
  };

  const result = await ordersStore.createOrder(payload);

  if (result.success) {
    // نجاح الطلب
    await cartStore.clearCart(); // تفريغ السلة
    navigateTo(`/account/orders/${result.data.id}?success=true`);
  } else {
    errorMessage.value =
      result.error || "فشل إتمام الطلب، يرجى المحاولة مرة أخرى.";
  }

  isSubmitting.value = false;
};

// Lifecycle
onMounted(async () => {
  isLoadingData.value = true;
  await Promise.all([cartStore.fetchCart(), addressStore.fetchAddresses()]);

  // تحديد العنوان الافتراضي تلقائياً
  const defaultAddr = addressStore.defaultAddress;
  if (defaultAddr) {
    selectedAddressId.value = defaultAddr.id;
  } else if (addressStore.addresses.length > 0) {
    selectedAddressId.value = addressStore.addresses[0].id;
  }

  isLoadingData.value = false;
});
</script>

<style scoped>
/* نفس الستايل السابق مع تعديلات بسيطة */
.checkout-page {
  min-height: 100vh;
  background-color: var(--bg-body, #fffff5);
  padding: 40px 0 80px;
  font-family: "Cairo", sans-serif;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.page-title {
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  color: var(--color-green-primary, #987226);
  margin-bottom: 40px;
}
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 30px;
  align-items: start;
}
.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.checkout-right {
  position: sticky;
  top: 20px;
}

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

/* Address */
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
  cursor: pointer;
  transition: all 0.2s;
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
.default-badge {
  font-size: 10px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}
.address-city {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin: 4px 0;
}
.address-details-text {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}
.address-phone {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}
.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.radio-circle.active {
  border-color: var(--color-green-primary, #987226);
  background: var(--color-green-primary, #987226);
}
.radio-circle.active::after {
  content: "";
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
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
  text-decoration: none;
  transition: all 0.2s;
}
.add-address-btn:hover {
  border-color: var(--color-green-primary, #987226);
  color: var(--color-green-primary, #987226);
}

/* Notes */
.notes-textarea {
  width: 100%;
  min-height: 80px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  resize: vertical;
  outline: none;
}
.notes-textarea:focus {
  border-color: var(--color-green-primary, #987226);
}

/* Payment */
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
  transition: all 0.2s;
}
.payment-option.active {
  border-color: var(--color-green-primary, #987226);
  background: #fdf9f0;
}
.payment-option input {
  display: none;
}
.check-icon {
  color: var(--color-green-primary, #987226);
  font-weight: bold;
}

/* Summary */
.summary-card {
  padding: 24px;
}
.order-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
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
  margin-bottom: 4px;
}
.item-qty-price {
  font-size: 13px;
  color: #555;
}
.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0ece2;
}
.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Coupon */
.coupon-row {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-direction: row-reverse;
}
.coupon-input {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  outline: none;
}
.coupon-input:focus {
  border-color: var(--color-green-primary, #987226);
}
.coupon-apply-btn {
  padding: 10px 20px;
  background: var(--color-green-primary, #987226);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.coupon-success {
  font-size: 13px;
  color: #059669;
  background: #ecfdf5;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 10px;
  text-align: center;
}

/* Totals */
.totals-section {
  margin-bottom: 20px;
}
.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 15px;
}
.total-row.discount {
  color: #059669;
}
.final-total {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a2e;
  border-top: 2px solid #eee;
  margin-top: 10px;
  padding-top: 15px;
}

/* Confirm Btn */
.confirm-btn {
  display: block;
  width: 100%;
  padding: 16px;
  background: var(--color-green-primary, #987226);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.confirm-btn:hover:not(:disabled) {
  background: #896722;
  transform: translateY(-2px);
}
.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}
.error-msg {
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-green-primary, #987226);
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

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .checkout-right {
    position: static;
    order: -1;
  }
}
</style>

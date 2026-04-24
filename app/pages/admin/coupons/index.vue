<template>
  <div class="coupons-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الكوبونات</h1>
        <span class="coupons-count" v-if="store.coupons.length">
          {{ store.coupons.length }} كوبون
        </span>
      </div>
      <button class="btn-add" @click="openCreateModal">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        إضافة كوبون
      </button>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchCoupons()">
        إعادة المحاولة
      </button>
    </div>

    <!-- ===== Coupons Table ===== -->
    <div v-else class="table-wrapper">
      <table class="coupons-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>نوع الخصم</th>
            <th>القيمة</th>
            <th>الحد الأدنى للطلب</th>
            <th>الاستخدام</th>
            <th>تاريخ الانتهاء</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="coupon in store.coupons"
            :key="coupon.id"
            class="coupon-row"
          >
            <!-- الكود -->
            <td>
              <div class="code-cell">
                <span class="code-badge">{{ coupon.code }}</span>
              </div>
            </td>

            <!-- النوع -->
            <td>
              <span class="type-tag" :class="coupon.discountType">
                {{
                  coupon.discountType === "percentage"
                    ? "نسبة مئوية %"
                    : "مبلغ ثابت"
                }}
              </span>
            </td>

            <!-- القيمة -->
            <td class="value-cell">
              <strong>{{ coupon.discountValue }}</strong>
              <small v-if="coupon.discountType === 'percentage'">%</small>
              <small v-else>ر.س</small>
            </td>

            <!-- الحد الأدنى -->
            <td>
              <span v-if="coupon.minOrderValue > 0"
                >{{ coupon.minOrderValue }} ر.س</span
              >
              <span v-else class="text-muted">—</span>
            </td>

            <!-- شريط الاستخدام -->
            <td>
              <div class="usage-container">
                <div class="usage-text">
                  {{ coupon.usedCount }} / {{ coupon.usageLimit || "∞" }}
                </div>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: store.usagePercentage(coupon) + '%' }"
                    :class="{
                      'is-full':
                        coupon.usedCount >= coupon.usageLimit &&
                        coupon.usageLimit > 0,
                    }"
                  ></div>
                </div>
              </div>
            </td>

            <!-- التاريخ -->
            <td class="date-cell">
              {{ formatDate(coupon.expiryDate) }}
            </td>

            <!-- الحالة -->
            <td>
              <span
                class="status-dot"
                :class="getStatusClass(coupon)"
                :title="store.statusLabel(coupon)"
              >
                {{ store.statusLabel(coupon) }}
              </span>
            </td>

            <!-- الإجراءات -->
            <td class="actions-cell">
              <div class="actions-row">
                <button
                  class="action-btn delete-btn"
                  title="حذف"
                  @click="confirmDelete(coupon)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!store.coupons.length">
            <td colspan="8" class="empty-row">لا توجد كوبونات حالياً</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== Create Modal ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">إضافة كوبون جديد</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- القسم 1: المعلومات الأساسية -->
              <fieldset class="form-section">
                <legend>بيانات الكوبون</legend>

                <div class="form-group">
                  <label class="form-label">كود الكوبون *</label>
                  <input
                    v-model="form.code"
                    type="text"
                    class="form-input"
                    placeholder="مثال: SUMMER2026"
                    required
                    style="text-transform: uppercase"
                  />
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">نوع الخصم *</label>
                    <select v-model="form.discountType" class="form-input">
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">قيمة الخصم *</label>
                    <input
                      v-model.number="form.discountValue"
                      type="number"
                      class="form-input"
                      min="0"
                      :placeholder="
                        form.discountType === 'percentage'
                          ? 'مثال: 20'
                          : 'مثال: 50'
                      "
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label"
                    >الحد الأدنى لقيمة الطلب (اختياري)</label
                  >
                  <input
                    v-model.number="form.minOrderValue"
                    type="number"
                    class="form-input"
                    min="0"
                    placeholder="0 يعني بدون حد أدنى"
                  />
                </div>
              </fieldset>

              <!-- القسم 2: القيود والتفعيل -->
              <fieldset class="form-section">
                <legend>القيود والتفعيل</legend>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">تاريخ الانتهاء *</label>
                    <input
                      v-model="form.expiryDate"
                      type="datetime-local"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">حد الاستخدام (عدد المرات)</label>
                    <input
                      v-model.number="form.usageLimit"
                      type="number"
                      class="form-input"
                      min="1"
                      placeholder="اتركه فارغاً للاستخدام اللانهائي"
                    />
                  </div>
                </div>

                <div class="form-group checkbox-group">
                  <label class="switch-container">
                    <input type="checkbox" v-model="form.isActive" />
                    <span class="switch-slider"></span>
                    <span class="switch-label">الكوبون نشط فوراً</span>
                  </label>
                </div>
              </fieldset>

              <!-- أزرار الحفظ -->
              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="submitting">
                  <span v-if="submitting">جارٍ الحفظ...</span>
                  <span v-else>حفظ الكوبون</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Delete Confirm Modal ===== -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="showDeleteModal = false"
      >
        <div class="modal-box modal-box--sm">
          <div class="modal-header">
            <h2 class="modal-title">تأكيد الحذف</h2>
            <button class="modal-close" @click="showDeleteModal = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-confirm-text">
              هل أنت متأكد من حذف الكوبون
              <strong class="highlight-code">{{ couponToDelete?.code }}</strong
              >؟
              <br />
              <small>سيتم إيقاف عمل هذا الكود نهائياً.</small>
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">
              إلغاء
            </button>
            <button
              class="btn-delete-confirm"
              :disabled="deleting"
              @click="executeDelete"
            >
              <span v-if="deleting">جارٍ الحذف...</span>
              <span v-else>نعم، احذف</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Toast ===== -->
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
const store = useCouponsStore();

onMounted(() => store.fetchCoupons());

// ── Toast ──
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ── Helpers ──
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusClass = (coupon) => {
  if (!coupon.isActive) return "status-inactive";
  if (new Date(coupon.expiryDate) < new Date()) return "status-expired";
  if (coupon.usedCount >= coupon.usageLimit && coupon.usageLimit > 0)
    return "status-used";
  return "status-active";
};

// ── Modal Logic ──
const showModal = ref(false);
const submitting = ref(false);

const defaultForm = () => ({
  code: "",
  discountType: "percentage",
  discountValue: null,
  minOrderValue: 0,
  expiryDate: "",
  usageLimit: null,
  isActive: true,
});

const form = ref(defaultForm());

const openCreateModal = () => {
  form.value = defaultForm();
  // تعيين تاريخ افتراضي (بعد شهر من الآن) لتسهيل الإدخال
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setMinutes(nextMonth.getMinutes() - nextMonth.getTimezoneOffset());
  form.value.expiryDate = nextMonth.toISOString().slice(0, 16);

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitForm = async () => {
  if (!form.value.code.trim() || !form.value.discountValue) {
    showToast("يرجى تعبئة الحقول الأساسية", "error");
    return;
  }

  submitting.value = true;

  // تحويل التاريخ إلى صيغة ISO كاملة كما يتوقعها السيرفر
  const payload = {
    ...form.value,
    expiryDate: new Date(form.value.expiryDate).toISOString(),
    // التأكد من إرسال الأرقام كأرقام وليس نصوص
    discountValue: Number(form.value.discountValue),
    minOrderValue: Number(form.value.minOrderValue) || 0,
    usageLimit: form.value.usageLimit ? Number(form.value.usageLimit) : null,
  };

  const result = await store.createCoupon(payload);
  submitting.value = false;

  if (result.success) {
    showToast("تم إضافة الكوبون بنجاح");
    closeModal();
  } else {
    showToast(result.error || "فشل إنشاء الكوبون", "error");
  }
};

// ── Delete Logic ──
const showDeleteModal = ref(false);
const couponToDelete = ref(null);
const deleting = ref(false);

const confirmDelete = (coupon) => {
  couponToDelete.value = coupon;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!couponToDelete.value) return;
  deleting.value = true;
  const result = await store.deleteCoupon(couponToDelete.value.id);
  deleting.value = false;
  showDeleteModal.value = false;
  couponToDelete.value = null;

  if (result.success) {
    showToast("تم حذف الكوبون بنجاح");
  } else {
    showToast(result.error || "فشل حذف الكوبون", "error");
  }
};
</script>

<style scoped>
/* ===== Layout & Base ===== */
.coupons-page {
  padding: 24px;
  min-height: 100vh;
  background: #f8f9fb;
  font-family: "Cairo", "Segoe UI", sans-serif;
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
.coupons-count {
  background: #e8f0fe;
  color: #4361ee;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
}
.btn-add:hover {
  background: #3451d1;
  transform: translateY(-1px);
}

/* ===== Skeleton & Error ===== */
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

/* ===== Table ===== */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  overflow-x: auto; /* للسماح بالسكرول في الشاشات الصغيرة */
}
.coupons-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  white-space: nowrap;
}
.coupons-table thead th {
  background: #f4f6fb;
  padding: 14px 16px;
  text-align: right;
  font-weight: 700;
  color: #555;
  border-bottom: 1px solid #e8eaf0;
}
.coupon-row:hover {
  background: #f9fafb;
}
.coupons-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f8;
  color: #2d2d4e;
  vertical-align: middle;
}

/* Specific Cells */
.code-badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid #c7d2fe;
}
.type-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
.type-tag.percentage {
  background: #fff1f2;
  color: #be123c;
}
.type-tag.fixed {
  background: #ecfdf5;
  color: #047857;
}
.value-cell strong {
  font-size: 1.1em;
  color: #1a1a2e;
}
.value-cell small {
  color: #888;
  font-size: 0.8em;
}
.text-muted {
  color: #aaa;
}

/* Progress Bar */
.usage-container {
  width: 120px;
}
.usage-text {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
}
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #e0e3ef;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: #4361ee;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-bar-fill.is-full {
  background: #e63946;
}

/* Status Dots */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}
.status-dot::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
}
.status-active {
  color: #059669;
}
.status-active::before {
  background: #059669;
  box-shadow: 0 0 0 2px #d1fae5;
}

.status-inactive {
  color: #6b7280;
}
.status-inactive::before {
  background: #6b7280;
}

.status-expired {
  color: #dc2626;
}
.status-expired::before {
  background: #dc2626;
}

.status-used {
  color: #d97706;
}
.status-used::before {
  background: #d97706;
}

/* Actions */
.actions-cell {
  width: 60px;
}
.actions-row {
  display: flex;
  gap: 8px;
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
}
.delete-btn {
  background: #fff0f0;
  color: #e63946;
}
.delete-btn:hover {
  background: #e63946;
  color: #fff;
}
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
}

/* ===== Modal Styles (Shared with Colors Page) ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 30, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-box {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-box--sm {
  max-width: 420px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f2f8;
}
.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}
.modal-close {
  background: #f4f6fb;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #e0e3ef;
}
.modal-body {
  padding: 20px 24px;
}

/* Form Elements */
.form-section {
  border: 1px solid #e8eaf0;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 18px;
  background: #fafbff;
}
.form-section legend {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4361ee;
  padding: 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}
.form-input {
  padding: 9px 12px;
  border: 1.5px solid #e0e3ef;
  border-radius: 8px;
  font-size: 0.92rem;
  color: #2d2d4e;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.form-input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

/* Toggle Switch */
.checkbox-group {
  margin-top: 10px;
}
.switch-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.switch-container input {
  display: none;
}
.switch-slider {
  width: 40px;
  height: 22px;
  background: #ccc;
  border-radius: 22px;
  position: relative;
  transition: 0.3s;
  margin-left: 10px;
}
.switch-slider::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
.switch-container input:checked + .switch-slider {
  background: #4361ee;
}
.switch-container input:checked + .switch-slider::after {
  transform: translateX(18px);
}
.switch-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
}

/* Footer & Buttons */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
}
.btn-cancel {
  padding: 10px 22px;
  border: 1.5px solid #e0e3ef;
  background: #fff;
  color: #555;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel:hover {
  background: #f4f6fb;
}
.btn-save {
  padding: 10px 24px;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
.btn-save:hover:not(:disabled) {
  background: #3451d1;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delete Modal Specifics */
.highlight-code {
  color: #4361ee;
  font-family: monospace;
  font-size: 1.1em;
}
.delete-confirm-text {
  color: #444;
  line-height: 1.7;
  margin-bottom: 16px;
}
.btn-delete-confirm {
  padding: 10px 24px;
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
.btn-delete-confirm:hover:not(:disabled) {
  background: #c62b36;
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

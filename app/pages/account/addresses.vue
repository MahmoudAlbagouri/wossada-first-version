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
          <h1 class="card-title">العناوين</h1>

          <!-- حالة التحميل -->
          <div v-if="addressStore.loading && !showModal" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل العناوين...</p>
          </div>

          <!-- رسالة الخطأ -->
          <div v-else-if="addressStore.error" class="error-state">
            <p>{{ addressStore.error }}</p>
            <button class="btn edit-btn" @click="addressStore.fetchAddresses()">
              إعادة المحاولة
            </button>
          </div>

          <div v-else class="addresses-list">
            <!-- بطاقة كل عنوان -->
            <div
              v-for="address in addressStore.addresses"
              :key="address.id"
              class="address-card"
              :class="{ 'is-default': address.isDefault }"
            >
              <div class="address-header">
                <span class="address-type">{{ address.addressName }}</span>
                <span v-if="address.isDefault" class="default-badge">
                  الافتراضي
                </span>
              </div>

              <div class="address-details">
                <div class="address-row">
                  <span class="label">الاسم:</span>
                  <span class="value">{{ address.fullName }}</span>
                </div>
                <div class="address-row">
                  <span class="label">الجوال:</span>
                  <span class="value">{{ address.phoneNumber }}</span>
                </div>
                <div class="address-row">
                  <span class="label">العنوان:</span>
                  <span class="value">{{ address.streetAddress }}</span>
                </div>
                <div v-if="address.landmark" class="address-row">
                  <span class="label">العلامة:</span>
                  <span class="value">{{ address.landmark }}</span>
                </div>
                <div class="address-row">
                  <span class="label">المدينة:</span>
                  <span class="value">
                    {{ address.city?.nameAr }} -
                    {{ address.city?.governorate?.nameAr }}
                  </span>
                </div>
              </div>

              <div class="address-actions">
                <button class="btn edit-btn" @click="openEditModal(address)">
                  <svg
                    width="16"
                    height="16"
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
                  <span>تعديل</span>
                </button>
                <button
                  class="btn delete-btn"
                  @click="confirmDelete(address.id)"
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
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- زر إضافة عنوان جديد -->
            <div class="add-address-card" @click="openAddModal">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>اضف عنوان جديد</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ===== Modal إضافة / تعديل ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? "تعديل العنوان" : "إضافة عنوان جديد" }}
            </h2>
            <button class="modal-close" @click="closeModal">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitForm">
            <!-- اسم العنوان -->
            <div class="form-group">
              <label class="form-label">اسم العنوان</label>
              <input
                v-model="form.addressName"
                type="text"
                class="form-input"
                placeholder="مثال: المنزل، المكتب..."
                required
              />
            </div>

            <!-- الاسم الكامل -->
            <div class="form-group">
              <label class="form-label">الاسم الكامل</label>
              <input
                v-model="form.fullName"
                type="text"
                class="form-input"
                placeholder="اكتب اسمك الكامل"
                required
              />
            </div>

            <!-- رقم الهاتف -->
            <div class="form-group">
              <label class="form-label">رقم الهاتف</label>
              <input
                v-model="form.phoneNumber"
                type="tel"
                class="form-input"
                placeholder="01xxxxxxxxx"
                required
              />
            </div>

            <!-- المحافظة -->
            <div class="form-group">
              <label class="form-label">المحافظة</label>
              <select
                v-model="selectedGovernorateId"
                class="form-input"
                :disabled="addressStore.loadingGov"
                required
                @change="form.cityId = ''"
              >
                <option value="" disabled>
                  {{
                    addressStore.loadingGov
                      ? "جاري التحميل..."
                      : "اختر المحافظة"
                  }}
                </option>
                <option
                  v-for="gov in addressStore.governorates"
                  :key="gov.id"
                  :value="gov.id"
                >
                  {{ gov.nameAr }}
                </option>
              </select>
            </div>

            <!-- المدينة / الحي -->
            <div class="form-group">
              <label class="form-label">المدينة / الحي</label>
              <select
                v-model="form.cityId"
                class="form-input"
                :disabled="!selectedGovernorateId || addressStore.loadingCities"
                required
              >
                <option value="" disabled>
                  {{
                    !selectedGovernorateId
                      ? "اختر المحافظة أولاً"
                      : addressStore.loadingCities
                        ? "جاري التحميل..."
                        : "اختر المدينة"
                  }}
                </option>
                <option
                  v-for="city in filteredCities"
                  :key="city.id"
                  :value="city.id"
                >
                  {{ city.nameAr }}
                </option>
              </select>
            </div>

            <!-- الشارع -->
            <div class="form-group">
              <label class="form-label">العنوان التفصيلي</label>
              <input
                v-model="form.streetAddress"
                type="text"
                class="form-input"
                placeholder="الشارع، رقم المبنى، الطابق..."
                required
              />
            </div>

            <!-- العلامة المميزة -->
            <div class="form-group">
              <label class="form-label"
                >علامة مميزة <span class="optional">(اختياري)</span></label
              >
              <input
                v-model="form.landmark"
                type="text"
                class="form-input"
                placeholder="بجوار... أمام..."
              />
            </div>

            <!-- الافتراضي -->
            <div class="form-group form-check">
              <label class="check-label">
                <input
                  v-model="form.isDefault"
                  type="checkbox"
                  class="check-input"
                />
                <span class="check-text">تعيين كعنوان افتراضي</span>
              </label>
            </div>

            <!-- أزرار الحفظ -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                إلغاء
              </button>
              <button
                type="submit"
                class="btn-save"
                :disabled="addressStore.loading"
              >
                <span v-if="addressStore.loading" class="btn-spinner"></span>
                {{ isEditing ? "حفظ التعديلات" : "إضافة العنوان" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ===== تأكيد الحذف ===== -->
    <Teleport to="body">
      <div
        v-if="deleteConfirmId"
        class="modal-overlay"
        @click.self="deleteConfirmId = null"
      >
        <div class="confirm-box">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e53e3e"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#e53e3e" />
          </svg>
          <h3 class="confirm-title">حذف العنوان</h3>
          <p class="confirm-text">
            هل أنت متأكد من حذف هذا العنوان؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="deleteConfirmId = null">
              إلغاء
            </button>
            <button class="btn-delete-confirm" @click="handleDelete">
              حذف
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import { useAddressStore } from "@/stores/address.js";

const addressStore = useAddressStore();

// ===== حالة الـ Modal =====
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const deleteConfirmId = ref(null);
const selectedGovernorateId = ref("");

const emptyForm = {
  addressName: "",
  fullName: "",
  phoneNumber: "",
  streetAddress: "",
  landmark: "",
  cityId: "",
  isDefault: false,
};

const form = reactive({ ...emptyForm });

// ===== مدن المحافظة المختارة =====
const filteredCities = computed(() =>
  selectedGovernorateId.value
    ? addressStore.citiesByGovernorate(selectedGovernorateId.value)
    : [],
);

// ===== فتح modal الإضافة =====
const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  selectedGovernorateId.value = "";
  Object.assign(form, emptyForm);
  showModal.value = true;
};

// ===== فتح modal التعديل =====
const openEditModal = (address) => {
  isEditing.value = true;
  editingId.value = address.id;

  // تعيين المحافظة أولاً ثم المدينة
  selectedGovernorateId.value = address.city?.governorate?.id || "";

  Object.assign(form, {
    addressName: address.addressName,
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    streetAddress: address.streetAddress,
    landmark: address.landmark || "",
    cityId: address.city?.id || "",
    isDefault: address.isDefault,
  });

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// ===== إرسال الفورم =====
const submitForm = async () => {
  const payload = {
    addressName: form.addressName,
    fullName: form.fullName,
    phoneNumber: form.phoneNumber,
    streetAddress: form.streetAddress,
    landmark: form.landmark || undefined,
    cityId: form.cityId,
    isDefault: form.isDefault,
  };

  let result;
  if (isEditing.value) {
    result = await addressStore.updateAddress(editingId.value, payload);
  } else {
    result = await addressStore.createAddress(payload);
  }

  if (result.success) {
    closeModal();
  }
};

// ===== حذف =====
const confirmDelete = (id) => {
  deleteConfirmId.value = id;
};

const handleDelete = async () => {
  if (!deleteConfirmId.value) return;
  await addressStore.deleteAddress(deleteConfirmId.value);
  deleteConfirmId.value = null;
};

// ===== تحميل البيانات عند فتح الصفحة =====
onMounted(async () => {
  await Promise.all([
    addressStore.fetchAddresses(),
    addressStore.fetchGovernorates(),
    addressStore.fetchCities(),
  ]);
});
</script>

<style scoped>
.account-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-body);
  padding: 20px;
  gap: 24px;
  padding-top: 50px;
  direction: rtl;
}

@media (max-width: 768px) {
  .account-layout {
    flex-direction: column;
  }
}

.main-content {
  flex: 1;
}

/* ====== بطاقة الصفحة ====== */
.account-card {
  background: var(--color-green-white, #fdfdfb);
  border-radius: 16px;
  box-shadow: var(--shadow-3, 0px 5px 10px #00000033);
  padding: 60px 40px 40px;
  position: relative;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-green-primary, #987226);
  text-align: center;
  position: absolute;
  top: -20px;
  background: var(--color-green-light, #f5f1e9);
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 12px;
  padding: 8px 0;
}

/* ====== حالة التحميل ====== */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 0;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0ead8;
  border-top-color: var(--color-green-primary, #987226);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ====== قائمة العناوين ====== */
.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-card {
  background: var(--color-green-white, #fdfdfb);
  border: 1.5px solid var(--border-color, #eee);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-1, 0px 2px 4px #00000033);
  transition: border-color 0.2s;
}

.address-card.is-default {
  border-color: var(--color-green-primary, #987226);
  background: #fdf9f0;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.address-type {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-green-primary, #987226);
}

.default-badge {
  font-size: 12px;
  font-weight: 600;
  background: var(--color-green-primary, #987226);
  color: #fff;
  padding: 3px 10px;
  border-radius: 20px;
}

.address-details {
  margin-bottom: 16px;
}

.address-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-main, #1a1a1a);
}

.label {
  color: var(--text-muted, #666);
  font-weight: 500;
  white-space: nowrap;
}

.value {
  font-weight: 600;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: "Cairo", sans-serif;
  transition: all 0.2s;
}

.edit-btn {
  background: var(--color-green-light, #f5f1e9);
  color: var(--color-green-primary, #987226);
  border: 1px solid var(--color-green-light-active, #dfd3bc);
}
.edit-btn:hover {
  background: var(--color-green-light-hover, #f0eade);
}

.delete-btn {
  background: #fde8e8;
  color: #c53030;
  border: 1px solid #fbb4b4;
}
.delete-btn:hover {
  background: #fdd5d5;
}

/* ====== بطاقة الإضافة ====== */
.add-address-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 160px;
  background: var(--color-green-white, #fdfdfb);
  border: 2px dashed #c8b98a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #aaa;
}

.add-address-card:hover {
  background: var(--color-green-light, #f5f1e9);
  border-color: var(--color-green-primary, #987226);
  color: var(--color-green-primary, #987226);
}

.add-address-card span {
  font-size: 16px;
  font-weight: 600;
}

/* ====== Modal ====== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  direction: rtl;
}

.modal-box {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1.5px solid #f0ece2;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-green-primary, #987226);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #333;
}

.modal-form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}

.optional {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #333;
  background: #faf8f3;
  outline: none;
  text-align: right;
  transition: border-color 0.2s;
  appearance: none;
}

.form-input:focus {
  border-color: var(--color-green-primary, #987226);
}
.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Checkbox */
.form-check {
  display: flex;
  align-items: center;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.check-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-green-primary, #987226);
  cursor: pointer;
}

/* أزرار الفورم */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #eee;
}

.btn-save {
  flex: 2;
  padding: 12px;
  background: var(--color-green-primary, #987226);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.btn-save:hover {
  background: var(--color-green-hover, #896722);
}
.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ====== Confirm Box ====== */
.confirm-box {
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 14px 0 8px;
}

.confirm-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-delete-confirm {
  flex: 1;
  padding: 12px;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-delete-confirm:hover {
  background: #c53030;
}
</style>

<template>
  <div class="account-layout">
    <aside class="sidebar">
      <AccountSidebar />
    </aside>

    <main class="main-content">
      <div class="account-card">
        <h1 class="card-title">
          <Icon name="ph:map-pin" class="title-icon" />
          العناوين
        </h1>

        <!-- تحميل -->
        <div v-if="addressStore.loading && !showModal" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل العناوين...</p>
        </div>

        <!-- خطأ -->
        <div v-else-if="addressStore.error" class="error-state">
          <Icon name="ph:warning-circle" class="error-state-icon" />
          <p>{{ addressStore.error }}</p>
          <button class="retry-btn" @click="addressStore.fetchAddresses()">
            <Icon name="ph:arrow-clockwise" /> إعادة المحاولة
          </button>
        </div>

        <!-- العناوين -->
        <div v-else class="addresses-list">
          <TransitionGroup name="addr-anim" tag="div" class="addr-group">
            <div
              v-for="(address, idx) in addressStore.addresses"
              :key="address.id"
              class="address-card"
              :class="{ 'is-default': address.isDefault }"
              :style="{ animationDelay: `${idx * 60}ms` }"
            >
              <!-- هيدر ── -->
              <div class="address-header">
                <div class="addr-type-wrap">
                  <span class="addr-icon-wrap">
                    <Icon name="ph:map-pin-fill" class="addr-icon" />
                  </span>
                  <span class="addr-type">{{ address.addressName }}</span>
                </div>
                <span v-if="address.isDefault" class="default-badge">
                  <Icon name="ph:star-fill" class="badge-star" />
                  الافتراضي
                </span>
              </div>

              <!-- التفاصيل ── -->
              <div class="address-details">
                <div class="addr-row">
                  <span class="addr-label"
                    ><Icon name="ph:user" class="row-icon" /> الاسم</span
                  >
                  <span class="addr-value">{{ address.fullName }}</span>
                </div>
                <div class="addr-row">
                  <span class="addr-label"
                    ><Icon name="ph:phone" class="row-icon" /> الجوال</span
                  >
                  <span class="addr-value">{{ address.phoneNumber }}</span>
                </div>
                <div class="addr-row">
                  <span class="addr-label"
                    ><Icon name="ph:road-horizon" class="row-icon" />
                    العنوان</span
                  >
                  <span class="addr-value">{{ address.streetAddress }}</span>
                </div>
                <div v-if="address.landmark" class="addr-row">
                  <span class="addr-label"
                    ><Icon name="ph:flag" class="row-icon" /> العلامة</span
                  >
                  <span class="addr-value">{{ address.landmark }}</span>
                </div>
                <div class="addr-row">
                  <span class="addr-label"
                    ><Icon name="ph:city" class="row-icon" /> المدينة</span
                  >
                  <span class="addr-value"
                    >{{ address.city?.nameAr }} —
                    {{ address.city?.governorate?.nameAr }}</span
                  >
                </div>
              </div>

              <!-- أزرار ── -->
              <div class="address-actions">
                <button class="addr-btn edit" @click="openEditModal(address)">
                  <Icon name="ph:pencil-simple" />
                  تعديل
                </button>
                <button
                  class="addr-btn delete"
                  @click="confirmDelete(address.id)"
                >
                  <Icon name="ph:trash-simple" />
                  حذف
                </button>
              </div>
            </div>
          </TransitionGroup>

          <!-- بطاقة الإضافة -->
          <button class="add-card" @click="openAddModal">
            <div class="add-card-inner">
              <span class="add-circle">
                <Icon name="ph:plus" class="add-icon" />
              </span>
              <span class="add-label">إضافة عنوان جديد</span>
            </div>
          </button>
        </div>
      </div>
    </main>

    <!-- ══ Modal الإضافة / التعديل ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h2 class="modal-title">
                <Icon
                  :name="isEditing ? 'ph:pencil-simple' : 'ph:map-pin-plus'"
                  class="modal-title-icon"
                />
                {{ isEditing ? "تعديل العنوان" : "إضافة عنوان جديد" }}
              </h2>
              <button
                class="modal-close"
                @click="closeModal"
                aria-label="إغلاق"
              >
                <Icon name="ph:x" />
              </button>
            </div>

            <form class="modal-form" @submit.prevent="submitForm">
              <div class="modal-grid">
                <div class="form-group">
                  <label class="form-label">اسم العنوان</label>
                  <input
                    v-model="form.addressName"
                    class="form-input"
                    placeholder="مثال: المنزل، المكتب..."
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">الاسم الكامل</label>
                  <input
                    v-model="form.fullName"
                    class="form-input"
                    placeholder="اكتب اسمك الكامل"
                    required
                  />
                </div>
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
                <div class="form-group">
                  <label class="form-label">المدينة / الحي</label>
                  <select
                    v-model="form.cityId"
                    class="form-input"
                    :disabled="
                      !selectedGovernorateId || addressStore.loadingCities
                    "
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
                <div class="form-group full-span">
                  <label class="form-label">العنوان التفصيلي</label>
                  <input
                    v-model="form.streetAddress"
                    class="form-input"
                    placeholder="الشارع، رقم المبنى، الطابق..."
                    required
                  />
                </div>
                <div class="form-group full-span">
                  <label class="form-label"
                    >علامة مميزة <span class="optional">(اختياري)</span></label
                  >
                  <input
                    v-model="form.landmark"
                    class="form-input"
                    placeholder="بجوار... أمام..."
                  />
                </div>
              </div>

              <label class="check-label">
                <div class="check-box" :class="{ checked: form.isDefault }">
                  <Transition name="check-anim">
                    <Icon
                      v-if="form.isDefault"
                      name="ph:check-bold"
                      class="check-icon"
                    />
                  </Transition>
                  <input
                    v-model="form.isDefault"
                    type="checkbox"
                    class="check-hidden"
                  />
                </div>
                <span>تعيين كعنوان افتراضي</span>
              </label>

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
                  <Icon
                    v-else
                    :name="isEditing ? 'ph:floppy-disk' : 'ph:plus-circle'"
                  />
                  {{ isEditing ? "حفظ التعديلات" : "إضافة العنوان" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ تأكيد الحذف ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="deleteConfirmId"
          class="modal-overlay"
          @click.self="deleteConfirmId = null"
        >
          <div class="confirm-box">
            <div class="confirm-icon-wrap">
              <Icon name="ph:trash-simple" class="confirm-icon" />
            </div>
            <h3 class="confirm-title">حذف العنوان</h3>
            <p class="confirm-text">
              هل أنت متأكد من حذف هذا العنوان؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="deleteConfirmId = null">
                إلغاء
              </button>
              <button class="btn-delete-confirm" @click="handleDelete">
                <Icon name="ph:trash-simple" />
                حذف
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";
import { useAddressStore } from "@/stores/address.js";

const addressStore = useAddressStore();
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

const filteredCities = computed(() =>
  selectedGovernorateId.value
    ? addressStore.citiesByGovernorate(selectedGovernorateId.value)
    : [],
);

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  selectedGovernorateId.value = "";
  Object.assign(form, emptyForm);
  showModal.value = true;
};

const openEditModal = (address) => {
  isEditing.value = true;
  editingId.value = address.id;
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
  const result = isEditing.value
    ? await addressStore.updateAddress(editingId.value, payload)
    : await addressStore.createAddress(payload);
  if (result.success) closeModal();
};

const confirmDelete = (id) => {
  deleteConfirmId.value = id;
};
const handleDelete = async () => {
  if (!deleteConfirmId.value) return;
  await addressStore.deleteAddress(deleteConfirmId.value);
  deleteConfirmId.value = null;
};

onMounted(async () => {
  await Promise.all([
    addressStore.fetchAddresses(),
    addressStore.fetchGovernorates(),
    addressStore.fetchCities(),
  ]);
});
</script>

<style scoped lang="scss">
.account-layout {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  // background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 60%, #f5faf7 100%);
  padding: 32px 20px 40px;
  gap: 24px;
  direction: rtl;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px 12px 32px;
  }
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
  }
}
.main-content {
  flex: 1;
  min-width: 0;
}

.account-card {
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 24px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 16px 50px rgba(0, 0, 0, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 72px 36px 40px;
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (max-width: 600px) {
    padding: 68px 16px 28px;
    border-radius: 18px;
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-title {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  font-size: 19px;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  background: linear-gradient(
    135deg,
    var(--color-green-primary),
    var(--color-green-hover)
  );
  border-radius: 50px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  .title-icon {
    font-size: 20px;
  }
}

/* ── Loading / Error ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--text-muted);
  font-size: 14px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.15);
  border-top-color: var(--color-green-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #dc2626;
  .error-state-icon {
    font-size: 40px;
    opacity: 0.5;
  }
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(239, 68, 68, 0.12);
  }
}

/* ── Grid العناوين ── */
.addr-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.address-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.25s;
  animation: addrIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  &.is-default {
    border-color: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.25);
    background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.03);
  }
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
    transform: translateY(-2px);
  }
}

@keyframes addrIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.addr-anim-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.addr-anim-leave-active {
  transition: all 0.25s ease;
}
.addr-anim-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.addr-anim-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.address-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.addr-type-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.addr-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.1);
}
.addr-icon {
  font-size: 16px;
  color: var(--color-green-primary);
}

.addr-type {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.default-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(
    135deg,
    var(--color-green-primary),
    var(--color-green-hover)
  );
  color: white;
  padding: 3px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  .badge-star {
    font-size: 10px;
  }
}

.address-details {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.addr-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  direction: rtl;
}
.addr-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 68px;
  flex-shrink: 0;
  .row-icon {
    font-size: 13px;
  }
}
.addr-value {
  color: var(--text-main);
  font-weight: 600;
  flex: 1;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.addr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &.edit {
    background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.08);
    color: var(--color-green-primary);
    border: 1px solid rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.15);
    &:hover {
      background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.14);
    }
  }
  &.delete {
    background: rgba(239, 68, 68, 0.07);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.15);
    &:hover {
      background: rgba(239, 68, 68, 0.12);
    }
  }
}

/* ── بطاقة الإضافة ── */
.add-card {
  background: transparent;
  border: 2px dashed rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.25);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color: var(--color-green-primary);
    background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.04);
  }
  &:hover .add-circle {
    background: linear-gradient(
      135deg,
      var(--color-green-primary),
      var(--color-green-hover)
    );
  }
  &:hover .add-circle .add-icon {
    color: white;
  }
  &:hover .add-label {
    color: var(--color-green-primary);
  }
}

.add-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.add-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
}
.add-icon {
  font-size: 24px;
  color: var(--color-green-primary);
  transition: color 0.25s;
}
.add-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-muted);
  transition: color 0.25s;
}

/* ══ Modal ══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  direction: rtl;
}

.modal-fade-enter-active {
  animation: overlayIn 0.3s ease;
}
.modal-fade-leave-active {
  animation: overlayOut 0.25s ease;
}
@keyframes overlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes overlayOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.modal-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: boxIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes boxIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 800;
  color: var(--color-green-primary);
  .modal-title-icon {
    font-size: 20px;
  }
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 18px;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 0, 0, 0.09);
    color: var(--text-main);
  }
}

.modal-form {
  padding: 20px 24px 24px;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.full-span {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.optional {
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
}

.form-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  direction: rtl;
  transition: border-color 0.2s;
  appearance: none;
  &:focus {
    border-color: var(--color-green-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* Checkbox */
.check-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20px;
}
.check-box {
  position: relative;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  background: white;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  &.checked {
    background: linear-gradient(
      135deg,
      var(--color-green-primary),
      var(--color-green-hover)
    );
    border-color: transparent;
    box-shadow: 0 3px 8px rgba(var(--color-green-primary-rgb, 45, 125, 75), 0.3);
  }
}
.check-hidden {
  position: absolute;
  opacity: 0;
  inset: 0;
  cursor: pointer;
}
.check-icon {
  font-size: 13px;
  color: white;
  display: block;
}
.check-anim-enter-active {
  animation: checkBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-anim-leave-active {
  transition: all 0.15s ease;
}
.check-anim-enter-from,
.check-anim-leave-to {
  opacity: 0;
  transform: scale(0);
}
@keyframes checkBounce {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* أزرار الفورم */
.form-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-muted);
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 0, 0, 0.07);
  }
}

.btn-save {
  flex: 2;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(
    135deg,
    var(--color-green-primary),
    var(--color-green-hover)
  );
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.25s;
  &:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ══ Confirm Box ══ */
.confirm-box {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 36px 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: boxIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  margin: 0 auto 20px;
  .confirm-icon {
    font-size: 32px;
    color: #dc2626;
  }
}

.confirm-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 10px;
}
.confirm-text {
  font-size: 14px;
  color: var(--text-muted);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #b91c1c;
  }
}
</style>

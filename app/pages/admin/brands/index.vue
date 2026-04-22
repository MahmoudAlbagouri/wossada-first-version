<template>
  <div class="admin-page" dir="rtl">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الماركات</h1>
        <span class="count-badge" v-if="store.brands.length">
          {{ store.brands.length }} ماركة
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
        إضافة ماركة
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchBrands()">
        إعادة المحاولة
      </button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>الشعار</th>
            <th>الاسم (عربي)</th>
            <th>الاسم (إنجليزي)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="brand in store.brands" :key="brand.id" class="data-row">
            <td>
              <img
                v-if="brand.logo"
                :src="brand.logo"
                :alt="store.getBrandName(brand)"
                class="brand-logo"
                @error="$event.target.src = '/images/placeholder.jpg'"
              />
              <span v-else class="no-logo">—</span>
            </td>
            <td class="name-cell">{{ store.getBrandName(brand, "ar") }}</td>
            <td class="name-cell" dir="ltr">
              {{ store.getBrandName(brand, "en") || "—" }}
            </td>
            <td class="actions-cell">
              <button
                class="action-btn delete-btn"
                title="حذف"
                @click="confirmDelete(brand)"
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
            </td>
          </tr>
          <tr v-if="!store.brands.length">
            <td colspan="4" class="empty-row">لا توجد ماركات بعد</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">إضافة ماركة جديدة</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- الشعار -->
              <fieldset class="form-section">
                <legend>الشعار</legend>
                <div class="form-group">
                  <label class="form-label">صورة الشعار *</label>
                  <ImageUploader v-model="form.logo" folder="categories" />
                </div>
              </fieldset>

              <!-- الترجمات -->
              <fieldset class="form-section">
                <legend>الترجمات</legend>
                <div class="lang-block">
                  <h4 class="lang-title">🇪🇬 عربي</h4>
                  <div class="form-group">
                    <label class="form-label">الاسم *</label>
                    <input
                      v-model="form.translations[0].name"
                      type="text"
                      class="form-input"
                      required
                      placeholder="مثال: وسادة"
                    />
                  </div>
                </div>
                <div class="lang-block">
                  <h4 class="lang-title">🇺🇸 English</h4>
                  <div class="form-group">
                    <label class="form-label">Name</label>
                    <input
                      v-model="form.translations[1].name"
                      type="text"
                      class="form-input"
                      dir="ltr"
                      placeholder="e.g. Wessada"
                    />
                  </div>
                </div>
              </fieldset>

              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="submitting">
                  {{ submitting ? "جارٍ الحفظ..." : "حفظ الماركة" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
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
              هل أنت متأكد من حذف الماركة
              <strong>{{
                itemToDelete ? store.getBrandName(itemToDelete) : ""
              }}</strong
              >؟ <br /><small>لا يمكن التراجع عن هذا الإجراء.</small>
            </p>
            <div v-if="itemToDelete?.logo" class="delete-preview">
              <img
                :src="itemToDelete.logo"
                class="brand-logo"
                @error="$event.target.src = '/images/placeholder.jpg'"
              />
            </div>
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
              {{ deleting ? "جارٍ الحذف..." : "نعم، احذف" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
const store = useBrandsStore();
onMounted(() => store.fetchBrands());

const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ── Create Modal ──
const showModal = ref(false);
const submitting = ref(false);
const defaultForm = () => ({
  logo: "",
  translations: [
    { languageCode: "ar", name: "" },
    { languageCode: "en", name: "" },
  ],
});
const form = ref(defaultForm());
const openCreateModal = () => {
  form.value = defaultForm();
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};
const submitForm = async () => {
  if (!form.value.translations[0].name.trim()) {
    showToast("يرجى إدخال الاسم بالعربي", "error");
    return;
  }
  if (!form.value.logo) {
    showToast("يرجى رفع شعار الماركة", "error");
    return;
  }
  submitting.value = true;
  const payload = {
    logo: form.value.logo,
    translations: form.value.translations.filter((t) => t.name.trim()),
  };
  const result = await store.createBrand(payload);
  submitting.value = false;
  if (result.success) {
    showToast("تم إضافة الماركة بنجاح");
    closeModal();
  } else showToast(result.error || "فشل إنشاء الماركة", "error");
};

// ── Delete Modal ──
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const confirmDelete = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};
const executeDelete = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  const result = await store.deleteBrand(itemToDelete.value.id);
  deleting.value = false;
  showDeleteModal.value = false;
  itemToDelete.value = null;
  if (result.success) showToast("تم حذف الماركة بنجاح");
  else showToast(result.error || "فشل حذف الماركة", "error");
};
</script>

<style scoped>
@import url("../../../assets/css/admin-shared.css");

.brand-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e3ef;
  background: #f9fafb;
  padding: 4px;
}
.no-logo {
  color: #bbb;
}
.delete-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 12px;
}
</style>

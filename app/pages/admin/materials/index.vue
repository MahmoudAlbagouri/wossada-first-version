<template>
  <div class="admin-page" dir="rtl">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الخامات</h1>
        <span class="count-badge" v-if="store.materials.length">
          {{ store.materials.length }} خامة
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
        إضافة خامة
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchMaterials()">
        إعادة المحاولة
      </button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>الاسم (عربي)</th>
            <th>الاسم (إنجليزي)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="material in store.materials"
            :key="material.id"
            class="data-row"
          >
            <td class="name-cell">
              {{ store.getMaterialName(material, "ar") }}
            </td>
            <td class="name-cell" dir="ltr">
              {{ store.getMaterialName(material, "en") || "—" }}
            </td>
            <td class="actions-cell">
              <button
                class="action-btn delete-btn"
                title="حذف"
                @click="confirmDelete(material)"
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
          <tr v-if="!store.materials.length">
            <td colspan="3" class="empty-row">لا توجد خامات بعد</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">إضافة خامة جديدة</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
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
                      placeholder="مثال: خشب زان"
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
                      placeholder="e.g. beech wood"
                    />
                  </div>
                </div>
              </fieldset>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="submitting">
                  {{ submitting ? "جارٍ الحفظ..." : "حفظ الخامة" }}
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
              هل أنت متأكد من حذف الخامة
              <strong>{{
                itemToDelete ? store.getMaterialName(itemToDelete) : ""
              }}</strong
              >؟ <br /><small>لا يمكن التراجع عن هذا الإجراء.</small>
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
const store = useMaterialsStore();
onMounted(() => store.fetchMaterials());

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
  submitting.value = true;
  const payload = {
    translations: form.value.translations.filter((t) => t.name.trim()),
  };
  const result = await store.createMaterial(payload);
  submitting.value = false;
  if (result.success) {
    showToast("تم إضافة الخامة بنجاح");
    closeModal();
  } else showToast(result.error || "فشل إنشاء الخامة", "error");
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
  const result = await store.deleteMaterial(itemToDelete.value.id);
  deleting.value = false;
  showDeleteModal.value = false;
  itemToDelete.value = null;
  if (result.success) showToast("تم حذف الخامة بنجاح");
  else showToast(result.error || "فشل حذف الخامة", "error");
};
</script>

<style scoped>
@import url("../../../assets/css/admin-shared.css");
</style>

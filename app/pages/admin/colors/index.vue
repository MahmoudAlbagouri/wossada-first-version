<template>
  <div class="colors-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الألوان</h1>
        <span class="colors-count" v-if="store.colors.length">
          {{ store.colors.length }} لون
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
        إضافة لون
      </button>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 8" :key="i" class="skeleton-card"></div>
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchColors()">
        إعادة المحاولة
      </button>
    </div>

    <!-- ===== Colors Table ===== -->
    <div v-else class="table-wrapper">
      <table class="colors-table">
        <thead>
          <tr>
            <th>المعاينة</th>
            <th>الكود اللوني</th>
            <th>الاسم (عربي)</th>
            <th>الاسم (إنجليزي)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in store.colors" :key="color.id" class="color-row">
            <!-- معاينة اللون -->
            <td>
              <div class="color-preview-cell">
                <span
                  class="color-swatch"
                  :style="{ background: color.hexCode }"
                ></span>
              </div>
            </td>
            <!-- الكود اللوني -->
            <td>
              <span class="hex-badge" dir="ltr">{{ color.hexCode }}</span>
            </td>
            <!-- الاسم عربي -->
            <td class="name-cell">
              {{ store.getColorName(color, "ar") }}
            </td>
            <!-- الاسم إنجليزي -->
            <td class="name-cell" dir="ltr">
              {{ store.getColorName(color, "en") || "—" }}
            </td>
            <!-- الإجراءات -->
            <td class="actions-cell">
              <div class="actions-row">
                <button
                  class="action-btn delete-btn"
                  title="حذف"
                  @click="confirmDelete(color)"
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
          <tr v-if="!store.colors.length">
            <td colspan="5" class="empty-row">لا توجد ألوان بعد</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== Create Modal ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">إضافة لون جديد</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- ===== الكود اللوني ===== -->
              <fieldset class="form-section">
                <legend>الكود اللوني</legend>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">اختر اللون *</label>
                    <div class="color-input-wrapper">
                      <input
                        v-model="form.hexCode"
                        type="color"
                        class="color-picker"
                        @input="syncHexInput"
                      />
                      <input
                        v-model="hexInputText"
                        type="text"
                        class="form-input hex-text-input"
                        dir="ltr"
                        placeholder="#000000"
                        @input="syncColorPicker"
                        maxlength="7"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">معاينة</label>
                    <div
                      class="color-preview-box"
                      :style="{ background: form.hexCode }"
                    ></div>
                  </div>
                </div>
              </fieldset>

              <!-- ===== الترجمات ===== -->
              <fieldset class="form-section">
                <legend>الترجمات</legend>

                <!-- عربي -->
                <div class="lang-block">
                  <h4 class="lang-title">🇪🇬 عربي</h4>
                  <div class="form-group">
                    <label class="form-label">اسم اللون *</label>
                    <input
                      v-model="form.translations[0].name"
                      type="text"
                      class="form-input"
                      required
                      placeholder="مثال: أحمر"
                    />
                  </div>
                </div>

                <!-- إنجليزي -->
                <div class="lang-block">
                  <h4 class="lang-title">🇺🇸 English</h4>
                  <div class="form-group">
                    <label class="form-label">Color Name</label>
                    <input
                      v-model="form.translations[1].name"
                      type="text"
                      class="form-input"
                      dir="ltr"
                      placeholder="e.g. Red"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- ===== أزرار الحفظ ===== -->
              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="submitting">
                  <span v-if="submitting">جارٍ الحفظ...</span>
                  <span v-else>حفظ اللون</span>
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
              هل أنت متأكد من حذف اللون
              <strong>{{
                colorToDelete ? store.getColorName(colorToDelete) : ""
              }}</strong
              >؟
              <br />
              <small>لا يمكن التراجع عن هذا الإجراء.</small>
            </p>
            <div class="delete-preview" v-if="colorToDelete">
              <span
                class="color-swatch color-swatch--lg"
                :style="{ background: colorToDelete.hexCode }"
              ></span>
              <span class="hex-badge" dir="ltr">{{
                colorToDelete.hexCode
              }}</span>
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
// ✅ لا يوجد layout "admin" في المشروع — يُستخدم default تلقائياً

const store = useColorsStore();

// ── جلب الألوان عند التحميل ──
onMounted(() => store.fetchColors());

// ── Toast ──
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ── Modal الإنشاء ──
const showModal = ref(false);
const submitting = ref(false);

const defaultForm = () => ({
  hexCode: "#000000",
  translations: [
    { languageCode: "ar", name: "" },
    { languageCode: "en", name: "" },
  ],
});

const form = ref(defaultForm());
const hexInputText = ref("#000000");

const syncHexInput = () => {
  hexInputText.value = form.value.hexCode;
};

const syncColorPicker = () => {
  const val = hexInputText.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    form.value.hexCode = val;
  }
};

const openCreateModal = () => {
  form.value = defaultForm();
  hexInputText.value = "#000000";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitForm = async () => {
  if (!form.value.translations[0].name.trim()) {
    showToast("يرجى إدخال اسم اللون بالعربي", "error");
    return;
  }

  submitting.value = true;
  const payload = {
    hexCode: form.value.hexCode,
    translations: form.value.translations.filter((t) => t.name.trim()),
  };

  const result = await store.createColor(payload);
  submitting.value = false;

  if (result.success) {
    showToast("تم إضافة اللون بنجاح");
    closeModal();
  } else {
    showToast(result.error || "فشل إنشاء اللون", "error");
  }
};

// ── Modal الحذف ──
const showDeleteModal = ref(false);
const colorToDelete = ref(null);
const deleting = ref(false);

const confirmDelete = (color) => {
  colorToDelete.value = color;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!colorToDelete.value) return;
  deleting.value = true;
  const result = await store.deleteColor(colorToDelete.value.id);
  deleting.value = false;
  showDeleteModal.value = false;
  colorToDelete.value = null;

  if (result.success) {
    showToast("تم حذف اللون بنجاح");
  } else {
    showToast(result.error || "فشل حذف اللون", "error");
  }
};
</script>

<style scoped>
/* ===== Layout ===== */
.colors-page {
  padding: 24px;
  min-height: 100vh;
  background: #f8f9fb;
  font-family: "Cairo", "Segoe UI", sans-serif;
}

/* ===== Header ===== */
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
.colors-count {
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

/* ===== Skeleton ===== */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 60px;
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

/* ===== Error ===== */
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
  overflow: hidden;
}
.colors-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.colors-table thead th {
  background: #f4f6fb;
  padding: 14px 16px;
  text-align: right;
  font-weight: 700;
  color: #555;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  border-bottom: 1px solid #e8eaf0;
}
.color-row {
  transition: background 0.15s;
}
.color-row:hover {
  background: #f9fafb;
}
.colors-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f8;
  color: #2d2d4e;
  vertical-align: middle;
}
.color-preview-cell {
  display: flex;
  justify-content: center;
}
.color-swatch {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}
.color-swatch--lg {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}
.hex-badge {
  display: inline-block;
  background: #f4f6fb;
  border: 1px solid #e0e3ef;
  border-radius: 6px;
  padding: 3px 10px;
  font-family: monospace;
  font-size: 0.9rem;
  color: #444;
  letter-spacing: 0.05em;
}
.name-cell {
  font-weight: 500;
}
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
  font-size: 0.95rem;
}

/* ===== Actions ===== */
.actions-cell {
  width: 80px;
}
.actions-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-btn {
  width: 34px;
  height: 34px;
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

/* ===== Modal Overlay ===== */
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
  transition: background 0.15s;
}
.modal-close:hover {
  background: #e0e3ef;
}
.modal-body {
  padding: 20px 24px;
}

/* ===== Form Sections ===== */
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
.form-group:last-child {
  margin-bottom: 0;
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

/* ===== Color Input ===== */
.color-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}
.color-picker {
  width: 48px;
  height: 40px;
  border: 1.5px solid #e0e3ef;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  background: #fff;
  flex-shrink: 0;
}
.hex-text-input {
  flex: 1;
  font-family: monospace;
  letter-spacing: 0.05em;
}
.color-preview-box {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ===== Lang Blocks ===== */
.lang-block {
  padding: 14px;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  background: #fff;
  margin-bottom: 12px;
}
.lang-block:last-child {
  margin-bottom: 0;
}
.lang-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2d2d4e;
  margin: 0 0 10px;
}

/* ===== Modal Footer ===== */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 4px;
  margin-top: 4px;
}
.btn-cancel {
  padding: 10px 22px;
  border: 1.5px solid #e0e3ef;
  background: #fff;
  color: #555;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.15s;
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
  font-size: 0.92rem;
  font-weight: 700;
  transition: background 0.15s;
}
.btn-save:hover:not(:disabled) {
  background: #3451d1;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Delete Confirm ===== */
.delete-confirm-text {
  color: #444;
  line-height: 1.7;
  margin-bottom: 16px;
  font-size: 0.95rem;
}
.delete-confirm-text small {
  color: #999;
  font-size: 0.82rem;
}
.delete-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
}
.btn-delete-confirm {
  padding: 10px 24px;
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 700;
  transition: background 0.15s;
}
.btn-delete-confirm:hover:not(:disabled) {
  background: #c62b36;
}
.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Toast ===== */
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

<template>
  <div class="home-manager-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة محتوى الصفحة الرئيسية</h1>
        <span class="header-badge">ترتيب وعرض الأقسام</span>
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
        إضافة قسم جديد
      </button>
    </div>

    <!-- ===== Loading State ===== -->
    <div v-if="store.loading" class="loading-container">
      <div class="spinner"></div>
      <p>جاري تحميل هيكل الصفحة...</p>
    </div>

    <!-- ===== Empty State ===== -->
    <div v-else-if="!store.sections.length" class="empty-state">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ccc"
        stroke-width="1"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <p>لا توجد أقسام مضافة للصفحة الرئيسية بعد</p>
      <button class="btn-primary-sm" @click="openCreateModal">
        ابدأ بإضافة قسم
      </button>
    </div>

    <!-- ===== Sections List (Sortable) ===== -->
    <div v-else class="sections-list">
      <div
        v-for="(section, index) in store.sections"
        :key="section.id"
        class="section-card"
        :class="{ inactive: !section.isActive }"
      >
        <!-- Drag Handle & Order -->
        <div class="card-handle">
          <div class="order-badge">{{ index + 1 }}</div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            stroke-width="2"
            class="drag-icon"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        <!-- Content Preview -->
        <div class="card-content">
          <div class="content-header">
            <span class="type-badge" :class="getTypeClass(section.type)">
              {{ getTypeLabel(section.type) }}
            </span>
            <span class="section-key" dir="ltr">{{ section.section_key }}</span>
          </div>

          <div class="preview-area">
            <!-- Preview based on Type -->
            <div v-if="section.type === 'mainSlider'" class="preview-slider">
              <div v-if="section.data?.[0]?.items?.length" class="slides-track">
                <img
                  v-for="item in section.data[0].items.slice(0, 3)"
                  :key="item.id"
                  :src="item.imageUrl"
                  class="slide-thumb"
                />
              </div>
              <span v-else class="no-data">لا توجد شرائح</span>
            </div>

            <div
              v-else-if="section.type === 'productSlider'"
              class="preview-products"
            >
              <div
                v-if="section.data?.[0]?.products?.length"
                class="products-track"
              >
                <img
                  v-for="prod in section.data[0].products.slice(0, 4)"
                  :key="prod.id"
                  :src="prod.mainImage"
                  class="prod-thumb"
                />
              </div>
              <span v-else class="no-data">لا توجد منتجات</span>
            </div>

            <div
              v-else-if="
                section.type === 'fixedBanner' || section.type === 'fullImage'
              "
              class="preview-banner"
            >
              <img
                v-if="section.data?.[0]?.imageUrl"
                :src="section.data[0].imageUrl"
                class="banner-thumb"
              />
              <span v-else class="no-data">لا توجد صورة</span>
            </div>

            <div
              v-else-if="section.type === 'CATEGORY_GRID'"
              class="preview-cats"
            >
              <span
                class="cat-chip"
                v-for="cat in section.data?.slice(0, 3)"
                :key="cat.id"
              >
                {{ cat.name }}
              </span>
              <span v-if="section.data?.length > 3" class="more-cats"
                >+{{ section.data.length - 3 }}</span
              >
            </div>

            <div v-else class="preview-static">
              <span>قسم ثابت: {{ section.section_key }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <label class="toggle-switch" title="تفعيل/تعطيل">
            <input
              type="checkbox"
              :checked="section.isActive"
              @change="handleToggleStatus(section)"
            />
            <span class="slider-toggle"></span>
          </label>

          <button
            class="action-btn edit"
            @click="openEditModal(section)"
            title="تعديل"
          >
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
          </button>

          <button
            class="action-btn delete"
            @click="confirmDelete(section)"
            title="حذف"
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
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Create/Edit Modal ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? "تعديل القسم" : "إضافة قسم جديد" }}
            </h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- Type Selection -->
              <div class="form-group">
                <label class="form-label">نوع القسم *</label>
                <select
                  v-model="form.type"
                  class="form-input"
                  :disabled="isEditing"
                  required
                >
                  <option value="" disabled>اختر النوع</option>
                  <option value="mainSlider">سلايدر رئيسي (Main Slider)</option>
                  <option value="productSlider">
                    سلايدر منتجات (Product Slider)
                  </option>
                  <option value="fixedBanner">بنر ثابت (Fixed Banner)</option>
                  <option value="fullImage">بنر كامل (Full Image)</option>
                  <option value="staticSection">
                    قسم ثابت (Static Section)
                  </option>
                  <option value="CATEGORY_GRID">
                    شبكة التصنيفات (Category Grid)
                  </option>
                </select>
                <p class="form-hint" v-if="isEditing">
                  لا يمكن تغيير نوع القسم بعد الإنشاء
                </p>
              </div>

              <!-- Key Selection (Searchable for Sliders/Banners) -->
              <div
                class="form-group"
                v-if="
                  form.type &&
                  form.type !== 'CATEGORY_GRID' &&
                  form.type !== 'staticSection'
                "
              >
                <label class="form-label">
                  {{ getKeyLabel(form.type) }} *
                </label>

                <div style="position: relative">
                  <input
                    v-model="keySearch"
                    type="text"
                    class="form-input"
                    :placeholder="getPlaceholder(form.type)"
                    @input="debouncedKeySearch"
                  />
                  <span v-if="store.keySearchLoading" class="search-loader">
                    <svg
                      class="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#987226"
                      stroke-width="2"
                    >
                      <path
                        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                      />
                    </svg>
                  </span>
                </div>

                <!-- Dropdown Results from Store -->
                <div v-if="store.keySearchResults.length" class="key-dropdown">
                  <div
                    v-for="item in store.keySearchResults"
                    :key="item.key || item.id"
                    class="key-option"
                    :class="{
                      selected: form.section_key === (item.key || item.slug),
                    }"
                    @click="selectKey(item)"
                  >
                    <img
                      v-if="item.mainImage || item.imageUrl"
                      :src="item.mainImage || item.imageUrl"
                      class="opt-img"
                    />
                    <div class="opt-info">
                      <span class="opt-title">{{ getItemTitle(item) }}</span>
                      <span class="opt-key" dir="ltr">{{
                        item.key || item.slug
                      }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="keySearch && !store.keySearchLoading"
                  class="empty-dropdown"
                >
                  لا توجد نتائج
                </div>
              </div>

              <!-- Static Section / Category Grid Key Input -->
              <div class="form-group" v-else>
                <label class="form-label">المعرف (Key/Slug) *</label>
                <input
                  v-model="form.section_key"
                  type="text"
                  class="form-input"
                  required
                  dir="ltr"
                  placeholder="e.g., features or category"
                />
              </div>

              <!-- Order -->
              <div class="form-group">
                <label class="form-label">الترتيب</label>
                <input
                  v-model.number="form.sectionOrder"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>

              <!-- Active Status -->
              <div class="form-check">
                <label class="check-label">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="check-input"
                  />
                  <span>نشط (يظهر في الصفحة الرئيسية)</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button
                  type="submit"
                  class="btn-save"
                  :disabled="store.actionLoading"
                >
                  <span v-if="store.actionLoading" class="btn-spinner"></span>
                  {{ isEditing ? "حفظ التعديلات" : "إضافة القسم" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Delete Confirm ===== -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="modal-overlay"
        @click.self="deleteTarget = null"
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
          <h3 class="confirm-title">حذف القسم</h3>
          <p class="confirm-text">
            هل أنت متأكد من حذف هذا القسم من الصفحة الرئيسية؟ لن يتم حذف
            البيانات الأصلية (مثل السلايدر نفسه).
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="deleteTarget = null">
              إلغاء
            </button>
            <button
              class="btn-delete-confirm"
              :disabled="store.actionLoading"
              @click="handleDelete"
            >
              <span v-if="store.actionLoading" class="btn-spinner dark"></span>
              حذف
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useHomeConfigsStore } from "@/stores/homeConfigs"; // استيراد الـ Store الجديد

const store = useHomeConfigsStore();

// ===== Local State for UI =====
const showModal = ref(false);
const isEditing = ref(false);
const deleteTarget = ref(null);
const keySearch = ref("");
let searchTimeout = null;

// Form State
const form = reactive({
  id: null,
  section_key: "",
  type: "",
  sectionOrder: 0,
  isActive: true,
  metadata: null,
});

// Toast Logic
const toast = reactive({ show: false, msg: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.msg = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ===== Key Search Logic (Debounce & Store Action) =====
const debouncedKeySearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (form.type) {
      store.searchKeys(form.type, keySearch.value);
    }
  }, 400);
};

const selectKey = (item) => {
  form.section_key = item.key || item.slug;
  store.clearKeySearch(); // مسح النتائج بعد الاختيار
  keySearch.value = "";
};

// Watch for Type Change to reset search and fetch initial list
watch(
  () => form.type,
  (newType) => {
    store.clearKeySearch();
    keySearch.value = "";

    if (!isEditing.value) {
      form.section_key = "";
      // جلب قائمة مبدئية عند اختيار النوع
      if (
        newType &&
        newType !== "CATEGORY_GRID" &&
        newType !== "staticSection"
      ) {
        store.searchKeys(newType, "");
      }
    }
  },
);

// ===== Modal Actions =====
const openCreateModal = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    section_key: "",
    type: "",
    sectionOrder: store.sections.length,
    isActive: true,
    metadata: null,
  });
  showModal.value = true;
};

const openEditModal = (section) => {
  isEditing.value = true;
  // نسخ البيانات لتجنب التعديل المباشر قبل الحفظ
  Object.assign(form, {
    ...section,
    // تأكد من تعيين القيم الافتراضية إذا كانت غير موجودة
    metadata: section.metadata || null,
  });
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  store.clearKeySearch();
};

const submitForm = async () => {
  const payload = {
    section_key: form.section_key,
    type: form.type,
    sectionOrder: form.sectionOrder,
    isActive: form.isActive,
    metadata: form.metadata,
  };

  let result;
  if (isEditing.value) {
    result = await store.updateSection(form.id, payload);
  } else {
    result = await store.createSection(payload);
  }

  if (result.success) {
    showToast(isEditing.value ? "تم التعديل بنجاح" : "تم الإضافة بنجاح");
    closeModal();
  } else {
    showToast(result.message || "حدث خطأ", "error");
  }
};

const handleToggleStatus = async (section) => {
  // الـ Store يتعامل مع الـ Optimistic Update داخلياً
  const result = await store.toggleStatus(section.id, section.isActive);
  if (!result.success) {
    showToast("فشل تحديث الحالة", "error");
  }
};

const confirmDelete = (section) => {
  deleteTarget.value = section;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;

  const result = await store.deleteSection(deleteTarget.value.id);

  if (result.success) {
    showToast("تم الحذف بنجاح");
  } else {
    showToast(result.message || "فشل الحذف", "error");
  }
  deleteTarget.value = null;
};

// ===== Helpers =====
const getTypeLabel = (type) => {
  const labels = {
    mainSlider: "سلايدر رئيسي",
    productSlider: "سلايدر منتجات",
    fixedBanner: "بنر ثابت",
    fullImage: "بنر كامل",
    staticSection: "قسم ثابت",
    CATEGORY_GRID: "شبكة التصنيفات",
  };
  return labels[type] || type;
};

const getTypeClass = (type) => {
  return `type-${type}`;
};

const getKeyLabel = (type) => {
  if (type === "mainSlider") return "اختر السلايدر الرئيسي";
  if (type === "productSlider") return "اختر سلايدر المنتجات";
  if (type === "fixedBanner") return "اختر البنر الثابت";
  if (type === "fullImage") return "اختر البنر الكامل";
  return "المعرف";
};

const getPlaceholder = (type) => {
  return "ابحث بالاسم أو المفتاح...";
};

const getItemTitle = (item) => {
  if (item.translations?.length) {
    const ar = item.translations.find((t) => t.languageCode === "ar");
    return ar?.title || ar?.name || item.key;
  }
  return item.key || item.title || "بدون عنوان";
};

// ===== Mount =====
onMounted(() => {
  store.fetchSections();
});
</script>

<style scoped>
/* نفس الـ CSS السابق تماماً */
.home-manager-page {
  padding: 28px;
  min-height: 100vh;
  background: #f7f5f0;
  font-family: "Cairo", sans-serif;
  direction: rtl;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0;
}
.header-badge {
  background: #f0e8d0;
  color: #987226;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover {
  background: #7a5b1e;
}
.btn-primary-sm {
  padding: 8px 16px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.loading-container {
  text-align: center;
  padding: 60px;
  color: #888;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0e8d0;
  border-top-color: #987226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #aaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Sections List */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.section-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1px solid transparent;
}
.section-card.inactive {
  opacity: 0.6;
  filter: grayscale(0.8);
}
.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-handle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-left: 1px solid #f0e8d0;
  cursor: grab;
}
.order-badge {
  width: 24px;
  height: 24px;
  background: #f7f5f0;
  color: #987226;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.drag-icon {
  cursor: grab;
}

.card-content {
  flex: 1;
  min-width: 0;
}
.content-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.type-mainSlider {
  background: #e3f2fd;
  color: #1565c0;
}
.type-productSlider {
  background: #fff3e0;
  color: #e65100;
}
.type-fixedBanner,
.type-fullImage {
  background: #e8f5e9;
  color: #2e7d32;
}
.type-staticSection {
  background: #f3e5f5;
  color: #7b1fa2;
}
.type-CATEGORY_GRID {
  background: #fce4ec;
  color: #c2185b;
}

.section-key {
  font-family: monospace;
  font-size: 12px;
  color: #999;
}

.preview-area {
  background: #fdfaf4;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}
.slides-track,
.products-track {
  display: flex;
  gap: 6px;
}
.slide-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
.prod-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
.banner-thumb {
  height: 40px;
  width: auto;
  max-width: 150px;
  object-fit: cover;
  border-radius: 4px;
}
.cat-chip {
  font-size: 11px;
  background: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #eee;
}
.no-data {
  font-size: 12px;
  color: #ccc;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid #f0e8d0;
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
  transition: background 0.2s;
}
.action-btn.edit {
  background: #fff3e0;
  color: #e65100;
}
.action-btn.edit:hover {
  background: #ffe0b2;
}
.action-btn.delete {
  background: #ffebee;
  color: #c62828;
}
.action-btn.delete:hover {
  background: #ffcdd2;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  cursor: pointer;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider-toggle {
  position: absolute;
  inset: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 22px;
}
.slider-toggle:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider-toggle {
  background-color: #987226;
}
input:checked + .slider-toggle:before {
  transform: translateX(18px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}
.modal-box {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
}
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0e8d0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #987226;
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}
.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  font-family: "Cairo";
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #987226;
}
.form-hint {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
.search-loader {
  position: absolute;
  left: 10px;
  top: 38px;
}

.key-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e0cf;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}
.key-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
}
.key-option:hover {
  background: #fdfaf4;
}
.key-option.selected {
  background: #fef9ee;
  border-right: 3px solid #987226;
}
.opt-img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}
.opt-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.opt-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.opt-key {
  font-size: 11px;
  color: #999;
  font-family: monospace;
}
.empty-dropdown {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e8e0cf;
  border-radius: 8px;
  margin-top: 4px;
}

.form-check {
  margin: 20px 0;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}
.check-input {
  width: 16px;
  height: 16px;
  accent-color: #987226;
}

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
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo";
  font-weight: 700;
  cursor: pointer;
}
.btn-save {
  flex: 2;
  padding: 12px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo";
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

/* Confirm Box */
.confirm-box {
  background: #fff;
  border-radius: 18px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.confirm-title {
  font-size: 18px;
  font-weight: 800;
  margin: 12px 0 8px;
}
.confirm-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
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
  font-family: "Cairo";
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 12px;
  font-family: "Cairo";
  font-size: 14px;
  font-weight: 700;
  z-index: 2000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}
.toast.success {
  background: #2e7d32;
  color: #fff;
}
.toast.error {
  background: #c53030;
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

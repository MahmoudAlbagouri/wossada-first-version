<template>
  <div class="categories-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة الأقسام</h1>
        <span class="categories-count" v-if="store.categories.length">
          {{ store.categories.length }} قسم
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
        إضافة قسم
      </button>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchAdminCategories()">
        إعادة المحاولة
      </button>
    </div>

    <!-- ===== Categories Table ===== -->
    <div v-else class="table-wrapper">
      <table class="categories-table">
        <thead>
          <tr>
            <th>القسم</th>
            <th>النوع</th>
            <th>الترتيب</th>
            <th>الحالة</th>
            <th>الصفحة الرئيسية</th>
            <th>الأقسام الفرعية</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="cat in store.categoriesAdmin" :key="cat.id">
            <!-- Parent Row -->
            <tr class="category-row parent-row">
              <td class="category-cell">
                <div class="category-info">
                  <img
                    v-if="cat.image"
                    :src="cat.image"
                    :alt="store.getCategoryName(cat)"
                    class="category-thumb"
                    @error="$event.target.src = '/images/placeholder.jpg'"
                  />
                  <div v-else class="category-thumb-placeholder">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                    </svg>
                  </div>
                  <div class="category-meta">
                    <p class="category-name">
                      {{ store.getCategoryName(cat, "ar") }}
                    </p>
                    <p class="category-slug">{{ cat.slug }}</p>
                  </div>
                </div>
              </td>
              <td><span class="type-badge parent-type">رئيسي</span></td>
              <td>
                <span class="order-badge">{{ cat.sectionOrder }}</span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="cat.isActive ? 'active' : 'inactive'"
                >
                  {{ cat.isActive ? "نشط" : "معطل" }}
                </span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="cat.showInHome ? 'active' : 'inactive'"
                >
                  {{ cat.showInHome ? "يظهر" : "مخفي" }}
                </span>
              </td>
              <td>
                <span class="children-count"
                  >{{ cat.children?.length || 0 }} فرعي</span
                >
              </td>
              <td class="actions-cell">
                <div class="actions-row">
                  <button
                    class="action-btn edit-btn"
                    title="تعديل"
                    @click="openEditModal(cat)"
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
                    class="action-btn add-child-btn"
                    title="إضافة قسم فرعي"
                    @click="openCreateChildModal(cat)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    title="حذف"
                    @click="confirmDelete(cat)"
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

            <!-- Children Rows -->
            <tr
              v-for="child in cat.children"
              :key="child.id"
              class="category-row child-row"
            >
              <td class="category-cell">
                <div class="category-info child-indent">
                  <span class="child-connector">└</span>
                  <img
                    v-if="child.image"
                    :src="child.image"
                    :alt="store.getCategoryName(child)"
                    class="category-thumb small"
                    @error="$event.target.src = '/images/placeholder.jpg'"
                  />
                  <div v-else class="category-thumb-placeholder small">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                    </svg>
                  </div>
                  <div class="category-meta">
                    <p class="category-name">
                      {{ store.getCategoryName(child, "ar") }}
                    </p>
                    <p class="category-slug">{{ child.slug }}</p>
                  </div>
                </div>
              </td>
              <td><span class="type-badge child-type">فرعي</span></td>
              <td>
                <span class="order-badge">{{ child.sectionOrder }}</span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="child.isActive ? 'active' : 'inactive'"
                >
                  {{ child.isActive ? "نشط" : "معطل" }}
                </span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="child.showInHome ? 'active' : 'inactive'"
                >
                  {{ child.showInHome ? "يظهر" : "مخفي" }}
                </span>
              </td>
              <td><span class="no-children">—</span></td>
              <td class="actions-cell">
                <div class="actions-row">
                  <button
                    class="action-btn edit-btn"
                    title="تعديل"
                    @click="openEditModal(child)"
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
                    class="action-btn delete-btn"
                    title="حذف"
                    @click="confirmDelete(child)"
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
          </template>

          <tr v-if="!store.categories.length">
            <td colspan="7" class="empty-row">لا توجد أقسام بعد</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== Create / Edit Modal ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">
              {{
                isEditing
                  ? "تعديل القسم"
                  : parentForNew
                    ? `إضافة فرعي لـ "${store.getCategoryName(parentForNew, "ar")}"`
                    : "إضافة قسم رئيسي"
              }}
            </h2>
            <div class="modal-header-meta">
              <span class="modal-draft-badge">{{
                isEditing ? "تعديل" : "مسودة"
              }}</span>
              <button class="modal-close" @click="closeModal">✕</button>
            </div>
          </div>

          <div class="tabs-bar">
            <button
              v-for="(tab, idx) in tabs"
              :key="idx"
              class="tab-btn"
              :class="{
                active: activeTab === idx,
                done: completedTabs.includes(idx),
              }"
              @click="switchTab(idx)"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
              <span class="tab-check" v-if="completedTabs.includes(idx)"
                >✓</span
              >
            </button>
          </div>

          <div class="modal-body">
            <!-- TAB 0 — المعلومات -->
            <div v-show="activeTab === 0" class="tab-pane">
              <fieldset class="form-section">
                <legend>معلومات أساسية</legend>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">القسم الأب</label>
                    <select
                      v-model="form.parentId"
                      class="form-input form-select"
                    >
                      <option value="">— قسم رئيسي (بدون أب) —</option>
                      <option
                        v-for="cat in store.topLevelCategories"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ store.getCategoryName(cat, "ar") }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label"
                      >ترتيب العرض <span class="req">*</span></label
                    >
                    <input
                      v-model.number="form.sectionOrder"
                      type="number"
                      class="form-input"
                      min="1"
                    />
                  </div>
                </div>
                <div class="form-grid-2" style="margin-top: 14px">
                  <div class="form-group">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                  </div>
                  <div class="form-group">
                    <label class="check-label">
                      <input
                        v-model="form.showInHome"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>يظهر في الصفحة الرئيسية</span>
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset class="form-section">
                <legend>الترجمات</legend>
                <div class="lang-tabs">
                  <button
                    v-for="(lang, li) in ['عربي 🇪🇬', 'English 🇺🇸']"
                    :key="li"
                    type="button"
                    class="lang-tab-btn"
                    :class="{ active: activeLang === li }"
                    @click="activeLang = li"
                  >
                    {{ lang }}
                  </button>
                </div>

                <div v-show="activeLang === 0" class="lang-block">
                  <div class="form-group">
                    <label class="form-label"
                      >اسم القسم <span class="req">*</span></label
                    >
                    <input
                      v-model="form.translations[0].name"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group" style="margin-top: 10px">
                    <label class="form-label">وصف القسم</label>
                    <textarea
                      v-model="form.translations[0].description"
                      class="form-input"
                      rows="3"
                      dir="rtl"
                      placeholder="وصف مختصر للقسم..."
                    ></textarea>
                  </div>
                </div>

                <div v-show="activeLang === 1" class="lang-block">
                  <div class="form-group">
                    <label class="form-label">Category Name</label>
                    <input
                      v-model="form.translations[1].name"
                      type="text"
                      class="form-input"
                      dir="ltr"
                    />
                  </div>
                  <div class="form-group" style="margin-top: 10px">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="form.translations[1].description"
                      class="form-input"
                      rows="3"
                      dir="ltr"
                      placeholder="Short category description..."
                    ></textarea>
                  </div>
                </div>
              </fieldset>
            </div>

            <!-- TAB 1 — الصور -->
            <div v-show="activeTab === 1" class="tab-pane">
              <fieldset class="form-section">
                <legend>صورة القسم</legend>
                <ImageUploader v-model="form.image" folder="categories" />
              </fieldset>
              <fieldset class="form-section">
                <legend>صورة OG (مشاركة السوشيال)</legend>
                <ImageUploader v-model="form.ogImage" folder="categories" />
              </fieldset>
            </div>

            <!-- TAB 2 — SEO -->
            <div v-show="activeTab === 2" class="tab-pane">
              <div class="seo-preview-box">
                <p class="seo-preview-label">معاينة نتائج جوجل</p>
                <div class="seo-preview-url">
                  https://yourstore.com/{{
                    form.translations[0].name
                      ? form.translations[0].name
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                      : "category-slug"
                  }}
                </div>
                <div class="seo-preview-title">
                  {{
                    form.metaTitle ||
                    form.translations[0].name ||
                    "عنوان القسم هنا"
                  }}
                </div>
                <div class="seo-preview-desc">
                  {{
                    form.metaDescription ||
                    form.translations[0].description ||
                    "وصف القسم المختصر يظهر هنا في نتائج البحث..."
                  }}
                </div>
              </div>
              <fieldset class="form-section">
                <legend>إعدادات SEO</legend>
                <div class="form-group">
                  <label class="form-label">Meta Title</label>
                  <input
                    v-model="form.metaTitle"
                    type="text"
                    class="form-input"
                    dir="ltr"
                  />
                  <span
                    class="char-count"
                    :class="{ warn: (form.metaTitle || '').length > 60 }"
                  >
                    {{ (form.metaTitle || "").length }} / 60
                  </span>
                </div>
                <div class="form-group" style="margin-top: 12px">
                  <label class="form-label">Meta Description</label>
                  <textarea
                    v-model="form.metaDescription"
                    class="form-input"
                    rows="3"
                    dir="ltr"
                  ></textarea>
                  <span
                    class="char-count"
                    :class="{ warn: (form.metaDescription || '').length > 160 }"
                  >
                    {{ (form.metaDescription || "").length }} / 160
                  </span>
                </div>
              </fieldset>
            </div>
          </div>

          <div class="modal-footer">
            <div class="footer-step-info">
              <span class="step-dots">
                <span
                  v-for="(tab, i) in tabs"
                  :key="i"
                  class="step-dot"
                  :class="{
                    active: i === activeTab,
                    done: completedTabs.includes(i),
                  }"
                  @click="switchTab(i)"
                ></span>
              </span>
              <span class="step-text"
                >{{ activeTab + 1 }} / {{ tabs.length }} —
                {{ tabs[activeTab].label }}</span
              >
            </div>
            <div class="footer-actions">
              <button
                v-if="activeTab > 0"
                type="button"
                class="btn-tab-prev"
                @click="switchTab(activeTab - 1)"
              >
                → السابق
              </button>
              <button
                v-if="activeTab < tabs.length - 1"
                type="button"
                class="btn-tab-next"
                @click="switchTab(activeTab + 1)"
              >
                التالي ←
              </button>
              <button
                v-if="activeTab === tabs.length - 1"
                type="button"
                class="btn-save"
                :disabled="store.actionLoading"
                @click="submitForm"
              >
                <span v-if="store.actionLoading" class="btn-spinner"></span>
                {{ isEditing ? "حفظ التعديلات" : "إنشاء القسم" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Confirm Delete ===== -->
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
            هل أنت متأكد من حذف "<strong>{{
              store.getCategoryName(deleteTarget, "ar")
            }}</strong
            >"؟
            <span v-if="deleteTarget.children?.length" class="confirm-warn">
              ⚠️ يحتوي على {{ deleteTarget.children.length }} قسم فرعي
            </span>
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

    <!-- ===== Toast ===== -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCategoryStore } from "@/stores/category.js";
import ImageUploader from "@/components/shared/ImageUploader.vue";

const { locale } = useI18n();
const store = useCategoryStore();

// ===== Tabs =====
const tabs = [
  { label: "المعلومات", icon: "📝" },
  { label: "الصور", icon: "🖼️" },
  { label: "SEO", icon: "🔍" },
];
const activeTab = ref(0);
const activeLang = ref(0);
const completedTabs = ref([]);

const switchTab = (idx) => {
  if (!completedTabs.value.includes(activeTab.value)) {
    completedTabs.value.push(activeTab.value);
  }
  activeTab.value = idx;
};

// ===== Toast =====
const toast = reactive({ show: false, msg: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.msg = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ===== Modal State =====
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const parentForNew = ref(null);
const deleteTarget = ref(null);

// ===== Default Form =====
const defaultForm = () => ({
  parentId: "",
  sectionOrder: 1,
  isActive: true,
  showInHome: true,
  image: "",
  ogImage: "",
  translations: [
    { languageCode: "ar", name: "", description: "" },
    { languageCode: "en", name: "", description: "" },
  ],
  metaTitle: "",
  metaDescription: "",
});

const form = reactive(defaultForm());

// ===== Open Modals =====
const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  parentForNew.value = null;
  activeTab.value = 0;
  activeLang.value = 0;
  completedTabs.value = [];
  Object.assign(form, defaultForm());
  showModal.value = true;
};

const openCreateChildModal = (parent) => {
  isEditing.value = false;
  editingId.value = null;
  parentForNew.value = parent;
  activeTab.value = 0;
  activeLang.value = 0;
  completedTabs.value = [];
  Object.assign(form, defaultForm());
  form.parentId = parent.id;
  showModal.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  editingId.value = category.id;
  parentForNew.value = null;
  activeTab.value = 0;
  activeLang.value = 0;
  completedTabs.value = [];

  const arTrans =
    category.translations?.find((t) => t.languageCode === "ar") || {};
  const enTrans =
    category.translations?.find((t) => t.languageCode === "en") || {};

  Object.assign(form, {
    parentId: category.parentId || "",
    sectionOrder: category.sectionOrder || 1,
    isActive: category.isActive ?? true,
    showInHome: category.showInHome ?? true,
    image: category.image?.replace(/^https?:\/\/[^/]+\/uploads\//, "") || "",
    ogImage:
      category.ogImage?.replace(/^https?:\/\/[^/]+\/uploads\//, "") || "",
    translations: [
      {
        languageCode: "ar",
        name: arTrans.name || "",
        description: arTrans.description || "",
      },
      {
        languageCode: "en",
        name: enTrans.name || "",
        description: enTrans.description || "",
      },
    ],
    metaTitle: category.metaTitle || "",
    metaDescription: category.metaDescription || "",
  });
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  parentForNew.value = null;
};

// ===== Submit =====
const submitForm = async () => {
  const payload = {
    parentId: form.parentId || undefined,
    sectionOrder: form.sectionOrder,
    isActive: form.isActive,
    showInHome: form.showInHome,
    image: form.image || "",
    ogImage: form.ogImage || "",
    translations: form.translations
      .filter((t) => t.name)
      .map((t) => ({
        languageCode: t.languageCode,
        name: t.name,
        description: t.description,
      })),
    metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,
  };

  const result = isEditing.value
    ? await store.updateCategory(editingId.value, payload)
    : await store.createCategory(payload);

  if (result.success) {
    closeModal();
    showToast(
      isEditing.value ? "تم تعديل القسم بنجاح" : "تم إنشاء القسم بنجاح",
    );
  } else {
    showToast("حدث خطأ، حاول مرة أخرى", "error");
  }
};

// ===== Delete =====
const confirmDelete = (category) => {
  deleteTarget.value = category;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  const result = await store.deleteCategory(deleteTarget.value.id);
  showToast(
    result.success ? "تم حذف القسم بنجاح" : "فشل الحذف",
    result.success ? "success" : "error",
  );
  deleteTarget.value = null;
};

// ===== Init — استخدام fetchAdminCategories =====
onMounted(async () => {
  await store.fetchAdminCategories();
});
</script>

<style scoped>
.categories-page {
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
.categories-count {
  background: #f0e8d0;
  color: #987226;
  font-size: 13px;
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
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ede8df 25%, #e0d8c8 50%, #ede8df 75%);
  background-size: 200%;
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
  padding: 60px;
  color: #888;
}
.btn-retry {
  margin-top: 12px;
  padding: 8px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
}
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.categories-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.categories-table thead {
  background: #faf6ee;
  border-bottom: 2px solid #f0e8d0;
}
.categories-table th {
  padding: 14px 16px;
  font-weight: 700;
  color: #987226;
  text-align: right;
  white-space: nowrap;
}
.categories-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f0e8;
  vertical-align: middle;
}
.category-row:hover {
  background: #fdfaf4;
}
.parent-row {
  background: #fff;
}
.child-row {
  background: #fdfcf8;
}
.category-cell {
  min-width: 220px;
}
.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.child-indent {
  padding-right: 16px;
}
.child-connector {
  color: #c8b87a;
  font-size: 16px;
  flex-shrink: 0;
}
.category-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0e8d0;
  flex-shrink: 0;
}
.category-thumb.small {
  width: 34px;
  height: 34px;
  border-radius: 6px;
}
.category-thumb-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f0e8d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #987226;
  flex-shrink: 0;
}
.category-thumb-placeholder.small {
  width: 34px;
  height: 34px;
  border-radius: 6px;
}
.category-name {
  font-weight: 700;
  color: #2a2015;
  margin: 0 0 3px;
  font-size: 14px;
}
.category-slug {
  font-size: 11px;
  color: #aaa;
  margin: 0;
  font-family: monospace;
}
.type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.parent-type {
  background: #fef3cd;
  color: #987226;
}
.child-type {
  background: #e3f2fd;
  color: #1565c0;
}
.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f0e8d0;
  color: #987226;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}
.children-count {
  font-size: 12px;
  font-weight: 700;
  color: #987226;
  background: #f0e8d0;
  padding: 3px 10px;
  border-radius: 20px;
}
.no-children {
  color: #ccc;
}
.actions-row {
  display: flex;
  gap: 6px;
}
.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.edit-btn {
  background: #fff3e0;
  color: #e65100;
}
.edit-btn:hover {
  background: #ffe0b2;
}
.add-child-btn {
  background: #e8f5e9;
  color: #2e7d32;
}
.add-child-btn:hover {
  background: #c8e6c9;
}
.delete-btn {
  background: #ffebee;
  color: #c62828;
}
.delete-btn:hover {
  background: #ffcdd2;
}
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
  direction: rtl;
}
.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  height: 88vh;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 0;
}
.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #987226;
  margin: 0;
}
.modal-header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-draft-badge {
  background: #f0e8d0;
  color: #987226;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #f5f0e8;
}
.tabs-bar {
  display: flex;
  gap: 2px;
  padding: 12px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 2px solid #f0e8d0;
  margin-top: 14px;
  flex-shrink: 0;
}
.tabs-bar::-webkit-scrollbar {
  display: none;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #aaa;
  border-radius: 10px 10px 0 0;
  border-bottom: 3px solid transparent;
  transition: all 0.18s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;
}
.tab-btn:hover {
  color: #666;
  background: #f7f5f0;
}
.tab-btn.active {
  color: #987226;
  border-bottom-color: #987226;
  background: #fdfaf4;
}
.tab-btn.done {
  color: #2e7d32;
}
.tab-icon {
  font-size: 14px;
}
.tab-check {
  font-size: 10px;
  background: #e8f5e9;
  color: #2e7d32;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}
.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #e8e0cf transparent;
}
.tab-pane {
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.form-section {
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 14px 18px 18px;
  margin-bottom: 18px;
  background: #fdfaf4;
}
.form-section legend {
  font-weight: 700;
  font-size: 13px;
  color: #987226;
  padding: 0 8px;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #555;
}
.req {
  color: #c62828;
}
.form-input {
  padding: 9px 12px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus {
  border-color: #987226;
}
.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23987226' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
  padding-left: 32px;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-top: 4px;
}
.check-input {
  width: 16px;
  height: 16px;
  accent-color: #987226;
  cursor: pointer;
}
.lang-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
.lang-tab-btn {
  padding: 6px 16px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  background: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.lang-tab-btn.active {
  background: #987226;
  color: #fff;
  border-color: #987226;
}
.char-count {
  font-size: 11px;
  color: #aaa;
  text-align: left;
  margin-top: 2px;
}
.char-count.warn {
  color: #e65100;
}
.seo-preview-box {
  background: #fff;
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.seo-preview-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  margin-bottom: 8px;
}
.seo-preview-url {
  font-size: 11px;
  color: #0a6b08;
  margin-bottom: 3px;
  font-family: monospace;
}
.seo-preview-title {
  font-size: 15px;
  color: #1a0dab;
  font-weight: 700;
  margin-bottom: 3px;
}
.seo-preview-desc {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1.5px solid #f0e8d0;
  background: #fff;
  flex-shrink: 0;
}
.footer-step-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.step-dots {
  display: flex;
  gap: 5px;
}
.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8e0cf;
  cursor: pointer;
  transition: all 0.2s;
}
.step-dot.active {
  background: #987226;
  transform: scale(1.3);
}
.step-dot.done {
  background: #2e7d32;
}
.step-text {
  font-size: 12px;
  font-weight: 700;
  color: #aaa;
}
.footer-actions {
  display: flex;
  gap: 8px;
}
.btn-tab-prev {
  padding: 10px 18px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn-tab-prev:hover {
  background: #ece8e0;
}
.btn-tab-next {
  padding: 10px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.btn-tab-next:hover {
  background: #7a5b1e;
}
.btn-save {
  padding: 10px 22px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-save:hover {
  background: #7a5b1e;
}
.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.btn-spinner.dark {
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: #fff;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
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
  font-weight: 800;
  color: #333;
  margin: 14px 0 8px;
}
.confirm-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 24px;
}
.confirm-warn {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #e65100;
  font-weight: 700;
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
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-delete-confirm:hover {
  background: #c53030;
}
.btn-delete-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 12px;
  font-family: "Cairo", sans-serif;
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

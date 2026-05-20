<template>
  <div class="users-page" dir="rtl">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة المستخدمين</h1>
        <span class="users-count" v-if="store.users.length">
          {{ store.users.length }} مستخدم
        </span>
      </div>
      <div class="header-actions">
        <button
          class="btn-refresh"
          @click="store.fetchUsers()"
          :disabled="store.loading"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            ></path>
          </svg>
          تحديث
        </button>
        <button class="btn-add" @click="openAddModal()">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          إضافة مستخدم
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="بحث بالاسم أو الإيميل..."
          class="search-input"
        />
      </div>
      <div class="role-filters">
        <button
          v-for="filter in roleFilters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <span class="filter-count">{{ getRoleCount(filter.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !store.users.length" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchUsers()">
        إعادة المحاولة
      </button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>التواصل</th>
            <th>الدور</th>
            <th>الدوام</th>
            <th>الراتب</th>
            <th>الحالة</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <!-- Avatar + Name -->
            <td>
              <div class="user-info">
                <div
                  class="avatar"
                  :style="{ background: getAvatarColor(user.name) }"
                >
                  {{ getInitials(user.name) }}
                </div>
                <div>
                  <span class="u-name">{{ user.name }}</span>
                  <span class="u-id">{{ user.id.split("-")[0] }}...</span>
                </div>
              </div>
            </td>

            <!-- Contact -->
            <td>
              <div class="contact-info">
                <span class="u-email">{{ user.email }}</span>
                <span class="u-phone" v-if="user.phone">{{ user.phone }}</span>
              </div>
            </td>

            <!-- Role -->
            <td>
              <span class="role-badge" :class="'role-' + user.role">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>

            <!-- Shift -->
            <td class="shift-cell">
              <span v-if="user.shiftStart && user.shiftEnd" class="shift-time">
                {{ user.shiftStart.slice(0, 5) }} —
                {{ user.shiftEnd.slice(0, 5) }}
              </span>
              <span v-else class="shift-none">—</span>
            </td>

            <!-- Salary -->
            <td class="salary-cell">
              <span v-if="+user.baseSalary > 0">{{
                formatCurrency(user.baseSalary)
              }}</span>
              <span v-else class="shift-none">—</span>
            </td>

            <!-- Status -->
            <td>
              <span
                class="status-dot"
                :class="user.isActive ? 'active' : 'inactive'"
              >
                {{ user.isActive ? "نشط" : "موقوف" }}
              </span>
            </td>

            <!-- Date -->
            <td class="date-cell">{{ formatDate(user.createdAt) }}</td>

            <!-- Actions -->
            <td class="actions-cell">
              <button
                class="action-btn edit-btn"
                title="تعديل"
                @click="openEditModal(user)"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  ></path>
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  ></path>
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                title="حذف"
                @click="confirmDelete(user)"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                  ></path>
                  <path d="M10 11v6M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="!filteredUsers.length">
            <td colspan="8" class="empty-row">لا توجد نتائج مطابقة</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ====== MODAL: Add / Edit ====== -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="modal.show" class="modal-overlay" @click.self="closeModal()">
          <div class="modal-box">
            <div class="modal-header">
              <h2>
                {{ modal.isEdit ? "تعديل المستخدم" : "إضافة مستخدم جديد" }}
              </h2>
              <button class="modal-close" @click="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-grid">
                <!-- Name -->
                <div class="form-group">
                  <label>الاسم *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="الاسم الكامل"
                    class="form-input"
                  />
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label>البريد الإلكتروني *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="example@email.com"
                    class="form-input"
                    :disabled="modal.isEdit"
                  />
                </div>

                <!-- Phone -->
                <div class="form-group">
                  <label>رقم الهاتف *</label>
                  <input
                    v-model="form.phone"
                    type="text"
                    placeholder="01xxxxxxxxx"
                    class="form-input"
                  />
                </div>

                <!-- Password (only on add) -->
                <div class="form-group" v-if="!modal.isEdit">
                  <label>كلمة المرور *</label>
                  <input
                    v-model="form.password"
                    type="password"
                    placeholder="6 أحرف على الأقل"
                    class="form-input"
                  />
                </div>

                <!-- Role -->
                <div class="form-group">
                  <label>الدور *</label>
                  <select v-model="form.role" class="form-select">
                    <option value="user">مستخدم عادي</option>
                    <option value="admin">مدير</option>
                    <option value="vendor">تاجر</option>
                    <option value="employee">موظف</option>
                  </select>
                </div>

                <!-- Shift Start -->
                <div class="form-group">
                  <label>بداية الدوام</label>
                  <input
                    v-model="form.shiftStart"
                    type="time"
                    class="form-input"
                  />
                </div>

                <!-- Shift End -->
                <div class="form-group">
                  <label>نهاية الدوام</label>
                  <input
                    v-model="form.shiftEnd"
                    type="time"
                    class="form-input"
                  />
                </div>

                <!-- Base Salary -->
                <div class="form-group" v-if="form.role === 'employee'">
                  <label>الراتب الأساسي (جنيه)</label>
                  <input
                    v-model.number="form.baseSalary"
                    type="number"
                    placeholder="0"
                    min="0"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal()">إلغاء</button>
              <button
                class="btn-save"
                @click="handleSave()"
                :disabled="store.saving"
              >
                <span v-if="store.saving">جارٍ الحفظ...</span>
                <span v-else>{{
                  modal.isEdit ? "حفظ التعديلات" : "إضافة المستخدم"
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ====== MODAL: Confirm Delete ====== -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="deleteModal.show"
          class="modal-overlay"
          @click.self="deleteModal.show = false"
        >
          <div class="modal-box modal-sm">
            <div class="modal-header danger">
              <h2>تأكيد الحذف</h2>
              <button class="modal-close" @click="deleteModal.show = false">
                ✕
              </button>
            </div>
            <div class="modal-body">
              <p class="delete-confirm-text">
                هل أنت متأكد من حذف المستخدم
                <strong>{{ deleteModal.user?.name }}</strong
                >؟ لا يمكن التراجع عن هذه العملية.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="deleteModal.show = false">
                إلغاء
              </button>
              <button
                class="btn-delete-confirm"
                @click="handleDelete()"
                :disabled="store.saving"
              >
                {{ store.saving ? "جارٍ الحذف..." : "نعم، احذف" }}
              </button>
            </div>
          </div>
        </div>
      </transition>
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
const store = useUsersStore();

onMounted(() => {
  store.fetchUsers();
});

// ─── Filters ───────────────────────────────────────────────
const search = ref("");
const activeFilter = ref("all");

const roleFilters = [
  { value: "all", label: "الكل" },
  { value: "user", label: "مستخدمون" },
  { value: "employee", label: "موظفون" },
  { value: "vendor", label: "تجار" },
  { value: "admin", label: "مديرون" },
];

const filteredUsers = computed(() => {
  let list = store.users;
  if (activeFilter.value !== "all") {
    list = list.filter((u) => u.role === activeFilter.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").includes(q),
    );
  }
  return list;
});

const getRoleCount = (role) => {
  if (role === "all") return store.users.length;
  return store.users.filter((u) => u.role === role).length;
};

// ─── Helpers ───────────────────────────────────────────────
const getRoleLabel = (role) => {
  const map = {
    user: "مستخدم",
    admin: "مدير",
    vendor: "تاجر",
    employee: "موظف",
  };
  return map[role] || role;
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(
    amount,
  );

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const avatarColors = [
  "#4361ee",
  "#f72585",
  "#4cc9f0",
  "#7209b7",
  "#3a86ff",
  "#06d6a0",
];
const getAvatarColor = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

// ─── Modal: Add / Edit ─────────────────────────────────────
const modal = reactive({ show: false, isEdit: false, userId: null });
const form = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  shiftStart: "09:00",
  shiftEnd: "17:00",
  baseSalary: 0,
});

const resetForm = () => {
  Object.assign(form, {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    shiftStart: "09:00",
    shiftEnd: "17:00",
    baseSalary: 0,
  });
};

const openAddModal = () => {
  resetForm();
  modal.isEdit = false;
  modal.userId = null;
  modal.show = true;
};

const openEditModal = (user) => {
  Object.assign(form, {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    password: "",
    role: user.role,
    shiftStart: (user.shiftStart || "09:00:00").slice(0, 5),
    shiftEnd: (user.shiftEnd || "17:00:00").slice(0, 5),
    baseSalary: +user.baseSalary || 0,
  });
  modal.isEdit = true;
  modal.userId = user.id;
  modal.show = true;
};

const closeModal = () => {
  modal.show = false;
};

const handleSave = async () => {
  if (!form.name || !form.email) {
    showToast("الاسم والبريد الإلكتروني مطلوبان", "error");
    return;
  }

  let result;
  if (modal.isEdit) {
    const payload = {
      name: form.name,
      phone: form.phone,
      role: form.role,
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      baseSalary: form.baseSalary,
    };
    result = await store.updateUser(modal.userId, payload);
  } else {
    if (!form.password || form.password.length < 6) {
      showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }
    result = await store.createUser({ ...form });
  }

  if (result.success) {
    showToast(
      modal.isEdit ? "تم تعديل المستخدم بنجاح" : "تم إضافة المستخدم بنجاح",
    );
    closeModal();
  } else {
    showToast(result.error || "حدث خطأ", "error");
  }
};

// ─── Modal: Delete ─────────────────────────────────────────
const deleteModal = reactive({ show: false, user: null });

const confirmDelete = (user) => {
  deleteModal.user = user;
  deleteModal.show = true;
};

const handleDelete = async () => {
  const result = await store.deleteUser(deleteModal.user.id);
  if (result.success) {
    showToast("تم حذف المستخدم بنجاح");
    deleteModal.show = false;
  } else {
    showToast(result.error || "فشل الحذف", "error");
  }
};

// ─── Toast ─────────────────────────────────────────────────
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};
</script>

<style scoped>
/* ── Base ── */
.users-page {
  padding: 24px;
  min-height: 100vh;
  background: #f8f9fb;
  font-family: "Cairo", sans-serif;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
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
.users-count {
  background: #e8f0fe;
  color: #4361ee;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e0e3ef;
  color: #555;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
}
.btn-refresh:hover:not(:disabled) {
  background: #f4f6fb;
  border-color: #4361ee;
  color: #4361ee;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #4361ee;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-add:hover {
  background: #3451d1;
}

/* ── Filters ── */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e0e3ef;
  border-radius: 8px;
  padding: 8px 14px;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}
.search-box svg {
  color: #aaa;
  flex-shrink: 0;
}
.search-input {
  border: none;
  outline: none;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  color: #333;
  width: 100%;
  background: transparent;
}
.role-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #e0e3ef;
  border-radius: 8px;
  background: #fff;
  color: #555;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
}
.filter-btn.active {
  background: #4361ee;
  border-color: #4361ee;
  color: #fff;
}
.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.filter-count {
  background: #f0f2f8;
  color: #4361ee;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── Skeleton ── */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 70px;
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

/* ── Error ── */
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
  font-family: "Cairo", sans-serif;
}

/* ── Table ── */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  white-space: nowrap;
}
.users-table thead th {
  background: #f4f6fb;
  padding: 14px 16px;
  text-align: right;
  font-weight: 700;
  color: #555;
  border-bottom: 1px solid #e8eaf0;
}
.user-row:hover {
  background: #f9fafb;
}
.users-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f8;
  vertical-align: middle;
}

/* ── User Cell ── */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.u-name {
  display: block;
  font-weight: 600;
  color: #1a1a2e;
}
.u-id {
  display: block;
  font-size: 0.75rem;
  color: #bbb;
  font-family: monospace;
}

/* ── Contact ── */
.contact-info {
  display: flex;
  flex-direction: column;
}
.u-email {
  color: #333;
  font-size: 0.87rem;
}
.u-phone {
  font-size: 0.8rem;
  color: #888;
  direction: ltr;
  text-align: right;
}

/* ── Role Badge ── */
.role-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}
.role-user {
  background: #eff6ff;
  color: #1d4ed8;
}
.role-admin {
  background: #fdf4ff;
  color: #7e22ce;
}
.role-vendor {
  background: #fff7ed;
  color: #c2410c;
}
.role-employee {
  background: #f0fdf4;
  color: #15803d;
}

/* ── Status ── */
.status-dot {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-dot.active {
  background: #dcfce7;
  color: #16a34a;
}
.status-dot.inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Misc cells ── */
.shift-time {
  font-family: monospace;
  color: #555;
  font-size: 0.85rem;
}
.shift-none {
  color: #ccc;
}
.salary-cell {
  font-weight: 700;
  color: #1a1a2e;
}
.date-cell {
  color: #777;
  font-size: 0.85rem;
}

/* ── Actions ── */
.actions-cell {
  width: 80px;
}
.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  margin: 0 2px;
}
.edit-btn {
  background: #eff6ff;
  color: #2563eb;
}
.edit-btn:hover {
  background: #2563eb;
  color: #fff;
}
.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}
.delete-btn:hover {
  background: #dc2626;
  color: #fff;
}

.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0 !important;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 16px;
}
.modal-box {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-sm {
  max-width: 420px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f2f8;
}
.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}
.modal-header.danger h2 {
  color: #dc2626;
}
.modal-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s;
}
.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #444;
}
.form-input,
.form-select {
  padding: 9px 12px;
  border: 1px solid #e0e3ef;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  color: #333;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;
}
.form-input:focus,
.form-select:focus {
  border-color: #4361ee;
}
.form-input:disabled {
  background: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.delete-confirm-text {
  color: #444;
  line-height: 1.7;
  margin: 0;
}
.delete-confirm-text strong {
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f2f8;
}
.btn-cancel {
  padding: 9px 20px;
  border: 1px solid #e0e3ef;
  background: #fff;
  color: #555;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  transition: all 0.15s;
}
.btn-cancel:hover {
  background: #f4f6fb;
}
.btn-save {
  padding: 9px 22px;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) {
  background: #3451d1;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-delete-confirm {
  padding: 9px 22px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-delete-confirm:hover:not(:disabled) {
  background: #b91c1c;
}
.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Transitions ── */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ── Toast ── */
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
  font-family: "Cairo", sans-serif;
}
.toast.success {
  background: #2d6a4f;
  color: #fff;
}
.toast.error {
  background: #e63946;
  color: #fff;
}
.toast.info {
  background: #4361ee;
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

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

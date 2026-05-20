// app/stores/users.js
import { defineStore } from "pinia";
import { ref } from "vue";
// import { useApi } from "@/composables/useApi"; // تأكد من استيراد useApi حسب مشروعك

export const useUsersStore = defineStore("users", () => {
  const api = useApi(); // افتراض وجود composable للـ API يتعامل مع الـ Headers والـ Token تلقائياً

  // ── State ──────────────────────────────────────────────────
  const users = ref([]);
  const currentUser = ref(null); // لتخزين بيانات المستخدم الحالي
  const loading = ref(false);
  const saving = ref(false);
  const error = ref(null);

  // ── Actions ────────────────────────────────────────────────

  /** جلب كل المستخدمين (للأدمن) */
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api("/users");
      if (response.success) {
        users.value = response.data;
      }
    } catch (err) {
      error.value = err.data?.message || "حدث خطأ أثناء جلب المستخدمين";
      console.error("fetchUsers error:", err);
    } finally {
      loading.value = false;
    }
  };

  /** جلب بيانات المستخدم الحالي (Profile Me) */
  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      // endpoint حسب الـ API الخاص بك
      const response = await api("/users/profile/me", { method: "GET" });
      if (response.success) {
        currentUser.value = response.data;
        return response.data;
      }
    } catch (err) {
      error.value = err.data?.message || "فشل جلب بيانات الحساب";
      console.error("fetchProfile error:", err);
    } finally {
      loading.value = false;
    }
  };

  /** تحديث بيانات المستخدم الحالي */
  const updateProfile = async (payload) => {
    saving.value = true;
    error.value = null;
    try {
      // تحضير البيانات: إرسال password فقط إذا كانت موجودة وغير فارغة
      const body = { ...payload };
      if (!body.password || body.password.trim() === "") {
        delete body.password;
      }

      const response = await api("/users/profile/update", {
        method: "PATCH",
        body: body,
      });

      if (response.success) {
        // تحديث البيانات المحلية
        if (currentUser.value) {
          currentUser.value = { ...currentUser.value, ...response.data };
        }
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error("updateProfile error:", err);
      return {
        success: false,
        error: err.data?.message || "فشل تعديل البيانات",
      };
    } finally {
      saving.value = false;
    }
  };

  /** إنشاء مستخدم جديد */
  const createUser = async (payload) => {
    saving.value = true;
    try {
      const response = await api("/users", {
        method: "POST",
        body: payload,
      });
      if (response.success) {
        users.value.unshift(response.data);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error("createUser error:", err);
      return {
        success: false,
        error: err.data?.message || "فشل إنشاء المستخدم",
      };
    } finally {
      saving.value = false;
    }
  };

  /** تعديل مستخدم موجود (للأدمن) */
  const updateUser = async (id, payload) => {
    saving.value = true;
    try {
      const response = await api(`/users/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (response.success) {
        const idx = users.value.findIndex((u) => u.id === id);
        if (idx !== -1) {
          users.value[idx] = { ...users.value[idx], ...response.data };
        }
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error("updateUser error:", err);
      return {
        success: false,
        error: err.data?.message || "فشل تعديل المستخدم",
      };
    } finally {
      saving.value = false;
    }
  };

  /** حذف مستخدم */
  const deleteUser = async (id) => {
    saving.value = true;
    try {
      const response = await api(`/users/${id}`, { method: "DELETE" });
      if (response.success) {
        users.value = users.value.filter((u) => u.id !== id);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error("deleteUser error:", err);
      return { success: false, error: err.data?.message || "فشل حذف المستخدم" };
    } finally {
      saving.value = false;
    }
  };

  return {
    users,
    currentUser,
    loading,
    saving,
    error,
    fetchUsers,
    fetchProfile,
    updateProfile,
    createUser,
    updateUser,
    deleteUser,
  };
});

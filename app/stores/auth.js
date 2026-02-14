import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    initialized: false, // متغير للتحقق من تحميل البيانات
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      const api = useApi();
      try {
        const response = await api("/client/auth/login", {
          method: "POST",
          body: credentials,
        });

        if (response.success) {
          this.saveAuthData(response.data);
          return { success: true };
        }
      } catch (error) {
        return {
          success: false,
          error: error.data?.message || "خطأ في تسجيل الدخول",
        };
      }
    },

    saveAuthData(data) {
      // حفظ التوكن في الكوكيز
      const tokenCookie = useCookie("auth_token", {
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      // حفظ في الكوكيز والستور معاً
      tokenCookie.value = data.access_token;
      this.token = data.access_token;
      this.user = data.user;
      this.initialized = true;
    },

    // async fetchUserProfile() {
    //   const tokenCookie = useCookie("auth_token");

    //   // التحقق من وجود توكن في الكوكيز
    //   if (!tokenCookie.value) {
    //     this.clearAuth();
    //     return;
    //   }

    //   // التأكد من تحديث التوكن في الستور
    //   if (!this.token) {
    //     this.token = tokenCookie.value;
    //   }

    //   const api = useApi();
    //   try {
    //     const response = await api("/client/auth/me");
    //     if (response.success) {
    //       this.user = response.data.user;
    //       this.token = tokenCookie.value;
    //       this.initialized = true;
    //     } else {
    //       this.clearAuth();
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user profile:", error);
    //     this.clearAuth();
    //   }
    // },
    async fetchUserProfile() {
      const tokenCookie = useCookie("auth_token");

      // تحميل التوكن فقط من الكوكيز (بدون طلب للسيرفر)
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        // لا نجلب user من السيرفر الآن
        // يمكنك ترك this.user كما هو (null) أو تعيينه لاحقًا
      } else {
        this.clearAuth();
        return;
      }

      // نعتبر أن التهيئة انتهت
      this.initialized = true;
    },

    logout() {
      this.clearAuth();
      navigateTo("/login");
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.initialized = false;

      // مسح الكوكيز بشكل صحيح
      const tokenCookie = useCookie("auth_token");
      tokenCookie.value = null;

      // إعادة توجيه فوراً
      if (process.client) {
        window.location.href = "/";
      }
    },

    // تحميل البيانات من الكوكيز
    async initializeAuth() {
      const tokenCookie = useCookie("auth_token");
      const token = tokenCookie.value;

      if (token) {
        this.token = token;
        await this.fetchUserProfile();
      }
      this.initialized = true;
    },
  },
});

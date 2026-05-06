// stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    initialized: false,
    isRefreshing: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    // ✅ تسجيل الدخول
    async login(credentials) {
      const config = useRuntimeConfig();
      try {
        const payload = {
          identifier: credentials.email,
          password: credentials.password,
        };

        const response = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: "POST",
          body: payload,
        });

        if (response.success) {
          this.saveAuthData(response.data);
          return { success: true };
        }
        return {
          success: false,
          error: response.message || "خطأ في تسجيل الدخول",
        };
      } catch (error) {
        console.error("Login Error:", error);
        return {
          success: false,
          error: error.data?.message || "حدث خطأ غير متوقع",
        };
      }
    },

    // ✅ تسجيل حساب جديد - الدالة المفقودة
    async register(userData) {
      const config = useRuntimeConfig();
      try {
        const response = await $fetch(
          `${config.public.apiBase}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              password: userData.password,
              confirmPassword: userData.confirmPassword,
            },
          },
        );

        if (response.success) {
          // حفظ البيانات وتوجيه المستخدم
          this.saveAuthData(response.data);
          return { success: true };
        }
        return {
          success: false,
          error: response.message || "فشل إنشاء الحساب",
        };
      } catch (error) {
        console.error("Register Error:", error);
        return {
          success: false,
          error: error.data?.message || "حدث خطأ أثناء التسجيل",
        };
      }
    },

    // ✅ حفظ بيانات المصادقة
    saveAuthData(data) {
      const tokenCookie = useCookie("auth_token", {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      const refreshCookie = useCookie("refresh_token", {
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      tokenCookie.value = data.access_token;
      refreshCookie.value = data.refresh_token;

      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      this.initialized = true;
    },

    // ✅ تحديث التوكن
    async refreshAccessToken() {
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!this.isRefreshing && this.token) {
              clearInterval(checkInterval);
              resolve(true);
            } else if (!this.refreshToken) {
              clearInterval(checkInterval);
              resolve(false);
            }
          }, 100);
        });
      }

      const refreshCookie = useCookie("refresh_token");
      const currentRefreshToken = refreshCookie.value;

      if (!currentRefreshToken) {
        this.clearAuth();
        return false;
      }

      this.isRefreshing = true;
      const config = useRuntimeConfig();

      try {
        const response = await $fetch(
          `${config.public.apiBase}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentRefreshToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.success && response.data.access_token) {
          const newAccessToken = response.data.access_token;
          const newRefreshToken =
            response.data.refresh_token || currentRefreshToken;
          const newUser = response.data.user;

          const tokenCookie = useCookie("auth_token", {
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });

          const newRefreshCookie = useCookie("refresh_token", {
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });

          tokenCookie.value = newAccessToken;
          newRefreshCookie.value = newRefreshToken;

          this.token = newAccessToken;
          this.refreshToken = newRefreshToken;
          if (newUser) this.user = newUser;

          this.isRefreshing = false;
          return true;
        } else {
          throw new Error("فشل تحديث التوكن من السيرفر");
        }
      } catch (error) {
        console.error("Refresh Token Failed:", error);
        this.isRefreshing = false;
        this.clearAuth();
        if (process.client) {
          navigateTo("/login");
        }
        return false;
      }
    },

    // ✅ تهيئة حالة المستخدم
    async fetchUserProfile() {
      const tokenCookie = useCookie("auth_token");
      const refreshCookie = useCookie("refresh_token");

      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        if (refreshCookie.value) {
          this.refreshToken = refreshCookie.value;
        }
      } else {
        this.clearAuth();
        return;
      }
      this.initialized = true;
    },

    // ✅ تسجيل الخروج
    logout() {
      this.clearAuth();
      navigateTo("/");
    },

    // ✅ مسح بيانات المصادقة
    clearAuth() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.initialized = false;
      this.isRefreshing = false;

      useCookie("auth_token").value = null;
      useCookie("refresh_token").value = null;

      if (process.client) {
        window.location.href = "/";
      }
    },

    // ✅ تهيئة المصادقة عند تحميل التطبيق
    async initializeAuth() {
      const tokenCookie = useCookie("auth_token");
      const refreshCookie = useCookie("refresh_token");

      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        if (refreshCookie.value) {
          this.refreshToken = refreshCookie.value;
        }
        await this.fetchUserProfile();
      }
      this.initialized = true;
    },
  },
});

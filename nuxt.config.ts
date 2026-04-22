export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  srcDir: "app/",

  modules: [
    "@nuxt/image",
    "nuxt-swiper",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/icon",
    "@formkit/auto-animate",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
  ],

  i18n: {
    locales: [
      {
        code: "ar",
        iso: "ar-SA",
        name: "العربية",
        file: "ar.json",
        dir: "rtl",
      },
      {
        code: "en",
        iso: "en-US",
        name: "English",
        file: "en.json",
        dir: "ltr",
      },
    ],

    defaultLocale: "ar",
    strategy: "no_prefix",

    // ✅ المسار داخل مجلد app/i18n/locales
    langDir: "locales/",

    // ✅ المسار لملف الإعدادات
    vueI18n: "./i18n.config.ts",

    // ✅ الحل الجذري لمشكلة الـ Refresh:
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: true,
      fallbackLocale: "ar",
      redirectOn: "root", // لضمان عدم حدوث Loop في الصفحات الداخلية
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000",
      defaultLang: "ar",
    },
  },

  pinia: {
    storesDirs: ["./stores"],
  },

  css: ["@/assets/css/main.css", "@/assets/css/admin-shared.css"],

  image: {
    domains: ["http://76.13.41.216/", "localhost:4000"],
    format: ["webp"],
  },
});

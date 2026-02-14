// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/image",
    "nuxt-swiper",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@formkit/auto-animate",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
  pinia: {
    storesDirs: ["./stores"],
  },
  css: ["@/assets/css/main.css"],
  image: {
    domains: ["http://76.13.41.216/"], // اسم نطاق السيرفر الخاص بك
    format: ["webp"],
  },
});

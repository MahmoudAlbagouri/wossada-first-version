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
  css: ["@/assets/css/main.css"],
  image: {
    domains: ["your-api-domain.com"], // اسم نطاق السيرفر الخاص بك
    format: ["webp"],
  },
});

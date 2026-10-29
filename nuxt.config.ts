const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3006';
/** Public URL of the store. Unset: absolute links use the domain each request came in on (see `useSiteUrl`). */
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || process.env.NUXT_SITE_URL || '').replace(/\/$/, '') || undefined;

/** Hosts @nuxt/image may fetch and optimize (the API + any extra CDN). */
const imageDomains = [
  new URL(apiBase).host,
  ...(process.env.NUXT_IMAGE_DOMAINS || '').split(',').map((d) => d.trim()).filter(Boolean),
];

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',

  modules: [
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@formkit/auto-animate',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // API layer (`useCatalogService()`, ...) is auto-imported like composables.
  imports: { dirs: ['services'] },

  // Components are referenced by file name only (`<ProductCard />`), whatever folder they live in.
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'theme-color', content: '#987226' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        {
          rel: 'preload',
          href: '/fonts/Cairo-Regular.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        {
          rel: 'preload',
          href: '/fonts/Cairo-Bold.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        { rel: 'preconnect', href: new URL(apiBase).origin, crossorigin: '' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase,
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || '',
      /** `ipx` optimizes images through the Nuxt server; `none` serves them as-is. */
      imageProvider: process.env.NUXT_PUBLIC_IMAGE_PROVIDER || 'ipx',
      /** Must match the API's FREE_SHIPPING_THRESHOLD (0 hides the promo). */
      freeShippingThreshold: Number(process.env.NUXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 0),
    },
  },

  site: {
    url: siteUrl,
    name: process.env.NUXT_PUBLIC_SITE_NAME || 'Aphnan Furniture',
    defaultLocale: 'ar',
  },

  i18n: {
    locales: [
      { code: 'ar', language: 'ar-EG', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    defaultLocale: 'ar',
    strategy: 'no_prefix',
    langDir: 'locales/',
    vueI18n: './i18n.config.ts',
    baseUrl: siteUrl,
    // The cookie remembers the visitor's choice; server/middleware/default-locale.ts
    // makes Arabic the default instead of the browser language.
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      fallbackLocale: 'ar',
    },
  },

  image: {
    domains: imageDomains,
    format: ['avif', 'webp'],
    quality: 80,
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  icon: {
    // Bundle the icons we use instead of fetching them from the Iconify API at runtime.
    serverBundle: { collections: ['ph', 'circle-flags'] },
    clientBundle: { scan: true, sizeLimitKb: 256 },
  },

  robots: {
    disallow: ['/admin', '/account', '/cart', '/checkout', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/account/**', '/cart', '/checkout', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
  },

  routeRules: {
    // Private pages also send `noindex` from their page meta.
    '/admin/**': { ssr: false },
    '/shop': { redirect: '/products' },
    '/account/cart': { redirect: '/cart' },
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } },
  },

  nitro: {
    compressPublicAssets: true,
  },

  experimental: {
    payloadExtraction: true,
  },
});

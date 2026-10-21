/**
 * Store branding & static content. Everything a new deployment needs to
 * change lives here (or in NUXT_PUBLIC_* env vars), never in components.
 */
export default defineAppConfig({
  brand: {
    name: { ar: 'أفنان', en: 'Aphnan' },
    tagline: { ar: 'أثاث يليق بذوقك', en: 'Furniture that fits your taste' },
    description: {
      ar: 'متجر أفنان للأثاث والمفروشات: غرف نوم، أنتريهات، سفرة وديكور بجودة عالية وتوصيل لكل المحافظات.',
      en: 'Aphnan furniture store: bedrooms, living rooms, dining sets and decor with premium quality and nationwide delivery.',
    },
    logo: '/images/logo.webp',
    ogImage: '/images/og-default.jpg',
    currency: 'EGP',
  },

  contact: {
    email: 'info@aphnan.com',
    phone: '+201000000000',
    whatsapp: '201000000000',
    address: { ar: 'القاهرة، جمهورية مصر العربية', en: 'Cairo, Egypt' },
  },

  /** Leave a URL empty to hide that network. */
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    snapchat: '',
    youtube: '',
    x: '',
  },

  branches: [] as { name: { ar: string; en: string }; address: { ar: string; en: string }; mapUrl?: string }[],

  /** Payment logos in the footer. */
  payments: [
    { name: 'Visa', logo: '/images/payments/visa.webp' },
    { name: 'Mastercard', logo: '/images/payments/mastercard.webp' },
    { name: 'Vodafone Cash', logo: '/images/payments/vodafone-cash.webp' },
  ],

  /** Mobile app store links (badges are hidden until a URL is set). */
  apps: [
    { name: 'App Store', badge: '/images/apps/app-store.webp', url: '' },
    { name: 'Google Play', badge: '/images/apps/google-play.webp', url: '' },
    { name: 'AppGallery', badge: '/images/apps/app-gallery.webp', url: '' },
  ],

  ui: {
    /** Shown on product cards while the image loads or when it is missing. */
    placeholderImage: '/images/placeholder.svg',
  },
});

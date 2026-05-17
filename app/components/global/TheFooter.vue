<template>
  <footer class="footer" dir="rtl">
    <!-- ══ شريط السوشيال ══ -->
    <div class="social-bar">
      <span class="social-label">
        <Icon name="ph:heart-fill" class="heart-icon" />
        تابعنا على
      </span>
      <div class="social-icons">
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.href"
          :aria-label="s.name"
          class="social-link"
          target="_blank"
          rel="noopener"
        >
          <img :src="s.img" :alt="s.name" class="social-img" />
        </a>
      </div>
    </div>

    <!-- ══ المحتوى الرئيسي ══ -->
    <div class="footer-main">
      <div class="container">
        <!-- شعار + وصف -->
        <div class="brand-section">
          <div class="brand-logo">
            <Icon name="ph:storefront-fill" class="brand-icon" />
            <span class="brand-name">أفنان</span>
          </div>
          <p class="brand-desc">
            متجرك المفضل للمنتجات عالية الجودة بأفضل الأسعار. نقدم لك تجربة تسوق
            استثنائية مع خدمة عملاء على مدار الساعة.
          </p>
          <div class="brand-stats">
            <div class="stat">
              <span class="stat-num">+١٠٠٠</span>
              <span class="stat-label">منتج</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">+٥٠٠٠</span>
              <span class="stat-label">عميل</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">٥</span>
              <span class="stat-label">فروع</span>
            </div>
          </div>
        </div>

        <!-- شبكة الروابط -->
        <div class="footer-grid">
          <div v-for="col in columns" :key="col.title" class="footer-col">
            <h4 class="col-title">
              <span class="col-title-bar"></span>
              {{ col.title }}
            </h4>
            <ul class="col-list">
              <li v-for="link in col.links" :key="link.label">
                <a :href="link.href" class="col-link">
                  <Icon name="ph:caret-left-bold" class="link-arrow" />
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ قسم الفروع ══ -->
    <div class="branches-section">
      <div class="container">
        <h3 class="branches-title">
          <Icon name="ph:map-pin-fill" class="branches-icon" />
          فروعنا
        </h3>
        <div class="branches-grid">
          <div
            v-for="(branch, idx) in branches"
            :key="branch.name"
            class="branch-card"
            :style="{ animationDelay: `${idx * 80}ms` }"
          >
            <span class="coming-soon-badge">
              <Icon name="ph:clock-countdown" class="badge-clock" />
              قريباً
            </span>
            <div class="branch-icon-wrap">
              <Icon name="ph:storefront" class="branch-icon" />
            </div>
            <div class="branch-info">
              <span class="branch-name">{{ branch.name }}</span>
              <span class="branch-address">{{ branch.address }}</span>
            </div>
            <div class="branch-soon-dots">
              <span class="soon-dot"></span>
              <span class="soon-dot"></span>
              <span class="soon-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ App + Payment ══ -->
    <div class="app-payment-bar">
      <div class="container">
        <div class="app-payment-inner">
          <!-- طرق الدفع -->
          <div class="payment-section">
            <h5 class="section-subtitle">
              <Icon name="ph:credit-card" class="subtitle-icon" />
              ادفع بأمان عبر
            </h5>
            <div class="payment-logos">
              <a
                href="#"
                class="logo-wrap payment-logo-wrap"
                v-for="p in payments"
                :key="p.alt"
              >
                <img :src="p.src" :alt="p.alt" class="payment-img" />
              </a>
            </div>
          </div>

          <!-- تطبيقات -->
          <div class="apps-section">
            <h5 class="section-subtitle">
              <Icon name="ph:device-mobile" class="subtitle-icon" />
              حمّل تطبيقاتنا
            </h5>
            <div class="app-logos">
              <a
                href="#"
                class="app-logo-link"
                v-for="app in apps"
                :key="app.alt"
              >
                <img :src="app.src" :alt="app.alt" class="app-img" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Copyright ══ -->
    <div class="copyright-bar">
      <div class="container">
        <div class="copyright-inner">
          <span class="copyright-text">
            © {{ currentYear }} متجر أفنان — جميع الحقوق محفوظة
          </span>
          <div class="copyright-links">
            <a href="#" class="cp-link">سياسة الخصوصية</a>
            <span class="cp-dot">·</span>
            <a href="#" class="cp-link">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";

const currentYear = ref(new Date().getFullYear());

const socials = [
  { name: "Facebook", img: "/images/logos_facebook.png", href: "#" },
  { name: "Snapchat", img: "/images/mage_snapchat.png", href: "#" },
  { name: "TikTok", img: "/images/mage_tiktok-circle.png", href: "#" },
  { name: "Instagram", img: "/images/skill-icons_instagram.png", href: "#" },
];

const columns = [
  {
    title: "الشركة",
    links: [
      { label: "معلومات عنا", href: "#" },
      { label: "الشروط والأحكام", href: "#" },
      { label: "وظائف", href: "#" },
    ],
  },
  {
    title: "روابط مهمة",
    links: [
      { label: "سياسة الاسترجاع", href: "#" },
      { label: "سياسة الخصوصية", href: "#" },
      { label: "أركان للشركات", href: "#" },
      { label: "الضمان", href: "#" },
    ],
  },
  {
    title: "تريد مساعدة؟",
    links: [
      { label: "تواصل معنا", href: "#" },
      { label: "مركز المساعدة", href: "#" },
      { label: "example@example.com", href: "mailto:example@example.com" },
      { label: "رقم الدعم: 25642", href: "tel:25642" },
    ],
  },
];

const branches = [
  {
    name: "التجمع الخامس",
    address: "القاهرة الجديدة — شارع التسعين الشمالي",
    maps: "https://maps.google.com",
  },
  {
    name: "مدينة نصر",
    address: "شارع عباس العقاد — أمام سيتي ستارز",
    maps: "https://maps.google.com",
  },
  {
    name: "زهراء المعادي",
    address: "شارع النصر — بجوار المعادي الجديدة",
    maps: "https://maps.google.com",
  },
  {
    name: "أكتوبر",
    address: "الحي الثالث عشر — شارع المحاور",
    maps: "https://maps.google.com",
  },
  {
    name: "الإسكندرية",
    address: "كورنيش الإسكندرية — محطة الرمل",
    maps: "https://maps.google.com",
  },
];

const payments = [
  { src: "/images/visa.jpg", alt: "Visa" },
  { src: "/images/mastercard.png", alt: "MasterCard" },
  { src: "/images/vodafone.jpg", alt: "Vodafone Cash" },
];

const apps = [
  { src: "/images/app-store.png", alt: "App Store" },
  { src: "/images/app-gallery.png", alt: "App Gallery" },
  { src: "/images/google-play.png", alt: "Play Store" },
];
</script>

<style scoped lang="scss">
/* ═══════════════════════════════════════════
   المتغيرات المحلية
═══════════════════════════════════════════ */
.footer {
  --footer-bg: var(--color-green-primary);
  --footer-surface: rgba(255, 255, 255, 0.06);
  --footer-border: rgba(255, 255, 255, 0.1);
  --footer-text: rgba(255, 255, 255, 0.85);
  --footer-muted: rgba(255, 255, 255, 0.55);
  --footer-accent: rgba(255, 255, 255, 0.15);

  background: var(--footer-bg);
  color: var(--footer-text);
  margin-top: 100px;
  position: relative;
  overflow: hidden;
  direction: rtl;

  /* خلفية ديكورية */
  &::before {
    content: "";
    position: absolute;
    top: -200px;
    right: -150px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.06),
      transparent 70%
    );
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: 100px;
    left: -100px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.04),
      transparent 70%
    );
    pointer-events: none;
  }
}

/* ═══════════════════════════════════════════
   شريط السوشيال
═══════════════════════════════════════════ */
.social-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 24px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--footer-border);
  flex-wrap: wrap;
}

.social-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.3px;
}

.heart-icon {
  font-size: 14px;
  color: #f87171;
  animation: heartbeat 2.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.25);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.12);
  }
}

.social-icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--footer-surface);
  border: 1px solid var(--footer-border);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-4px) scale(1.08);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.25);
  }
}

.social-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* ═══════════════════════════════════════════
   المحتوى الرئيسي
═══════════════════════════════════════════ */
.footer-main {
  padding: 52px 0 40px;
  position: relative;
  z-index: 1;
}

.footer-main .container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

/* ── الشعار والوصف ── */
.brand-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 36px;
  color: white;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
}

.brand-name {
  font-size: 28px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
}

.brand-desc {
  font-size: 14px;
  color: var(--footer-text);
  line-height: 1.8;
  max-width: 260px;
}

.brand-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--footer-surface);
  border: 1px solid var(--footer-border);
  border-radius: 14px;
  width: fit-content;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: white;
}
.stat-label {
  font-size: 11px;
  color: var(--footer-muted);
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--footer-border);
}

/* ── شبكة الروابط ── */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 800;
  color: white;
  margin-bottom: 18px;
  letter-spacing: 0.2px;
}

.col-title-bar {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.col-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--footer-text);
  text-decoration: none;
  transition: all 0.25s;

  .link-arrow {
    font-size: 11px;
    opacity: 0;
    transform: translateX(4px);
    transition: all 0.25s;
    flex-shrink: 0;
  }

  &:hover {
    color: white;
    transform: translateX(-4px);
    .link-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

/* ═══════════════════════════════════════════
   قسم الفروع
═══════════════════════════════════════════ */
.branches-section {
  padding: 36px 0;
  border-top: 1px solid var(--footer-border);
  border-bottom: 1px solid var(--footer-border);
  background: rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.branches-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;

  .branches-icon {
    font-size: 20px;
    color: #fbbf24;
  }
}

.branches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.branch-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--footer-surface);
  border: 1px solid var(--footer-border);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: branchIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .branch-icon-wrap {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

@keyframes branchIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.branch-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  transition: background 0.25s;
}

.branch-icon {
  font-size: 20px;
  color: white;
  display: block;
}

.branch-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.branch-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
}
.branch-address {
  font-size: 12px;
  color: var(--footer-muted);
  line-height: 1.4;
}

/* شارة "قريباً" */
.coming-soon-badge {
  position: absolute;
  top: -10px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 800;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.3px;
  .badge-clock {
    font-size: 12px;
  }
}

/* نقاط الانتظار */
.branch-soon-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.soon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: dotPulse 1.4s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
    background: rgba(255, 255, 255, 0.8);
  }
}

/* ═══════════════════════════════════════════
   App + Payment
═══════════════════════════════════════════ */
.app-payment-bar {
  padding: 32px 0;
  position: relative;
  z-index: 1;
}

.app-payment-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.section-subtitle {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-bottom: 14px;
  .subtitle-icon {
    font-size: 16px;
  }
}

/* الدفع */
.payment-logos {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.payment-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  padding: 6px 10px;
  transition: all 0.25s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
}

.payment-img {
  height: 28px;
  object-fit: contain;
}

/* التطبيقات */
.app-logos {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.app-logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--footer-border);
  border-radius: 10px;
  padding: 6px 12px;
  transition: all 0.25s;
  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.app-img {
  height: 30px;
  object-fit: contain;
}

/* ═══════════════════════════════════════════
   Copyright
═══════════════════════════════════════════ */
.copyright-bar {
  padding: 16px 0;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid var(--footer-border);
  position: relative;
  z-index: 1;
}

.copyright-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.copyright-text {
  font-size: 13px;
  color: var(--footer-muted);
}

.copyright-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-link {
  font-size: 13px;
  color: var(--footer-muted);
  text-decoration: none;
  transition: color 0.2s;
  &:hover {
    color: white;
  }
}

.cp-dot {
  color: var(--footer-muted);
  font-size: 12px;
}

/* ═══════════════════════════════════════════
   Container
═══════════════════════════════════════════ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
</style>

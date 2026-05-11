<template>
  <section class="features-section" dir="rtl" ref="sectionRef">
    <!-- Decorative Background -->
    <div class="features-bg" aria-hidden="true">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- Intro -->
    <div class="features-intro" :class="{ 'intro-visible': isVisible }">
      <span class="features-eyebrow">
        <span class="eyebrow-line"></span>
        لماذا تختارنا
        <span class="eyebrow-line"></span>
      </span>
      <h2 class="features-heading">نوفّر لك أفضل<br /><em>تجربة تسوّق</em></h2>
      <p class="features-subtext">كل تفصيلة مدروسة، كل خدمة بمستوى استثنائي</p>
    </div>

    <!-- Cards Grid -->
    <div class="features-grid">
      <div
        v-for="(feature, idx) in features"
        :key="feature.key"
        class="feature-card"
        :class="{ 'card-visible': isVisible }"
        :style="{
          '--card-delay': idx * 120 + 'ms',
          '--accent': feature.iconColor,
          '--accent-bg': feature.iconBg,
        }"
        @mouseenter="activeCard = idx"
        @mouseleave="activeCard = null"
      >
        <!-- Card glow on hover -->
        <div class="card-glow"></div>

        <!-- Icon -->
        <div class="feature-icon-wrap">
          <div class="feature-icon">
            <component :is="feature.icon" :color="feature.iconColor" />
          </div>
          <div class="icon-ring"></div>
        </div>

        <!-- Badge -->
        <span class="feature-badge">
          <span class="badge-dot"></span>
          {{ feature.badge }}
        </span>

        <!-- Body -->
        <div class="feature-body">
          <p class="feature-title">{{ feature.title }}</p>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>

        <!-- Bottom accent line -->
        <div class="card-bottom-line"></div>
      </div>
    </div>

    <!-- Bottom decorative row -->
    <div class="features-footer" :class="{ 'footer-visible': isVisible }">
      <div class="trust-pill" v-for="pill in trustPills" :key="pill">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="var(--color-gold)"
          stroke="none"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
        {{ pill }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// ===== Intersection Observer =====
const sectionRef = ref(null);
const isVisible = ref(false);
const activeCard = ref(null);
let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.15 },
  );
  if (sectionRef.value) observer.observe(sectionRef.value);
});
onUnmounted(() => observer?.disconnect());

// ===== Icons =====
const IconTruck = {
  props: ["color"],
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
      <rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1.2"/>
      <circle cx="20" cy="21" r="1.2"/>
    </svg>
  `,
};

const IconTag = {
  props: ["color"],
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
    </svg>
  `,
};

const IconHeadset = {
  props: ["color"],
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 11a9 9 0 1 1 18 0"/>
      <path d="M20 12v2a2 2 0 0 1-2 2h-1"/>
      <path d="M4 12v2a2 2 0 0 0 2 2h1"/>
      <path d="M8 21h8"/>
      <path d="M12 17v4"/>
    </svg>
  `,
};

const IconShield = {
  props: ["color"],
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  `,
};

// ===== Data =====
const features = [
  {
    key: "delivery",
    title: "توصيل سريع",
    desc: "لباب بيتك في أسرع وقت ممكن بعناية تامة",
    badge: "خلال 48 ساعة",
    icon: IconTruck,
    iconBg: "#E3F5EE",
    iconColor: "#0C7A5E",
  },
  {
    key: "price",
    title: "سعر منافس",
    desc: "أسعار لا تُقارن مع جودة لا تُضاهى في كل منتج",
    badge: "أفضل الأسعار",
    icon: IconTag,
    iconBg: "#FEF0D8",
    iconColor: "#9A5A0A",
  },
  {
    key: "support",
    title: "دعم فني",
    desc: "فريق متخصص متاح لمساعدتك في أي وقت تحتاج",
    badge: "24 / 7",
    icon: IconHeadset,
    iconBg: "#E4EFFC",
    iconColor: "#1756A8",
  },
  {
    key: "warranty",
    title: "ضمان شامل",
    desc: "ضمان موثوق على جميع المنتجات مع خدمة ما بعد البيع",
    badge: "سنة كاملة",
    icon: IconShield,
    iconBg: "#FCE8F0",
    iconColor: "#A0335A",
  },
];

const trustPills = ["ألف عميل راضٍ", "تسليم آمن", "جودة مضمونة", "دفع مرن"];
</script>

<style scoped>
/* ===== Section ===== */
.features-section {
  position: relative;
  padding: clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px);
  font-family: "Cairo", sans-serif;
  overflow: hidden;
  background: linear-gradient(160deg, #fdfaf4 0%, #f5edd8 100%);
}

/* ===== Decorative Background ===== */
.features-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.25;
}
.bg-orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #d4a83a, transparent);
  top: -120px;
  right: -100px;
  animation: orbFloat 8s ease-in-out infinite;
}
.bg-orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #0c7a5e, transparent);
  bottom: -80px;
  left: -60px;
  animation: orbFloat 10s ease-in-out infinite reverse;
}
@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -15px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.97);
  }
}
.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(152, 114, 38, 0.06) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
}

/* ===== Intro ===== */
.features-intro {
  text-align: center;
  margin-bottom: clamp(32px, 5vw, 52px);
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.intro-visible {
  opacity: 1;
  transform: translateY(0);
}
.features-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #987226;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.eyebrow-line {
  display: block;
  width: 28px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #987226);
  border-radius: 2px;
}
.eyebrow-line:last-child {
  background: linear-gradient(90deg, #987226, transparent);
}
.features-heading {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 900;
  color: #1a1208;
  margin: 0 0 12px;
  line-height: 1.3;
}
.features-heading em {
  font-style: normal;
  background: linear-gradient(135deg, #987226, #d4a83a, #987226);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: goldShimmer 3s linear infinite;
}
@keyframes goldShimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.features-subtext {
  font-size: clamp(13px, 2.5vw, 15px);
  color: #a08050;
  margin: 0;
  font-weight: 500;
}

/* ===== Grid ===== */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(10px, 2vw, 20px);
  max-width: 1100px;
  margin: 0 auto;
}

/* ===== Card ===== */
.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(152, 114, 38, 0.1);
  border-radius: clamp(16px, 2.5vw, 24px);
  padding: clamp(20px, 3vw, 32px) clamp(16px, 2vw, 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 2vw, 18px);
  text-align: center;
  cursor: pointer;
  overflow: hidden;

  opacity: 0;
  transform: translateY(32px) scale(0.95);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--card-delay, 0ms),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--card-delay, 0ms),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}
.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.feature-card:hover {
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.1),
    0 0 0 1px var(--accent);
  border-color: var(--accent);
  transform: translateY(-6px) scale(1.02);
}

/* Card glow */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    var(--accent-bg, #faeeda),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.feature-card:hover .card-glow {
  opacity: 0.7;
}

/* Bottom accent line */
.card-bottom-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  border-radius: 0 0 24px 24px;
}
.feature-card:hover .card-bottom-line {
  transform: scaleX(1);
}

/* ===== Icon ===== */
.feature-icon-wrap {
  position: relative;
  width: clamp(52px, 8vw, 68px);
  height: clamp(52px, 8vw, 68px);
}
.feature-icon {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  z-index: 1;
}
.feature-card:hover .feature-icon {
  transform: scale(1.12) rotate(-5deg);
}

.icon-ring {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  border: 2px solid var(--accent);
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.feature-card:hover .icon-ring {
  opacity: 0.4;
  transform: scale(1);
}

/* ===== Badge ===== */
.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: clamp(10px, 1.8vw, 12px);
  font-weight: 800;
  padding: 5px 14px;
  border-radius: 50px;
  background: var(--accent-bg);
  color: var(--accent);
  letter-spacing: 0.04em;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.3s;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: badgePulse 2s infinite;
}
@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.6;
  }
}
.feature-card:hover .feature-badge {
  transform: scale(1.05);
}

/* ===== Body ===== */
.feature-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feature-title {
  font-size: clamp(14px, 2.2vw, 16px);
  font-weight: 800;
  color: #1a1208;
  margin: 0;
}
.feature-desc {
  font-size: clamp(11.5px, 1.8vw, 13px);
  color: #8a7055;
  margin: 0;
  line-height: 1.7;
}

/* ===== Footer Trust Pills ===== */
.features-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: clamp(24px, 4vw, 40px);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.7s 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.footer-visible {
  opacity: 1;
  transform: translateY(0);
}
.trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: clamp(11px, 2vw, 13px);
  font-weight: 700;
  color: #7a5c20;
  background: rgba(152, 114, 38, 0.08);
  border: 1px solid rgba(152, 114, 38, 0.15);
  padding: 6px 16px;
  border-radius: 50px;
  transition: all 0.25s;
}
.trust-pill:hover {
  background: rgba(152, 114, 38, 0.15);
  transform: translateY(-2px);
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .feature-card {
    padding: 18px 12px;
    gap: 10px;
    border-radius: 16px;
  }
  .features-section {
    padding: 40px 14px;
  }
  .trust-pill {
    font-size: 10px;
    padding: 5px 12px;
  }
}
@media (max-width: 360px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .features-intro,
  .features-footer {
    transition: none;
    opacity: 1;
    transform: none;
  }
  .bg-orb-1,
  .bg-orb-2 {
    animation: none;
  }
  .features-heading em {
    animation: none;
  }
  .badge-dot {
    animation: none;
  }
}
</style>

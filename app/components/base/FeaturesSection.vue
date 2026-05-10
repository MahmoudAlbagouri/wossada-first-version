<template>
  <section class="features-section" dir="rtl">
    <div class="features-intro">
      <p class="features-eyebrow">لماذا تختارنا</p>
      <h2 class="features-heading">نوفّر لك أفضل تجربة تسوّق</h2>
    </div>

    <div class="features-grid">
      <div v-for="feature in features" :key="feature.key" class="feature-card">
        <div class="feature-icon" :style="{ background: feature.iconBg }">
          <component :is="feature.icon" :color="feature.iconColor" />
        </div>

        <div class="feature-body">
          <p class="feature-title">{{ feature.title }}</p>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>

        <span
          class="feature-badge"
          :style="{ background: feature.iconBg, color: feature.iconColor }"
        >
          {{ feature.badge }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
// ===== Icons (inline SVG components) =====
const IconTruck = {
  props: ["color"],
  template: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
      <rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
    </svg>
  `,
};

const IconTag = {
  props: ["color"],
  template: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  `,
};

const IconHeadset = {
  props: ["color"],
  template: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  `,
};

// ===== بيانات الميزات =====
const features = [
  {
    key: "delivery",
    title: "التوصيل السريع",
    desc: "توصيل لباب بيتك في أسرع وقت ممكن",
    badge: "خلال 48 ساعة",
    icon: IconTruck,
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
  },
  {
    key: "price",
    title: "سعر منافس",
    desc: "أسعار لا تُقارن مع جودة لا تُضاهى",
    badge: "أفضل الأسعار",
    icon: IconTag,
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
  },
  {
    key: "support",
    title: "دعم فني",
    desc: "فريق متاح لمساعدتك في أي وقت",
    badge: "24 / 7",
    icon: IconHeadset,
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
  },
  {
    key: "warranty",
    title: "ضمان",
    desc: "ضمان شامل على جميع المنتجات",
    badge: "سنة كاملة",
    icon: IconShield,
    iconBg: "#FBEAF0",
    iconColor: "#993556",
  },
];
</script>

<style scoped>
.features-section {
  padding: 60px 24px;
  font-family: "Cairo", sans-serif;
}

/* ===== Intro ===== */
.features-intro {
  text-align: center;
  margin-bottom: 40px;
}
.features-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #987226;
  text-transform: uppercase;
  margin: 0 0 8px;
}
.features-heading {
  font-size: 26px;
  font-weight: 700;
  color: #2a2015;
  margin: 0;
}

/* ===== Grid ===== */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e8e0cf;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e0cf;
  max-width: 960px;
  margin: 0 auto;
}

/* ===== Card ===== */
.feature-card {
  background: #fff;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  transition: background 0.2s;
}
.feature-card:hover {
  background: #fdfaf4;
}

/* ===== Icon ===== */
.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ===== Body ===== */
.feature-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feature-title {
  font-size: 15px;
  font-weight: 700;
  color: #2a2015;
  margin: 0;
}
.feature-desc {
  font-size: 12.5px;
  color: #888;
  margin: 0;
  line-height: 1.65;
}

/* ===== Badge ===== */
.feature-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .features-heading {
    font-size: 22px;
  }
}
@media (max-width: 420px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .features-section {
    padding: 40px 16px;
  }
}
</style>

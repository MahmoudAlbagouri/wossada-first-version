<template>
  <div class="home-page">
    <!-- ===== Loading State ===== -->
    <div v-if="store.homeLoading" class="home-loading">
      <div class="skeleton-hero">
        <div class="skeleton-shimmer"></div>
        <div class="skeleton-dots">
          <span v-for="i in 3" :key="i"></span>
        </div>
      </div>
      <div class="skeleton-row">
        <div class="skeleton-block" v-for="i in 5" :key="i">
          <div class="skeleton-shimmer"></div>
        </div>
      </div>
      <div class="skeleton-slider">
        <div class="skeleton-shimmer"></div>
      </div>
    </div>

    <!-- ===== Error State ===== -->
    <div v-else-if="store.homeError" class="home-error">
      <div class="error-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p>{{ store.homeError }}</p>
      <button @click="store.fetchHomePage()" class="retry-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        إعادة المحاولة
      </button>
    </div>

    <!-- ===== Dynamic Sections ===== -->
    <template v-else>
      <template
        v-for="(section, idx) in store.sortedHomeSections"
        :key="section.id"
      >
        <template v-if="section.isActive !== false">
          <!-- ① Main Slider (Hero) -->
          <section
            v-if="section.type === 'mainSlider'"
            class="section-hero reveal-section"
            :style="{ '--delay': '0ms' }"
          >
            <BannerSlider
              v-if="section.data?.[0]?.items?.length"
              :banners="mapSliderItems(section.data[0].items)"
            />
          </section>

          <!-- ② Product Slider -->
          <section
            v-else-if="section.type === 'productSlider'"
            class="section-products reveal-section"
            :style="{ '--delay': idx * 80 + 'ms' }"
          >
            <MainSlider
              v-if="section.data?.[0]?.products?.length"
              :key="
                'slider-' + section.id + '-' + section.data[0].products.length
              "
              :title="getSliderTitle(section.data[0])"
              highlight="مشاهدة المزيد"
              :products="mapProducts(section.data[0].products)"
            />
          </section>

          <!-- ③ Full Image Banner -->
          <section
            v-else-if="section.type === 'fullImage'"
            class="section-full-image reveal-section"
            :style="{ '--delay': idx * 80 + 'ms' }"
          >
            <template v-if="section.data?.[0]">
              <a
                v-if="section.data[0].translations?.[0]?.link"
                :href="section.data[0].translations[0].link"
                class="full-image-link"
              >
                <div class="full-image-wrapper">
                  <img
                    :src="section.data[0].imageUrl"
                    :alt="section.section_key"
                    loading="lazy"
                    class="full-image-img"
                    @error="handleImgError"
                  />
                  <div class="full-image-overlay"></div>
                  <div class="full-image-cta">
                    <span>تسوق الآن</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </a>
              <div v-else class="full-image-wrapper">
                <img
                  :src="section.data[0].imageUrl"
                  :alt="section.section_key"
                  loading="lazy"
                  class="full-image-img"
                  @error="handleImgError"
                />
              </div>
            </template>
          </section>

          <!-- ④ Fixed Banner -->
          <section
            v-else-if="section.type === 'fixedBanner'"
            class="section-fixed-banner reveal-section"
            :style="{ '--delay': idx * 80 + 'ms' }"
          >
            <template v-if="section.data?.[0]">
              <a
                v-if="section.data[0].translations?.[0]?.link"
                :href="section.data[0].translations[0].link"
                class="fixed-banner-link"
              >
                <div class="fixed-banner-wrap">
                  <img
                    :src="section.data[0].imageUrl"
                    :alt="
                      section.data[0].translations?.[0]?.title ||
                      section.section_key
                    "
                    loading="lazy"
                    class="fixed-banner-img"
                    @error="handleImgError"
                  />
                  <div class="fixed-banner-overlay">
                    <div
                      v-if="section.data[0].translations?.[0]?.title"
                      class="fixed-banner-content"
                    >
                      <span class="fixed-banner-title">{{
                        section.data[0].translations[0].title
                      }}</span>
                      <span class="fixed-banner-arrow">←</span>
                    </div>
                  </div>
                </div>
              </a>
              <div v-else class="fixed-banner-wrap">
                <img
                  :src="section.data[0].imageUrl"
                  :alt="section.section_key"
                  loading="lazy"
                  class="fixed-banner-img"
                  @error="handleImgError"
                />
              </div>
            </template>
          </section>

          <!-- ⑤ Category Grid -->
          <section
            v-else-if="section.type === 'CATEGORY_GRID'"
            class="section-categories reveal-section"
            :style="{ '--delay': idx * 80 + 'ms' }"
          >
            <div class="section-header">
              <span class="section-eyebrow">تسوق حسب</span>
              <h2 class="section-title">الأقسام</h2>
              <div class="title-underline"></div>
            </div>
            <div class="categories-grid" v-if="section.data?.length">
              <NuxtLink
                v-for="(cat, catIdx) in section.data"
                :key="cat.id"
                :to="`/category/${cat.slug}`"
                class="category-item"
                :style="{ '--cat-delay': catIdx * 60 + 'ms' }"
              >
                <div class="category-image-wrap">
                  <div class="category-image">
                    <img
                      v-if="cat.image"
                      :src="cat.image"
                      :alt="cat.name"
                      loading="lazy"
                      @error="handleImgError"
                    />
                    <div v-else class="category-placeholder">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </div>
                  </div>
                  <div class="category-glow"></div>
                </div>
                <p class="category-name">{{ cat.name }}</p>
              </NuxtLink>
            </div>
          </section>

          <!-- ⑥ Static Section -->
          <section
            v-else-if="section.type === 'staticSection'"
            class="section-static reveal-section"
            :style="{ '--delay': idx * 80 + 'ms' }"
          >
            <FeaturesSection v-if="section.section_key === 'features'" />
          </section>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useHomeConfigsStore } from "@/stores/homeConfigs";
import FeaturesSection from "~/components/base/FeaturesSection.vue";

const store = useHomeConfigsStore();

// Intersection Observer for reveal animations
let observer = null;

onMounted(async () => {
  await store.fetchHomePage();
  initRevealObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const initRevealObserver = () => {
  if (typeof window === "undefined") return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  // Re-query after DOM update
  setTimeout(() => {
    document.querySelectorAll(".reveal-section").forEach((el) => {
      observer.observe(el);
    });
    document.querySelectorAll(".category-item").forEach((el) => {
      observer.observe(el);
    });
  }, 200);
};

const getFirstTrans = (transArray) => {
  if (!transArray) return {};
  return Array.isArray(transArray) ? transArray[0] || {} : transArray;
};

const mapSliderItems = (items = []) =>
  [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const trans = getFirstTrans(item.translations);
      return {
        title: trans.title ?? "",
        buttonText: trans.buttonText ?? "",
        buttonLink: trans.buttonLink ?? "#",
        image: item.imageUrl ?? "",
      };
    });

const getSliderTitle = (sliderData) => {
  if (!sliderData) return "";
  const trans = getFirstTrans(sliderData.translations);
  return trans.title ?? sliderData.key ?? "";
};

const mapProducts = (products = []) =>
  products.map((p) => {
    const trans = getFirstTrans(p.translations);
    return {
      id: p.id,
      slug: p.slug,
      mainImage: p.mainImage,
      basePrice: p.basePrice,

      baseDiscountPrice: p.baseDiscountPrice,
      baseStock: 50,
      translations: [
        {
          name: trans.name ?? "منتج أفنان",
          languageCode: trans.languageCode || "ar",
        },
      ],
    };
  });

const handleImgError = (e) => {
  e.target.src = "/images/placeholder.jpg";
};
</script>

<style scoped>
/* ===== Base ===== */
.home-page {
  min-height: 100vh;
  direction: rtl;
  background: #f7f4ee;
}

/* ===== Reveal Animation ===== */
.reveal-section {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms);
  will-change: opacity, transform;
}
.reveal-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== Loading State ===== */
.home-loading {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}
.skeleton-hero {
  width: 100%;
  height: clamp(220px, 55vw, 480px);
  border-radius: 16px;
  background: #e8e1d3;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
}
.skeleton-dots {
  display: flex;
  gap: 8px;
  z-index: 1;
}
.skeleton-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(152, 114, 38, 0.35);
  animation: dotPulse 1.4s infinite ease-in-out;
}
.skeleton-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.skeleton-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.45) 50%,
    transparent 70%
  );
  background-size: 250% 100%;
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-row {
  display: flex;
  gap: 10px;
}
.skeleton-block {
  flex: 1;
  height: 110px;
  border-radius: 12px;
  background: #e8e1d3;
  overflow: hidden;
  position: relative;
  min-width: 0;
}
.skeleton-slider {
  width: 100%;
  height: 240px;
  border-radius: 14px;
  background: #e8e1d3;
  overflow: hidden;
  position: relative;
}

/* ===== Error State ===== */
.home-error {
  text-align: center;
  padding: 100px 24px;
  color: #a89070;
  font-family: "Cairo", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.error-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0e8d8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #987226;
  animation: errorPulse 2s infinite;
}
@keyframes errorPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(152, 114, 38, 0.2);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(152, 114, 38, 0);
  }
}
.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #987226, #c09840);
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(152, 114, 38, 0.35);
}
.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(152, 114, 38, 0.4);
}
.retry-btn:active {
  transform: translateY(0);
}

/* ===== Hero ===== */
.section-hero {
  width: 100%;
}

/* ===== Products ===== */
.section-products {
  margin-bottom: 8px;
}

/* ===== Full Image ===== */
.section-full-image {
  width: 100%;
  overflow: hidden;
  margin: 4px 0;
}
.full-image-link {
  display: block;
}
.full-image-wrapper {
  position: relative;
  overflow: hidden;
}
.full-image-img {
  width: 100%;
  display: block;
  border-radius: 0;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.full-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.3), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
}
.full-image-cta {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%) translateX(20px);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(152, 114, 38, 0.9);
  color: #fff;
  padding: 10px 22px;
  border-radius: 50px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  backdrop-filter: blur(8px);
}
.full-image-link:hover .full-image-img {
  transform: scale(1.03);
}
.full-image-link:hover .full-image-overlay {
  opacity: 1;
}
.full-image-link:hover .full-image-cta {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* ===== Fixed Banner ===== */
.section-fixed-banner {
  padding: 12px 16px;
}
.fixed-banner-link {
  display: block;
}
.fixed-banner-wrap {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.fixed-banner-img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: clamp(160px, 40vw, 300px);
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fixed-banner-link:hover .fixed-banner-img {
  transform: scale(1.04);
}
.fixed-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 20px 24px;
}
.fixed-banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fixed-banner-title {
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-size: clamp(16px, 4vw, 22px);
  font-weight: 800;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}
.fixed-banner-arrow {
  color: #ffd97a;
  font-size: 22px;
  transition: transform 0.3s;
}
.fixed-banner-link:hover .fixed-banner-arrow {
  transform: translateX(-4px);
}

/* ===== Categories ===== */
.section-categories {
  padding: clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px);
  font-family: "Cairo", sans-serif;
}
.section-header {
  text-align: center;
  margin-bottom: clamp(24px, 4vw, 40px);
}
.section-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #987226;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.section-title {
  font-size: clamp(22px, 5vw, 32px);
  font-weight: 800;
  color: #2a1f0e;
  margin: 0 0 12px;
}
.title-underline {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #987226, #f0c040);
  border-radius: 2px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: clamp(12px, 2.5vw, 24px);
  max-width: 1200px;
  margin: 0 auto;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: clamp(14px, 2.5vw, 20px) 12px;
  background: #fff;
  border-radius: 20px;
  text-decoration: none;
  opacity: 0;
  transform: translateY(24px) scale(0.95);
  transition:
    opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) var(--cat-delay, 0ms),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) var(--cat-delay, 0ms),
    box-shadow 0.3s ease;
  border: 1px solid rgba(152, 114, 38, 0.08);
  position: relative;
  overflow: hidden;
}
.category-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(152, 114, 38, 0.06), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.category-item.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.category-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(152, 114, 38, 0.15);
}
.category-item:hover::before {
  opacity: 1;
}

.category-image-wrap {
  position: relative;
  width: clamp(64px, 10vw, 100px);
  height: clamp(64px, 10vw, 100px);
}
.category-image {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, #faf3e4, #f0e8d0);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.category-item:hover .category-image {
  transform: scale(1.08) rotate(-2deg);
}
.category-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  transition: transform 0.4s;
}
.category-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: radial-gradient(circle, rgba(152, 114, 38, 0.2), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.category-item:hover .category-glow {
  opacity: 1;
}
.category-placeholder {
  color: #c5b08a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.category-name {
  font-weight: 700;
  font-size: clamp(12px, 2vw, 15px);
  color: #2a1f0e;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .section-fixed-banner {
    padding: 10px 12px;
  }
  .full-image-cta {
    display: none;
  }
}
@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .skeleton-row .skeleton-block:nth-child(n + 4) {
    display: none;
  }
}
@media (max-width: 360px) {
  .section-categories {
    padding: 28px 12px;
  }
}

/* ===== Performance: Reduce motion ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal-section,
  .category-item {
    transition: none;
    opacity: 1;
    transform: none;
  }
  .skeleton-shimmer {
    animation: none;
  }
}
</style>

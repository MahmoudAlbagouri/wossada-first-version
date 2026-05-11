<template>
  <div
    class="main-slider"
    ref="sliderRef"
    :class="{ 'slider-visible': isVisible }"
  >
    <div class="container">
      <div class="product-slider-wrapper">
        <!-- Header -->
        <div v-if="title" class="slider-header">
          <div class="slider-title-group">
            <span class="slider-eyebrow">مجموعة مختارة</span>
            <h3 class="slider-title">{{ title }}</h3>
          </div>
          <a href="" class="slider-more-btn">
            <span>{{ highlight }}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
          </a>
        </div>

        <!-- Slider -->
        <div v-show="isClient" class="swiper-outer">
          <div class="swiper" ref="swiperEl">
            <div class="swiper-wrapper">
              <div
                v-for="(product, index) in products"
                :key="index"
                class="swiper-slide"
              >
                <ProductCard :product="product" />
              </div>
            </div>
          </div>

          <!-- Custom Nav Buttons -->
          <button
            ref="prevBtn"
            class="slider-nav-btn prev-btn"
            @click="slidePrev"
            aria-label="السابق"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            ref="nextBtn"
            class="slider-nav-btn next-btn"
            @click="slideNext"
            aria-label="التالي"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <!-- Progress indicator -->
        <div v-show="isClient && products.length" class="slider-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
          <span class="progress-count"
            >{{ currentSlide + 1 }} / {{ products.length }}</span
          >
        </div>

        <!-- Skeleton -->
        <div v-if="!isClient" class="swiper-skeleton">
          <div
            v-for="i in 4"
            :key="i"
            class="skeleton-slide"
            :style="{ '--s-delay': i * 80 + 'ms' }"
          >
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line long"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import ProductCard from "./ProductCard.vue";
import Swiper from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

const props = defineProps({
  title: { type: String, default: "" },
  highlight: { type: String, default: "" },
  products: { type: Array, default: () => [] },
});

const swiperEl = ref(null);
const prevBtn = ref(null);
const nextBtn = ref(null);
const sliderRef = ref(null);
let swiperInstance = null;
const isClient = ref(false);
const isVisible = ref(false);
const currentSlide = ref(0);

const progressWidth = computed(() => {
  if (!props.products.length) return 0;
  return ((currentSlide.value + 1) / props.products.length) * 100;
});

let observer = null;

onMounted(() => {
  isClient.value = true;

  // Intersection Observer for entrance animation
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.1 },
  );
  if (sliderRef.value) observer.observe(sliderRef.value);

  if (swiperEl.value && typeof window !== "undefined") {
    swiperInstance = new Swiper(swiperEl.value, {
      modules: [Autoplay, Navigation],
      slidesPerView: 1.8,
      spaceBetween: 12,
      loop: props.products.length > 4,
      centeredSlides: false,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: { prevEl: prevBtn.value, nextEl: nextBtn.value },
      breakpoints: {
        480: { slidesPerView: 2, spaceBetween: 14, centeredSlides: false },
        768: { slidesPerView: 2.5, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
        1280: { slidesPerView: 4, spaceBetween: 28 },
        1440: { slidesPerView: 5, spaceBetween: 20 },
      },
      on: {
        slideChange(swiper) {
          currentSlide.value = swiper.realIndex ?? swiper.activeIndex;
        },
      },
      keyboard: true,
      updateOnWindowResize: true,
      watchOverflow: true,
    });
  }
});

onUnmounted(() => {
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }
  observer?.disconnect();
});

const slidePrev = () => swiperInstance?.slidePrev();
const slideNext = () => swiperInstance?.slideNext();
</script>

<style scoped lang="scss">
/* ===== Section ===== */
.main-slider {
  background: linear-gradient(180deg, #f0ead9 0%, #e8dfc8 100%);
  position: relative;
  overflow: hidden;
  padding-bottom: 4px;
  @media (max-width: 500px) {
    .container {
      padding: unset;
    }
  }
  /* Entrance animation */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      #987226,
      #d4a83a,
      #987226,
      transparent
    );
    transform: scaleX(0);
    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &.slider-visible::before {
    transform: scaleX(1);
  }
}

/* Subtle noise texture overlay */
.main-slider::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.5;
}

.product-slider-wrapper {
  padding: clamp(20px, 4vw, 32px) 0;
}

/* ===== Header ===== */
.slider-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 0 clamp(12px, 3vw, 20px);
  margin-bottom: clamp(16px, 3vw, 24px);
}
.slider-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.slider-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #987226;
  text-transform: uppercase;
  font-family: "Cairo", sans-serif;
}
.slider-title {
  font-size: clamp(18px, 3.5vw, 24px);
  font-weight: 900;
  color: #2a1f0e;
  margin: 0;
  font-family: "Cairo", sans-serif;
  line-height: 1.2;
}
.slider-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Cairo", sans-serif;
  font-size: clamp(12px, 2vw, 14px);
  font-weight: 700;
  color: #2a1f0e;
  background: rgba(152, 114, 38, 0.1);
  border: 1.5px solid rgba(152, 114, 38, 0.2);
  padding: 8px 18px;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    transition: transform 0.3s;
  }

  &:hover {
    background: #987226;
    color: #fff;
    border-color: #987226;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(152, 114, 38, 0.3);

    svg {
      transform: translateX(-4px);
    }
  }
}

/* ===== Swiper Outer ===== */
.swiper-outer {
  position: relative;
}
.swiper {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: clamp(8px, 2vw, 14px) clamp(12px, 3vw, 20px);
}
.swiper-wrapper {
  display: flex;
  transition-property: transform;
  box-sizing: content-box;
  will-change: transform;
}
.swiper-slide {
  flex-shrink: 0;
  width: 100%;
  height: auto;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s;
}

/* Fade side cards slightly */
.swiper-slide:not(.swiper-slide-active):not(.swiper-slide-next) {
  opacity: 0.85;
}

/* ===== Nav Buttons ===== */
.slider-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: clamp(36px, 5vw, 44px);
  height: clamp(36px, 5vw, 44px);
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid rgba(152, 114, 38, 0.2);
  color: #5a3e10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #987226;
    color: #fff;
    border-color: #987226;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 8px 24px rgba(152, 114, 38, 0.35);
  }

  &:active {
    transform: translateY(-50%) scale(0.96);
  }

  &.prev-btn {
    right: 6px;
  }
  &.next-btn {
    left: 6px;
  }
}

/* ===== Progress ===== */
.slider-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 clamp(12px, 3vw, 20px);
  margin-top: clamp(12px, 2vw, 18px);
}
.progress-track {
  flex: 1;
  height: 3px;
  background: rgba(152, 114, 38, 0.15);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #987226, #d4a83a);
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.progress-count {
  font-family: "Cairo", sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #987226;
  min-width: 40px;
  text-align: left;
}

/* ===== Skeleton ===== */
.swiper-skeleton {
  display: flex;
  gap: clamp(10px, 2vw, 20px);
  overflow: hidden;
  padding: 8px clamp(12px, 3vw, 20px);
}
.skeleton-slide {
  height: auto;
  min-width: clamp(160px, 30vw, 240px);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  overflow: hidden;
  animation: skeletonFade 0.5s ease-out var(--s-delay, 0ms) both;
}
@keyframes skeletonFade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.skeleton-img {
  width: 100%;
  height: clamp(140px, 25vw, 200px);
  background: linear-gradient(90deg, #e8dfc8 25%, #d8cebc 50%, #e8dfc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e8dfc8 25%, #d8cebc 50%, #e8dfc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite 0.15s;
}
.skeleton-line.long {
  width: 80%;
}
.skeleton-line.short {
  width: 45%;
}
.skeleton-btn {
  height: 36px;
  border-radius: 8px;
  margin-top: 4px;
  background: linear-gradient(90deg, #e8dfc8 25%, #d8cebc 50%, #e8dfc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite 0.3s;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .slider-nav-btn {
    display: none;
  }
  .swiper {
    padding: 8px 6px 12px;
  }
  .slider-header {
    padding: 0 12px;
  }
  .slider-progress {
    padding: 0 12px;
  }
}
@media (max-width: 480px) {
  .slider-more-btn {
    padding: 6px 14px;
    font-size: 12px;
  }
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .main-slider::before {
    transition: none;
    transform: scaleX(1);
  }
  .skeleton-img,
  .skeleton-line,
  .skeleton-btn {
    animation: none;
  }
}
</style>

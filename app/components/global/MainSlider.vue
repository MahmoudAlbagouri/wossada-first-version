<template>
  <div class="main-slider">
    <div class="container">
      <div class="product-slider-wrapper">
        <div v-if="title" class="slider-title">
          {{ title }}
          <a href=""
            ><span class="slider-title-highlight">{{ highlight }}</span></a
          >
        </div>

        <div v-show="isClient" class="swiper" ref="swiperEl">
          <div class="swiper-wrapper">
            <div
              v-for="(product, index) in products"
              :key="index"
              class="swiper-slide"
            >
              <ProductCard :product="product" />
            </div>
          </div>

          <button
            ref="prevBtn"
            class="slider-nav-btn prev-btn"
            @click="slidePrev"
            aria-label="السابق"
          >
            <Icon name="ph:caret-left" class="nav-icon" />
          </button>
          <button
            ref="nextBtn"
            class="slider-nav-btn next-btn"
            @click="slideNext"
            aria-label="التالي"
          >
            <Icon name="ph:caret-right" class="nav-icon" />
          </button>
        </div>

        <div v-if="!isClient" class="swiper-skeleton">
          <div v-for="i in 5" :key="i" class="skeleton-slide"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ProductCard from "./ProductCard.vue";

// ✅ استيراد Swiper + الوحدات المطلوبة
import Swiper from "swiper";
import { Autoplay, Navigation } from "swiper/modules";

// ✅ استيراد CSS الضروري لوظائف Swiper
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
let swiperInstance = null;
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;

  if (swiperEl.value && typeof window !== "undefined") {
    swiperInstance = new Swiper(swiperEl.value, {
      // ✅ تفعيل الوحدات
      modules: [Autoplay, Navigation],

      slidesPerView: 1.2,
      spaceBetween: 5,
      loop: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true, // اختياري: إيقاف مؤقت عند التحوّم
      },
      navigation: {
        prevEl: prevBtn.value,
        nextEl: nextBtn.value,
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 28 },
        1280: { slidesPerView: 4, spaceBetween: 32 },
        1440: { slidesPerView: 5, spaceBetween: 10 },
      },
      mousewheel: true,
      keyboard: true,
      preloadImages: false,
      lazy: true,
      updateOnWindowResize: true,
    });
  }
});

onUnmounted(() => {
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }
});

const slidePrev = () => swiperInstance?.slidePrev();
const slideNext = () => swiperInstance?.slideNext();
</script>

<style scoped lang="scss">
.main-slider {
  background-color: var(--color-green-light);
}

.product-slider-wrapper {
  padding: 20px 0;
}

.slider-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-green-dark);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .slider-title-highlight {
    background: var(--color-green-light-active);
    color: var(--color-green-darker);
    padding: 2px 20px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 16px;
  }
}

.swiper {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 10px;
}

.swiper-wrapper {
  display: flex;
  transition-property: transform;
  box-sizing: content-box;
}

.swiper-slide {
  flex-shrink: 0;
  width: 100%;
  height: auto;
}

/* أزرار التصفّح */
.slider-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-green-white);
  border: 1px solid var(--color-green-light-active);
  color: var(--color-green-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: var(--color-green-light-hover);
    transform: translateY(-50%) scale(1.1);
  }

  &.prev-btn {
    left: 10px;
  }

  &.next-btn {
    right: 10px;
  }
}

.nav-icon {
  font-size: 24px;
}

/* Skeleton مؤقت (اختياري) */
.swiper-skeleton {
  display: flex;
  gap: 20px;
  overflow: hidden;
}
.skeleton-slide {
  height: 320px;
  width: 100%;
  max-width: 300px;
  background: var(--color-green-light);
  border-radius: 12px;
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* الاستجابة */
@media (max-width: 768px) {
  .slider-nav-btn {
    display: none;
  }
  .swiper {
    padding: 0 16px;
  }
}
</style>

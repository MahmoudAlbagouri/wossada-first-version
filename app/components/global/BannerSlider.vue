<template>
  <div class="banner-slider-wrapper">
    <div class="swiper" ref="swiperEl">
      <div class="swiper-wrapper">
        <div
          v-for="(banner, index) in banners"
          :key="index"
          class="swiper-slide"
        >
          <div class="banner-slide">
            <div class="banner-content">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <button class="banner-btn">
                {{ banner.buttonText }}
              </button>
            </div>
            <div class="banner-image">
              <img
                :src="banner.image"
                :alt="banner.alt || 'بنر ترويجي'"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- أزرار التصفّح -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Swiper from "swiper";
import { Autoplay, Navigation } from "swiper/modules";

// استيراد CSS (اختياري لكن موصى به لضمان التوافق)
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

const props = defineProps({
  banners: {
    type: Array,
    default: () => [
      {
        title: "افرش بيتك بالكامل من أثاث مصر",
        subtitle: "من أثاث ومفروشات وأضاعة وديكور",
        buttonText: "اكتشف المجموعة",
        image: "/images/slider1.png",
        alt: "أثاث مودرن",
      },
      {
        title: "عروض حصرية على قطع محدودة",
        subtitle: "خصومات تصل إلى 60% لفترة محدودة",
        buttonText: "تسوّق الآن",
        image: "/images/slider2.png",
        alt: "عروض خاصة",
      },
      {
        title: "عروض حصرية على قطع محدودة",
        subtitle: "خصومات تصل إلى 60% لفترة محدودة",
        buttonText: "تسوّق الآن",
        image: "/images/slider3.png",
        alt: "عروض خاصة",
      },
    ],
  },
});

const swiperEl = ref(null);
const prevBtn = ref(null);
const nextBtn = ref(null);
let swiperInstance = null;

onMounted(() => {
  if (swiperEl.value && typeof window !== "undefined") {
    swiperInstance = new Swiper(swiperEl.value, {
      modules: [Autoplay, Navigation],
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        prevEl: prevBtn.value,
        nextEl: nextBtn.value,
      },
      effect: "fade", // اختياري: تأثير تلاشي لجعله أكثر احترافية
      fadeEffect: {
        crossFade: true,
      },
      // تحسين الأداء
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
.banner-slider-wrapper {
  width: 100%;
  overflow: hidden;
  margin-bottom: 15px;
}

.swiper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.swiper-slide {
  height: 100%;
}

.banner-slide {
  display: flex;
  height: 100%;
  background: #f9f9f9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.banner-image {
  flex: 1;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.banner-content {
  flex: 1;
  padding: 60px 80px;
  display: flex;
  display: none;
  flex-direction: column;
  justify-content: center;
  text-align: right;
  direction: rtl;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
}

.banner-title {
  font-size: 36px;
  font-weight: 700;
  color: #222;
  margin: 0 0 16px 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 28px;
  }
}

.banner-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 16px;
  }
}

.banner-btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--color-green-primary); /* #987226 */
  color: var(--color-green-white);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: var(--color-green-hover); /* #896722 */
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(152, 114, 38, 0.3);
  }

  &:active {
    transform: translateY(0);
    background: var(--color-green-active); /* #7a5b1e */
  }
}

/* أزرار التصفّح */
.slider-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-green-light-active);
  color: var(--color-green-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--color-green-light-hover);
    color: var(--color-green-white);
    transform: translateY(-50%) scale(1.1);
  }

  &.prev-btn {
    left: 30px;
  }

  &.next-btn {
    right: 30px;
  }
}

.nav-icon {
  font-size: 28px;
}

/* الاستجابة */
@media (max-width: 768px) {
  .slider-nav-btn {
    display: none;
  }

  .banner-slide {
    height: auto;
  }

  .banner-content {
    padding: 30px 20px;
  }
}
</style>

<template>
  <div class="product-page-skeleton">
    <!-- صف رئيسي بنسق جانبي -->
    <div class="product-layout">
      <!-- السلايدر المزدوج (رئيسي + مصغّر) -->
      <div class="product-slider-section">
        <!-- Main Image Skeleton -->
        <div class="main-swiper-skeleton skeleton-box"></div>

        <!-- Thumbs Slider Skeleton -->
        <div class="thumbs-swiper-skeleton">
          <div
            v-for="i in 5"
            :key="i"
            class="thumb-slide-skeleton skeleton-box"
          ></div>
        </div>
      </div>

      <!-- محتوى المنتج -->
      <div class="product-info-section">
        <div class="skeleton-line title-skeleton"></div>
        <div class="skeleton-line id-skeleton"></div>

        <div class="skeleton-text-block">
          <div class="skeleton-line desc-line" v-for="i in 4" :key="i"></div>
        </div>

        <div class="price-section-skeleton">
          <div class="skeleton-line old-price-skeleton"></div>
          <div class="skeleton-line new-price-skeleton"></div>
          <div class="skeleton-badge discount-badge-skeleton"></div>
        </div>

        <div class="quantity-actions-skeleton">
          <div class="skeleton-line quantity-input-skeleton"></div>
          <div class="skeleton-line add-btn-skeleton"></div>
        </div>

        <div class="share-section-skeleton">
          <div class="skeleton-line share-text-skeleton"></div>
          <div class="social-icons-skeleton">
            <div class="skeleton-circle" v-for="i in 4" :key="i"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- منتجات ذات صلة -->
    <div class="related-products-skeleton">
      <div class="skeleton-line related-title-skeleton"></div>
      <div class="related-slider-skeleton">
        <div
          v-for="i in 5"
          :key="i"
          class="related-product-card-skeleton skeleton-box"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// لا حاجة لمنطق هنا — فقط عرض بصري
</script>

<style scoped lang="scss">
.product-page-skeleton {
  background-color: var(--color-green-white);
  padding: 50px 20px;
}

.product-layout {
  display: flex;
  gap: 40px;
  margin: 0 auto 50px;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }
}

/* === Skeleton Utilities === */
.skeleton-box,
.skeleton-line,
.skeleton-circle,
.skeleton-badge {
  background: linear-gradient(
    90deg,
    var(--color-green-light) 25%,
    #e0e7e3 50%,
    var(--color-green-light) 75%
  );
  background-size: 200% 100%;
  animation: pulseLoading 1.5s infinite ease-in-out;
  border-radius: 8px;
}

@keyframes pulseLoading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* === Slider Section === */
.product-slider-section {
  width: 500px;
  max-width: 100%;

  .main-swiper-skeleton {
    width: 100%;
    height: 500px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }

  .thumbs-swiper-skeleton {
    display: flex;
    gap: 10px;
    margin-top: 20px;

    .thumb-slide-skeleton {
      width: calc((100% - 40px) / 5); // تقريبًا 4 فراغات بين 5 عناصر
      aspect-ratio: 1/1;
      border-radius: 8px;
    }
  }
}

/* === Product Info Section === */
.product-info-section {
  width: calc(100% - 520px); // مطابق للتصميم الأصلي تقريبًا
  max-width: 100%;

  .title-skeleton {
    height: 36px;
    width: 70%;
    margin-bottom: 12px;
  }

  .id-skeleton {
    height: 24px;
    width: 30%;
    background-color: rgba(0, 0, 0, 0.06);
  }

  .skeleton-text-block {
    margin: 24px 0 30px;
  }

  .desc-line {
    height: 20px;
    margin-bottom: 12px;

    &:nth-child(1) {
      width: 90%;
    }
    &:nth-child(2),
    &:nth-child(3) {
      width: 95%;
    }
    &:last-child {
      width: 80%;
    }
  }

  .price-section-skeleton {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 30px;
    flex-wrap: wrap;

    .old-price-skeleton {
      height: 20px;
      width: 80px;
      background-color: #ddd;
    }

    .new-price-skeleton {
      height: 40px;
      width: 160px;
      background: var(--color-green-primary); // نفس لون السعر الحقيقي
      opacity: 0.3;
    }

    .discount-badge-skeleton {
      height: 32px;
      width: 80px;
      background: var(--color-yellow-secondary);
      opacity: 0.4;
    }
  }

  .quantity-actions-skeleton {
    margin: 30px 0;

    .quantity-input-skeleton {
      height: 50px;
      width: 140px;
      margin-bottom: 12px;
    }

    .add-btn-skeleton {
      height: 50px;
      width: 200px;
      background: var(--color-green-primary);
      opacity: 0.4;
    }
  }

  .share-section-skeleton {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 20px;

    .share-text-skeleton {
      height: 20px;
      width: 60px;
    }

    .social-icons-skeleton {
      display: flex;
      gap: 14px;

      .skeleton-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #ccc;
      }
    }
  }
}

/* === Related Products === */
.related-products-skeleton {
  .related-title-skeleton {
    height: 28px;
    width: 200px;
    margin-bottom: 20px;
  }

  .related-slider-skeleton {
    display: flex;
    gap: 20px;
    overflow: hidden;

    .related-product-card-skeleton {
      width: 220px;
      height: 320px;
      border-radius: 12px;
    }
  }
}

/* === Responsive === */
@media (max-width: 992px) {
  .product-info-section {
    width: 100%;
  }

  .product-slider-section .main-swiper-skeleton {
    height: 400px;
  }

  .thumbs-swiper-skeleton .thumb-slide-skeleton {
    width: calc((100% - 30px) / 4);
  }
}

@media (max-width: 768px) {
  .product-page-skeleton {
    padding: 30px 16px;
  }

  .product-slider-section .main-swiper-skeleton {
    height: 350px;
  }

  .thumbs-swiper-skeleton .thumb-slide-skeleton {
    width: calc((100% - 20px) / 3);
  }

  .related-slider-skeleton .related-product-card-skeleton {
    width: 160px;
    height: 280px;
  }
}
</style>

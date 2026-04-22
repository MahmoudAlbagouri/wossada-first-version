<template>
  <div>
    <ProductPageSkeleton v-if="store.loading" />

    <div v-else-if="store.product" class="product-page">
      <div class="product-layout">
        <!-- ===== السلايدر ===== -->
        <div class="product-slider-section">
          <Swiper
            :style="{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
            }"
            :loop="true"
            :space-between="10"
            :navigation="true"
            :thumbs="{ swiper: thumbsSwiper }"
            :modules="modules"
            class="main-swiper"
          >
            <SwiperSlide v-for="(img, idx) in store.allImages" :key="idx">
              <div class="swiper-slide-content">
                <img
                  :src="img"
                  :alt="`${currentTranslation?.name} - الصورة ${idx + 1}`"
                  class="main-image"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <Swiper
            @swiper="setThumbsSwiper"
            :loop="true"
            :space-between="10"
            :slides-per-view="4"
            :free-mode="true"
            :watch-slides-progress="true"
            :modules="modules"
            class="thumbs-swiper"
          >
            <SwiperSlide v-for="(img, idx) in store.allImages" :key="idx">
              <div class="thumb-slide">
                <img
                  :src="img"
                  :alt="`${currentTranslation?.name} - مصغّر ${idx + 1}`"
                  class="thumb-image"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- ===== معلومات المنتج ===== -->
        <div class="product-info-section">
          <div class="product-header">
            <h1 class="product-title">{{ currentTranslation?.name }}</h1>
            <button
              class="favorite-btn"
              :class="{ 'is-favorite': isFavorite }"
              @click="toggleFavorite"
              aria-label="إضافة إلى المفضلة"
            >
              <Icon
                name="ph:heart-fill"
                v-if="isFavorite"
                class="favorite-icon filled"
              />
              <Icon name="ph:heart" v-else class="favorite-icon outlined" />
            </button>
          </div>

          <span class="product-id">كود: {{ store.product.id }}</span>

          <div class="product-description">
            {{ currentTranslation?.shortDescription }}
          </div>

          <!-- ===== الألوان ===== -->
          <div class="options-section" v-if="store.availableColors.length">
            <h3 class="options-title">اللون:</h3>
            <div class="colors-list">
              <button
                v-for="color in store.availableColors"
                :key="color.id"
                class="color-option"
                :class="{
                  active: selectedColorId === color.id,
                  'color-disabled': !isColorAvailable(color.id),
                }"
                :style="{ backgroundColor: color.hex }"
                :disabled="!isColorAvailable(color.id)"
                @click="selectColor(color.id)"
                :title="getTranslationName(color.translations)"
                aria-label="اختر اللون"
              >
                <Icon
                  v-if="selectedColorId === color.id"
                  name="ph:check"
                  class="color-check"
                />
              </button>
            </div>
          </div>

          <!-- ===== المقاسات ===== -->
          <div class="options-section" v-if="store.availableSizes.length">
            <h3 class="options-title">المقاس:</h3>
            <div class="sizes-list">
              <button
                v-for="size in store.availableSizes"
                :key="size.id"
                class="size-option"
                :class="{
                  active: selectedSizeId === size.id,
                  unavailable: !isSizeAvailable(size.id),
                }"
                :disabled="!isSizeAvailable(size.id)"
                @click="selectSize(size.id)"
              >
                {{ size.type }}
                <span v-if="!isSizeAvailable(size.id)" class="out-badge"
                  >نفذ</span
                >
              </button>
            </div>
          </div>

          <!-- ===== الخامات ===== -->
          <div class="options-section" v-if="store.availableMaterials.length">
            <h3 class="options-title">الخامة:</h3>
            <div class="materials-list">
              <button
                v-for="material in store.availableMaterials"
                :key="material.id"
                class="material-option"
                :class="{
                  active: selectedMaterialId === material.id,
                  unavailable: !isMaterialAvailable(material.id),
                }"
                :disabled="!isMaterialAvailable(material.id)"
                @click="selectMaterial(material.id)"
              >
                {{ getTranslationName(material.translations) }}
                <span v-if="!isMaterialAvailable(material.id)" class="out-badge"
                  >نفذ</span
                >
              </button>
            </div>
          </div>

          <!-- ===== السعر ===== -->
          <div class="price-section">
            <div class="price-row">
              <span class="old-price" v-if="displayDiscountPercent"
                >{{ store.product.basePrice }} ج.م</span
              >
              <span class="new-price">{{ displayPrice }} ج.م</span>
            </div>
            <span class="discount-badge" v-if="displayDiscountPercent">{{
              displayDiscountPercent
            }}</span>
          </div>

          <div class="quantity-actions">
            <AddToCartButton
              :productId="store.product.id"
              :variantId="currentVariantId"
              :max="currentVariantStock || store.product.baseStock"
            />
          </div>

          <div class="share-section">
            <span>شارك:</span>
            <div class="social-icons">
              <a href="#" aria-label="فيسبوك"
                ><Icon name="ph:facebook-logo" class="social-icon"
              /></a>
              <a href="#" aria-label="إنستغرام"
                ><Icon name="ph:instagram-logo" class="social-icon"
              /></a>
              <a href="#" aria-label="تيك توك"
                ><Icon name="ph:logo-tiktok" class="social-icon"
              /></a>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Tabs ===== -->
      <div class="tabs-section">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.title }}
          </button>
        </div>

        <div class="tabs-content">
          <!-- وصف -->
          <div v-if="activeTab === 'description'" class="tab-pane">
            <h3>الوصف التفصيلي</h3>
            <p>{{ currentTranslation?.longDescription }}</p>
          </div>

          <!-- مواصفات -->
          <div v-else-if="activeTab === 'specifications'" class="tab-pane">
            <h3>المواصفات الفنية</h3>
            <table class="specs-table">
              <tbody>
                <tr v-if="store.product.brand">
                  <td>الماركة</td>
                  <td>
                    <div class="spec-brand">
                      <img
                        v-if="store.product.brand.logo"
                        :src="store.product.brand.logo"
                        :alt="getBrandName(store.product.brand)"
                        class="spec-brand-logo"
                        @error="$event.target.src = '/images/placeholder.jpg'"
                      />
                      <span>{{ getBrandName(store.product.brand) }}</span>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(value, key) in currentTranslation?.specifications"
                  :key="key"
                >
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
                <tr v-if="store.product.weight">
                  <td>الوزن</td>
                  <td>{{ store.product.weight }} كجم</td>
                </tr>
                <tr
                  v-if="
                    store.product.width ||
                    store.product.height ||
                    store.product.length
                  "
                >
                  <td>الأبعاد (ع × ا × ط)</td>
                  <td>
                    {{ store.product.width || 0 }} ×
                    {{ store.product.height || 0 }} ×
                    {{ store.product.length || 0 }} سم
                  </td>
                </tr>
                <tr>
                  <td>الشحن المجاني</td>
                  <td>{{ store.product.isFreeShipping ? "نعم" : "لا" }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- تقييمات -->
          <div v-else-if="activeTab === 'reviews'" class="tab-pane">
            <h3>
              التقييمات ومراجعات العملاء
              <span class="reviews-count" v-if="store.reviews.length"
                >({{ store.reviews.length }})</span
              >
            </h3>
            <div v-if="store.reviewsLoading" class="reviews-loading">
              <div class="skeleton-review" v-for="i in 3" :key="i"></div>
            </div>
            <template v-else-if="store.reviews.length">
              <div
                v-for="review in store.reviews"
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <div class="review-author-info">
                    <div class="author-avatar">
                      {{ review.user?.name?.charAt(0) || "؟" }}
                    </div>
                    <span class="review-author">{{
                      review.user?.name || "مستخدم"
                    }}</span>
                  </div>
                  <div class="review-rating">
                    <Icon
                      name="ph:star-fill"
                      v-for="i in 5"
                      :key="i"
                      :class="{ filled: i <= review.rating }"
                    />
                  </div>
                </div>
                <p class="review-text">{{ review.comment }}</p>
                <div class="review-meta">
                  <span>{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
            </template>
            <p v-else class="no-reviews">
              لا توجد تقييمات بعد. كن أول من يقيّم!
            </p>

            <div class="add-review-section">
              <h4>اكتب مراجعتك</h4>
              <div v-if="store.submitError" class="review-error">
                <Icon name="ph:warning-circle" class="error-icon" />{{
                  store.submitError
                }}
              </div>
              <div v-if="reviewSubmitted" class="review-success">
                <Icon name="ph:check-circle" class="success-icon" />تم إرسال
                تقييمك بنجاح، شكراً لك!
              </div>
              <textarea
                v-model="newReview.comment"
                placeholder="شارك تجربتك مع هذا المنتج..."
                rows="4"
                class="review-input"
                :disabled="store.submitLoading"
              ></textarea>
              <div class="review-footer">
                <div class="rating-selector">
                  <span>التقييم:</span>
                  <div class="stars">
                    <Icon
                      name="ph:star-fill"
                      v-for="i in 5"
                      :key="i"
                      @click="!store.submitLoading && (newReview.rating = i)"
                      :class="{
                        filled: i <= newReview.rating,
                        disabled: store.submitLoading,
                      }"
                      class="star-icon"
                    />
                  </div>
                </div>
                <button
                  class="btn-submit-review"
                  @click="handleSubmitReview"
                  :disabled="
                    store.submitLoading ||
                    !newReview.comment.trim() ||
                    newReview.rating === 0
                  "
                >
                  <Icon
                    v-if="store.submitLoading"
                    name="ph:spinner"
                    class="spin"
                  />
                  {{
                    store.submitLoading ? "جاري الإرسال..." : "إرسال المراجعة"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MainSlider
        title="منتجات ذات صلة"
        highlight="مشاهدة المزيد"
        :products="[]"
      />
    </div>

    <div v-else class="error-state">
      <Icon name="ph:warning" class="error-icon" />
      <p>لم يتم العثور على المنتج</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { useProductDetailStore } from "@/stores/productDetail";
import { useCartStore } from "@/stores/cart";
import ProductPageSkeleton from "@/components/skeletons/ProductPageSkeleton.vue";
import AddToCartButton from "@/components/base/AddToCartButton.vue";

const route = useRoute();
const store = useProductDetailStore();
const cartStore = useCartStore();
const { currentLang } = useLanguage();

const slug = computed(() => route.params.id);
const currentTranslation = computed(() => store.translation(currentLang.value));

// ===== جلب البيانات SSR =====
await useAsyncData(
  () => `product-detail-${slug.value}-${currentLang.value}`,
  async () => {
    if (!slug.value) return null;
    const product = await store.fetchProduct(slug.value);
    if (product?.id) await store.fetchReviews(product.id);
    return product ?? null;
  },
  { lazy: false },
);

watch(currentLang, async () => {
  if (!slug.value) return;
  await store.fetchProduct(slug.value);
});

watch(slug, async (newSlug) => {
  if (!newSlug) return;
  store.resetState();
  const product = await store.fetchProduct(newSlug);
  if (product?.id) await store.fetchReviews(product.id);
});

// ===== الاختيارات =====
const thumbsSwiper = ref(null);
const modules = [FreeMode, Navigation, Thumbs];
const isFavorite = ref(false);
const selectedColorId = ref(null);
const selectedSizeId = ref(null);
const selectedMaterialId = ref(null);

watch(
  () => store.availableColors,
  (c) => {
    if (c.length && !selectedColorId.value) selectedColorId.value = c[0].id;
  },
  { immediate: true },
);
watch(
  () => store.availableSizes,
  (s) => {
    if (s.length && !selectedSizeId.value) selectedSizeId.value = s[0].id;
  },
  { immediate: true },
);
watch(
  () => store.availableMaterials,
  (m) => {
    if (m.length && !selectedMaterialId.value)
      selectedMaterialId.value = m[0].id;
  },
  { immediate: true },
);

// ===== منطق الـ Collection =====
const isColorAvailable = (colorId) => {
  if (!store.product?.variants) return false;
  return store.product.variants.some((v) => {
    const matchColor = v.color?.id === colorId;
    const matchSize =
      !selectedSizeId.value || v.size?.id === selectedSizeId.value;
    const matchMaterial =
      !selectedMaterialId.value || v.material?.id === selectedMaterialId.value;
    return matchColor && matchSize && matchMaterial && (v.stock ?? 0) > 0;
  });
};

const isSizeAvailable = (sizeId) => {
  if (!store.product?.variants) return false;
  return store.product.variants.some((v) => {
    const matchSize = v.size?.id === sizeId;
    const matchColor =
      !selectedColorId.value || v.color?.id === selectedColorId.value;
    const matchMaterial =
      !selectedMaterialId.value || v.material?.id === selectedMaterialId.value;
    return matchSize && matchColor && matchMaterial && (v.stock ?? 0) > 0;
  });
};

const isMaterialAvailable = (materialId) => {
  if (!store.product?.variants) return false;
  return store.product.variants.some((v) => {
    const matchMaterial = v.material?.id === materialId;
    const matchColor =
      !selectedColorId.value || v.color?.id === selectedColorId.value;
    const matchSize =
      !selectedSizeId.value || v.size?.id === selectedSizeId.value;
    return matchMaterial && matchColor && matchSize && (v.stock ?? 0) > 0;
  });
};

const selectColor = (colorId) => {
  selectedColorId.value = colorId;
  if (selectedSizeId.value && !isSizeAvailable(selectedSizeId.value)) {
    selectedSizeId.value =
      store.availableSizes.find((s) => isSizeAvailable(s.id))?.id || null;
  }
  if (
    selectedMaterialId.value &&
    !isMaterialAvailable(selectedMaterialId.value)
  ) {
    selectedMaterialId.value =
      store.availableMaterials.find((m) => isMaterialAvailable(m.id))?.id ||
      null;
  }
};

const selectSize = (sizeId) => {
  if (!isSizeAvailable(sizeId)) return;
  selectedSizeId.value = sizeId;
  if (selectedColorId.value && !isColorAvailable(selectedColorId.value)) {
    selectedColorId.value =
      store.availableColors.find((c) => isColorAvailable(c.id))?.id || null;
  }
  if (
    selectedMaterialId.value &&
    !isMaterialAvailable(selectedMaterialId.value)
  ) {
    selectedMaterialId.value =
      store.availableMaterials.find((m) => isMaterialAvailable(m.id))?.id ||
      null;
  }
};

const selectMaterial = (materialId) => {
  if (!isMaterialAvailable(materialId)) return;
  selectedMaterialId.value = materialId;
  if (selectedColorId.value && !isColorAvailable(selectedColorId.value)) {
    selectedColorId.value =
      store.availableColors.find((c) => isColorAvailable(c.id))?.id || null;
  }
  if (selectedSizeId.value && !isSizeAvailable(selectedSizeId.value)) {
    selectedSizeId.value =
      store.availableSizes.find((s) => isSizeAvailable(s.id))?.id || null;
  }
};

// ===== الـ Variant والسعر =====
const currentVariantId = computed(() =>
  store.findVariantId(
    selectedColorId.value,
    selectedSizeId.value,
    selectedMaterialId.value,
  ),
);

const currentVariantStock = computed(() =>
  store.variantStock(
    selectedColorId.value,
    selectedSizeId.value,
    selectedMaterialId.value,
  ),
);

const displayPrice = computed(() => {
  if (
    selectedColorId.value ||
    selectedSizeId.value ||
    selectedMaterialId.value
  ) {
    const vPrice = store.variantPrice(
      selectedColorId.value,
      selectedSizeId.value,
      selectedMaterialId.value,
    );
    if (vPrice !== null && !isNaN(vPrice)) return vPrice;
  }
  return store.finalPrice;
});

const displayDiscountPercent = computed(() => {
  const base = parseFloat(store.product?.basePrice || 0);
  const current = parseFloat(displayPrice.value || 0);
  if (!base || !current || current >= base) return null;
  return `-${Math.round(((base - current) / base) * 100)}%`;
});

// ===== دوال مساعدة =====
const getTranslationName = (translations, lang = currentLang.value) => {
  if (!translations?.length) return "";
  const t = translations.find((t) => t.languageCode === lang);
  return t?.name || translations[0]?.name || "";
};

const getBrandName = (brand) => getTranslationName(brand?.translations);

// ===== Tabs =====
const activeTab = ref("description");
const tabs = [
  { id: "description", title: "الوصف" },
  { id: "specifications", title: "المواصفات" },
  { id: "reviews", title: "التقييمات ومراجعات المنتج" },
];

// ===== التقييمات =====
const newReview = ref({ comment: "", rating: 0 });
const reviewSubmitted = ref(false);

const handleSubmitReview = async () => {
  if (!newReview.value.comment.trim() || newReview.value.rating === 0) return;
  reviewSubmitted.value = false;
  const result = await store.submitReview({
    productId: store.product.id,
    rating: newReview.value.rating,
    comment: newReview.value.comment,
  });
  if (result?.success) {
    newReview.value = { comment: "", rating: 0 };
    reviewSubmitted.value = true;
    setTimeout(() => {
      reviewSubmitted.value = false;
    }, 4000);
  }
};

const setThumbsSwiper = (swiper) => {
  thumbsSwiper.value = swiper;
};
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("ar-EG");
</script>

<style scoped lang="scss">
.spec-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  .spec-brand-logo {
    width: 30px;
    height: 30px;
    object-fit: contain;
    border-radius: 4px;
    background: #f9f9f9;
  }
}

.product-page {
  background-color: var(--color-green-white);
  padding: 50px 20px;
}

.product-layout {
  display: flex;
  gap: 40px;
  margin: 0 auto 50px;
  max-width: 1400px;
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }
}

.product-slider-section {
  width: 500px;
  max-width: 100%;
  .main-swiper {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    background: #f9fafb;
    aspect-ratio: 1 / 1;
    height: auto;
    .swiper-slide-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      .main-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
  }
  .thumbs-swiper {
    margin-top: 20px;
    .swiper-slide {
      opacity: 0.7;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 8px;
      overflow: hidden;
      &.swiper-slide-thumb-active {
        opacity: 1;
        transform: scale(1.05);
        box-shadow: 0 0 0 2px var(--color-green-primary);
      }
      .thumb-slide {
        aspect-ratio: 1 / 1;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
        background: #f0f4f2;
        display: flex;
        align-items: center;
        justify-content: center;
        .thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }
  }
}

.product-info-section {
  width: calc(100% - 520px);
  max-width: 100%;

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
    .product-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-green-darker);
      line-height: 1.2;
      margin: 0;
      flex: 1;
    }
    .favorite-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #f0f4f2;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      flex-shrink: 0;
      &:hover {
        background: var(--color-green-light);
        transform: scale(1.05);
      }
      &.is-favorite .filled {
        color: #e53935;
      }
      .favorite-icon {
        font-size: 24px;
        color: #888;
      }
    }
  }

  .product-id {
    font-size: 14px;
    color: var(--text-muted);
    background: rgba(0, 0, 0, 0.04);
    padding: 4px 10px;
    border-radius: 6px;
    margin-bottom: 20px;
    display: inline-block;
  }

  .product-description {
    font-size: 16px;
    color: var(--text-main);
    line-height: 1.7;
    margin-bottom: 24px;
    text-align: right;
    font-weight: 400;
  }

  .options-section {
    margin-bottom: 24px;
    .options-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-green-darker);
      margin-bottom: 12px;
      text-align: right;
    }

    .colors-list {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      .color-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #ddd;
        cursor: pointer;
        position: relative;
        transition:
          transform 0.2s,
          border-color 0.2s;
        &:hover:not(:disabled) {
          transform: scale(1.1);
        }
        &.active {
          border-color: var(--color-green-primary);
          transform: scale(1.15);
        }
        &.color-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .color-check {
          position: absolute;
          bottom: -6px;
          right: -6px;
          background: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-green-primary);
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .sizes-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      .size-option {
        position: relative;
        padding: 8px 16px;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        &:hover:not(:disabled) {
          border-color: var(--color-green-primary);
          background: var(--color-green-light);
        }
        &.active {
          border-color: var(--color-green-primary);
          background: var(--color-green-primary);
          color: white;
        }
        &.unavailable {
          opacity: 0.4;
          cursor: not-allowed;
          text-decoration: line-through;
        }
      }
    }

    .materials-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      .material-option {
        position: relative;
        padding: 8px 18px;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        &:hover:not(:disabled) {
          border-color: var(--color-green-primary);
          background: var(--color-green-light);
        }
        &.active {
          border-color: var(--color-green-primary);
          background: var(--color-green-primary);
          color: white;
        }
        &.unavailable {
          opacity: 0.4;
          cursor: not-allowed;
          text-decoration: line-through;
        }
      }
    }
  }

  .out-badge {
    font-size: 10px;
    font-weight: 700;
    background: #e53935;
    color: white;
    border-radius: 4px;
    padding: 1px 5px;
  }

  .price-section {
    margin-bottom: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 16px;
      .old-price {
        font-size: 18px;
        color: #aaa;
        text-decoration: line-through;
        font-weight: 500;
      }
      .new-price {
        font-size: 36px;
        font-weight: 800;
        color: var(--color-green-primary);
      }
    }
    .discount-badge {
      display: inline-block;
      background: var(--color-yellow-secondary);
      color: var(--color-green-darker);
      font-size: 14px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      min-width: 70px;
      text-align: center;
    }
  }

  .quantity-actions {
    margin: 30px 0;
  }

  .share-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
    span {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
    }
    .social-icons {
      display: flex;
      gap: 14px;
    }
    .social-icon {
      font-size: 26px;
      color: #666;
      cursor: pointer;
      transition:
        color 0.3s,
        transform 0.2s;
      &:hover {
        color: var(--color-green-primary);
        transform: translateY(-2px);
      }
    }
  }
}

.tabs-section {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 30px;
  .tabs-nav {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .tab-button {
      padding: 12px 24px;
      background: #f0f4f2;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      &:hover {
        background: var(--color-green-light);
      }
      &.active {
        background: var(--color-green-primary);
        color: white;
        box-shadow: 0 4px 8px rgba(46, 125, 50, 0.2);
      }
    }
  }

  .tabs-content {
    .tab-pane {
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      h3 {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-green-darker);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        .reviews-count {
          font-size: 16px;
          color: var(--color-green-primary);
          font-weight: 600;
        }
      }
      p {
        margin-bottom: 16px;
        line-height: 1.6;
      }

      table.specs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 15px;
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
        }
        td:first-child {
          font-weight: 600;
          color: var(--text-main);
          width: 40%;
        }
      }

      .no-reviews {
        text-align: center;
        color: #aaa;
        padding: 30px 0;
        font-size: 16px;
      }

      .skeleton-review {
        height: 80px;
        border-radius: 8px;
        margin-bottom: 16px;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .review-item {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          .review-author-info {
            display: flex;
            align-items: center;
            gap: 10px;
            .author-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: var(--color-green-primary);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .review-author {
              font-weight: 700;
              color: var(--color-green-darker);
            }
          }
          .review-rating {
            display: flex;
            gap: 4px;
            .filled {
              color: #ffc107;
            }
          }
        }
        .review-text {
          color: var(--text-main);
          line-height: 1.6;
          margin-bottom: 12px;
          padding-right: 46px;
        }
        .review-meta {
          font-size: 13px;
          color: #aaa;
          display: flex;
          gap: 8px;
          padding-right: 46px;
        }
      }

      .add-review-section {
        margin-top: 30px;
        border-top: 1px solid #eee;
        padding-top: 24px;
        h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--color-green-darker);
        }
        .review-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fff3f3;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          color: #c62828;
          font-size: 14px;
          margin-bottom: 16px;
          .error-icon {
            font-size: 18px;
            flex-shrink: 0;
          }
        }
        .review-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f1f8e9;
          border: 1px solid #c5e1a5;
          border-radius: 8px;
          color: #2e7d32;
          font-size: 14px;
          margin-bottom: 16px;
          .success-icon {
            font-size: 18px;
            flex-shrink: 0;
          }
        }
        textarea.review-input {
          width: 100%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          resize: vertical;
          margin-bottom: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
          &:focus {
            outline: none;
            border-color: var(--color-green-primary);
          }
          &:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }
        }
        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          .rating-selector {
            display: flex;
            align-items: center;
            gap: 10px;
            .stars {
              display: flex;
              gap: 4px;
            }
            .star-icon {
              font-size: 28px;
              color: #ddd;
              cursor: pointer;
              transition:
                color 0.2s,
                transform 0.1s;
              &.filled {
                color: #ffc107;
              }
              &:hover:not(.disabled) {
                color: #ffc107;
                transform: scale(1.2);
              }
              &.disabled {
                cursor: not-allowed;
                opacity: 0.5;
              }
            }
          }
          .btn-submit-review {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 28px;
            background: var(--color-green-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.3s;
            &:hover:not(:disabled) {
              opacity: 0.9;
            }
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          }
        }
      }
    }
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #aaa;
  .error-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: #f44336;
  }
  p {
    font-size: 18px;
  }
}

@media (max-width: 992px) {
  .product-info-section {
    width: 100%;
  }
}
@media (max-width: 768px) {
  .product-page {
    padding: 30px 16px;
  }
  .product-info-section {
    .product-title {
      font-size: 22px;
    }
    .price-section .price-row .new-price {
      font-size: 28px;
    }
  }
  .tabs-section {
    .tabs-nav .tab-button {
      padding: 10px 16px;
      font-size: 14px;
    }
    .tabs-content .tab-pane .review-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>

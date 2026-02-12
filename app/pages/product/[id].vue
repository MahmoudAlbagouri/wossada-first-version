<template>
  <div>
    <!-- عرض الـ Skeleton أثناء التحميل -->
    <ProductPageSkeleton v-if="loading" />

    <!-- عرض المحتوى الحقيقي بعد التحميل -->
    <div v-else class="product-page">
      <!-- صف رئيسي بنسق جانبي -->
      <div class="product-layout">
        <!-- السلايدر المزدوج (رئيسي + مصغّر) -->
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
            <SwiperSlide v-for="(img, idx) in product.images" :key="idx">
              <div class="swiper-slide-content">
                <img
                  :src="img"
                  :alt="`${product.title} - الصورة ${idx + 1}`"
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
            <SwiperSlide v-for="(img, idx) in product.images" :key="idx">
              <div class="thumb-slide">
                <img
                  :src="img"
                  :alt="`${product.title} - مصغّر ${idx + 1}`"
                  class="thumb-image"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- محتوى المنتج المُحسّن -->
        <div class="product-info-section">
          <!-- العنوان + المفضلة -->
          <div class="product-header">
            <h1 class="product-title">{{ product.title }}</h1>
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

          <span class="product-id">كود: {{ product.id }}</span>

          <!-- الوصف -->
          <div class="product-description">
            {{ product.description }}
          </div>

          <!-- الألوان -->
          <div class="options-section">
            <h3 class="options-title">اللون:</h3>
            <div class="colors-list">
              <button
                v-for="(color, index) in product.colors"
                :key="index"
                class="color-option"
                :class="{ active: selectedColor === color.name }"
                :style="{ backgroundColor: color.hex }"
                @click="selectColor(color)"
                :aria-label="`اختر اللون ${color.name}`"
              >
                <Icon
                  v-if="selectedColor === color.name"
                  name="ph:check"
                  class="color-check"
                />
              </button>
            </div>
          </div>

          <!-- المقاسات -->
          <div class="options-section">
            <h3 class="options-title">المقاس:</h3>
            <div class="sizes-list">
              <button
                v-for="(size, index) in product.sizes"
                :key="index"
                class="size-option"
                :class="{ active: selectedSize === size }"
                @click="selectSize(size)"
                :disabled="size === 'L' && !isInStock"
              >
                {{ size }}
                <span v-if="size === 'L' && !isInStock" class="out-of-stock"
                  >نفذ</span
                >
              </button>
            </div>
          </div>

          <!-- السعر -->
          <div class="price-section">
            <div class="price-row">
              <span class="old-price">{{ product.oldPrice }} ج.م</span>
              <span class="new-price">{{ product.price }} ج.م</span>
            </div>
            <span class="discount-badge">{{ product.discount }}</span>
          </div>

          <!-- عداد الكمية + زر الإضافة -->
          <div class="quantity-actions">
            <AddToCartButton
              v-model:quantity="quantity"
              :max="10"
              @added="handleAddToCart"
              @removed="handleRemoveFromCart"
            />
          </div>

          <!-- مشاركة -->
          <div class="share-section">
            <span>شارك:</span>
            <div class="social-icons">
              <a href="#" aria-label="سناب شات"
                ><Icon name="ph:snapchat-logo" class="social-icon"
              /></a>
              <a href="#" aria-label="تيك توك"
                ><Icon name="ph:logo-tiktok" class="social-icon"
              /></a>
              <a href="#" aria-label="فيسبوك"
                ><Icon name="ph:facebook-logo" class="social-icon"
              /></a>
              <a href="#" aria-label="إنستغرام"
                ><Icon name="ph:instagram-logo" class="social-icon"
              /></a>
              <a href="#" aria-label="يوتيوب"
                ><Icon name="ph:youtube-logo" class="social-icon"
              /></a>
            </div>
          </div>
        </div>
      </div>
      <!-- tabs new -->
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
          <div v-if="activeTab === 'description'" class="tab-pane">
            <h3>الوصف التفصيلي</h3>
            <p>
              هذا المنتج مصنوع من خشب المعرف عالي الجودة، مع هيكل متين يضمن
              المتانة لسنوات. القماش الخارجي من نوع كتان فاخر مقاوم للتمزق،
              وملمسه ناعم جدًّا يمنح راحة استثنائية. تم تصميمه ليتناسب مع جميع
              أنواع الديكورات الحديثة والكلاسيكية.
            </p>
            <ul class="features-list">
              <li>الوزن: 45 كجم</li>
              <li>الأبعاد: 200 × 80 × 90 سم</li>
              <li>الضمان: سنتان على الهيكل، سنة على القماش</li>
              <li>الصيانة: تنظيف بقطعة قماش مبللة</li>
            </ul>
          </div>

          <div v-else-if="activeTab === 'specifications'" class="tab-pane">
            <h3>المواصفات الفنية</h3>
            <table class="specs-table">
              <tbody>
                <tr>
                  <td>العلامة التجارية</td>
                  <td>كاساديا</td>
                </tr>
                <tr>
                  <td>المواد</td>
                  <td>خشب معرف + قماش كتان فاخر</td>
                </tr>
                <tr>
                  <td>الوزن الصافي</td>
                  <td>45 كجم</td>
                </tr>
                <tr>
                  <td>الأبعاد (طول × عرض × ارتفاع)</td>
                  <td>200 × 80 × 90 سم</td>
                </tr>
                <tr>
                  <td>الضمان</td>
                  <td>سنتان على الهيكل، سنة على القماش</td>
                </tr>
                <tr>
                  <td>البلد المصنع</td>
                  <td>مصر</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'reviews'" class="tab-pane">
            <h3>التقييمات ومراجعات العملاء</h3>
            <div class="review-item" v-for="review in reviews" :key="review.id">
              <div class="review-header">
                <span class="review-author">{{ review.author }}</span>
                <div class="review-rating">
                  <Icon
                    name="ph:star-fill"
                    v-for="i in 5"
                    :key="i"
                    :class="{ filled: i <= review.rating }"
                  />
                </div>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <div class="review-meta">
                <span>{{ review.date }}</span>
                <span>•</span>
                <span>{{ review.helpful }} شخص وجدوا هذه المراجعة مفيدة</span>
              </div>
            </div>

            <div class="add-review-section">
              <h4>اكتب مراجعتك</h4>
              <textarea
                v-model="newReview.text"
                placeholder="شارك تجربتك مع هذا المنتج..."
                rows="4"
                class="review-input"
              ></textarea>
              <div class="review-footer">
                <div class="rating-selector">
                  <span>التقييم:</span>
                  <div class="stars">
                    <Icon
                      name="ph:star"
                      v-for="i in 5"
                      :key="i"
                      @click="newReview.rating = i"
                      :class="{ filled: i <= newReview.rating }"
                      class="star-icon"
                    />
                  </div>
                </div>
                <button class="btn-submit-review" @click="submitReview">
                  إرسال المراجعة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- منتجات ذات صلة باستخدام MainSlider -->
      <MainSlider
        title="منتجات ذات صلة"
        highlight="مشاهدة المزيد"
        :products="relatedProducts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

// ✅ المكونات
import ProductPageSkeleton from "@/components/skeletons/ProductPageSkeleton.vue";
import MainSlider from "@/components/global/MainSlider.vue";
import AddToCartButton from "@/components/base/AddToCartButton.vue";

// ✅ الحالة
const loading = ref(true);
const product = ref(null);
const relatedProducts = ref([]);
const thumbsSwiper = ref(null);
const quantity = ref(1);

// ✅ حالة المفضلة
const isFavorite = ref(false);
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  console.log(`المفضلة: ${isFavorite.value ? "مضاف" : "محذوف"}`);
};

// ✅ خيارات المنتج
const selectedColor = ref("أخضر");
const selectedSize = ref("M");
const isInStock = ref(false);

const selectColor = (color) => {
  selectedColor.value = color.name;
  console.log("اللون المختار:", color.name);
};

const selectSize = (size) => {
  if (size === "L" && !isInStock.value) return;
  selectedSize.value = size;
  console.log("المقاس المختار:", size);
};

// ✅ Tabs
const activeTab = ref("description");
const tabs = [
  { id: "description", title: "الوصف" },
  { id: "specifications", title: "المواصفات" },
  { id: "reviews", title: "التقييمات ومراجعات المنتج" },
];

// ✅ مراجعات العملاء
const reviews = ref([
  {
    id: 1,
    author: "أحمد محمد",
    rating: 5,
    text: "منتج ممتاز! الجودة عالية جدًا، والتصميم أنيق. وصل في الوقت المحدد وبدون أي خدوش.",
    date: "2026-01-15",
    helpful: 24,
  },
  {
    id: 2,
    author: "سارة علي",
    rating: 4,
    text: "الراحة ممتازة، لكن لونه في الصورة يختلف قليلاً عن الواقع. مع ذلك، أنا راضية جدًا.",
    date: "2026-01-10",
    helpful: 18,
  },
  {
    id: 3,
    author: "محمد حسن",
    rating: 5,
    text: "أفضل اقتناء هذا العام! الهيكل متين جدًا، والخياطة دقيقة. أنصح به بشدة.",
    date: "2026-01-05",
    helpful: 31,
  },
]);

const newReview = ref({
  text: "",
  rating: 0,
});

const submitReview = () => {
  if (!newReview.value.text.trim() || newReview.value.rating === 0) return;
  const review = {
    id: reviews.value.length + 1,
    author: "أنا",
    rating: newReview.value.rating,
    text: newReview.value.text,
    date: new Date().toISOString().split("T")[0],
    helpful: 0,
  };
  reviews.value.unshift(review);
  newReview.value.text = "";
  newReview.value.rating = 0;
  alert("شكرًا لمراجعتك! سيتم مراجعتها soon.");
};

// ✅ الوحدات
const modules = [FreeMode, Navigation, Thumbs];

// ✅ دوال swiper
const setThumbsSwiper = (swiper) => {
  thumbsSwiper.value = swiper;
};

// ✅ محاكاة جلب البيانات
const fetchProductData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        product: {
          id: "63204",
          title: "انتريه كاساديا",
          images: [
            "/images/products/product1.jpg",
            "/images/products/product2.jpg",
            "/images/products/product3.jpg",
            "/images/products/product4.jpg",
            "/images/products/product5.jpg",
          ],
          description: `الراحة اللي تحلم بها: تخيل نفسك تغوص في مصفحة خشبية تصيّدها لتنسكب تعب اليوم كلّه. كثافة (38 سوفت)، يعاني راحة فخمية ما تهبط ولا تتغير مع الزمن. القماش: سواد كان قطيفة فاخرة أو كتان عالي الجودة، ناعم الملمس، يضيف لمسة دفء وأناقة.`,
          price: "50,000",
          oldPrice: "75,000",
          discount: "-33%",
          colors: [
            { name: "أخضر", hex: "#2e7d32" },
            { name: "أزرق", hex: "#1976d2" },
            { name: "بيج", hex: "#d7ccc8" },
            { name: "رمادي", hex: "#607d8b" },
          ],
          sizes: ["S", "M", "L", "XL"],
        },
        relatedProducts: [
          {
            id: 1,
            title: '* 36" 180 كونتر خشب قهوة ترابيزة',
            image: "/images/products/product1.jpg",
            price: "1,299",
            oldPrice: "2,599",
            discount: "-57%",
          },
          {
            id: 2,
            title: '* 40" 200 كونتر خشب قهوة ترابيزة',
            image: "/images/products/product2.jpg",
            price: "1,499",
            oldPrice: "2,999",
            discount: "-50%",
          },
          {
            id: 3,
            title: '* 32" 160 كونتر خشب قهوة ترابيزة',
            image: "/images/products/product3.jpg",
            price: "1,099",
            oldPrice: "2,199",
            discount: "-50%",
          },
          {
            id: 4,
            title: '* 38" 190 كونتر خشب قهوة ترابيزة',
            image: "/images/products/product4.jpg",
            price: "1,399",
            oldPrice: "2,799",
            discount: "-50%",
          },
          {
            id: 5,
            title: '* 34" 170 كونتر خشب قهوة ترابيزة',
            image: "/images/products/product5.jpg",
            price: "1,199",
            oldPrice: "2,399",
            discount: "-50%",
          },
        ],
      });
    }, 1200);
  });
};

// ✅ عند التحميل
onMounted(async () => {
  const data = await fetchProductData();
  product.value = data.product;
  relatedProducts.value = data.relatedProducts;
  loading.value = false;
});

// ✅ أحداث السلة
const handleAddToCart = (qty) => {
  console.log(`تم إضافة ${qty} من "${product.value.title}" إلى السلة`);
};

const handleRemoveFromCart = () => {
  console.log(`تم إزالة "${product.value.title}" من السلة`);
};
</script>

<style scoped lang="scss">
/* ========== الصفحة الرئيسية ========== */
.product-page {
  background-color: var(--color-green-white);
  padding: 50px 20px;
}

/* ========== التنسيق الجانبي ========== */
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

/* ========== السلايدر المزدوج ========== */
.product-slider-section {
  width: 500px;
  max-width: 100%;

  .main-swiper {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    position: relative;
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

    .swiper-button-prev,
    .swiper-button-next {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      color: var(--color-green-darker);
      font-size: 22px;
      z-index: 10;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      margin-top: 0 !important;

      &:hover {
        background: var(--color-green-primary);
        color: white;
        transform: scale(1.05);
      }
    }

    .swiper-button-prev {
      left: 24px;
    }

    .swiper-button-next {
      right: 24px;
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
        height: auto;
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

/* ========== محتوى المنتج ========== */
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

  /* ========== خيارات الألوان والمقاسات ========== */
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

        &:hover {
          transform: scale(1.1);
        }

        &.active {
          border-color: var(--color-green-primary);
          transform: scale(1.15);
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
        padding: 8px 16px;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        &:hover:not(:disabled) {
          border-color: var(--color-green-primary);
          background: var(--color-green-light);
        }

        &.active {
          border-color: var(--color-green-primary);
          background: var(--color-green-primary);
          color: white;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .out-of-stock {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--color-yellow-secondary);
          color: var(--color-green-darker);
          font-size: 10px;
          font-weight: bold;
          padding: 2px 4px;
          border-radius: 4px;
        }
      }
    }
  }

  /* ========== السعر ========== */
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

/* ========== Tabs ========== */
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
      }

      p {
        margin-bottom: 16px;
        line-height: 1.6;
      }

      ul.features-list {
        list-style: none;
        padding: 0;
        margin: 16px 0;

        li {
          padding: 6px 0;
          border-bottom: 1px dashed #eee;
          &:last-child {
            border-bottom: none;
          }
        }
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

          .review-author {
            font-weight: 700;
            color: var(--color-green-darker);
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
        }

        .review-meta {
          font-size: 13px;
          color: #777;
          display: flex;
          gap: 8px;
        }
      }

      .add-review-section {
        margin-top: 30px;

        h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--color-green-darker);
        }

        textarea.review-input {
          width: 100%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          resize: vertical;
          margin-bottom: 16px;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;

          .rating-selector {
            display: flex;
            align-items: center;
            gap: 10px;

            .stars {
              display: flex;
              gap: 4px;
            }

            .star-icon {
              font-size: 20px;
              color: #ddd;
              cursor: pointer;
              transition: color 0.2s;

              &.filled {
                color: #ffc107;
              }
            }
          }

          .btn-submit-review {
            padding: 12px 28px;
            background: var(--color-green-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;

            &:hover {
              background: var(--color-green-primary);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }
}
/* ========== الاستجابة ========== */
@media (max-width: 992px) {
  .product-info-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-page {
    padding: 30px 16px;
  }

  .product-layout {
    padding: 0 8px;
  }

  .product-info-section {
    .product-title {
      font-size: 26px;
    }

    .new-price {
      font-size: 28px;
    }
  }

  .tabs-section {
    .tabs-nav {
      .tab-button {
        padding: 10px 16px;
        font-size: 15px;
      }
    }
  }
}
</style>

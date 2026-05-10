<template>
  <div class="home-page">
    <!-- ===== Loading State ===== -->
    <div v-if="store.homeLoading" class="home-loading">
      <div class="skeleton-hero"></div>
      <div class="skeleton-row">
        <div class="skeleton-block" v-for="i in 5" :key="i"></div>
      </div>
      <div class="skeleton-slider"></div>
    </div>

    <!-- ===== Error State ===== -->
    <div v-else-if="store.homeError" class="home-error">
      <p>{{ store.homeError }}</p>
      <button @click="store.fetchHomePage()">إعادة المحاولة</button>
    </div>

    <!-- ===== Dynamic Sections ===== -->
    <template v-else>
      <template v-for="section in store.sortedHomeSections" :key="section.id">
        <template v-if="section.isActive !== false">
          <!-- ① Main Slider (Hero) -->
          <section v-if="section.type === 'mainSlider'" class="section-hero">
            <BannerSlider
              v-if="section.data?.[0]?.items?.length"
              :banners="mapSliderItems(section.data[0].items)"
            />
          </section>

          <!-- ② Product Slider -->
          <section
            v-else-if="section.type === 'productSlider'"
            class="section-products"
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
            class="section-full-image"
          >
            <template v-if="section.data?.[0]">
              <a
                v-if="section.data[0].translations?.[0]?.link"
                :href="section.data[0].translations[0].link"
                class="full-image-link"
              >
                <img
                  :src="section.data[0].imageUrl"
                  :alt="section.section_key"
                  loading="lazy"
                  class="full-image-img"
                  @error="handleImgError"
                />
              </a>
              <img
                v-else
                :src="section.data[0].imageUrl"
                :alt="section.section_key"
                loading="lazy"
                class="full-image-img"
                @error="handleImgError"
              />
            </template>
          </section>

          <!-- ④ Fixed Banner -->
          <section
            v-else-if="section.type === 'fixedBanner'"
            class="section-fixed-banner"
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
                  <div
                    v-if="section.data[0].translations?.[0]?.title"
                    class="fixed-banner-overlay"
                  >
                    <span class="fixed-banner-title">{{
                      section.data[0].translations[0].title
                    }}</span>
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
            class="section-categories"
          >
            <h2 class="section-title">الأقسام</h2>
            <div class="categories-grid" v-if="section.data?.length">
              <NuxtLink
                v-for="cat in section.data"
                :key="cat.id"
                :to="`/category/${cat.slug}`"
                class="category-item"
              >
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
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                </div>
                <p class="category-name">{{ cat.name }}</p>
              </NuxtLink>
            </div>
          </section>

          <!-- ⑥ Static Section -->
          <section
            v-else-if="section.type === 'staticSection'"
            class="section-static"
          >
            <FeaturesSection v-if="section.section_key === 'features'" />
          </section>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useHomeConfigsStore } from "@/stores/homeConfigs";
import FeaturesSection from "~/components/base/FeaturesSection.vue";

const store = useHomeConfigsStore();

onMounted(async () => {
  await store.fetchHomePage();
});

// Helper: استخراج أول ترجمة (لأن الـ Backend يرجع الترجمة المختارة فقط)
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

/**
 * ✅ التصحيح الجذري:
 * نعيد بناء كائن المنتج ليحاكي هيكلية الـ Entity الكامل الذي يتوقعه ProductCard.
 * ProductCard يحتاج إلى: mainImage, basePrice, slug, id, و translations[0].name
 */
const mapProducts = (products = []) =>
  products.map((p) => {
    const trans = getFirstTrans(p.translations);

    return {
      id: p.id,
      slug: p.slug,

      // حقول ضرورية لـ ProductCard لعرض الصورة والسعر
      mainImage: p.mainImage,
      basePrice: p.basePrice,
      baseDiscountPrice: null, // يمكن ملؤها إذا توفرت في الـ API
      baseStock: 50, // قيمة افتراضية للمخزون

      // إعادة صياغة الترجمات لتكون مصفوفة تحتوي على كائن باسم name
      // ليتوافق مع قراءة ProductCard لـ props.product.translations[0]?.name
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
.home-page {
  min-height: 100vh;
  direction: rtl;
}
.home-loading {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}
.skeleton-hero {
  width: 100%;
  height: 480px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ede8df 25%, #e0d8c8 50%, #ede8df 75%);
  background-size: 200%;
  animation: shimmer 1.4s infinite;
}
.skeleton-row {
  display: flex;
  gap: 12px;
}
.skeleton-block {
  flex: 1;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ede8df 25%, #e0d8c8 50%, #ede8df 75%);
  background-size: 200%;
  animation: shimmer 1.4s infinite;
}
.skeleton-slider {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ede8df 25%, #e0d8c8 50%, #ede8df 75%);
  background-size: 200%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
.home-error {
  text-align: center;
  padding: 80px 20px;
  color: #888;
  font-family: "Cairo", sans-serif;
}
.home-error button {
  margin-top: 16px;
  padding: 10px 24px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.section-hero {
  width: 100%;
}
.section-products {
  margin-bottom: 40px;
}
.section-full-image {
  width: 100%;
  overflow: hidden;
}
.full-image-link {
  display: block;
}
.full-image-img {
  width: 100%;
  display: block;
  border-radius: 5px;
  transition: transform 0.4s ease;
}
.full-image-link:hover .full-image-img {
  transform: scale(1.01);
}
.section-fixed-banner {
  padding: 16px 20px;
}
.fixed-banner-link {
  display: block;
}
.fixed-banner-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.fixed-banner-img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 300px;
  transition: transform 0.4s ease;
}
.fixed-banner-link:hover .fixed-banner-img {
  transform: scale(1.02);
}
.fixed-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent);
  display: flex;
  align-items: flex-end;
  padding: 20px 24px;
}
.fixed-banner-title {
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 20px;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.section-categories {
  padding: 50px 20px;
  text-align: center;
  font-family: "Cairo", sans-serif;
}
.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #5a4a2f;
  margin-bottom: 30px;
  letter-spacing: 1px;
}
.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #faf8f5;
  border-radius: 16px;
  text-decoration: none;
  transition:
    transform 0.3s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}
.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}
.category-image {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.category-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}
.category-placeholder {
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.category-name {
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin: 0;
  line-height: 1.4;
}
@media (max-width: 992px) {
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
}
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .section-categories {
    padding: 32px 16px;
  }
  .fixed-banner-img {
    max-height: 200px;
  }
}
@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .section-title {
    font-size: 22px;
  }
  .category-image {
    width: 72px;
    height: 72px;
  }
  .category-name {
    font-size: 13px;
  }
  .section-fixed-banner {
    padding: 12px;
  }
}
</style>

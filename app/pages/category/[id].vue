<template>
  <div class="category-page">
    <!-- العنوان وعدد النتائج -->
    <div class="category-header">
      <h1 class="category-title">
        {{ currentCategory?.name || "جميع المنتجات" }}
      </h1>
      <div class="results-count">
        نتيجة <span class="highlight">{{ totalProducts }}</span> منتج
      </div>
    </div>

    <!-- زر الفلترة للشاشات الصغيرة -->
    <button v-if="isMobile" class="mobile-filter-btn" @click="openFilterModal">
      <Icon name="ph-funnel-simple" class="filter-icon" />
      فلترة
    </button>

    <div class="category-layout">
      <!-- الفلتر الجانبي (للشاشات الكبيرة) -->
      <aside v-if="!isMobile" class="filter-sidebar">
        <!-- Accordion: التصنيف -->
        <div class="accordion-item">
          <button
            class="accordion-header"
            @click="toggleAccordion('categories')"
          >
            <span>التصنيف</span>
            <Icon
              :name="
                openAccordion === 'categories' ? 'ph:caret-up' : 'ph:caret-down'
              "
              class="accordion-icon"
            />
          </button>
          <div
            v-show="openAccordion === 'categories'"
            class="accordion-content"
          >
            <div class="filter-options">
              <BaseCheckbox
                v-for="cat in categories"
                :key="cat.id"
                v-model="selectedCategories"
                :label="cat.name"
                :id="`cat-${cat.id}`"
                :value="cat.id"
              />
            </div>
          </div>
        </div>

        <!-- Accordion: السعر -->
        <div class="accordion-item">
          <button class="accordion-header" @click="toggleAccordion('price')">
            <span>السعر</span>
            <Icon
              :name="
                openAccordion === 'price' ? 'ph:caret-up' : 'ph:caret-down'
              "
              class="accordion-icon"
            />
          </button>
          <div v-show="openAccordion === 'price'" class="accordion-content">
            <div class="price-range">
              <div class="price-values">
                <span>من: {{ formatPrice(priceMin) }}</span>
                <span>إلى: {{ formatPrice(priceMax) }}</span>
              </div>
              <ClientOnly>
                <vue3-slider
                  v-model="priceRange"
                  :min="0"
                  :max="10000"
                  :tooltip="true"
                  :tooltip-formatter="formatPrice"
                  :range="true"
                  class="custom-slider"
                />
              </ClientOnly>
              <div class="price-inputs">
                <input
                  type="number"
                  v-model.number="priceMin"
                  min="0"
                  max="10000"
                  class="price-input"
                />
                <input
                  type="number"
                  v-model.number="priceMax"
                  min="0"
                  max="10000"
                  class="price-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Accordion: اللون -->
        <div class="accordion-item">
          <button class="accordion-header" @click="toggleAccordion('colors')">
            <span>اللون</span>
            <Icon
              :name="
                openAccordion === 'colors' ? 'ph:caret-up' : 'ph:caret-down'
              "
              class="accordion-icon"
            />
          </button>
          <div v-show="openAccordion === 'colors'" class="accordion-content">
            <div class="color-options">
              <button
                v-for="color in colors"
                :key="color.id"
                class="color-btn"
                :class="{ active: selectedColors.includes(color.id) }"
                @click="toggleColor(color.id)"
                :style="{ backgroundColor: color.hex }"
                :aria-label="color.name"
              >
                <Icon
                  v-if="selectedColors.includes(color.id)"
                  name="ph:check"
                  class="color-check"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Accordion: نوع اللون -->
        <div class="accordion-item">
          <button
            class="accordion-header"
            @click="toggleAccordion('colorType')"
          >
            <span>نوع اللون</span>
            <Icon
              :name="
                openAccordion === 'colorType' ? 'ph:caret-up' : 'ph:caret-down'
              "
              class="accordion-icon"
            />
          </button>
          <div v-show="openAccordion === 'colorType'" class="accordion-content">
            <div class="radio-group">
              <BaseRadio
                v-for="type in colorTypes"
                :key="type.value"
                v-model="selectedColorType"
                :value="type.value"
                :label="type.label"
                :id="`color-type-${type.value}`"
                name="colorType"
              />
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">إعادة تعيين</button>
          <button class="btn-apply" @click="applyFilters">تطبيق</button>
        </div>
      </aside>

      <!-- محتوى المنتجات -->
      <main class="products-grid">
        <!-- شريط الترتيب -->
        <div class="sort-bar">
          <span class="sort-label">ترتيب حسب:</span>
          <select v-model="sortBy" class="sort-select">
            <option value="featured">الأكثر رواجًا</option>
            <option value="price-low">الأقل سعرًا</option>
            <option value="price-high">الأعلى سعرًا</option>
            <option value="newest">الأحدث</option>
            <option value="rating">الأعلى تقييمًا</option>
          </select>
        </div>

        <!-- كروت المنتجات -->
        <div class="products-list">
          <ProductCard
            v-for="product in displayedProducts"
            :key="product.id"
            :product="product"
            :in-wishlist="isInWishlist(product.id)"
            @add-to-cart="handleAddToCart(product)"
          />
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            ←
          </button>
          <span class="pagination-info">
            {{ currentPage }} من {{ totalPages }}
          </span>
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            →
          </button>
        </div>
      </main>
    </div>

    <!-- Popup الفلترة للشاشات الصغيرة -->
    <Teleport to="body">
      <div
        v-if="showFilterModal"
        class="filter-modal-overlay"
        @click="closeFilterModal"
      >
        <div class="filter-modal" @click.stop>
          <div class="modal-header">
            <h3>فلترة</h3>
            <button class="close-btn" @click="closeFilterModal">
              <Icon name="ph:x" />
            </button>
          </div>
          <div class="modal-accordions">
            <div class="accordion-item">
              <button
                class="accordion-header"
                @click="toggleMobileAccordion('categories')"
              >
                <span>التصنيف</span>
                <Icon
                  :name="
                    openMobileAccordion === 'categories'
                      ? 'ph:caret-up'
                      : 'ph:caret-down'
                  "
                  class="accordion-icon"
                />
              </button>
              <div
                v-show="openMobileAccordion === 'categories'"
                class="accordion-content"
              >
                <div class="filter-options">
                  <BaseCheckbox
                    v-for="cat in categories"
                    :key="cat.id"
                    v-model="selectedCategories"
                    :label="cat.name"
                    :id="`mobile-cat-${cat.id}`"
                    :value="cat.id"
                  />
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button
                class="accordion-header"
                @click="toggleMobileAccordion('price')"
              >
                <span>السعر</span>
                <Icon
                  :name="
                    openMobileAccordion === 'price'
                      ? 'ph:caret-up'
                      : 'ph:caret-down'
                  "
                  class="accordion-icon"
                />
              </button>
              <div
                v-show="openMobileAccordion === 'price'"
                class="accordion-content"
              >
                <div class="price-range">
                  <div class="price-values">
                    <span>من: {{ formatPrice(priceMin) }}</span>
                    <span>إلى: {{ formatPrice(priceMax) }}</span>
                  </div>
                  <ClientOnly>
                    <vue3-slider
                      v-model="priceRange"
                      :min="0"
                      :max="10000"
                      :tooltip="true"
                      :tooltip-formatter="formatPrice"
                      :range="true"
                      class="custom-slider"
                    />
                  </ClientOnly>
                  <div class="price-inputs">
                    <input
                      type="number"
                      v-model.number="priceMin"
                      min="0"
                      max="10000"
                      class="price-input"
                    />
                    <input
                      type="number"
                      v-model.number="priceMax"
                      min="0"
                      max="10000"
                      class="price-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button
                class="accordion-header"
                @click="toggleMobileAccordion('colors')"
              >
                <span>اللون</span>
                <Icon
                  :name="
                    openMobileAccordion === 'colors'
                      ? 'ph:caret-up'
                      : 'ph:caret-down'
                  "
                  class="accordion-icon"
                />
              </button>
              <div
                v-show="openMobileAccordion === 'colors'"
                class="accordion-content"
              >
                <div class="color-options">
                  <button
                    v-for="color in colors"
                    :key="color.id"
                    class="color-btn"
                    :class="{ active: selectedColors.includes(color.id) }"
                    @click="toggleColor(color.id)"
                    :style="{ backgroundColor: color.hex }"
                    :aria-label="color.name"
                  >
                    <Icon
                      v-if="selectedColors.includes(color.id)"
                      name="ph:check"
                      class="color-check"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button
                class="accordion-header"
                @click="toggleMobileAccordion('colorType')"
              >
                <span>نوع اللون</span>
                <Icon
                  :name="
                    openMobileAccordion === 'colorType'
                      ? 'ph:caret-up'
                      : 'ph:caret-down'
                  "
                  class="accordion-icon"
                />
              </button>
              <div
                v-show="openMobileAccordion === 'colorType'"
                class="accordion-content"
              >
                <div class="radio-group">
                  <BaseRadio
                    v-for="type in colorTypes"
                    :key="type.value"
                    v-model="selectedColorType"
                    :value="type.value"
                    :label="type.label"
                    :id="`mobile-color-type-${type.value}`"
                    name="mobileColorType"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-reset" @click="resetFilters">إعادة تعيين</button>
            <button class="btn-apply" @click="applyAndClose">تطبيق</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import ProductCard from "@/components/global/ProductCard.vue";
import BaseCheckbox from "@/components/base/BaseCheckbox.vue";
import BaseRadio from "@/components/base/BaseRadio.vue";
import vue3Slider from "vue3-slider";

// ✅ الحالة
const route = useRoute();
const isMobile = ref(false);
const showFilterModal = ref(false);
const openAccordion = ref(null);
const openMobileAccordion = ref(null);

const loading = ref(true);
const currentPage = ref(1);
const pageSize = 12;

const sortBy = ref("featured");
const priceMin = ref(0);
const priceMax = ref(10000);
const selectedCategories = ref([]);
const selectedColors = ref([]);
const selectedColorType = ref("");

// ❗️ categoryId كـ ref، وليس computed، ليتم تحديثه عبر watch
const categoryId = ref("");

// ✅ مراقبة تغيير المعامل في الرابط
watch(
  () => route.params.id,
  (newId) => {
    categoryId.value = newId || "";
    currentPage.value = 1; // إعادة تعيين الصفحة عند تغيير الفئة
    // يمكنك هنا أيضًا إعادة تعيين الفلاتر إذا أردت
  },
  { immediate: true },
);

// ✅ مزامنة السلايدر مع الحقول
const priceRange = computed({
  get() {
    return [priceMin.value, priceMax.value];
  },
  set(value) {
    if (Array.isArray(value) && value.length === 2) {
      priceMin.value = value[0];
      priceMax.value = value[1];
    }
  },
});

// ✅ أنواع الألوان
const colorTypes = [
  { value: "ابيض", label: "أبيض" },
  { value: "اسود", label: "أسود" },
  { value: "بني", label: "بني" },
  { value: "رمادي", label: "رمادي" },
];

// ✅ بيانات الفئات
const categories = [
  { id: "chairs", name: "كراسي" },
  { id: "tables", name: "طاولات" },
  { id: "sofas", name: "انتريهات" },
  { id: "shelves", name: "وحدات تخزين" },
  { id: "beds", name: "أسرّة" },
];

// ✅ الفئة الحالية
const currentCategory = computed(() =>
  categories.find((cat) => cat.id === categoryId.value),
);

// ✅ ألوان
const colors = [
  { id: "green", name: "أخضر", hex: "#2e7d32" },
  { id: "blue", name: "أزرق", hex: "#1976d2" },
  { id: "beige", name: "بيج", hex: "#d7ccc8" },
  { id: "gray", name: "رمادي", hex: "#607d8b" },
  { id: "brown", name: "بني", hex: "#5d4037" },
];

// ✅ بيانات المنتجات - تم جعل كل id فريدًا
const allProducts = ref([
  {
    id: 1,
    title: "* 36* 180 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product1.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    id: 2,
    title: "* 40* 200 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product2.jpg",
    price: "1,499",
    oldPrice: "2,999",
    discount: "-50%",
  },
  {
    id: 3,
    title: "* 32* 160 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product3.jpg",
    price: "1,099",
    oldPrice: "2,199",
    discount: "-50%",
  },
  {
    id: 4,
    title: "* 38* 190 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product4.jpg",
    price: "1,399",
    oldPrice: "2,799",
    discount: "-50%",
  },
  {
    id: 5,
    title: "* 34* 170 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product5.jpg",
    price: "1,199",
    oldPrice: "2,399",
    discount: "-50%",
  },
  {
    id: 11,
    title: "* 36* 180 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product1.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    id: 12,
    title: "* 40* 200 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product2.jpg",
    price: "1,499",
    oldPrice: "2,999",
    discount: "-50%",
  },
  {
    id: 13,
    title: "* 32* 160 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product3.jpg",
    price: "1,099",
    oldPrice: "2,199",
    discount: "-50%",
  },
  {
    id: 14,
    title: "* 38* 190 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product4.jpg",
    price: "1,399",
    oldPrice: "2,799",
    discount: "-50%",
  },
  {
    id: 15,
    title: "* 34* 170 كونتر خشب قهوة ترابيزة",
    category: "tables",
    image: "/images/products/product5.jpg",
    price: "1,199",
    oldPrice: "2,399",
    discount: "-50%",
  },
  // beds products — IDs فريدة الآن
  {
    id: 20,
    title: "سرير خشب بحجم كينغ - أول نموذج",
    category: "tables",
    image: "/images/products/bed1.jpg",
    price: "50,000",
    oldPrice: "75,000",
    discount: "-33%",
  },
  {
    id: 21,
    title: "سرير معدني بحجم كوين",
    category: "beds",
    image: "/images/products/bed2.jpg",
    price: "35,000",
    oldPrice: "50,000",
    discount: "-30%",
  },
  {
    id: 22,
    title: "سرير أطفال خشبي",
    category: "beds",
    image: "/images/products/bed3.jpg",
    price: "12,000",
    oldPrice: "18,000",
    discount: "-33%",
  },
  {
    id: 23,
    title: "سرير خشب بحجم كينغ - فاخر",
    category: "beds",
    image: "/images/products/bed4.jpg",
    price: "65,000",
    oldPrice: "90,000",
    discount: "-28%",
  },
  // باقي المنتجات
  {
    id: 24,
    title: "كرسي مكتب خشب + جلد",
    category: "chairs",
    image: "/images/products/chair1.jpg",
    price: "2,499",
    oldPrice: "3,999",
    discount: "-37%",
  },
  {
    id: 25,
    title: "رف خشبي 4 أدراج",
    category: "shelves",
    image: "/images/products/shelf1.jpg",
    price: "899",
    oldPrice: "1,499",
    discount: "-40%",
  },
  {
    id: 26,
    title: "طاولة طعام 6 مقاعد",
    category: "tables",
    image: "/images/products/table6.jpg",
    price: "3,799",
    oldPrice: "5,999",
    discount: "-37%",
  },
  {
    id: 27,
    title: "خزانة ملابس 3 أبواب",
    category: "shelves",
    image: "/images/products/shelf2.jpg",
    price: "4,299",
    oldPrice: "6,999",
    discount: "-39%",
  },
  {
    id: 28,
    title: "كرسي استرخاء مع وسادة",
    category: "chairs",
    image: "/images/products/chair2.jpg",
    price: "1,899",
    oldPrice: "2,799",
    discount: "-32%",
  },
]);

const wishlist = ref([1, 20, 26]);
const isInWishlist = (id) => wishlist.value.includes(id);

// ✅ المنتجات حسب الفئة (بدون فلترة أخرى)
const productsByCategory = computed(() => {
  if (!categoryId.value || categoryId.value === "all") {
    return allProducts.value;
  }
  return allProducts.value.filter((p) => p.category === categoryId.value);
});

// ✅ الفلترة الكاملة
const filteredProducts = computed(() => {
  return productsByCategory.value.filter((p) => {
    const price = parseFloat(p.price.replace(/,/g, ""));
    if (price < priceMin.value || price > priceMax.value) return false;

    if (selectedCategories.value.length > 0) {
      const hasCat = selectedCategories.value.some((cat) => p.category === cat);
      if (!hasCat) return false;
    }

    if (selectedColors.value.length > 0) {
      const hasColor = selectedColors.value.some((colorId) =>
        p.title
          .toLowerCase()
          .includes(colors.find((c) => c.id === colorId)?.name.toLowerCase()),
      );
      if (!hasColor) return false;
    }

    return true;
  });
});

// ✅ عدد المنتجات بعد الفلترة
const totalProducts = computed(() => filteredProducts.value.length);

// ✅ صفحات التنقل
const totalPages = computed(() => Math.ceil(totalProducts.value / pageSize));
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);

// ✅ المنتجات المعروضة
const displayedProducts = computed(() => {
  let result = [...filteredProducts.value];

  switch (sortBy.value) {
    case "price-low":
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price-high":
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "newest":
      result.reverse();
      break;
  }

  return result.slice(startIndex.value, endIndex.value);
});

// ✅ دوال الفلتر
const toggleColor = (colorId) => {
  if (selectedColors.value.includes(colorId)) {
    selectedColors.value = selectedColors.value.filter((c) => c !== colorId);
  } else {
    selectedColors.value.push(colorId);
  }
};

const resetFilters = () => {
  priceMin.value = 0;
  priceMax.value = 10000;
  selectedCategories.value = [];
  selectedColors.value = [];
  selectedColorType.value = "";
  sortBy.value = "featured";
  currentPage.value = 1;
};

const applyFilters = () => {
  console.log("الفلاتر المطبقة:", {
    price: [priceMin.value, priceMax.value],
    categories: selectedCategories.value,
    colors: selectedColors.value,
    colorType: selectedColorType.value,
    sort: sortBy.value,
  });
};

const handleAddToCart = (product) => {
  console.log(`تم إضافة "${product.title}" إلى السلة`);
};

// ✅ دوال الـ Modal
const openFilterModal = () => {
  showFilterModal.value = true;
};

const closeFilterModal = () => {
  showFilterModal.value = false;
};

const applyAndClose = () => {
  applyFilters();
  closeFilterModal();
};

// ✅ دوال الـ Accordion
const toggleAccordion = (section) => {
  openAccordion.value = openAccordion.value === section ? null : section;
};

const toggleMobileAccordion = (section) => {
  openMobileAccordion.value =
    openMobileAccordion.value === section ? null : section;
};

// ✅ تنسيق السعر
const formatPrice = (value) => {
  return new Intl.NumberFormat("ar-EG").format(value) + " ج.م";
};

// ✅ كشف حجم الشاشة
const checkScreenSize = () => {
  isMobile.value = typeof window !== "undefined" && window.innerWidth <= 768;
};

onBeforeMount(() => {
  checkScreenSize();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", checkScreenSize);
  }
});

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 300);
});
</script>

<style scoped lang="scss">
/* ========== الأنماط العامة ========== */
.category-page {
  background-color: var(--color-green-white);
  padding: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .category-title {
    font-size: 28px;
    font-weight: 800;
    color: var(--color-green-darker);
    margin: 0;
  }

  .results-count {
    font-size: 16px;
    color: var(--text-main);

    .highlight {
      font-weight: 700;
      color: var(--color-green-primary);
    }
  }
}

/* ========== زر الفلترة للجوال ========== */
.mobile-filter-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  width: fit-content;

  .filter-icon {
    font-size: 20px;
  }
}

/* ========== التنسيق الرئيسي ========== */
.category-layout {
  display: flex;
  gap: 24px;

  @media (max-width: 992px) {
    flex-direction: column;
  }
}

/* ========== الفلتر الجانبي ========== */
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-2);
}

/* ========== Accordions ========== */
.accordion-item {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  &:last-child {
    margin-bottom: 0;
  }
}

.accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--color-green-light-active);
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-green-darker);
  transition: background 0.3s;

  &:hover {
    background: var(--color-green-light-hover);
  }

  .accordion-icon {
    font-size: 20px;
    transition: transform 0.3s;
  }
}

.accordion-content {
  background: white;
  padding: 16px;
  border-top: 1px solid #eee;
}

/* ========== الفلاتر ========== */
.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-range {
  .price-values {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .custom-slider {
    margin: 16px 0;
    :deep(.vue3-slider) {
      height: 6px;
      background: #eee;
      border-radius: 3px;
    }
    :deep(.vue3-slider-process) {
      background: var(--color-green-primary);
      border-radius: 3px;
    }
    :deep(.vue3-slider-dot) {
      width: 20px;
      height: 20px;
      background: var(--color-green-primary);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      top: -7px;
    }
    :deep(.vue3-slider-tooltip) {
      background: var(--color-green-primary);
      color: white;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
    }
  }

  .price-inputs {
    display: flex;
    gap: 10px;
    margin-top: 12px;

    .price-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
    }
  }
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .color-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #ddd;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &.active {
      border-color: var(--color-green-primary);
      transform: scale(1.1);
    }

    .color-check {
      position: absolute;
      bottom: -4px;
      right: -4px;
      font-size: 12px;
      color: white;
      background: var(--color-green-primary);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;

  .btn-reset,
  .btn-apply {
    flex: 1;
    padding: 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-reset {
    background: #f0f4f2;
    color: var(--color-green-darker);
    border: 1px solid #ddd;

    &:hover {
      background: #e0e7e3;
    }
  }

  .btn-apply {
    background: var(--color-green-primary);
    color: white;

    &:hover {
      background: var(--color-green-primary);
    }
  }
}

/* ========== محتوى المنتجات ========== */
.products-grid {
  flex: 1;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .sort-label {
    font-size: 14px;
    color: var(--text-main);
  }

  .sort-select {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: white;
  }
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;

  .pagination-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 50%;
    background: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--color-green-light);
      color: var(--color-green-primary);
    }
  }

  .pagination-info {
    font-size: 14px;
    color: var(--text-main);
  }
}

/* ========== Modal الفلترة ========== */
.filter-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.filter-modal {
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  max-height: 80vh;
  overflow-y: auto;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-green-darker);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #777;
    }
  }

  .modal-accordions {
    padding: 0 20px 20px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid #eee;

    .btn-reset,
    .btn-apply {
      flex: 1;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
  }
}

/* ========== الاستجابة ========== */
@media (max-width: 768px) {
  .category-page {
    padding: 12px;
  }

  .mobile-filter-btn {
    display: flex;
  }

  .filter-sidebar {
    display: none;
  }

  .products-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>

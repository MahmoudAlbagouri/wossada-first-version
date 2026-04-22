<template>
  <div class="category-page">
    <!-- العنوان -->
    <div class="category-header">
      <h1 class="category-title">
        {{ store.category?.name || "جميع المنتجات" }}
      </h1>
      <div class="results-count">
        نتيجة <span class="highlight">{{ store.meta.totalItems }}</span> منتج
      </div>
    </div>

    <!-- زر الفلترة للجوال -->
    <button v-if="isMobile" class="mobile-filter-btn" @click="openFilterModal">
      <Icon name="ph:funnel-simple" class="filter-icon" />
      فلترة
    </button>

    <div class="category-layout">
      <!-- الفلتر الجانبي -->
      <aside v-if="!isMobile" class="filter-sidebar">
        <div class="accordion-item">
          <button class="accordion-header" @click="toggleAccordion('price')">
            <span>السعر</span>
            <Icon
              :name="
                openAccordion === 'price' ? 'ph:caret-up' : 'ph:caret-down'
              "
            />
          </button>
          <div v-show="openAccordion === 'price'" class="accordion-content">
            <div class="price-inputs">
              <input
                type="number"
                v-model.number="priceMin"
                placeholder="من"
                class="price-input"
              />
              <input
                type="number"
                v-model.number="priceMax"
                placeholder="إلى"
                class="price-input"
              />
            </div>
          </div>
        </div>

        <div class="accordion-item" v-if="store.filters.colors.length">
          <button class="accordion-header" @click="toggleAccordion('colors')">
            <span>اللون</span>
            <Icon
              :name="
                openAccordion === 'colors' ? 'ph:caret-up' : 'ph:caret-down'
              "
            />
          </button>
          <div v-show="openAccordion === 'colors'" class="accordion-content">
            <div class="color-options">
              <button
                v-for="color in store.filters.colors"
                :key="color.id"
                class="color-btn"
                :class="{ active: selectedColors.includes(color.id) }"
                @click="toggleColor(color.id)"
                :style="{ backgroundColor: color.hex }"
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

        <div class="accordion-item" v-if="store.filters.sizes.length">
          <button class="accordion-header" @click="toggleAccordion('sizes')">
            <span>الحجم</span>
            <Icon
              :name="
                openAccordion === 'sizes' ? 'ph:caret-up' : 'ph:caret-down'
              "
            />
          </button>
          <div v-show="openAccordion === 'sizes'" class="accordion-content">
            <div class="filter-options">
              <label
                v-for="size in store.filters.sizes"
                :key="size.id"
                class="filter-label"
              >
                <input
                  type="checkbox"
                  :value="size.id"
                  v-model="selectedSizes"
                />
                {{ size.value }}
              </label>
            </div>
          </div>
        </div>

        <div class="accordion-item" v-if="store.filters.brands.length">
          <button class="accordion-header" @click="toggleAccordion('brands')">
            <span>الماركة</span>
            <Icon
              :name="
                openAccordion === 'brands' ? 'ph:caret-up' : 'ph:caret-down'
              "
            />
          </button>
          <div v-show="openAccordion === 'brands'" class="accordion-content">
            <div class="filter-options">
              <label
                v-for="brand in store.filters.brands"
                :key="brand.id"
                class="filter-label"
              >
                <input
                  type="checkbox"
                  :value="brand.id"
                  v-model="selectedBrands"
                />
                {{ brand.name }}
              </label>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">إعادة تعيين</button>
          <button class="btn-apply" @click="applyFilters">تطبيق</button>
        </div>
      </aside>

      <!-- المنتجات -->
      <main class="products-grid">
        <div class="sort-bar">
          <span class="sort-label">ترتيب حسب:</span>
          <select v-model="sortBy" class="sort-select" @change="applyFilters">
            <option value="">الأكثر رواجًا</option>
            <option value="price_asc">الأقل سعرًا</option>
            <option value="price_desc">الأعلى سعرًا</option>
            <option value="newest">الأحدث</option>
            <option value="rating">الأعلى تقييمًا</option>
          </select>
        </div>

        <!-- لودينج -->
        <div v-if="store.loading" class="loading-grid">
          <div v-for="i in 8" :key="i" class="skeleton-card"></div>
        </div>

        <!-- المنتجات -->
        <div v-else-if="store.products.length" class="products-list">
          <ProductCard
            v-for="product in store.products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- لا يوجد منتجات -->
        <div v-else class="empty-state">
          <Icon name="ph:package" class="empty-icon" />
          <p>لا توجد منتجات في هذا التصنيف</p>
        </div>

        <!-- Pagination -->
        <div v-if="store.meta.totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ←
          </button>

          <button
            v-for="page in store.meta.totalPages"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            class="pagination-btn"
            :disabled="currentPage === store.meta.totalPages"
            @click="changePage(currentPage + 1)"
          >
            →
          </button>
        </div>
      </main>
    </div>

    <!-- Modal للجوال -->
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
          <div class="modal-body">
            <!-- نفس محتوى الفلتر -->
            <div class="filter-actions">
              <button class="btn-reset" @click="resetFilters">
                إعادة تعيين
              </button>
              <button class="btn-apply" @click="applyAndClose">تطبيق</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryProductsStore } from "@/stores/categoryProducts";

const route = useRoute();
const router = useRouter();
const store = useCategoryProductsStore();
const { currentLang } = useLanguage();

const slug = computed(() => route.params.id);

const currentPage = ref(Number(route.query.page) || 1);
const sortBy = ref(route.query.sortBy || "");
const priceMin = ref(Number(route.query.minPrice) || 0);
const priceMax = ref(Number(route.query.maxPrice) || 10000);

const selectedColors = ref(
  route.query.colorIds ? route.query.colorIds.split(",") : [],
);
const selectedSizes = ref(
  route.query.sizeIds ? route.query.sizeIds.split(",") : [],
);
const selectedBrands = ref(
  route.query.brandIds ? route.query.brandIds.split(",") : [],
);

const buildQuery = () => {
  const query = { page: currentPage.value, limit: 12 };
  if (sortBy.value) query.sortBy = sortBy.value;
  if (priceMin.value > 0) query.minPrice = priceMin.value;
  if (priceMax.value < 10000) query.maxPrice = priceMax.value;
  if (selectedColors.value.length)
    query.colorIds = selectedColors.value.join(",");
  if (selectedSizes.value.length) query.sizeIds = selectedSizes.value.join(",");
  if (selectedBrands.value.length)
    query.brandIds = selectedBrands.value.join(",");
  return query;
};

await useAsyncData(
  () => `category-products-${slug.value}-${currentLang.value}`,
  () => store.fetchCategoryProducts(slug.value, buildQuery()),
  { lazy: false },
);

watch(currentLang, async (newLang) => {
  console.log("🌐 تم تغيير اللغة إلى:", newLang);
  await store.fetchCategoryProducts(slug.value, buildQuery());
});

watch(slug, async (newSlug) => {
  if (newSlug) {
    resetFilters(false);
    await store.fetchCategoryProducts(newSlug, buildQuery());
  }
});

const applyFilters = async () => {
  currentPage.value = 1;
  router.push({ query: buildQuery() });
  await store.fetchCategoryProducts(slug.value, buildQuery());
};

const changePage = async (page) => {
  currentPage.value = page;
  router.push({ query: buildQuery() });
  await store.fetchCategoryProducts(slug.value, buildQuery());
  if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
};

const resetFilters = async (fetch = true) => {
  currentPage.value = 1;
  sortBy.value = "";
  priceMin.value = 0;
  priceMax.value = 10000;
  selectedColors.value = [];
  selectedSizes.value = [];
  selectedBrands.value = [];

  if (fetch) {
    router.push({ query: {} });
    await store.fetchCategoryProducts(slug.value, buildQuery());
  }
};

const toggleColor = (colorId) => {
  const index = selectedColors.value.indexOf(colorId);
  if (index > -1) {
    selectedColors.value.splice(index, 1);
  } else {
    selectedColors.value.push(colorId);
  }
};

const isMobile = ref(false);
const showFilterModal = ref(false);
const openAccordion = ref(null);

const toggleAccordion = (section) => {
  openAccordion.value = openAccordion.value === section ? null : section;
};

const openFilterModal = () => (showFilterModal.value = true);
const closeFilterModal = () => (showFilterModal.value = false);
const applyAndClose = () => {
  applyFilters();
  closeFilterModal();
};

onMounted(() => {
  isMobile.value = window.innerWidth <= 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 768;
  });
});
</script>

<style scoped lang="scss">
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
}

.category-layout {
  display: flex;
  gap: 24px;

  @media (max-width: 992px) {
    flex-direction: column;
  }
}

.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-2);
  height: fit-content;
}

.accordion-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
  font-size: 15px;
  font-weight: 700;
  color: var(--color-green-darker);
  transition: background 0.3s;

  &:hover {
    background: var(--color-green-light-hover);
  }
}

.accordion-content {
  background: white;
  padding: 16px;
  border-top: 1px solid #eee;
}

.price-inputs {
  display: flex;
  gap: 10px;

  .price-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    text-align: center;
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

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }
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
  }

  .btn-apply {
    background: var(--color-green-primary);
    color: white;
    border: none;
  }
}

.products-grid {
  flex: 1;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

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

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;

  .skeleton-card {
    height: 320px;
    border-radius: 12px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #aaa;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    font-size: 18px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;

  .pagination-btn {
    min-width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0 8px;

    &.active {
      background: var(--color-green-primary);
      color: white;
      border-color: var(--color-green-primary);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled):not(.active) {
      background: var(--color-green-light-active);
      color: var(--color-green-primary);
    }
  }
}

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
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #777;
    }
  }

  .modal-body {
    padding: 20px;
  }
}

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

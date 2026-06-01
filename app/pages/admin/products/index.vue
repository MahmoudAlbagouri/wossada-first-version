<template>
  <div class="products-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة المنتجات</h1>
        <span class="products-count" v-if="store.meta">
          {{ store.meta.totalItems }} منتج
        </span>
      </div>
      <button class="btn-add" @click="openCreateModal">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        إضافة منتج
      </button>
    </div>

    <!-- ===== Search & Filters Bar ===== -->
    <div class="search-filters-bar">
      <div class="search-input-wrap">
        <svg
          class="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          class="search-input"
          placeholder="ابحث باسم المنتج أو الـ slug..."
          @keyup.enter="doSearch"
          @input="onSearchInput"
        />
        <button v-if="searchInput" class="search-clear" @click="clearSearch">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <button
        class="btn-filters-toggle"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        فلترة
        <span v-if="store.hasActiveFilters" class="filter-active-dot"></span>
      </button>

      <button
        v-if="store.hasActiveFilters"
        class="btn-reset-filters"
        @click="resetAll"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        مسح الكل
      </button>
    </div>

    <!-- ===== Filters Panel ===== -->
    <Transition name="filters-slide">
      <div v-if="showFilters" class="filters-panel">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">القسم</label>
            <select
              v-model="localFilters.categoryId"
              class="filter-select"
              @change="applyFiltersNow"
            >
              <option value="">كل الأقسام</option>
              <template
                v-for="parent in categoryStore.topLevelCategories"
                :key="parent.id"
              >
                <option :value="parent.id">
                  {{ categoryStore.getCategoryName(parent, "ar") }}
                </option>
                <option
                  v-for="child in parent.children"
                  :key="child.id"
                  :value="child.id"
                >
                  └ {{ categoryStore.getCategoryName(child, "ar") }}
                </option>
              </template>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">الماركة</label>
            <select
              v-model="localFilters.brandId"
              class="filter-select"
              @change="applyFiltersNow"
            >
              <option value="">كل الماركات</option>
              <option
                v-for="brand in brandsStore.brands"
                :key="brand.id"
                :value="brand.id"
              >
                {{ brandsStore.getBrandName(brand, "ar") }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">اللون</label>
            <select
              v-model="localFilters.colorId"
              class="filter-select"
              @change="applyFiltersNow"
            >
              <option value="">كل الألوان</option>
              <option
                v-for="color in colorsStore.colors"
                :key="color.id"
                :value="color.id"
              >
                {{ colorsStore.getColorName(color, "ar") }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">الحجم</label>
            <select
              v-model="localFilters.sizeId"
              class="filter-select"
              @change="applyFiltersNow"
            >
              <option value="">كل الأحجام</option>
              <option
                v-for="size in sizesStore.sizes"
                :key="size.id"
                :value="size.id"
              >
                {{ sizesStore.getSizeName(size, "ar") }}
              </option>
            </select>
          </div>

          <div class="filter-group price-range-group">
            <label class="filter-label">نطاق السعر (ج.م)</label>
            <div class="price-inputs">
              <div class="price-input-wrap">
                <input
                  v-model.number="localFilters.minPrice"
                  type="number"
                  class="filter-input"
                  placeholder="من"
                  min="0"
                  @change="applyFiltersNow"
                />
                <span class="price-label">من</span>
              </div>
              <span class="price-separator">—</span>
              <div class="price-input-wrap">
                <input
                  v-model.number="localFilters.maxPrice"
                  type="number"
                  class="filter-input"
                  placeholder="إلى"
                  min="0"
                  @change="applyFiltersNow"
                />
                <span class="price-label">إلى</span>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">عدد النتائج</label>
            <select
              v-model.number="localFilters.limit"
              class="filter-select"
              @change="applyFiltersNow"
            >
              <option :value="10">10 لكل صفحة</option>
              <option :value="20">20 لكل صفحة</option>
              <option :value="50">50 لكل صفحة</option>
              <option :value="100">100 لكل صفحة</option>
            </select>
          </div>
        </div>

        <div v-if="store.hasActiveFilters" class="active-filter-tags">
          <span class="tags-label">الفلاتر النشطة:</span>
          <span v-if="store.activeFilters.searchTerm" class="filter-tag">
            🔍 "{{ store.activeFilters.searchTerm }}"
            <button @click="clearSingleFilter('searchTerm')">✕</button>
          </span>
          <span v-if="store.activeFilters.categoryId" class="filter-tag">
            📁 {{ getCategoryNameById(store.activeFilters.categoryId) }}
            <button @click="clearSingleFilter('categoryId')">✕</button>
          </span>
          <span v-if="store.activeFilters.brandId" class="filter-tag">
            🏷️ {{ getBrandNameById(store.activeFilters.brandId) }}
            <button @click="clearSingleFilter('brandId')">✕</button>
          </span>
          <span v-if="store.activeFilters.colorId" class="filter-tag">
            🎨 {{ getColorNameById(store.activeFilters.colorId) }}
            <button @click="clearSingleFilter('colorId')">✕</button>
          </span>
          <span v-if="store.activeFilters.sizeId" class="filter-tag">
            📐 {{ getSizeNameById(store.activeFilters.sizeId) }}
            <button @click="clearSingleFilter('sizeId')">✕</button>
          </span>
          <span
            v-if="store.activeFilters.minPrice || store.activeFilters.maxPrice"
            class="filter-tag"
          >
            💰 {{ store.activeFilters.minPrice || "0" }} —
            {{ store.activeFilters.maxPrice || "∞" }} ج.م
            <button @click="clearPriceFilter">✕</button>
          </span>
        </div>
      </div>
    </Transition>

    <!-- ===== Loading ===== -->
    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-retry" @click="store.fetchProducts()">
        إعادة المحاولة
      </button>
    </div>

    <!-- ===== Products Table ===== -->
    <div v-else class="table-wrapper">
      <div v-if="!store.products.length" class="no-results-state">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4b87a"
          stroke-width="1"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="no-results-title">لا توجد نتائج</p>
        <p class="no-results-sub">جرب تعديل الفلاتر أو مسحها</p>
        <button class="btn-retry" @click="resetAll">مسح الفلاتر</button>
      </div>

      <table v-else class="products-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>السعر</th>
            <th>السعر بعد الخصم</th>
            <th>المخزون</th>
            <th>الألوان</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in store.products"
            :key="product.id"
            class="product-row"
          >
            <td class="product-cell">
              <div class="product-info">
                <img
                  :src="product.mainImage"
                  :alt="store.getProductName(product)"
                  class="product-thumb"
                  @error="$event.target.src = '/images/placeholder.jpg'"
                />
                <div class="product-meta">
                  <p class="product-name">
                    {{ store.getProductName(product, "ar") }}
                  </p>
                  <p class="product-slug">{{ product.slug }}</p>
                </div>
              </div>
            </td>
            <td class="price-cell">{{ formatPrice(product.basePrice) }} ج.م</td>
            <td class="price-cell">
              <span v-if="product.baseDiscountPrice" class="discount-price"
                >{{ formatPrice(product.baseDiscountPrice) }} ج.م</span
              >
              <span v-else class="no-discount">—</span>
            </td>
            <td>
              <span
                class="stock-badge"
                :class="stockClass(product.baseStock)"
                >{{ product.baseStock }}</span
              >
            </td>
            <td>
              <div class="colors-row">
                <span
                  v-for="v in uniqueColors(product.variants)"
                  :key="v.id"
                  class="color-dot"
                  :style="{ background: v.hexCode }"
                  :title="v.hexCode"
                ></span>
                <span
                  v-if="!uniqueColors(product.variants).length"
                  class="no-color"
                  >—</span
                >
              </div>
            </td>
            <td>
              <span
                class="status-badge"
                :class="product.isActive ? 'active' : 'inactive'"
              >
                {{ product.isActive ? "نشط" : "معطل" }}
              </span>
            </td>
            <td class="actions-cell">
              <div class="actions-row">
                <button
                  class="action-btn view-btn"
                  title="عرض"
                  @click="viewProduct(product)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button
                  class="action-btn edit-btn"
                  title="تعديل"
                  @click="openEditModal(product)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn copy-btn"
                  title="نسخ"
                  @click="handleDuplicate(product.id)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path
                      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn delete-btn"
                  title="حذف"
                  @click="confirmDelete(product)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.meta && store.meta.totalPages > 1" class="pagination">
        <button
          class="page-btn page-nav"
          :disabled="store.meta.currentPage === 1"
          @click="goToPage(store.meta.currentPage - 1)"
        >
          →
        </button>
        <template v-for="page in paginationPages" :key="page">
          <span v-if="page === '...'" class="page-dots">…</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: page === store.meta.currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
        <button
          class="page-btn page-nav"
          :disabled="store.meta.currentPage === store.meta.totalPages"
          @click="goToPage(store.meta.currentPage + 1)"
        >
          ←
        </button>
      </div>
    </div>

    <!-- ===== Create / Edit Modal — TABBED ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? "تعديل المنتج" : "إضافة منتج جديد" }}
            </h2>
            <div class="modal-header-meta">
              <!-- ===== Draft Indicator ===== -->
              <span
                v-if="hasDraft"
                class="modal-draft-badge draft-saved"
                title="يوجد مسودة محفوظة"
              >
                💾 مسودة محفوظة
              </span>
              <span v-else class="modal-draft-badge">{{
                isEditing ? "تعديل" : "مسودة"
              }}</span>
              <!-- ===== Discard Draft Button ===== -->
              <button
                v-if="hasDraft"
                class="btn-discard-draft"
                @click="discardDraft"
                title="تجاهل المسودة وبدء من جديد"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                تجاهل
              </button>
              <button class="modal-close" @click="closeModal">✕</button>
            </div>
          </div>

          <div class="tabs-bar">
            <button
              v-for="(tab, idx) in tabs"
              :key="idx"
              class="tab-btn"
              :class="{
                active: activeTab === idx,
                done: completedTabs.includes(idx),
              }"
              @click="switchTab(idx)"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
              <span class="tab-check" v-if="completedTabs.includes(idx)"
                >✓</span
              >
            </button>
          </div>

          <div class="modal-body">
            <!-- TAB 0 — الأسعار والمخزون -->
            <div v-show="activeTab === 0" class="tab-pane">
              <div class="price-highlight-box">
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label"
                      >السعر الأصلي <span class="req">*</span></label
                    >
                    <div class="input-suffix-wrap">
                      <input
                        v-model.number="form.basePrice"
                        type="number"
                        class="form-input"
                        required
                        min="0"
                      />
                      <span class="input-suffix">ج.م</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">سعر بعد الخصم</label>
                    <div class="input-suffix-wrap">
                      <input
                        v-model.number="form.baseDiscountPrice"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                      <span class="input-suffix">ج.م</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label"
                      >المخزون <span class="req">*</span></label
                    >
                    <input
                      v-model.number="form.baseStock"
                      type="number"
                      class="form-input"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <fieldset class="form-section">
                <legend>الشحن</legend>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">سعر الشحن الثابت</label>
                    <div class="input-suffix-wrap">
                      <input
                        v-model.number="form.fixedShippingPrice"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                      <span class="input-suffix">ج.م</span>
                    </div>
                  </div>
                  <div
                    class="form-group"
                    style="justify-content: flex-end; padding-bottom: 4px"
                  >
                    <label class="check-label" style="margin-top: 24px">
                      <input
                        v-model="form.isFreeShipping"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>شحن مجاني</span>
                    </label>
                  </div>
                </div>
              </fieldset>
              <fieldset class="form-section">
                <legend>الأبعاد والوزن</legend>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label">الوزن (كجم)</label>
                    <input
                      v-model.number="form.weight"
                      type="number"
                      class="form-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">العرض (سم)</label>
                    <input
                      v-model.number="form.width"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">الارتفاع (سم)</label>
                    <input
                      v-model.number="form.height"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">الطول (سم)</label>
                    <input
                      v-model.number="form.length"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            <!-- TAB 1 — المعلومات والترجمات -->
            <div v-show="activeTab === 1" class="tab-pane">
              <fieldset class="form-section">
                <legend>معلومات أساسية</legend>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label"
                      >Slug <span class="req">*</span></label
                    >
                    <input
                      v-model="form.slug"
                      type="text"
                      class="form-input"
                      required
                      dir="ltr"
                      placeholder="my-product-name"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">الماركة (Brand)</label>
                    <select
                      v-model="form.brandId"
                      class="form-input form-select"
                    >
                      <option value="">— بدون ماركة —</option>
                      <option
                        v-for="brand in brandsStore.brands"
                        :key="brand.id"
                        :value="brand.id"
                      >
                        {{ brandsStore.getBrandName(brand, "ar") }}
                      </option>
                    </select>
                  </div>
                </div>
              </fieldset>
              <fieldset class="form-section">
                <legend>الأقسام (Categories) <span class="req">*</span></legend>
                <div class="categories-tree">
                  <template
                    v-for="parent in categoryStore.topLevelCategories"
                    :key="parent.id"
                  >
                    <div class="cat-parent-row">
                      <label class="category-check-item cat-parent">
                        <input
                          type="checkbox"
                          :value="parent.id"
                          v-model="form.categoryIds"
                          class="check-input"
                        />
                        <span>{{
                          categoryStore.getCategoryName(parent, "ar")
                        }}</span>
                      </label>
                    </div>
                    <div
                      v-if="parent.children && parent.children.length"
                      class="cat-children-row"
                    >
                      <label
                        v-for="child in parent.children"
                        :key="child.id"
                        class="category-check-item cat-child"
                      >
                        <input
                          type="checkbox"
                          :value="child.id"
                          v-model="form.categoryIds"
                          class="check-input"
                        />
                        <span>{{
                          categoryStore.getCategoryName(child, "ar")
                        }}</span>
                      </label>
                    </div>
                  </template>
                  <p
                    v-if="!categoryStore.topLevelCategories.length"
                    class="empty-cats"
                  >
                    لا توجد أقسام
                  </p>
                </div>
              </fieldset>
              <fieldset class="form-section">
                <legend>الترجمات والمواصفات</legend>
                <div class="lang-tabs">
                  <button
                    v-for="(lang, li) in ['عربي 🇪🇬', 'English 🇺🇸']"
                    :key="li"
                    type="button"
                    class="lang-tab-btn"
                    :class="{ active: activeLang === li }"
                    @click="activeLang = li"
                  >
                    {{ lang }}
                  </button>
                </div>
                <div v-show="activeLang === 0" class="lang-block">
                  <div class="form-group">
                    <label class="form-label"
                      >اسم المنتج <span class="req">*</span></label
                    >
                    <input
                      v-model="form.translations[0].name"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">وصف مختصر</label>
                    <textarea
                      v-model="form.translations[0].shortDescription"
                      class="form-input"
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">وصف تفصيلي</label>
                    <textarea
                      v-model="form.translations[0].longDescription"
                      class="form-input long-desc-input"
                      rows="5"
                      dir="auto"
                      placeholder="اكتب الوصف هنا..."
                    ></textarea>
                  </div>
                  <div class="specs-container">
                    <label class="form-label">المواصفات</label>
                    <div
                      v-for="(spec, idx) in form.translations[0]
                        .specificationsList"
                      :key="idx"
                      class="spec-row"
                    >
                      <input
                        v-model="spec.key"
                        type="text"
                        class="form-input"
                        placeholder="الخامة"
                        style="flex: 1"
                      />
                      <input
                        v-model="spec.value"
                        type="text"
                        class="form-input"
                        placeholder="خشب زان"
                        style="flex: 1"
                      />
                      <button
                        type="button"
                        class="btn-remove-spec"
                        @click="removeSpec(0, idx)"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn-add-spec"
                      @click="addSpec(0)"
                    >
                      + إضافة مواصفة
                    </button>
                  </div>
                </div>
                <div v-show="activeLang === 1" class="lang-block">
                  <div class="form-group">
                    <label class="form-label">Product Name</label>
                    <input
                      v-model="form.translations[1].name"
                      type="text"
                      class="form-input"
                      dir="ltr"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Short Description</label>
                    <textarea
                      v-model="form.translations[1].shortDescription"
                      class="form-input"
                      rows="2"
                      dir="ltr"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Long Description</label>
                    <textarea
                      v-model="form.translations[1].longDescription"
                      class="form-input long-desc-input"
                      rows="5"
                      dir="auto"
                      placeholder="Write description here..."
                    ></textarea>
                  </div>
                  <div class="specs-container">
                    <label class="form-label">Specifications</label>
                    <div
                      v-for="(spec, idx) in form.translations[1]
                        .specificationsList"
                      :key="idx"
                      class="spec-row"
                    >
                      <input
                        v-model="spec.key"
                        type="text"
                        class="form-input"
                        placeholder="Material"
                        style="flex: 1"
                        dir="ltr"
                      />
                      <input
                        v-model="spec.value"
                        type="text"
                        class="form-input"
                        placeholder="Beech Wood"
                        style="flex: 1"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        class="btn-remove-spec"
                        @click="removeSpec(1, idx)"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn-add-spec"
                      @click="addSpec(1)"
                    >
                      + Add Specification
                    </button>
                  </div>
                </div>
              </fieldset>
            </div>

            <!-- TAB 2 — الصور -->
            <div v-show="activeTab === 2" class="tab-pane">
              <fieldset class="form-section">
                <legend>الصورة الرئيسية <span class="req">*</span></legend>
                <ImageUploader v-model="form.mainImage" folder="products" />
              </fieldset>
              <fieldset class="form-section">
                <legend>
                  الصور الإضافية
                  <button
                    type="button"
                    class="btn-add-gallery"
                    @click="addGalleryImage"
                  >
                    + إضافة صورة
                  </button>
                </legend>
                <p v-if="!form.defaultGallery.length" class="empty-gallery">
                  لا توجد صور إضافية
                </p>
                <div v-else class="gallery-list">
                  <div
                    v-for="(img, idx) in form.defaultGallery"
                    :key="idx"
                    class="gallery-item"
                  >
                    <span class="gallery-num">{{ idx + 1 }}</span>
                    <div style="flex: 1">
                      <ImageUploader
                        :modelValue="form.defaultGallery[idx]"
                        folder="products"
                        @update:modelValue="form.defaultGallery[idx] = $event"
                      />
                    </div>
                    <button
                      type="button"
                      class="btn-remove-gallery"
                      @click="form.defaultGallery.splice(idx, 1)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </fieldset>
            </div>

            <!-- TAB 3 — المتغيرات -->
            <div v-show="activeTab === 3" class="tab-pane">
              <div class="variants-header">
                <p class="variants-hint">
                  المتغيرات تتيح ألواناً وأحجاماً وخامات مختلفة لنفس المنتج
                </p>
                <button
                  type="button"
                  class="btn-add-variant"
                  @click="addVariant"
                >
                  + إضافة variant
                </button>
              </div>
              <div
                v-for="(v, idx) in form.variants"
                :key="idx"
                class="variant-block"
              >
                <div class="variant-header">
                  <span>Variant #{{ idx + 1 }}</span>
                  <button
                    type="button"
                    class="btn-remove-variant"
                    @click="removeVariant(idx)"
                  >
                    ✕
                  </button>
                </div>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label"
                      >SKU <span class="req">*</span></label
                    >
                    <input
                      v-model="v.sku"
                      type="text"
                      class="form-input"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label"
                      >السعر <span class="req">*</span></label
                    >
                    <input
                      v-model.number="v.price"
                      type="number"
                      class="form-input"
                      required
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">سعر الخصم</label>
                    <input
                      v-model.number="v.discountPrice"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">المخزون</label>
                    <input
                      v-model.number="v.stock"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">اللون</label>
                    <select v-model="v.colorId" class="form-input form-select">
                      <option value="">— اختر اللون —</option>
                      <option
                        v-for="color in colorsStore.colors"
                        :key="color.id"
                        :value="color.id"
                      >
                        {{ colorsStore.getColorName(color, "ar") }}
                      </option>
                    </select>
                    <div v-if="v.colorId" class="color-preview-inline">
                      <span
                        class="color-dot-sm"
                        :style="{
                          background: colorsStore.colors.find(
                            (c) => c.id === v.colorId,
                          )?.hexCode,
                        }"
                      ></span>
                      <span class="color-hex-sm" dir="ltr">{{
                        colorsStore.colors.find((c) => c.id === v.colorId)
                          ?.hexCode
                      }}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">الحجم</label>
                    <select v-model="v.sizeId" class="form-input form-select">
                      <option value="">— اختر الحجم —</option>
                      <option
                        v-for="size in sizesStore.sizes"
                        :key="size.id"
                        :value="size.id"
                      >
                        {{ sizesStore.getSizeName(size, "ar") }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">الخامة</label>
                    <select
                      v-model="v.materialId"
                      class="form-input form-select"
                    >
                      <option value="">— اختر الخامة —</option>
                      <option
                        v-for="material in materialsStore.materials"
                        :key="material.id"
                        :value="material.id"
                      >
                        {{ materialsStore.getMaterialName(material, "ar") }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="form-group" style="margin-top: 8px">
                  <label class="form-label"
                    >صور الـ Variant (سطر لكل صورة)</label
                  >
                  <textarea
                    class="form-input"
                    rows="2"
                    dir="ltr"
                    :value="(v.variantImages || []).join('\n')"
                    @input="
                      v.variantImages = $event.target.value
                        .split('\n')
                        .filter(Boolean)
                    "
                  ></textarea>
                </div>
              </div>
              <p v-if="!form.variants.length" class="empty-variants">
                لا توجد variants بعد. اضغط + إضافة.
              </p>
            </div>

            <!-- TAB 4 — المرتبطات -->
            <div v-show="activeTab === 4" class="tab-pane">
              <fieldset class="form-section">
                <legend>أقسام ذات صلة</legend>
                <p class="form-hint">ستظهر منتجاتها في قسم "منتجات مشابهة"</p>
                <div class="categories-tree">
                  <template
                    v-for="parent in categoryStore.topLevelCategories"
                    :key="'rel-' + parent.id"
                  >
                    <div class="cat-parent-row">
                      <label class="category-check-item cat-parent">
                        <input
                          type="checkbox"
                          :value="parent.id"
                          v-model="form.relatedCategoryIds"
                          class="check-input"
                        />
                        <span>{{
                          categoryStore.getCategoryName(parent, "ar")
                        }}</span>
                      </label>
                    </div>
                    <div
                      v-if="parent.children && parent.children.length"
                      class="cat-children-row"
                    >
                      <label
                        v-for="child in parent.children"
                        :key="'rel-' + child.id"
                        class="category-check-item cat-child"
                      >
                        <input
                          type="checkbox"
                          :value="child.id"
                          v-model="form.relatedCategoryIds"
                          class="check-input"
                        />
                        <span>{{
                          categoryStore.getCategoryName(child, "ar")
                        }}</span>
                      </label>
                    </div>
                  </template>
                </div>
              </fieldset>
              <fieldset class="form-section">
                <legend>منتجات ذات صلة</legend>
                <p class="form-hint">منتجات محددة ستظهر في "منتجات مشابهة"</p>
                <input
                  v-model="relatedProductSearch"
                  type="text"
                  class="form-input"
                  placeholder="ابحث عن منتج بالاسم أو الـ slug..."
                  style="margin-bottom: 10px"
                />
                <div class="related-products-list">
                  <label
                    v-for="product in filteredRelatedProducts"
                    :key="product.id"
                    class="related-product-item"
                    :class="{
                      selected: form.relatedProductsIds.includes(product.id),
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="product.id"
                      v-model="form.relatedProductsIds"
                      class="check-input"
                    />
                    <img
                      :src="product.mainImage"
                      class="related-product-thumb"
                      @error="$event.target.src = '/images/placeholder.jpg'"
                    />
                    <div class="related-product-info">
                      <span class="related-product-name">{{
                        store.getProductName(product, "ar")
                      }}</span>
                      <span class="related-product-slug" dir="ltr">{{
                        product.slug
                      }}</span>
                    </div>
                  </label>
                  <p
                    v-if="!filteredRelatedProducts.length"
                    class="empty-related"
                  >
                    لا توجد نتائج
                  </p>
                </div>
                <p v-if="form.relatedProductsIds.length" class="selected-count">
                  ✓ {{ form.relatedProductsIds.length }} منتج مختار
                </p>
              </fieldset>
            </div>

            <!-- TAB 5 — SEO -->
            <div v-show="activeTab === 5" class="tab-pane">
              <div class="seo-preview-box">
                <p class="seo-preview-label">معاينة نتائج جوجل</p>
                <div class="seo-preview-url">
                  https://yourstore.com/products/{{ form.slug || "my-product" }}
                </div>
                <div class="seo-preview-title">
                  {{
                    form.metaTitle ||
                    form.translations[0].name ||
                    "عنوان المنتج هنا"
                  }}
                </div>
                <div class="seo-preview-desc">
                  {{
                    form.metaDescription ||
                    form.translations[0].shortDescription ||
                    "وصف المنتج المختصر يظهر هنا في نتائج البحث..."
                  }}
                </div>
              </div>
              <fieldset class="form-section">
                <legend>إعدادات SEO</legend>
                <div class="form-group">
                  <label class="form-label">Meta Title</label>
                  <input
                    v-model="form.metaTitle"
                    type="text"
                    class="form-input"
                    dir="ltr"
                  />
                  <span
                    class="char-count"
                    :class="{ warn: (form.metaTitle || '').length > 60 }"
                    >{{ (form.metaTitle || "").length }} / 60</span
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">Meta Description</label>
                  <textarea
                    v-model="form.metaDescription"
                    class="form-input"
                    rows="3"
                    dir="ltr"
                  ></textarea>
                  <span
                    class="char-count"
                    :class="{ warn: (form.metaDescription || '').length > 160 }"
                    >{{ (form.metaDescription || "").length }} / 160</span
                  >
                </div>
              </fieldset>
            </div>
          </div>

          <div class="modal-footer">
            <div class="footer-step-info">
              <span class="step-dots">
                <span
                  v-for="(tab, i) in tabs"
                  :key="i"
                  class="step-dot"
                  :class="{
                    active: i === activeTab,
                    done: completedTabs.includes(i),
                  }"
                  @click="switchTab(i)"
                ></span>
              </span>
              <span class="step-text"
                >{{ activeTab + 1 }} / {{ tabs.length }} —
                {{ tabs[activeTab].label }}</span
              >
            </div>
            <div class="footer-actions">
              <button
                v-if="activeTab > 0"
                type="button"
                class="btn-tab-prev"
                @click="switchTab(activeTab - 1)"
              >
                → السابق
              </button>
              <button
                v-if="activeTab < tabs.length - 1"
                type="button"
                class="btn-tab-next"
                @click="switchTab(activeTab + 1)"
              >
                التالي ←
              </button>
              <button
                v-if="activeTab === tabs.length - 1"
                type="button"
                class="btn-save"
                :disabled="store.actionLoading"
                @click="submitForm"
              >
                <span v-if="store.actionLoading" class="btn-spinner"></span>
                {{ isEditing ? "حفظ التعديلات" : "إنشاء المنتج" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== View Modal ===== -->
    <Teleport to="body">
      <div
        v-if="viewingProduct"
        class="modal-overlay"
        @click.self="viewingProduct = null"
      >
        <div class="modal-box view-modal">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ store.getProductName(viewingProduct, "ar") }}
            </h2>
            <button class="modal-close" @click="viewingProduct = null">
              ✕
            </button>
          </div>
          <div class="modal-body view-body">
            <div class="view-images">
              <img :src="viewingProduct.mainImage" class="view-main-img" />
              <div class="view-gallery">
                <img
                  v-for="(img, i) in viewingProduct.defaultGallery"
                  :key="i"
                  :src="img"
                  class="view-thumb"
                />
              </div>
            </div>
            <div class="view-details">
              <div class="detail-row">
                <span class="detail-label">Slug:</span
                ><span class="detail-val" dir="ltr">{{
                  viewingProduct.slug
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">السعر:</span
                ><span class="detail-val"
                  >{{ formatPrice(viewingProduct.basePrice) }} ج.م</span
                >
              </div>
              <div class="detail-row" v-if="viewingProduct.baseDiscountPrice">
                <span class="detail-label">بعد الخصم:</span
                ><span class="detail-val discount"
                  >{{ formatPrice(viewingProduct.baseDiscountPrice) }} ج.م</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">المخزون:</span
                ><span class="detail-val">{{ viewingProduct.baseStock }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الشحن:</span
                ><span class="detail-val">{{
                  viewingProduct.isFreeShipping
                    ? "مجاني"
                    : `${viewingProduct.fixedShippingPrice} ج.م`
                }}</span>
              </div>
              <div class="detail-row" v-if="viewingProduct.brand">
                <span class="detail-label">الماركة:</span
                ><span class="detail-val">{{
                  brandsStore.getBrandName(viewingProduct.brand, "ar")
                }}</span>
              </div>
              <div class="detail-row" v-if="viewingProduct.variants?.length">
                <span class="detail-label">Variants:</span>
                <div class="variants-list">
                  <div
                    v-for="v in viewingProduct.variants"
                    :key="v.id"
                    class="variant-tag"
                  >
                    <span
                      v-if="v.color"
                      :style="{ background: v.color?.hexCode }"
                      class="v-color"
                      :title="v.color?.hexCode"
                    ></span>
                    <span class="variant-info"
                      >{{ v.sku }} — {{ formatPrice(v.price) }} ج.م<span
                        v-if="v.size"
                        class="variant-size-label"
                        >| {{ v.size?.type }}</span
                      ></span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Confirm Delete ===== -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="modal-overlay"
        @click.self="deleteTarget = null"
      >
        <div class="confirm-box">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e53e3e"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#e53e3e" />
          </svg>
          <h3 class="confirm-title">حذف المنتج</h3>
          <p class="confirm-text">
            هل أنت متأكد من حذف "<strong>{{
              store.getProductName(deleteTarget, "ar")
            }}</strong
            >"؟
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="deleteTarget = null">
              إلغاء
            </button>
            <button
              class="btn-delete-confirm"
              :disabled="store.actionLoading"
              @click="handleDelete"
            >
              <span v-if="store.actionLoading" class="btn-spinner dark"></span
              >حذف
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Toast ===== -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "@/stores/products.js";
import { useColorsStore } from "@/stores/colors.js";
import { useSizesStore } from "@/stores/sizes.js";
import { useBrandsStore } from "@/stores/brands.js";
import { useMaterialsStore } from "@/stores/materials.js";
import { useCategoryStore } from "@/stores/category.js";
import ImageUploader from "@/components/shared/ImageUploader.vue";

const { locale } = useI18n();
const store = useProductsStore();
const colorsStore = useColorsStore();
const sizesStore = useSizesStore();
const brandsStore = useBrandsStore();
const materialsStore = useMaterialsStore();
const categoryStore = useCategoryStore();

watch(locale, async () => {
  await store.fetchProducts();
});

// ===== Search & Filters =====
const searchInput = ref("");
const showFilters = ref(false);
let searchDebounce = null;

const localFilters = reactive({
  categoryId: "",
  brandId: "",
  colorId: "",
  sizeId: "",
  minPrice: "",
  maxPrice: "",
  limit: 20,
});

const onSearchInput = () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    store.applyFilters({ searchTerm: searchInput.value });
  }, 500);
};

const doSearch = () => {
  clearTimeout(searchDebounce);
  store.applyFilters({ searchTerm: searchInput.value });
};

const clearSearch = () => {
  searchInput.value = "";
  store.applyFilters({ searchTerm: "" });
};

const applyFiltersNow = () => {
  store.applyFilters({ ...localFilters });
};

const resetAll = () => {
  searchInput.value = "";
  Object.assign(localFilters, {
    categoryId: "",
    brandId: "",
    colorId: "",
    sizeId: "",
    minPrice: "",
    maxPrice: "",
    limit: 20,
  });
  store.resetFilters();
};

const clearSingleFilter = (key) => {
  if (key === "searchTerm") searchInput.value = "";
  if (key in localFilters) localFilters[key] = "";
  store.applyFilters({ [key]: "" });
};

const clearPriceFilter = () => {
  localFilters.minPrice = "";
  localFilters.maxPrice = "";
  store.applyFilters({ minPrice: "", maxPrice: "" });
};

const getCategoryNameById = (id) => {
  for (const cat of categoryStore.categories) {
    if (cat.id === id) return categoryStore.getCategoryName(cat, "ar");
    const child = cat.children?.find((c) => c.id === id);
    if (child) return categoryStore.getCategoryName(child, "ar");
  }
  return id;
};
const getBrandNameById = (id) => {
  const b = brandsStore.brands?.find((b) => b.id === id);
  return b ? brandsStore.getBrandName(b, "ar") : id;
};
const getColorNameById = (id) => {
  const c = colorsStore.colors?.find((c) => c.id === id);
  return c ? colorsStore.getColorName(c, "ar") : id;
};
const getSizeNameById = (id) => {
  const s = sizesStore.sizes?.find((s) => s.id === id);
  return s ? sizesStore.getSizeName(s, "ar") : id;
};

// ===== Pagination =====
const goToPage = (page) => {
  store.fetchProducts({ page });
};

const paginationPages = computed(() => {
  if (!store.meta) return [];
  const { currentPage, totalPages } = store.meta;
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
});

// ===== Tabs =====
const tabs = [
  { label: "الأسعار والمخزون", icon: "💰" },
  { label: "المعلومات", icon: "📝" },
  { label: "الصور", icon: "🖼️" },
  { label: "المتغيرات", icon: "🔢" },
  { label: "المرتبطات", icon: "🔗" },
  { label: "SEO", icon: "🔍" },
];
const activeTab = ref(0);
const activeLang = ref(0);
const completedTabs = ref([]);

const switchTab = (idx) => {
  if (!completedTabs.value.includes(activeTab.value))
    completedTabs.value.push(activeTab.value);
  activeTab.value = idx;
};

// ===== Toast =====
const toast = reactive({ show: false, msg: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.msg = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ===== Modal State =====
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const viewingProduct = ref(null);
const deleteTarget = ref(null);

// ===== Form Persistence =====
const DRAFT_CREATE_KEY = "products_draft_create";
const DRAFT_EDIT_KEY = "products_draft_edit";

// computed: هل يوجد مسودة للوضع الحالي
const hasDraft = computed(() => {
  const key = isEditing.value ? DRAFT_EDIT_KEY : DRAFT_CREATE_KEY;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // في وضع التعديل نتحقق من نفس المنتج
    if (isEditing.value && saved.editingId !== editingId.value) return false;
    return true;
  } catch {
    return false;
  }
});

// Debounce timer for saving drafts to avoid memory spikes
let draftSaveTimer = null;

const saveDraft = () => {
  if (!showModal.value) return;

  // Clear previous timer
  if (draftSaveTimer) clearTimeout(draftSaveTimer);

  // Wait 1 second after user stops typing before saving to SessionStorage
  draftSaveTimer = setTimeout(() => {
    const key = isEditing.value ? DRAFT_EDIT_KEY : DRAFT_CREATE_KEY;
    try {
      // Use a shallow clone for simple fields and structured clone for safety
      // Avoid JSON.stringify here for comparison, just save directly
      const dataToSave = {
        form: JSON.parse(JSON.stringify(form)),
        editingId: editingId.value,
        activeTab: activeTab.value,
        activeLang: activeLang.value,
        completedTabs: completedTabs.value,
      };
      sessionStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Draft save failed (storage full?):", e);
    }
  }, 1000);
};

const loadDraft = (editingMode, id = null) => {
  const key = editingMode ? DRAFT_EDIT_KEY : DRAFT_CREATE_KEY;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (editingMode && saved.editingId !== id) return null;
    return saved;
  } catch {
    return null;
  }
};

const clearDraft = (editingMode) => {
  sessionStorage.removeItem(editingMode ? DRAFT_EDIT_KEY : DRAFT_CREATE_KEY);
};

// تجاهل المسودة وإعادة التعيين حسب الوضع
const discardDraft = async () => {
  clearDraft(isEditing.value);
  if (isEditing.value && editingId.value) {
    // أعد تحميل بيانات المنتج من الـ API
    activeTab.value = 0;
    activeLang.value = 0;
    completedTabs.value = [];
    await _loadProductIntoForm(editingId.value);
  } else {
    activeTab.value = 0;
    activeLang.value = 0;
    completedTabs.value = [];
    Object.assign(form, defaultForm());
  }
};

// ===== Default Form =====
const defaultForm = () => ({
  basePrice: null,
  baseDiscountPrice: null,
  baseStock: null,
  slug: "",
  weight: null,
  width: null,
  height: null,
  length: null,
  isFreeShipping: false,
  fixedShippingPrice: null,
  brandId: "",
  categoryIds: [],
  mainImage: "",
  defaultGallery: [],
  translations: [
    {
      languageCode: "ar",
      name: "",
      shortDescription: "",
      longDescription: "",
      specificationsList: [],
    },
    {
      languageCode: "en",
      name: "",
      shortDescription: "",
      longDescription: "",
      specificationsList: [],
    },
  ],
  variants: [],
  metaTitle: "",
  metaDescription: "",
  relatedProductsIds: [],
  relatedCategoryIds: [],
});

const form = reactive(defaultForm());

// ===== Optimized Auto-save watch =====
// Removed JSON.stringify watcher which caused the crash.
// Now we watch specific parts or use deep watch without heavy serialization for comparison.
watch(
  form,
  () => {
    saveDraft();
  },
  { deep: true },
);

watch(
  [activeTab, activeLang, completedTabs],
  () => {
    saveDraft();
  },
  { deep: true },
);

// ===== Form Helpers =====
const addSpec = (li) =>
  form.translations[li].specificationsList.push({ key: "", value: "" });
const removeSpec = (li, si) =>
  form.translations[li].specificationsList.splice(si, 1);
const addVariant = () =>
  form.variants.push({
    sku: "",
    price: null,
    discountPrice: null,
    stock: 0,
    colorId: "",
    sizeId: "",
    materialId: "",
    variantImages: [],
  });
const removeVariant = (idx) => form.variants.splice(idx, 1);
const addGalleryImage = () => form.defaultGallery.push("");

// ===== Helper: Load product from API into form =====
const _loadProductIntoForm = async (id) => {
  const full = await store.fetchProduct(id);
  if (!full) return false;
  const arTrans = full.translations?.find((t) => t.languageCode === "ar") || {};
  const enTrans = full.translations?.find((t) => t.languageCode === "en") || {};
  const specsToArray = (obj) =>
    obj && typeof obj === "object"
      ? Object.entries(obj).map(([key, value]) => ({ key, value }))
      : [];
  Object.assign(form, {
    basePrice: parseFloat(full.basePrice) || null,
    baseDiscountPrice: parseFloat(full.baseDiscountPrice) || null,
    baseStock: full.baseStock || null,
    slug: full.slug || "",
    weight: parseFloat(full.weight) || null,
    width: full.width || null,
    height: full.height || null,
    length: full.length || null,
    isFreeShipping: full.isFreeShipping || false,
    fixedShippingPrice: parseFloat(full.fixedShippingPrice) || null,
    brandId: full.brand?.id || full.brandId || "",
    categoryIds: (full.categories || []).map((c) => c.id),
    mainImage:
      full.mainImage?.replace(/^https?:\/\/[^/]+\/uploads\//, "") || "",
    defaultGallery: (full.defaultGallery || []).map((u) =>
      u.replace(/^https?:\/\/[^/]+\/uploads\//, ""),
    ),
    translations: [
      {
        languageCode: "ar",
        name: arTrans.name || "",
        shortDescription: arTrans.shortDescription || "",
        longDescription: arTrans.longDescription || "",
        specificationsList: specsToArray(arTrans.specifications),
      },
      {
        languageCode: "en",
        name: enTrans.name || "",
        shortDescription: enTrans.shortDescription || "",
        longDescription: enTrans.longDescription || "",
        specificationsList: specsToArray(enTrans.specifications),
      },
    ],
    variants: (full.variants || []).map((v) => ({
      sku: v.sku || "",
      price: parseFloat(v.price) || null,
      discountPrice: parseFloat(v.discountPrice) || null,
      stock: v.stock || 0,
      colorId: v.color?.id || "",
      sizeId: v.size?.id || "",
      materialId: v.material?.id || "",
      variantImages: (v.variantImages || []).map((u) =>
        u.replace(/^https?:\/\/[^/]+\/uploads\//, ""),
      ),
    })),
    metaTitle: full.metaTitle || "",
    metaDescription: full.metaDescription || "",
    relatedProductsIds: (full.relatedProducts || []).map((p) => p.id),
    relatedCategoryIds: (full.relatedCategories || []).map((c) => c.id),
  });
  return true;
};

// ===== Open Create Modal =====
const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;

  const saved = loadDraft(false);
  if (saved) {
    // استعادة المسودة المحفوظة
    Object.assign(form, saved.form);
    activeTab.value = saved.activeTab ?? 0;
    activeLang.value = saved.activeLang ?? 0;
    completedTabs.value = saved.completedTabs ?? [];
  } else {
    activeTab.value = 0;
    activeLang.value = 0;
    completedTabs.value = [];
    Object.assign(form, defaultForm());
  }

  showModal.value = true;
};

// ===== Open Edit Modal =====
const openEditModal = async (product) => {
  isEditing.value = true;
  editingId.value = product.id;

  const saved = loadDraft(true, product.id);
  if (saved) {
    // استعادة المسودة المحفوظة لنفس المنتج
    Object.assign(form, saved.form);
    activeTab.value = saved.activeTab ?? 0;
    activeLang.value = saved.activeLang ?? 0;
    completedTabs.value = saved.completedTabs ?? [];
    showModal.value = true;
    return;
  }

  // لا مسودة → حمّل من الـ API
  activeTab.value = 0;
  activeLang.value = 0;
  completedTabs.value = [];
  const ok = await _loadProductIntoForm(product.id);
  if (!ok) return;
  showModal.value = true;
};

// ===== Close Modal — لا تمسح الداتا =====
const closeModal = () => {
  showModal.value = false;
  // المسودة تبقى في sessionStorage عمداً
};

const viewProduct = (product) => {
  viewingProduct.value = product;
};

// ===== Submit Form =====
const submitForm = async () => {
  const arrayToSpecs = (list) => {
    if (!list?.length) return {};
    const obj = {};
    list.forEach((item) => {
      if (item.key && item.value) obj[item.key] = item.value;
    });
    return obj;
  };
  const payload = {
    basePrice: form.basePrice,
    baseDiscountPrice: form.baseDiscountPrice || undefined,
    baseStock: form.baseStock,
    slug: form.slug,
    weight: form.weight || undefined,
    width: form.width || undefined,
    height: form.height || undefined,
    length: form.length || undefined,
    isFreeShipping: form.isFreeShipping,
    fixedShippingPrice: form.fixedShippingPrice || undefined,
    brandId: form.brandId || undefined,
    categoryIds: form.categoryIds.length ? form.categoryIds : undefined,
    mainImage: form.mainImage,
    defaultGallery: form.defaultGallery,
    translations: form.translations
      .filter((t) => t.name)
      .map((t) => ({
        languageCode: t.languageCode,
        name: t.name,
        shortDescription: t.shortDescription,
        longDescription: t.longDescription,
        specifications: arrayToSpecs(t.specificationsList),
      })),
    variants: form.variants.map((v) => ({
      sku: v.sku,
      price: v.price,
      discountPrice: v.discountPrice || undefined,
      stock: v.stock,
      colorId: v.colorId || undefined,
      sizeId: v.sizeId || undefined,
      materialId: v.materialId || undefined,
      variantImages: v.variantImages,
    })),
    metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,
    relatedProductsIds: form.relatedProductsIds.length
      ? form.relatedProductsIds
      : undefined,
    relatedCategoryIds: form.relatedCategoryIds.length
      ? form.relatedCategoryIds
      : undefined,
  };

  const result = isEditing.value
    ? await store.updateProduct(editingId.value, payload)
    : await store.createProduct(payload);

  if (result.success) {
    clearDraft(isEditing.value); // ← امسح المسودة فقط عند النجاح
    closeModal();
    showToast(
      isEditing.value ? "تم تعديل المنتج بنجاح" : "تم إنشاء المنتج بنجاح",
    );
  } else {
    showToast("حدث خطأ، حاول مرة أخرى", "error");
  }
};

const confirmDelete = (product) => {
  deleteTarget.value = product;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  const result = await store.deleteProduct(deleteTarget.value.id);
  showToast(
    result.success ? "تم حذف المنتج بنجاح" : "فشل الحذف",
    result.success ? "success" : "error",
  );
  deleteTarget.value = null;
};

const handleDuplicate = async (id) => {
  const result = await store.duplicateProduct(id);
  showToast(
    result.success ? "تم نسخ المنتج بنجاح" : "فشل النسخ",
    result.success ? "success" : "error",
  );
};

const relatedProductSearch = ref("");
const filteredRelatedProducts = computed(() => {
  if (!relatedProductSearch.value.trim()) return store.products;
  const q = relatedProductSearch.value.trim().toLowerCase();
  return store.products.filter((p) => {
    const name = store.getProductName(p).toLowerCase();
    const slug = (p.slug || "").toLowerCase();
    return name.includes(q) || slug.includes(q);
  });
});

const formatPrice = (price) => {
  const loc = locale.value === "ar" ? "en-EG" : "en-US";
  return parseFloat(price || 0).toLocaleString(loc);
};
const stockClass = (stock) => (stock <= 0 ? "out" : stock <= 5 ? "low" : "ok");
const uniqueColors = (variants) => {
  if (!variants?.length) return [];
  const seen = new Set();
  return variants
    .filter((v) => {
      if (!v.color?.hexCode || seen.has(v.color.id)) return false;
      seen.add(v.color.id);
      return true;
    })
    .map((v) => v.color);
};

onMounted(async () => {
  await Promise.all([
    store.fetchProducts(),
    colorsStore.fetchColors(),
    sizesStore.fetchSizes(),
    brandsStore.fetchBrands(),
    materialsStore.fetchMaterials(),
    categoryStore.fetchCategories(),
  ]);
});
</script>

<style scoped>
.products-page {
  padding: 28px;
  min-height: 100vh;
  background: #f7f5f0;
  font-family: "Cairo", sans-serif;
  direction: rtl;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0;
}
.products-count {
  background: #f0e8d0;
  color: #987226;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover {
  background: #7a5b1e;
}

.search-filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 240px;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #987226;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.search-input:focus {
  border-color: #987226;
  box-shadow: 0 0 0 3px rgba(152, 114, 38, 0.1);
}
.search-input::placeholder {
  color: #bbb;
}
.search-clear {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
}
.search-clear:hover {
  color: #c62828;
  background: #ffebee;
}

.btn-filters-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  background: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}
.btn-filters-toggle:hover {
  border-color: #987226;
  color: #987226;
}
.btn-filters-toggle.active {
  background: #987226;
  color: #fff;
  border-color: #987226;
}
.filter-active-dot {
  width: 7px;
  height: 7px;
  background: #e53e3e;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 8px;
  border: 1.5px solid #fff;
}
.btn-filters-toggle.active .filter-active-dot {
  border-color: #987226;
}

.btn-reset-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1.5px solid #ffcdd2;
  border-radius: 10px;
  background: #ffebee;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #c62828;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-reset-filters:hover {
  background: #ffcdd2;
}

.filters-panel {
  background: #fff;
  border: 1.5px solid #f0e8d0;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.filter-label {
  font-size: 11px;
  font-weight: 700;
  color: #987226;
}
.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  color: #333;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.filter-select:focus,
.filter-input:focus {
  border-color: #987226;
}
.filter-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23987226' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 10px center;
  padding-left: 28px;
}
.price-range-group {
  grid-column: span 2;
}
@media (max-width: 600px) {
  .price-range-group {
    grid-column: span 1;
  }
}
.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-input-wrap {
  position: relative;
  flex: 1;
}
.price-label {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #aaa;
  font-weight: 700;
  pointer-events: none;
}
.price-input-wrap .filter-input {
  padding-right: 28px;
}
.price-separator {
  color: #ccc;
  font-weight: 700;
  flex-shrink: 0;
}

.active-filter-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0e8d0;
}
.tags-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
}
.filter-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fef3cd;
  color: #7a5b1e;
  border: 1px solid #f0e8d0;
  border-radius: 20px;
  padding: 3px 10px 3px 6px;
  font-size: 12px;
  font-weight: 700;
}
.filter-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #987226;
  font-size: 11px;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
}
.filter-tag button:hover {
  color: #c62828;
}

.filters-slide-enter-active,
.filters-slide-leave-active {
  transition: all 0.25s ease;
}
.filters-slide-enter-from,
.filters-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 80px;
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
.error-state {
  text-align: center;
  padding: 60px;
  color: #888;
}
.btn-retry {
  margin-top: 12px;
  padding: 8px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
}

.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 8px;
}
.no-results-title {
  font-size: 18px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0;
}
.no-results-sub {
  font-size: 13px;
  color: #aaa;
  margin: 0;
}

.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.products-table thead {
  background: #faf6ee;
  border-bottom: 2px solid #f0e8d0;
}
.products-table th {
  padding: 14px 16px;
  font-weight: 700;
  color: #987226;
  text-align: right;
  white-space: nowrap;
}
.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f5f0e8;
  vertical-align: middle;
}
.product-row:hover {
  background: #fdfaf4;
}
.product-cell {
  min-width: 220px;
}
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-thumb {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0e8d0;
  flex-shrink: 0;
}
.product-name {
  font-weight: 700;
  color: #2a2015;
  margin: 0 0 4px;
  font-size: 14px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-slug {
  font-size: 12px;
  color: #aaa;
  margin: 0;
  font-family: monospace;
}
.price-cell {
  font-weight: 700;
  color: #987226;
  white-space: nowrap;
}
.discount-price {
  color: #2e7d32;
}
.no-discount {
  color: #ccc;
}
.stock-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}
.stock-badge.ok {
  background: #e8f5e9;
  color: #2e7d32;
}
.stock-badge.low {
  background: #fff3e0;
  color: #e65100;
}
.stock-badge.out {
  background: #ffebee;
  color: #c62828;
}
.colors-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
}
.no-color {
  color: #ccc;
}
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}
.actions-row {
  display: flex;
  gap: 6px;
}
.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.view-btn {
  background: #e8f5e9;
  color: #2e7d32;
}
.view-btn:hover {
  background: #c8e6c9;
}
.edit-btn {
  background: #fff3e0;
  color: #e65100;
}
.edit-btn:hover {
  background: #ffe0b2;
}
.copy-btn {
  background: #e3f2fd;
  color: #1565c0;
}
.copy-btn:hover {
  background: #bbdefb;
}
.delete-btn {
  background: #ffebee;
  color: #c62828;
}
.delete-btn:hover {
  background: #ffcdd2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border-top: 1px solid #f0e8d0;
  flex-wrap: wrap;
}
.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
}
.page-btn.active {
  background: #987226;
  color: #fff;
  border-color: #987226;
}
.page-btn:hover:not(.active):not(:disabled) {
  background: #faf6ee;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-btn.page-nav {
  font-size: 16px;
  color: #987226;
}
.page-dots {
  color: #aaa;
  font-size: 14px;
  padding: 0 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
  direction: rtl;
}
.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 820px;
  height: 93vh;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 0;
}
.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #987226;
  margin: 0;
}
.modal-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-draft-badge {
  background: #f0e8d0;
  color: #987226;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
/* ===== Draft Saved Badge ===== */
.modal-draft-badge.draft-saved {
  background: #e8f5e9;
  color: #2e7d32;
  animation: pulse-green 2s ease-in-out infinite;
}
@keyframes pulse-green {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
/* ===== Discard Draft Button ===== */
.btn-discard-draft {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-discard-draft:hover {
  background: #ffcdd2;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #f5f0e8;
}

.tabs-bar {
  display: flex;
  gap: 2px;
  padding: 12px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 2px solid #f0e8d0;
  margin-top: 14px;
  flex-shrink: 0;
}
.tabs-bar::-webkit-scrollbar {
  display: none;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #aaa;
  border-radius: 10px 10px 0 0;
  border-bottom: 3px solid transparent;
  transition: all 0.18s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;
}
.tab-btn:hover {
  color: #666;
  background: #f7f5f0;
}
.tab-btn.active {
  color: #987226;
  border-bottom-color: #987226;
  background: #fdfaf4;
}
.tab-btn.done {
  color: #2e7d32;
}
.tab-icon {
  font-size: 14px;
}
.tab-check {
  font-size: 10px;
  background: #e8f5e9;
  color: #2e7d32;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}
.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #e8e0cf transparent;
}
.tab-pane {
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.form-section {
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 14px 18px 18px;
  margin-bottom: 18px;
  background: #fdfaf4;
}
.form-section legend {
  font-weight: 700;
  font-size: 13px;
  color: #987226;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .form-grid-2,
  .form-grid-3 {
    grid-template-columns: 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #555;
}
.req {
  color: #c62828;
}
.form-input {
  padding: 9px 12px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus {
  border-color: #987226;
}
.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23987226' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
  padding-left: 32px;
}
.input-suffix-wrap {
  position: relative;
}
.input-suffix {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #aaa;
  font-weight: 700;
  pointer-events: none;
}
.input-suffix-wrap .form-input {
  padding-left: 36px;
}
.form-hint {
  font-size: 11px;
  color: #aaa;
  margin: -4px 0 6px;
}
.char-count {
  font-size: 11px;
  color: #aaa;
  text-align: left;
  margin-top: 2px;
}
.char-count.warn {
  color: #e65100;
}
.price-highlight-box {
  background: linear-gradient(135deg, #fdfaf4, #fef8e8);
  border: 1.5px solid #f0e8d0;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 18px;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #444;
}
.check-input {
  width: 16px;
  height: 16px;
  accent-color: #987226;
  cursor: pointer;
}
.lang-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
.lang-tab-btn {
  padding: 6px 16px;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  background: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.lang-tab-btn.active {
  background: #987226;
  color: #fff;
  border-color: #987226;
}
.specs-container {
  margin-top: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8e0cf;
  border-radius: 8px;
}
.spec-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.btn-remove-spec {
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: 700;
  flex-shrink: 0;
}
.btn-add-spec {
  margin-top: 8px;
  padding: 6px 12px;
  background: #f0e8d0;
  color: #987226;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 12px;
}
.categories-tree {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: #fff;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
}
.cat-parent-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.cat-children-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-right: 16px;
  padding-bottom: 4px;
  border-right: 3px solid #f0e8d0;
  margin-right: 6px;
}
.category-check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #444;
  background: #fdfaf4;
  border: 1px solid #e8e0cf;
  border-radius: 6px;
  padding: 4px 10px;
  transition: all 0.15s;
  user-select: none;
}
.category-check-item:has(input:checked) {
  background: #987226;
  color: #fff;
  border-color: #987226;
}
.cat-parent {
  font-weight: 700;
}
.cat-child {
  font-size: 11px;
  opacity: 0.9;
}
.cat-child:has(input:checked) {
  background: #b8962e;
  opacity: 1;
}
.empty-cats {
  color: #aaa;
  font-size: 13px;
  padding: 6px;
  margin: 0;
}
.color-preview-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.color-dot-sm {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.color-hex-sm {
  font-family: monospace;
  font-size: 11px;
  color: #666;
}
.btn-add-gallery {
  padding: 4px 10px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: "Cairo", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  margin-right: auto;
}
.empty-gallery {
  text-align: center;
  color: #bbb;
  font-size: 13px;
  padding: 12px 0;
  margin: 0;
}
.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.gallery-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.gallery-num {
  background: #f0e8d0;
  color: #987226;
  font-weight: 700;
  font-size: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 6px;
}
.btn-remove-gallery {
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 6px;
}
.variants-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.variants-hint {
  font-size: 12px;
  color: #aaa;
  font-weight: 700;
}
.btn-add-variant {
  padding: 6px 14px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.variant-block {
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fff;
}
.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 12px;
  color: #666;
}
.btn-remove-variant {
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-weight: 700;
}
.empty-variants {
  text-align: center;
  color: #aaa;
  padding: 16px;
  font-size: 13px;
}
.related-products-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
  padding: 6px;
  background: #fff;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
}
.related-product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
  user-select: none;
}
.related-product-item:hover {
  background: #fdfaf4;
}
.related-product-item.selected {
  background: #fef9ee;
  border-color: #987226;
}
.related-product-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #f0e8d0;
  flex-shrink: 0;
}
.related-product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.related-product-name {
  font-size: 12px;
  font-weight: 700;
  color: #2a2015;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.related-product-slug {
  font-size: 10px;
  color: #aaa;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-related {
  text-align: center;
  color: #bbb;
  font-size: 12px;
  padding: 10px 0;
  margin: 0;
}
.selected-count {
  margin: 6px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: #987226;
}
.seo-preview-box {
  background: #fff;
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.seo-preview-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  margin-bottom: 8px;
}
.seo-preview-url {
  font-size: 11px;
  color: #0a6b08;
  margin-bottom: 3px;
  font-family: monospace;
}
.seo-preview-title {
  font-size: 15px;
  color: #1a0dab;
  font-weight: 700;
  margin-bottom: 3px;
}
.seo-preview-desc {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
}
.long-desc-input {
  min-height: 110px;
  resize: vertical;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1.5px solid #f0e8d0;
  background: #fff;
  flex-shrink: 0;
}
.footer-step-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.step-dots {
  display: flex;
  gap: 5px;
}
.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8e0cf;
  cursor: pointer;
  transition: all 0.2s;
}
.step-dot.active {
  background: #987226;
  transform: scale(1.3);
}
.step-dot.done {
  background: #2e7d32;
}
.step-text {
  font-size: 12px;
  font-weight: 700;
  color: #aaa;
}
.footer-actions {
  display: flex;
  gap: 8px;
}
.btn-tab-prev {
  padding: 10px 18px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn-tab-prev:hover {
  background: #ece8e0;
}
.btn-tab-next {
  padding: 10px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.btn-tab-next:hover {
  background: #7a5b1e;
}
.btn-save {
  padding: 10px 22px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #7a5b1e;
}
.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.btn-spinner.dark {
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: #fff;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.view-modal {
  max-width: 600px;
}
.view-body {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.view-images {
  flex: 0 0 200px;
}
.view-main-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  aspect-ratio: 1;
}
.view-gallery {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.view-thumb {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  object-fit: cover;
}
.view-details {
  flex: 1;
  min-width: 200px;
}
.detail-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0e8d0;
  font-size: 13px;
  flex-wrap: wrap;
}
.detail-label {
  font-weight: 700;
  color: #987226;
  white-space: nowrap;
}
.detail-val {
  color: #333;
}
.detail-val.discount {
  color: #2e7d32;
  font-weight: 700;
}
.variants-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.variant-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  background: #faf6ee;
  padding: 4px 10px;
  border-radius: 6px;
}
.v-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.variant-info {
  color: #333;
}
.variant-size-label {
  color: #987226;
  font-weight: 700;
}

.confirm-box {
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.confirm-title {
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin: 14px 0 8px;
}
.confirm-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 24px;
}
.confirm-actions {
  display: flex;
  gap: 12px;
}
.btn-delete-confirm {
  flex: 1;
  padding: 12px;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.btn-delete-confirm:hover {
  background: #c53030;
}
.btn-delete-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 12px;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  font-weight: 700;
  z-index: 2000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}
.toast.success {
  background: #2e7d32;
  color: #fff;
}
.toast.error {
  background: #c53030;
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>

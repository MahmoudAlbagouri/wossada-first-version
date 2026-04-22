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
      <table class="products-table">
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
          <tr v-if="!store.products.length">
            <td colspan="7" class="empty-row">لا توجد منتجات بعد</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.meta && store.meta.totalPages > 1" class="pagination">
        <button
          v-for="page in store.meta.totalPages"
          :key="page"
          class="page-btn"
          :class="{ active: page === store.meta.currentPage }"
          @click="store.fetchProducts({ page })"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- ===== Create / Edit Modal ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? "تعديل المنتج" : "إضافة منتج جديد" }}
            </h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- ===== الأسعار والمخزون ===== -->
              <fieldset class="form-section">
                <legend>الأسعار والمخزون</legend>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label">السعر الأصلي *</label>
                    <input
                      v-model.number="form.basePrice"
                      type="number"
                      class="form-input"
                      required
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">سعر بعد الخصم</label>
                    <input
                      v-model.number="form.baseDiscountPrice"
                      type="number"
                      class="form-input"
                      min="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">المخزون *</label>
                    <input
                      v-model.number="form.baseStock"
                      type="number"
                      class="form-input"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- ===== معلومات عامة ===== -->
              <fieldset class="form-section">
                <legend>معلومات عامة</legend>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Slug *</label>
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
                  <div class="form-group">
                    <label class="form-label">سعر الشحن الثابت</label>
                    <input
                      v-model.number="form.fixedShippingPrice"
                      type="number"
                      class="form-input"
                      min="0"
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

                <!-- ✅ الأقسام (أب + أبناء) -->
                <div class="form-group" style="margin-top: 12px">
                  <label class="form-label">الأقسام (Categories) *</label>
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
                </div>

                <div class="form-check">
                  <label class="check-label">
                    <input
                      v-model="form.isFreeShipping"
                      type="checkbox"
                      class="check-input"
                    />
                    <span>شحن مجاني</span>
                  </label>
                </div>
              </fieldset>

              <!-- ===== الصور ===== -->
              <fieldset class="form-section">
                <legend>الصور</legend>
                <div class="form-group">
                  <label class="form-label">الصورة الرئيسية *</label>
                  <ImageUploader v-model="form.mainImage" folder="products" />
                </div>
                <div class="form-group" style="margin-top: 16px">
                  <label
                    class="form-label"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <span>الصور الإضافية</span>
                    <button
                      type="button"
                      class="btn-add-gallery"
                      @click="addGalleryImage"
                    >
                      + إضافة صورة
                    </button>
                  </label>
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
                </div>
              </fieldset>

              <!-- ===== الترجمات والمواصفات ===== -->
              <fieldset class="form-section">
                <legend>الترجمات والمواصفات</legend>

                <!-- عربي -->
                <div class="lang-block">
                  <h4 class="lang-title">🇪🇬 عربي</h4>
                  <div class="form-group">
                    <label class="form-label">اسم المنتج *</label>
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
                      class="form-input"
                      rows="3"
                    ></textarea>
                  </div>
                  <!-- ✅ Specifications عربي -->
                  <div class="specs-container">
                    <label class="form-label">المواصفات (Specifications)</label>
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
                        placeholder="المفتاح (مثلاً: الخامة)"
                        style="flex: 1"
                      />
                      <input
                        v-model="spec.value"
                        type="text"
                        class="form-input"
                        placeholder="القيمة (مثلاً: خشب زان)"
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

                <!-- إنجليزي -->
                <div class="lang-block">
                  <h4 class="lang-title">🇺🇸 English</h4>
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
                      class="form-input"
                      rows="3"
                      dir="ltr"
                    ></textarea>
                  </div>
                  <!-- ✅ Specifications English -->
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
                        placeholder="Key (e.g., Material)"
                        style="flex: 1"
                        dir="ltr"
                      />
                      <input
                        v-model="spec.value"
                        type="text"
                        class="form-input"
                        placeholder="Value (e.g., Beech Wood)"
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

              <!-- ===== Variants ===== -->
              <fieldset class="form-section">
                <legend>
                  المتغيرات (Variants)
                  <button
                    type="button"
                    class="btn-add-variant"
                    @click="addVariant"
                  >
                    + إضافة
                  </button>
                </legend>

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
                      <label class="form-label">SKU *</label>
                      <input
                        v-model="v.sku"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">السعر *</label>
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
                    <!-- اللون -->
                    <div class="form-group">
                      <label class="form-label">اللون</label>
                      <select
                        v-model="v.colorId"
                        class="form-input form-select"
                      >
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
                    <!-- الحجم -->
                    <div class="form-group">
                      <label class="form-label">الحجم</label>
                      <select v-model="v.sizeId" class="form-input form-select">
                        <option value="">— اختر الحجم (اختياري) —</option>
                        <option
                          v-for="size in sizesStore.sizes"
                          :key="size.id"
                          :value="size.id"
                        >
                          {{ sizesStore.getSizeName(size, "ar") }}
                        </option>
                      </select>
                    </div>
                    <!-- الخامة -->
                    <div class="form-group">
                      <label class="form-label">الخامة</label>
                      <select
                        v-model="v.materialId"
                        class="form-input form-select"
                      >
                        <option value="">— اختر الخامة (اختياري) —</option>
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
                  <div class="form-group">
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
              </fieldset>

              <!-- ===== SEO ===== -->
              <fieldset class="form-section">
                <legend>SEO</legend>
                <div class="form-group">
                  <label class="form-label">Meta Title</label>
                  <input
                    v-model="form.metaTitle"
                    type="text"
                    class="form-input"
                    dir="ltr"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Meta Description</label>
                  <textarea
                    v-model="form.metaDescription"
                    class="form-input"
                    rows="2"
                    dir="ltr"
                  ></textarea>
                </div>
              </fieldset>

              <!-- ===== المنتجات والأقسام المرتبطة ===== -->
              <fieldset class="form-section">
                <legend>المنتجات والأقسام المرتبطة</legend>

                <!-- Related Categories -->
                <div class="form-group">
                  <label class="form-label"
                    >أقسام ذات صلة (relatedCategoryIds)</label
                  >
                  <p class="form-hint">ستظهر منتجاتها في "منتجات مشابهة"</p>
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
                </div>

                <!-- Related Products -->
                <div class="form-group" style="margin-top: 16px">
                  <label class="form-label"
                    >منتجات ذات صلة (relatedProductsIds)</label
                  >
                  <p class="form-hint">منتجات محددة ستظهر في "منتجات مشابهة"</p>
                  <input
                    v-model="relatedProductSearch"
                    type="text"
                    class="form-input"
                    placeholder="ابحث عن منتج بالاسم أو الـ slug..."
                    style="margin-bottom: 8px"
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
                  <p
                    v-if="form.relatedProductsIds.length"
                    class="selected-count"
                  >
                    ✓ {{ form.relatedProductsIds.length }} منتج مختار
                  </p>
                </div>
              </fieldset>

              <!-- ===== أزرار الحفظ ===== -->
              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="closeModal">
                  إلغاء
                </button>
                <button
                  type="submit"
                  class="btn-save"
                  :disabled="store.actionLoading"
                >
                  <span v-if="store.actionLoading" class="btn-spinner"></span>
                  {{ isEditing ? "حفظ التعديلات" : "إنشاء المنتج" }}
                </button>
              </div>
            </form>
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
                <span class="detail-label">Slug:</span>
                <span class="detail-val" dir="ltr">{{
                  viewingProduct.slug
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">السعر:</span>
                <span class="detail-val"
                  >{{ formatPrice(viewingProduct.basePrice) }} ج.م</span
                >
              </div>
              <div class="detail-row" v-if="viewingProduct.baseDiscountPrice">
                <span class="detail-label">بعد الخصم:</span>
                <span class="detail-val discount"
                  >{{ formatPrice(viewingProduct.baseDiscountPrice) }} ج.م</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">المخزون:</span>
                <span class="detail-val">{{ viewingProduct.baseStock }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الشحن:</span>
                <span class="detail-val">{{
                  viewingProduct.isFreeShipping
                    ? "مجاني"
                    : `${viewingProduct.fixedShippingPrice} ج.م`
                }}</span>
              </div>
              <div class="detail-row" v-if="viewingProduct.brand">
                <span class="detail-label">الماركة:</span>
                <span class="detail-val">{{
                  brandsStore.getBrandName(viewingProduct.brand, "ar")
                }}</span>
              </div>
              <!-- ✅ عرض المواصفات في view mode -->
              <div
                class="detail-row"
                v-if="
                  viewingProduct.translations?.[0]?.specifications &&
                  Object.keys(viewingProduct.translations[0].specifications)
                    .length
                "
              >
                <span class="detail-label">المواصفات:</span>
                <ul class="specs-view-list">
                  <li
                    v-for="(val, key) in viewingProduct.translations[0]
                      .specifications"
                    :key="key"
                  >
                    <strong>{{ key }}:</strong> {{ val }}
                  </li>
                </ul>
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
                    <span class="variant-info">
                      {{ v.sku }} — {{ formatPrice(v.price) }} ج.م
                      <span v-if="v.size" class="variant-size-label"
                        >| {{ v.size?.type }}</span
                      >
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== تأكيد الحذف ===== -->
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
              <span v-if="store.actionLoading" class="btn-spinner dark"></span>
              حذف
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
import { ref, reactive, computed, onMounted } from "vue";
import { useProductsStore } from "@/stores/products.js";
import { useColorsStore } from "@/stores/colors.js";
import { useSizesStore } from "@/stores/sizes.js";
import { useBrandsStore } from "@/stores/brands.js";
import { useMaterialsStore } from "@/stores/materials.js";
import { useCategoryStore } from "@/stores/category.js";
import ImageUploader from "@/components/shared/ImageUploader.vue";

const store = useProductsStore();
const colorsStore = useColorsStore();
const sizesStore = useSizesStore();
const brandsStore = useBrandsStore();
const materialsStore = useMaterialsStore();
const categoryStore = useCategoryStore();

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

// ===== Specifications Helpers =====
const addSpec = (langIndex) => {
  form.translations[langIndex].specificationsList.push({ key: "", value: "" });
};
const removeSpec = (langIndex, specIndex) => {
  form.translations[langIndex].specificationsList.splice(specIndex, 1);
};

// ===== Variants & Gallery =====
const addVariant = () => {
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
};
const removeVariant = (idx) => form.variants.splice(idx, 1);
const addGalleryImage = () => form.defaultGallery.push("");

// ===== Open Modals =====
const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  Object.assign(form, defaultForm());
  showModal.value = true;
};

const openEditModal = async (product) => {
  isEditing.value = true;
  editingId.value = product.id;
  const full = await store.fetchProduct(product.id);
  if (!full) return;

  const arTrans = full.translations?.find((t) => t.languageCode === "ar") || {};
  const enTrans = full.translations?.find((t) => t.languageCode === "en") || {};

  // ✅ تحويل specifications object → array للـ UI
  const specsToArray = (specsObj) => {
    if (!specsObj || typeof specsObj !== "object") return [];
    return Object.entries(specsObj).map(([key, value]) => ({ key, value }));
  };

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

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
const viewProduct = (product) => {
  viewingProduct.value = product;
};

// ===== Submit =====
const submitForm = async () => {
  // ✅ تحويل specifications array → object للـ API
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
        specifications: arrayToSpecs(t.specificationsList), // ✅ object للـ API
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
    closeModal();
    showToast(
      isEditing.value ? "تم تعديل المنتج بنجاح" : "تم إنشاء المنتج بنجاح",
    );
  } else {
    showToast("حدث خطأ، حاول مرة أخرى", "error");
  }
};

// ===== Delete =====
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

// ===== Duplicate =====
const handleDuplicate = async (id) => {
  const result = await store.duplicateProduct(id);
  showToast(
    result.success ? "تم نسخ المنتج بنجاح" : "فشل النسخ",
    result.success ? "success" : "error",
  );
};

// ===== Related Products Search =====
const relatedProductSearch = ref("");
const filteredRelatedProducts = computed(() => {
  if (!relatedProductSearch.value.trim()) return store.products;
  const q = relatedProductSearch.value.trim().toLowerCase();
  return store.products.filter((p) => {
    const name = store.getProductName(p, "ar").toLowerCase();
    const slug = (p.slug || "").toLowerCase();
    return name.includes(q) || slug.includes(q);
  });
});

// ===== Helpers =====
const formatPrice = (price) => parseFloat(price || 0).toLocaleString("ar-EG");
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

// ===== جلب البيانات =====
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
  margin-bottom: 24px;
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
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #f0e8d0;
}
.page-btn {
  width: 36px;
  height: 36px;
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
.page-btn:hover:not(.active) {
  background: #faf6ee;
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
  border-radius: 18px;
  width: 100%;
  max-width: 720px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1.5px solid #f0e8d0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}
.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #987226;
  margin: 0;
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
.modal-body {
  padding: 20px 24px 28px;
  overflow-y: auto;
}
.form-section {
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 16px 20px 20px;
  margin-bottom: 20px;
  background: #fdfaf4;
}
.form-section legend {
  font-weight: 700;
  font-size: 14px;
  color: #987226;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 13px;
  font-weight: 600;
  color: #555;
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
.color-preview-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.color-dot-sm {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.color-hex-sm {
  font-family: monospace;
  font-size: 12px;
  color: #666;
}
.form-check {
  margin-top: 12px;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}
.check-input {
  width: 17px;
  height: 17px;
  accent-color: #987226;
  cursor: pointer;
}
.lang-block {
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0e8d0;
}
.lang-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.lang-title {
  font-size: 14px;
  font-weight: 700;
  color: #666;
  margin: 0 0 12px;
}
/* ✅ Specifications */
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
  font-weight: bold;
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
  font-weight: 600;
  font-size: 13px;
}
.specs-view-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
}
.specs-view-list li {
  margin-bottom: 4px;
  color: #555;
}
/* Variants */
.btn-add-variant {
  margin-right: auto;
  padding: 4px 12px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
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
  font-size: 13px;
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
  padding: 12px;
  font-size: 14px;
}
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #555;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.btn-save {
  flex: 2;
  padding: 12px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
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
  font-size: 14px;
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
  font-size: 13px;
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
  font-weight: 600;
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
  font-size: 15px;
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
.btn-spinner.dark {
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: #fff;
}
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 12px;
  font-family: "Cairo", sans-serif;
  font-size: 15px;
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
.btn-add-gallery {
  padding: 4px 10px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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
  font-size: 13px;
  width: 26px;
  height: 26px;
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
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 6px;
}
/* Categories Tree */
.categories-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #fff;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
  max-height: 260px;
  overflow-y: auto;
}
.cat-parent-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cat-children-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-right: 18px;
  padding-bottom: 4px;
  border-right: 3px solid #f0e8d0;
  margin-right: 8px;
}
.category-check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  background: #fdfaf4;
  border: 1px solid #e8e0cf;
  border-radius: 6px;
  padding: 5px 10px;
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
  font-size: 13px;
}
.cat-child {
  font-size: 12px;
  font-weight: 500;
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
/* Form Hint */
.form-hint {
  font-size: 12px;
  color: #aaa;
  margin: -2px 0 6px;
}
/* Related Products */
.related-products-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
  background: #fff;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
}
.related-product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
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
  width: 38px;
  height: 38px;
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
  font-size: 13px;
  font-weight: 600;
  color: #2a2015;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.related-product-slug {
  font-size: 11px;
  color: #aaa;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-related {
  text-align: center;
  color: #bbb;
  font-size: 13px;
  padding: 12px 0;
  margin: 0;
}
.selected-count {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #987226;
}
</style>

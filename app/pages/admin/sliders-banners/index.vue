<template>
  <div class="media-page" dir="rtl">
    <!-- ===== Header ===== -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">إدارة السلايدرات والبنرات</h1>
        <span class="header-badge">الصفحة الرئيسية</span>
      </div>
    </div>

    <!-- ===== Tabs ===== -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        {{ tab.label }}
        <span class="tab-count" v-if="tabCount(tab.key) !== null">
          {{ tabCount(tab.key) }}
        </span>
      </button>
    </div>

    <!-- ===== TAB: Main Sliders ===== -->
    <div v-if="activeTab === 'mainSliders'" class="tab-content">
      <div class="section-toolbar">
        <h2 class="section-title">السلايدرات الرئيسية (Hero)</h2>
        <button class="btn-add" @click="openModal('mainSlider')">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة سلايدر
        </button>
      </div>

      <div v-if="store.mainSlidersLoading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
      <div v-else-if="store.mainSlidersError" class="error-state">
        <p>{{ store.mainSlidersError }}</p>
        <button class="btn-retry" @click="store.fetchMainSliders()">
          إعادة المحاولة
        </button>
      </div>
      <div v-else class="cards-grid">
        <div
          v-for="slider in store.mainSliders"
          :key="slider.id"
          class="media-card"
        >
          <div class="card-type-badge main-slider-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 2l-4 5-4-5" />
            </svg>
            سلايدر رئيسي
          </div>
          <!-- Slides Preview -->
          <div class="slides-preview">
            <div v-if="slider.items?.length" class="slides-strip">
              <div
                v-for="item in slider.items.slice(0, 4)"
                :key="item.id"
                class="slide-thumb-wrap"
              >
                <img
                  :src="item.imageUrl"
                  class="slide-thumb"
                  @error="$event.target.src = '/images/placeholder.jpg'"
                />
                <div class="slide-order-badge">{{ item.order }}</div>
              </div>
              <div v-if="slider.items.length > 4" class="slides-more">
                +{{ slider.items.length - 4 }}
              </div>
            </div>
            <div v-else class="no-slides">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                stroke-width="1.5"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 2l-4 5-4-5" />
              </svg>
              <span>لا توجد شرائح</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-key" dir="ltr">{{ slider.key }}</div>
            <div class="card-meta-row">
              <span class="meta-item">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                </svg>
                {{ slider.items?.length || 0 }} شريحة
              </span>
              <span class="meta-item">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                ترتيب: {{ slider.sectionOrder }}
              </span>
            </div>
            <div class="card-flags">
              <span
                class="flag-badge"
                :class="slider.isActive ? 'flag-active' : 'flag-inactive'"
              >
                {{ slider.isActive ? "نشط" : "معطل" }}
              </span>
              <span
                class="flag-badge"
                :class="slider.showInHome ? 'flag-home' : 'flag-hidden'"
              >
                {{ slider.showInHome ? "يظهر في الرئيسية" : "مخفي" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="action-btn edit-btn"
              title="تعديل"
              @click="openEditModal('mainSlider', slider)"
            >
              <svg
                width="15"
                height="15"
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
              تعديل
            </button>
            <button
              class="action-btn delete-btn"
              title="حذف"
              @click="confirmDelete('mainSlider', slider)"
            >
              <svg
                width="15"
                height="15"
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
              حذف
            </button>
          </div>
        </div>
        <div v-if="!store.mainSliders.length" class="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ccc"
            stroke-width="1"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 2l-4 5-4-5" />
          </svg>
          <p>لا توجد سلايدرات رئيسية بعد</p>
        </div>
      </div>
    </div>

    <!-- ===== TAB: Product Sliders ===== -->
    <div v-if="activeTab === 'productSliders'" class="tab-content">
      <div class="section-toolbar">
        <h2 class="section-title">سلايدرات المنتجات</h2>
        <button class="btn-add" @click="openModal('productSlider')">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة سلايدر منتجات
        </button>
      </div>

      <div v-if="store.productSlidersLoading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
      <div v-else class="cards-grid">
        <div
          v-for="slider in store.productSliders"
          :key="slider.id"
          class="media-card"
        >
          <div class="card-type-badge product-slider-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            سلايدر منتجات
          </div>
          <div class="products-preview">
            <div v-if="slider.products?.length" class="products-strip">
              <div
                v-for="product in slider.products.slice(0, 5)"
                :key="product.id"
                class="product-thumb-wrap"
              >
                <img
                  :src="product.mainImage"
                  class="product-thumb-sm"
                  @error="$event.target.src = '/images/placeholder.jpg'"
                />
              </div>
              <div v-if="slider.products.length > 5" class="products-more">
                +{{ slider.products.length - 5 }}
              </div>
            </div>
            <div v-else class="no-slides">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                stroke-width="1.5"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              </svg>
              <span>لا توجد منتجات</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-title">{{ store.getTitle(slider, "ar") }}</div>
            <div class="card-key" dir="ltr">{{ slider.key }}</div>
            <div class="card-meta-row">
              <span class="meta-item"
                >{{ slider.products?.length || 0 }} منتج</span
              >
              <span class="meta-item">ترتيب: {{ slider.sectionOrder }}</span>
            </div>
            <div class="card-flags">
              <span
                class="flag-badge"
                :class="slider.isActive ? 'flag-active' : 'flag-inactive'"
              >
                {{ slider.isActive ? "نشط" : "معطل" }}
              </span>
              <span
                class="flag-badge"
                :class="slider.showInHome ? 'flag-home' : 'flag-hidden'"
              >
                {{ slider.showInHome ? "في الرئيسية" : "مخفي" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="action-btn edit-btn"
              @click="openEditModal('productSlider', slider)"
            >
              <svg
                width="15"
                height="15"
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
              تعديل
            </button>
            <button
              class="action-btn delete-btn"
              @click="confirmDelete('productSlider', slider)"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              حذف
            </button>
          </div>
        </div>
        <div v-if="!store.productSliders.length" class="empty-state">
          <p>لا توجد سلايدرات منتجات بعد</p>
        </div>
      </div>
    </div>

    <!-- ===== TAB: Full Images ===== -->
    <div v-if="activeTab === 'fullImages'" class="tab-content">
      <div class="section-toolbar">
        <h2 class="section-title">البنرات الكاملة (Full Image)</h2>
        <button class="btn-add" @click="openModal('fullImage')">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة بنر كامل
        </button>
      </div>

      <div v-if="store.fullImagesLoading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card tall"></div>
      </div>
      <div v-else class="cards-grid">
        <div
          v-for="img in store.fullImages"
          :key="img.id"
          class="media-card banner-card"
        >
          <div class="card-type-badge full-image-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            بنر كامل
          </div>
          <div class="banner-img-wrap">
            <img
              :src="img.imageUrl"
              class="banner-preview-img"
              @error="$event.target.src = '/images/placeholder.jpg'"
            />
            <div class="banner-img-overlay">
              <a
                v-if="img.translations?.[0]?.link"
                :href="img.translations[0].link"
                target="_blank"
                class="overlay-link"
                dir="ltr"
              >
                {{ img.translations[0].link }}
              </a>
            </div>
          </div>
          <div class="card-body">
            <div class="card-key" dir="ltr">{{ img.key }}</div>
            <div class="card-flags">
              <span
                class="flag-badge"
                :class="img.isActive ? 'flag-active' : 'flag-inactive'"
              >
                {{ img.isActive ? "نشط" : "معطل" }}
              </span>
              <span
                class="flag-badge"
                :class="img.showInHome ? 'flag-home' : 'flag-hidden'"
              >
                {{ img.showInHome ? "في الرئيسية" : "مخفي" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="action-btn edit-btn"
              @click="openEditModal('fullImage', img)"
            >
              <svg
                width="15"
                height="15"
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
              تعديل
            </button>
            <button
              class="action-btn delete-btn"
              @click="confirmDelete('fullImage', img)"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              حذف
            </button>
          </div>
        </div>
        <div v-if="!store.fullImages.length" class="empty-state">
          <p>لا توجد بنرات كاملة بعد</p>
        </div>
      </div>
    </div>

    <!-- ===== TAB: Fixed Banners ===== -->
    <div v-if="activeTab === 'fixedBanners'" class="tab-content">
      <div class="section-toolbar">
        <h2 class="section-title">البنرات الثابتة</h2>
        <button class="btn-add" @click="openModal('fixedBanner')">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة بنر ثابت
        </button>
      </div>

      <div v-if="store.fixedBannersLoading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card tall"></div>
      </div>
      <div v-else class="cards-grid">
        <div
          v-for="banner in store.fixedBanners"
          :key="banner.id"
          class="media-card banner-card"
        >
          <div class="card-type-badge fixed-banner-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
              />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            بنر ثابت
          </div>
          <div class="banner-img-wrap">
            <img
              :src="banner.imageUrl"
              class="banner-preview-img"
              @error="$event.target.src = '/images/placeholder.jpg'"
            />
            <div class="banner-img-overlay">
              <div class="overlay-title">
                {{ banner.translations?.[0]?.title || "" }}
              </div>
              <a
                v-if="banner.translations?.[0]?.link"
                :href="banner.translations[0].link"
                target="_blank"
                class="overlay-link"
                dir="ltr"
              >
                {{ banner.translations[0].link }}
              </a>
            </div>
          </div>
          <div class="card-body">
            <div class="card-key" dir="ltr">{{ banner.key }}</div>
            <div class="card-meta-row">
              <span class="meta-item">ترتيب: {{ banner.sectionOrder }}</span>
            </div>
            <div class="card-flags">
              <span
                class="flag-badge"
                :class="banner.isActive ? 'flag-active' : 'flag-inactive'"
              >
                {{ banner.isActive ? "نشط" : "معطل" }}
              </span>
              <span
                class="flag-badge"
                :class="banner.showInHome ? 'flag-home' : 'flag-hidden'"
              >
                {{ banner.showInHome ? "في الرئيسية" : "مخفي" }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="action-btn edit-btn"
              @click="openEditModal('fixedBanner', banner)"
            >
              <svg
                width="15"
                height="15"
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
              تعديل
            </button>
            <button
              class="action-btn delete-btn"
              @click="confirmDelete('fixedBanner', banner)"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              حذف
            </button>
          </div>
        </div>
        <div v-if="!store.fixedBanners.length" class="empty-state">
          <p>لا توجد بنرات ثابتة بعد</p>
        </div>
      </div>
    </div>

    <!-- ===== TAB: Static Sections ===== -->
    <div v-if="activeTab === 'staticSections'" class="tab-content">
      <div class="section-toolbar">
        <h2 class="section-title">الأقسام الثابتة</h2>
        <button class="btn-add" @click="openModal('staticSection')">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة قسم ثابت
        </button>
      </div>

      <div v-if="store.staticSectionsLoading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
      <div v-else class="table-wrapper">
        <table class="media-table">
          <thead>
            <tr>
              <th>المفتاح (Key)</th>
              <th>ترتيب القسم</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="section in store.staticSections"
              :key="section.id"
              class="media-row"
            >
              <td>
                <span class="key-badge" dir="ltr">{{ section.key }}</span>
              </td>
              <td>
                <span class="order-num">{{ section.sectionOrder }}</span>
              </td>
              <td>
                <span
                  class="flag-badge"
                  :class="section.isActive ? 'flag-active' : 'flag-inactive'"
                >
                  {{ section.isActive ? "نشط" : "معطل" }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(section.createdAt) }}</td>
              <td>
                <div class="actions-row">
                  <button
                    class="action-btn edit-btn sm"
                    @click="openEditModal('staticSection', section)"
                  >
                    <svg
                      width="14"
                      height="14"
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
                    class="action-btn delete-btn sm"
                    @click="confirmDelete('staticSection', section)"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.staticSections.length">
              <td colspan="5" class="empty-row">لا توجد أقسام ثابتة بعد</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== CREATE/EDIT MODAL ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">{{ modalTitle }}</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- ===== MAIN SLIDER FORM ===== -->
              <template v-if="modalType === 'mainSlider'">
                <fieldset class="form-section">
                  <legend>معلومات السلايدر</legend>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label class="form-label">المفتاح (Key) *</label>
                      <input
                        v-model="form.key"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        required
                        placeholder="hero-summer-2026"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">ترتيب القسم</label>
                      <input
                        v-model.number="form.sectionOrder"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="form-checks-row">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                    <label class="check-label">
                      <input
                        v-model="form.showInHome"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>يظهر في الرئيسية</span>
                    </label>
                  </div>
                </fieldset>

                <fieldset class="form-section">
                  <legend>
                    الشرائح (Items)
                    <button
                      type="button"
                      class="btn-add-inline"
                      @click="addSlide"
                    >
                      + إضافة شريحة
                    </button>
                  </legend>
                  <div
                    v-for="(item, idx) in form.items"
                    :key="idx"
                    class="slide-form-block"
                  >
                    <div class="slide-form-header">
                      <span>شريحة {{ idx + 1 }}</span>
                      <button
                        type="button"
                        class="btn-remove-sm"
                        @click="form.items.splice(idx, 1)"
                      >
                        ✕
                      </button>
                    </div>
                    <div class="form-group">
                      <label class="form-label">رابط الصورة *</label>
                      <ImageUploader v-model="item.imageUrl" folder="sliders" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">الترتيب</label>
                      <input
                        v-model.number="item.order"
                        type="number"
                        class="form-input"
                        min="1"
                      />
                    </div>
                    <div class="lang-block-sm">
                      <div class="lang-mini-title">🇪🇬 عربي</div>
                      <div class="form-grid-3">
                        <div class="form-group">
                          <label class="form-label">العنوان</label>
                          <input
                            v-model="item.translations[0].title"
                            type="text"
                            class="form-input"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">نص الزر</label>
                          <input
                            v-model="item.translations[0].buttonText"
                            type="text"
                            class="form-input"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">رابط الزر</label>
                          <input
                            v-model="item.translations[0].buttonLink"
                            type="text"
                            class="form-input"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="lang-block-sm">
                      <div class="lang-mini-title">🇺🇸 English</div>
                      <div class="form-grid-3">
                        <div class="form-group">
                          <label class="form-label">Title</label>
                          <input
                            v-model="item.translations[1].title"
                            type="text"
                            class="form-input"
                            dir="ltr"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Button Text</label>
                          <input
                            v-model="item.translations[1].buttonText"
                            type="text"
                            class="form-input"
                            dir="ltr"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Button Link</label>
                          <input
                            v-model="item.translations[1].buttonLink"
                            type="text"
                            class="form-input"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-if="!form.items.length" class="empty-hint">
                    لا توجد شرائح. اضغط + إضافة شريحة.
                  </p>
                </fieldset>
              </template>

              <!-- ===== PRODUCT SLIDER FORM ===== -->
              <template v-if="modalType === 'productSlider'">
                <fieldset class="form-section">
                  <legend>معلومات السلايدر</legend>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label class="form-label">المفتاح (Key) *</label>
                      <input
                        v-model="form.key"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">ترتيب القسم</label>
                      <input
                        v-model.number="form.sectionOrder"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">العنوان (عربي)</label>
                      <input
                        v-model="form.titleAr"
                        type="text"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Title (English)</label>
                      <input
                        v-model="form.titleEn"
                        type="text"
                        class="form-input"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div class="form-checks-row">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                    <label class="check-label">
                      <input
                        v-model="form.showInHome"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>يظهر في الرئيسية</span>
                    </label>
                  </div>
                </fieldset>
                <fieldset class="form-section">
                  <legend>منتجات السلايدر</legend>
                  <input
                    v-model="productSearch"
                    type="text"
                    class="form-input"
                    placeholder="ابحث عن منتج بالاسم أو الـ slug..."
                    style="margin-bottom: 10px"
                  />
                  <div class="products-picker-list">
                    <label
                      v-for="product in filteredPickerProducts"
                      :key="product.id"
                      class="picker-product-item"
                      :class="{
                        selected: form.productIds.includes(product.id),
                      }"
                    >
                      <input
                        type="checkbox"
                        :value="product.id"
                        v-model="form.productIds"
                        class="check-input"
                      />
                      <img
                        :src="product.mainImage"
                        class="picker-thumb"
                        @error="$event.target.src = '/images/placeholder.jpg'"
                      />
                      <div class="picker-info">
                        <span class="picker-name">{{
                          productsStore.getProductName(product, "ar")
                        }}</span>
                        <span class="picker-slug" dir="ltr">{{
                          product.slug
                        }}</span>
                      </div>
                      <span
                        v-if="form.productIds.includes(product.id)"
                        class="picker-check-icon"
                        >✓</span
                      >
                    </label>
                    <p v-if="!filteredPickerProducts.length" class="empty-hint">
                      لا توجد نتائج
                    </p>
                  </div>
                  <p v-if="form.productIds.length" class="selected-count">
                    ✓ {{ form.productIds.length }} منتج مختار
                  </p>
                </fieldset>
              </template>

              <!-- ===== FULL IMAGE FORM ===== -->
              <template v-if="modalType === 'fullImage'">
                <fieldset class="form-section">
                  <legend>معلومات البنر الكامل</legend>
                  <div class="form-group">
                    <label class="form-label">المفتاح (Key) *</label>
                    <input
                      v-model="form.key"
                      type="text"
                      class="form-input"
                      dir="ltr"
                      required
                      placeholder="mid-page-offer"
                    />
                  </div>
                  <div class="form-group" style="margin-top: 12px">
                    <label class="form-label">الصورة *</label>
                    <ImageUploader v-model="form.imageUrl" folder="banners" />
                  </div>
                  <div class="form-checks-row" style="margin-top: 12px">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                    <label class="check-label">
                      <input
                        v-model="form.showInHome"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>يظهر في الرئيسية</span>
                    </label>
                  </div>
                </fieldset>
                <fieldset class="form-section">
                  <legend>الترجمات</legend>
                  <div class="lang-block-sm">
                    <div class="lang-mini-title">🇪🇬 عربي</div>
                    <div class="form-group">
                      <label class="form-label">الرابط</label>
                      <input
                        v-model="form.linkAr"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        placeholder="/offers/summer"
                      />
                    </div>
                  </div>
                  <div class="lang-block-sm" style="margin-top: 12px">
                    <div class="lang-mini-title">🇺🇸 English</div>
                    <div class="form-group">
                      <label class="form-label">Link</label>
                      <input
                        v-model="form.linkEn"
                        type="text"
                        class="form-input"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </fieldset>
              </template>

              <!-- ===== FIXED BANNER FORM ===== -->
              <template v-if="modalType === 'fixedBanner'">
                <fieldset class="form-section">
                  <legend>معلومات البنر الثابت</legend>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label class="form-label">المفتاح (Key) *</label>
                      <input
                        v-model="form.key"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">ترتيب القسم</label>
                      <input
                        v-model.number="form.sectionOrder"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="form-group" style="margin-top: 12px">
                    <label class="form-label">الصورة *</label>
                    <ImageUploader v-model="form.imageUrl" folder="banners" />
                  </div>
                  <div class="form-checks-row" style="margin-top: 12px">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                    <label class="check-label">
                      <input
                        v-model="form.showInHome"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>يظهر في الرئيسية</span>
                    </label>
                  </div>
                </fieldset>
                <fieldset class="form-section">
                  <legend>الترجمات</legend>
                  <div class="lang-block-sm">
                    <div class="lang-mini-title">🇪🇬 عربي</div>
                    <div class="form-grid-2">
                      <div class="form-group">
                        <label class="form-label">العنوان</label>
                        <input
                          v-model="form.titleAr"
                          type="text"
                          class="form-input"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">الرابط</label>
                        <input
                          v-model="form.linkAr"
                          type="text"
                          class="form-input"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="lang-block-sm" style="margin-top: 12px">
                    <div class="lang-mini-title">🇺🇸 English</div>
                    <div class="form-grid-2">
                      <div class="form-group">
                        <label class="form-label">Title</label>
                        <input
                          v-model="form.titleEn"
                          type="text"
                          class="form-input"
                          dir="ltr"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Link</label>
                        <input
                          v-model="form.linkEn"
                          type="text"
                          class="form-input"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </template>

              <!-- ===== STATIC SECTION FORM ===== -->
              <template v-if="modalType === 'staticSection'">
                <fieldset class="form-section">
                  <legend>معلومات القسم الثابت</legend>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label class="form-label">المفتاح (Key) *</label>
                      <input
                        v-model="form.key"
                        type="text"
                        class="form-input"
                        dir="ltr"
                        required
                        placeholder="about-us-home"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">ترتيب القسم</label>
                      <input
                        v-model.number="form.sectionOrder"
                        type="number"
                        class="form-input"
                        min="0"
                      />
                    </div>
                  </div>
                  <div class="form-checks-row">
                    <label class="check-label">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="check-input"
                      />
                      <span>نشط</span>
                    </label>
                  </div>
                </fieldset>
              </template>

              <!-- Form Actions -->
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
                  {{ isEditing ? "حفظ التعديلات" : "إنشاء" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== DELETE CONFIRM ===== -->
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
          <h3 class="confirm-title">تأكيد الحذف</h3>
          <p class="confirm-text">
            هل أنت متأكد من حذف "<strong>{{ deleteTarget.item?.key }}</strong
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
import { useSlidersStore } from "@/stores/slidersBanners.js";
import { useProductsStore } from "@/stores/products.js";
import ImageUploader from "@/components/shared/ImageUploader.vue";

const store = useSlidersStore();
const productsStore = useProductsStore();

// ===== Tabs =====
const activeTab = ref("mainSliders");

const tabs = [
  {
    key: "mainSliders",
    label: "السلايدرات الرئيسية",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2l-4 5-4-5"/></svg>`,
  },
  {
    key: "productSliders",
    label: "سلايدرات المنتجات",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>`,
  },
  {
    key: "fullImages",
    label: "البنرات الكاملة",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  },
  {
    key: "fixedBanners",
    label: "البنرات الثابتة",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  },
  {
    key: "staticSections",
    label: "الأقسام الثابتة",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  },
];

const tabCount = (key) => {
  const map = {
    mainSliders: store.mainSliders.length,
    productSliders: store.productSliders.length,
    fullImages: store.fullImages.length,
    fixedBanners: store.fixedBanners.length,
    staticSections: store.staticSections.length,
  };
  return map[key] ?? null;
};

// ===== Toast =====
const toast = reactive({ show: false, msg: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.msg = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

// ===== Modal =====
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const modalType = ref("");

const modalTitle = computed(() => {
  const typeLabels = {
    mainSlider: "السلايدر الرئيسي",
    productSlider: "سلايدر المنتجات",
    fullImage: "البنر الكامل",
    fixedBanner: "البنر الثابت",
    staticSection: "القسم الثابت",
  };
  return `${isEditing.value ? "تعديل" : "إضافة"} ${typeLabels[modalType.value] || ""}`;
});

const defaultForm = () => ({
  key: "",
  sectionOrder: 1,
  isActive: true,
  showInHome: true,
  imageUrl: "",
  titleAr: "",
  titleEn: "",
  linkAr: "",
  linkEn: "",
  productIds: [],
  items: [],
});

const form = reactive(defaultForm());

const addSlide = () => {
  form.items.push({
    imageUrl: "",
    order: form.items.length + 1,
    translations: [
      { languageCode: "ar", title: "", buttonText: "", buttonLink: "" },
      { languageCode: "en", title: "", buttonText: "", buttonLink: "" },
    ],
  });
};

// ===== Product Picker Logic (Fetch All) =====
const allProducts = ref([]);
const isAllProductsLoaded = ref(false);

const fetchAllProductsForSlider = async () => {
  if (isAllProductsLoaded.value) return; // منع التكرار إذا تم الجلب مسبقاً

  try {
    const nuxtApp = useNuxtApp();
    const config = useRuntimeConfig();
    const token = useCookie("auth_token").value;

    // جلب عدد كبير من المنتجات لتجاوز الـ Pagination الافتراضي
    const response = await $fetch(`/products?limit=1000`, {
      baseURL: config.public.apiBase,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.success) {
      allProducts.value = response.data.data || response.data;
      isAllProductsLoaded.value = true;
    }
  } catch (e) {
    console.error("Failed to fetch all products for slider:", e);
    showToast("فشل في تحميل قائمة المنتجات الكاملة", "error");
  }
};

const openModal = (type) => {
  modalType.value = type;
  isEditing.value = false;
  editingId.value = null;
  Object.assign(form, defaultForm());

  // إذا كان النوع سلايدر منتجات، نجلب كل المنتجات
  if (type === "productSlider") {
    fetchAllProductsForSlider();
  }

  showModal.value = true;
};

const openEditModal = (type, item) => {
  modalType.value = type;
  isEditing.value = true;
  editingId.value = item.id;

  Object.assign(form, defaultForm());
  form.key = item.key || "";
  form.sectionOrder = item.sectionOrder || 1;
  form.isActive = item.isActive ?? true;
  form.showInHome = item.showInHome ?? true;

  if (type === "mainSlider") {
    form.items = (item.items || []).map((it) => ({
      imageUrl: it.imageUrl || "",
      order: it.order || 1,
      translations: [
        {
          languageCode: "ar",
          ...(it.translations?.find((t) => t.languageCode === "ar") || {
            title: "",
            buttonText: "",
            buttonLink: "",
          }),
        },
        {
          languageCode: "en",
          ...(it.translations?.find((t) => t.languageCode === "en") || {
            title: "",
            buttonText: "",
            buttonLink: "",
          }),
        },
      ],
    }));
  }

  if (type === "productSlider") {
    const arT = item.translations?.find((t) => t.languageCode === "ar");
    const enT = item.translations?.find((t) => t.languageCode === "en");
    form.titleAr = arT?.title || "";
    form.titleEn = enT?.title || "";
    form.productIds = (item.products || []).map((p) => p.id);
    // تأكد من جلب المنتجات أيضاً عند التعديل لضمان ظهور الأسماء والصور
    fetchAllProductsForSlider();
  }

  if (type === "fullImage") {
    form.imageUrl =
      item.imageUrl?.replace(/^https?:\/\/[^/]+\/uploads\//, "") || "";
    const arT = item.translations?.find((t) => t.languageCode === "ar");
    const enT = item.translations?.find((t) => t.languageCode === "en");
    form.linkAr = arT?.link || "";
    form.linkEn = enT?.link || "";
  }

  if (type === "fixedBanner") {
    form.imageUrl =
      item.imageUrl?.replace(/^https?:\/\/[^/]+\/uploads\//, "") || "";
    const arT = item.translations?.find((t) => t.languageCode === "ar");
    const enT = item.translations?.find((t) => t.languageCode === "en");
    form.titleAr = arT?.title || "";
    form.titleEn = enT?.title || "";
    form.linkAr = arT?.link || "";
    form.linkEn = enT?.link || "";
  }

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitForm = async () => {
  let result;

  if (modalType.value === "mainSlider") {
    const payload = {
      key: form.key,
      sectionOrder: form.sectionOrder,
      isActive: form.isActive,
      showInHome: form.showInHome,
      items: form.items.map((item) => ({
        imageUrl: item.imageUrl,
        order: item.order,
        translations: item.translations.filter((t) => t.title),
      })),
    };
    result = isEditing.value
      ? await store.updateMainSlider(editingId.value, payload)
      : await store.createMainSlider(payload);
  }

  if (modalType.value === "productSlider") {
    const payload = {
      key: form.key,
      sectionOrder: form.sectionOrder,
      isActive: form.isActive,
      showInHome: form.showInHome,
      productIds: form.productIds,
      translations: [
        { languageCode: "ar", title: form.titleAr },
        { languageCode: "en", title: form.titleEn },
      ].filter((t) => t.title),
    };
    result = isEditing.value
      ? await store.updateProductSlider(editingId.value, payload)
      : await store.createProductSlider(payload);
  }

  if (modalType.value === "fullImage") {
    const payload = {
      key: form.key,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
      showInHome: form.showInHome,
      translations: [
        { languageCode: "ar", link: form.linkAr },
        { languageCode: "en", link: form.linkEn },
      ].filter((t) => t.link),
    };
    result = isEditing.value
      ? await store.updateFullImage(editingId.value, payload)
      : await store.createFullImage(payload);
  }

  if (modalType.value === "fixedBanner") {
    const payload = {
      key: form.key,
      imageUrl: form.imageUrl,
      sectionOrder: form.sectionOrder,
      isActive: form.isActive,
      showInHome: form.showInHome,
      translations: [
        { languageCode: "ar", title: form.titleAr, link: form.linkAr },
        { languageCode: "en", title: form.titleEn, link: form.linkEn },
      ].filter((t) => t.title || t.link),
    };
    result = isEditing.value
      ? await store.updateFixedBanner(editingId.value, payload)
      : await store.createFixedBanner(payload);
  }

  if (modalType.value === "staticSection") {
    const payload = {
      key: form.key,
      sectionOrder: form.sectionOrder,
      isActive: form.isActive,
    };
    result = isEditing.value
      ? await store.updateStaticSection(editingId.value, payload)
      : await store.createStaticSection(payload);
  }

  if (result?.success) {
    closeModal();
    showToast(isEditing.value ? "تم التعديل بنجاح" : "تم الإنشاء بنجاح");
  } else {
    showToast("حدث خطأ، حاول مرة أخرى", "error");
  }
};

// ===== Delete =====
const deleteTarget = ref(null);

const confirmDelete = (type, item) => {
  deleteTarget.value = { type, item };
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  const { type, item } = deleteTarget.value;
  let result;

  if (type === "mainSlider") result = await store.deleteMainSlider(item.id);
  if (type === "productSlider")
    result = await store.deleteProductSlider(item.id);
  if (type === "fullImage") result = await store.deleteFullImage(item.id);
  if (type === "fixedBanner") result = await store.deleteFixedBanner(item.id);
  if (type === "staticSection")
    result = await store.deleteStaticSection(item.id);

  showToast(
    result?.success ? "تم الحذف بنجاح" : "فشل الحذف",
    result?.success ? "success" : "error",
  );
  deleteTarget.value = null;
};

// ===== Helpers =====
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ===== Product Picker Search (Updated to use allProducts) =====
const productSearch = ref("");

const filteredPickerProducts = computed(() => {
  // نستخدم allProducts إذا تم تحميلها، وإلا نعود للمخزن العام كاحتياط
  const sourceList = isAllProductsLoaded.value
    ? allProducts.value
    : productsStore.products;

  if (!productSearch.value.trim()) return sourceList;

  const q = productSearch.value.trim().toLowerCase();
  return sourceList.filter((p) => {
    // البحث المباشر في الترجمات لتجنب الاعتماد على دوال الـ Store الخارجية هنا
    const nameAr =
      p.translations?.find((t) => t.languageCode === "ar")?.name || "";
    const nameEn =
      p.translations?.find((t) => t.languageCode === "en")?.name || "";
    const slug = (p.slug || "").toLowerCase();

    return (
      nameAr.toLowerCase().includes(q) ||
      nameEn.toLowerCase().includes(q) ||
      slug.includes(q)
    );
  });
});

// ===== Mount =====
onMounted(async () => {
  await Promise.all([
    store.fetchMainSliders(),
    store.fetchProductSliders(),
    store.fetchFullImages(),
    store.fetchFixedBanners(),
    store.fetchStaticSections(),
    // تم إزالة productsStore.fetchProducts() من هنا لأننا نجلب الكل عند الحاجة فقط
  ]);
});
</script>

<style scoped>
.media-page {
  padding: 28px;
  min-height: 100vh;
  background: #f7f5f0;
  font-family: "Cairo", sans-serif;
  direction: rtl;
}

/* Header */
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
.header-badge {
  background: #f0e8d0;
  color: #987226;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

/* Tabs */
.tabs-bar {
  display: flex;
  gap: 6px;
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-bar::-webkit-scrollbar {
  display: none;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  font-family: "Cairo", sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #777;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.tab-btn:hover {
  background: #fdfaf4;
  color: #987226;
}
.tab-btn.active {
  background: #987226;
  color: #fff;
  box-shadow: 0 3px 10px rgba(152, 114, 38, 0.3);
}
.tab-icon {
  display: flex;
  align-items: center;
}
.tab-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}
.tab-btn:not(.active) .tab-count {
  background: #f0e8d0;
  color: #987226;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Toolbar */
.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #3a2e1a;
  margin: 0;
}

/* Add Button */
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
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover {
  background: #7a5b1e;
}

/* Loading */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.skeleton-card {
  height: 200px;
  border-radius: 14px;
  background: linear-gradient(90deg, #ede8df 25%, #e0d8c8 50%, #ede8df 75%);
  background-size: 200%;
  animation: shimmer 1.4s infinite;
}
.skeleton-card.tall {
  height: 260px;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

/* Media Card */
.media-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  position: relative;
}
.media-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Type Badges */
.card-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(6px);
}
.main-slider-badge {
  background: rgba(33, 150, 243, 0.15);
  color: #1565c0;
  border: 1px solid rgba(33, 150, 243, 0.2);
}
.product-slider-badge {
  background: rgba(152, 114, 38, 0.15);
  color: #987226;
  border: 1px solid rgba(152, 114, 38, 0.2);
}
.full-image-badge {
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.2);
}
.fixed-banner-badge {
  background: rgba(156, 39, 176, 0.15);
  color: #6a1b9a;
  border: 1px solid rgba(156, 39, 176, 0.2);
}

/* Slides Preview */
.slides-preview {
  background: #f0ebe0;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
.slides-strip {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.slide-thumb-wrap {
  position: relative;
  width: 72px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.slide-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.slide-order-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slides-more {
  width: 40px;
  height: 40px;
  background: #987226;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.no-slides {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #bbb;
  font-size: 12px;
}

/* Products Preview */
.products-preview {
  background: #f0ebe0;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
.products-strip {
  display: flex;
  gap: 6px;
  align-items: center;
}
.product-thumb-wrap {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.product-thumb-sm {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.products-more {
  width: 34px;
  height: 34px;
  background: #987226;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

/* Banner */
.banner-card {
}
.banner-img-wrap {
  position: relative;
  height: 130px;
  overflow: hidden;
}
.banner-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px 12px;
}
.overlay-title {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}
.overlay-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-family: monospace;
  text-decoration: none;
}
.overlay-link:hover {
  color: #fff;
}

/* Card Body */
.card-body {
  padding: 14px 16px 10px;
  flex: 1;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #2a2015;
  margin-bottom: 4px;
}
.card-key {
  font-family: monospace;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #777;
}
.card-flags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Flag Badges */
.flag-badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.flag-active {
  background: #e8f5e9;
  color: #2e7d32;
}
.flag-inactive {
  background: #ffebee;
  color: #c62828;
}
.flag-home {
  background: #e3f2fd;
  color: #1565c0;
}
.flag-hidden {
  background: #f5f5f5;
  color: #999;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid #f5f0e8;
}
.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
}
.edit-btn {
  background: #fff3e0;
  color: #e65100;
}
.edit-btn:hover {
  background: #ffe0b2;
}
.delete-btn {
  background: #ffebee;
  color: #c62828;
}
.delete-btn:hover {
  background: #ffcdd2;
}
.action-btn.sm {
  width: 32px;
  height: 32px;
  flex: none;
  padding: 0;
}

/* Empty / Error */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px;
  color: #bbb;
  font-size: 14px;
}
.error-state {
  text-align: center;
  padding: 48px;
  color: #888;
}
.btn-retry {
  margin-top: 10px;
  padding: 8px 20px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
}

/* Table */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.media-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.media-table thead {
  background: #faf6ee;
  border-bottom: 2px solid #f0e8d0;
}
.media-table th {
  padding: 14px 16px;
  font-weight: 700;
  color: #987226;
  text-align: right;
}
.media-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f0e8;
  vertical-align: middle;
}
.media-row:hover {
  background: #fdfaf4;
}
.key-badge {
  font-family: monospace;
  font-size: 13px;
  color: #555;
  background: #f5f0e8;
  padding: 3px 8px;
  border-radius: 6px;
}
.order-num {
  font-weight: 700;
  color: #987226;
  font-size: 16px;
}
.date-cell {
  color: #888;
  font-size: 13px;
}
.actions-row {
  display: flex;
  gap: 6px;
}
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px;
}

/* Modal */
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
  max-width: 680px;
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
  font-size: 19px;
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

/* Form */
.form-section {
  border: 1.5px solid #f0e8d0;
  border-radius: 12px;
  padding: 16px 20px 20px;
  margin-bottom: 16px;
  background: #fdfaf4;
}
.form-section legend {
  font-weight: 700;
  font-size: 13.5px;
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
  gap: 10px;
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
  font-size: 12.5px;
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
  resize: vertical;
}
.form-input:focus {
  border-color: #987226;
}
.form-hint {
  font-size: 12px;
  color: #aaa;
  margin: 4px 0;
}
.form-checks-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: #444;
}
.check-input {
  width: 16px;
  height: 16px;
  accent-color: #987226;
  cursor: pointer;
}

/* Slide Form */
.slide-form-block {
  border: 1.5px solid #e8e0cf;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fff;
}
.slide-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 13px;
  color: #666;
}
.btn-remove-sm {
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-weight: 700;
}
.lang-block-sm {
  margin-top: 12px;
  padding: 10px;
  background: #fdfaf4;
  border-radius: 8px;
  border: 1px solid #f0e8d0;
}
.lang-mini-title {
  font-size: 12px;
  font-weight: 700;
  color: #888;
  margin-bottom: 8px;
}
.btn-add-inline {
  margin-right: auto;
  padding: 4px 12px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: "Cairo", sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.empty-hint {
  text-align: center;
  color: #bbb;
  padding: 12px;
  font-size: 13px;
}

/* Form Actions */
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
  font-size: 14px;
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
  font-size: 14px;
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
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Confirm Delete */
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
  font-size: 19px;
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
.btn-spinner.dark {
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: #fff;
}

/* Toast */
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

/* Product Picker */
.products-picker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  background: #fff;
  border: 1.5px solid #e8e0cf;
  border-radius: 8px;
}
.picker-product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
  user-select: none;
}
.picker-product-item:hover {
  background: #fdfaf4;
}
.picker-product-item.selected {
  background: #fef9ee;
  border-color: #987226;
}
.picker-thumb {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #f0e8d0;
  flex-shrink: 0;
}
.picker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.picker-name {
  font-size: 13px;
  font-weight: 600;
  color: #2a2015;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.picker-slug {
  font-size: 11px;
  color: #aaa;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.picker-check-icon {
  color: #987226;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
}
.selected-count {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #987226;
}
</style>

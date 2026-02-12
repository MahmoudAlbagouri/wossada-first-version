<template>
  <!-- Overlay القائمة المحمولة -->
  <TheMobileNavOverlay
    v-if="isMobileValue"
    :mobile-menu-open="mobileMenuOpen"
    @close="closeMobileMenu"
  />

  <!-- Overlay البحث -->
  <div
    v-if="searchPopupOpen"
    class="search-overlay"
    @click="closeSearchPopup"
  ></div>

  <!-- Popup البحث -->
  <TheSearchPopup
    v-if="searchPopupOpen"
    :search-query="searchQuery"
    :search-input-ref="searchInputRef"
    @update:search-query="searchQuery = $event"
    @close="closeSearchPopup"
    @perform-search="performSearch"
  />

  <header class="main-header">
    <!-- الشريط العلوي -->
    <TheTopBar />

    <!-- Smart Nav -->
    <div
      :class="[
        'smart-nav-wrapper',
        { 'is-hidden': isHidden, 'is-sticky': isSticky },
      ]"
    >
      <div class="middle-bar">
        <div class="container">
          <div class="nav-content">
            <!-- أيقونات الإجراءات - شاشات كبيرة -->
            <TheDesktopActionIcons v-if="!isMobileValue" />

            <!-- حقل البحث - شاشات كبيرة -->
            <div v-if="!isMobileValue" class="search-container">
              <input
                type="text"
                placeholder="بحث ......"
                class="search-input"
              />
              <Icon name="ph:magnifying-glass-light" class="search-icon" />
            </div>

            <!-- أيقونة البحث - شاشات صغيرة -->
            <button
              v-if="isMobileValue"
              @click="openSearchPopup"
              class="search-icon-mobile"
              aria-label="بحث"
            >
              <Icon name="ph:magnifying-glass" class="search-icon-mobile-svg" />
            </button>

            <!-- الشعار وزر القائمة -->
            <div class="logo-section">
              <NuxtLink to="/">
                <div class="image">
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    class="logo-icon"
                    loading="eager"
                    fetchpriority="high"
                  />
                </div>
              </NuxtLink>
              <button
                v-if="isMobileValue"
                @click="toggleMobileMenu"
                class="menu-toggle-btn"
                aria-label="قائمة التنقل"
              >
                <Icon name="ph:list" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- القائمة الرئيسية - سطح المكتب -->

      <TheDesktopNav v-if="!isMobileValue" />
    </div>

    <!-- أيقونات الجوال السفلية -->
    <TheMobileActionIcons v-if="isMobileValue" />
  </header>
  <!-- القائمة الرئيسية - الجوال -->
  <TheMobileNav
    v-if="isMobileValue"
    :mobile-menu-open="mobileMenuOpen"
    :active-accordion="activeAccordion"
    :active-sub-accordion="activeSubAccordion"
    @toggle-accordion="toggleAccordion"
    @toggle-sub-accordion="toggleSubAccordion"
    @close-mobile-menu="closeMobileMenu"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useBreakpoints } from "@vueuse/core";
import TheTopBar from "@/components/header/TheTopBar.vue";
import TheDesktopNav from "@/components/header/TheDesktopNav.vue";
import TheMobileNav from "@/components/header/TheMobileNav.vue";
import TheSearchPopup from "@/components/header/TheSearchPopup.vue";
import TheDesktopActionIcons from "@/components/header/TheDesktopActionIcons.vue";
import TheMobileActionIcons from "@/components/header/TheMobileActionIcons.vue";
import TheMobileNavOverlay from "@/components/header/TheMobileNavOverlay.vue";

// 1. تعريف المتغيرات
const isSticky = ref(false);
const isHidden = ref(false);
const isMounted = ref(false);
const mobileMenuOpen = ref(false);
const activeAccordion = ref(null);
const activeSubAccordion = ref(null);
const searchPopupOpen = ref(false);
const searchQuery = ref("");
const searchInputRef = ref(null);
let lastScrollPosition = 0;

// 2. إدارة نقاط التوقف
const customBreakpoints = {
  mobile: 870,
  tablet: 1024,
  desktop: 1280,
};
const breakpoints = useBreakpoints(customBreakpoints);
const isMobileDevice = breakpoints.smaller("mobile");

// 3. تعديل منطق الحساب ليعمل بتوافق مع SSR
const isMobileValue = computed(() => {
  if (!isMounted.value) return false;
  return isMobileDevice.value;
});

// 4. دالة التمرير المحسنة
const handleScroll = () => {
  if (typeof window === "undefined") return;
  const currentScrollPosition = window.scrollY;
  isSticky.value = currentScrollPosition > 45;
  if (
    currentScrollPosition > lastScrollPosition &&
    currentScrollPosition > 150
  ) {
    isHidden.value = true;
  } else if (currentScrollPosition < lastScrollPosition) {
    isHidden.value = false;
  }
  lastScrollPosition = currentScrollPosition;
};

// 5. دوال القائمة المحمولة
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  activeAccordion.value = null;
  activeSubAccordion.value = null;
  document.body.style.overflow = "";
};

const toggleAccordion = (category) => {
  if (activeAccordion.value === category) {
    activeAccordion.value = null;
    activeSubAccordion.value = null;
  } else {
    activeAccordion.value = category;
    activeSubAccordion.value = null;
  }
};

const toggleSubAccordion = (subcategory) => {
  activeSubAccordion.value =
    activeSubAccordion.value === subcategory ? null : subcategory;
};

// 6. دوال البحث
const openSearchPopup = () => {
  searchPopupOpen.value = true;
  document.body.style.overflow = "hidden";
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  });
};

const closeSearchPopup = () => {
  searchPopupOpen.value = false;
  searchQuery.value = "";
  document.body.style.overflow = "";
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    console.log("بحث عن:", searchQuery.value);
    closeSearchPopup();
  }
};

// 7. دورة الحياة
onMounted(() => {
  isMounted.value = true;
  window.addEventListener("scroll", handleScroll, { passive: true });

  const handleClickOutside = (event) => {
    if (
      mobileMenuOpen.value &&
      !event.target.closest(".mobile-menu") &&
      !event.target.closest(".menu-toggle-btn")
    ) {
      closeMobileMenu();
    }
    if (
      searchPopupOpen.value &&
      !event.target.closest(".search-popup") &&
      !event.target.closest(".search-icon-mobile")
    ) {
      closeSearchPopup();
    }
  };

  const handleEscapeKey = (event) => {
    if (event.key === "Escape") {
      if (searchPopupOpen.value) closeSearchPopup();
      if (mobileMenuOpen.value) closeMobileMenu();
    }
  };

  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.body.style.overflow = "";
});
</script>

<style scoped lang="scss">
/* نفس الـ CSS الموجود في الملف الأصلي بالكامل */
.smart-nav-wrapper {
  width: 100%;
  transition: transform 0.3s ease-in-out;
  will-change: transform;
}
.is-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--bg-body);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.is-sticky.is-hidden {
  transform: translateY(-100%);
}
.main-header {
  background-color: var(--bg-body);
  box-shadow: var(--shadow-1);
  transition: all 0.3s ease;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
}
.bar-content,
.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.middle-bar {
  background-color: var(--color-green-white);
  padding: 10px 0;
  border-bottom: 1px solid var(--color-green-light-active);
}
.menu-toggle-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-green-primary);
  font-size: 28px;
}
@media (max-width: 870px) {
  .menu-toggle-btn {
    display: block;
  }
}
.search-container {
  position: relative;
  width: 45%;
}
.search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  padding-right: 50px;
  border: 1.5px solid var(--color-green-primary);
  border-radius: 30px;
  background-color: transparent;
  text-align: right;
  outline: none;
  font-size: 15px;
  transition: box-shadow 0.3s;
}
.search-input:focus {
  box-shadow: 0 0 8px var(--color-green-light-active);
}
.search-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-green-primary);
  font-size: 22px;
}
.search-icon-mobile {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--color-green-primary);
  font-size: 28px;
  transition: transform 0.2s;
}
.search-icon-mobile:hover {
  transform: scale(1.1);
}
.search-icon-mobile-svg {
  font-size: 28px;
}
@media (max-width: 870px) {
  .search-icon-mobile {
    display: block;
  }
  .search-container {
    display: none;
  }
}
.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--color-green-primary);
}
.logo-section img {
  width: 250px;
}
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 2100;
  cursor: pointer;
}

.search-overlay {
  opacity: 1;
  visibility: visible;
}
</style>

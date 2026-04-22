<template>
  <div class="top-bar">
    <div class="container">
      <div class="bar-content">
        <div class="social-links">
          <Icon name="ph:whatsapp-logo" />
          <Icon name="ph:youtube-logo" />
          <Icon name="ph:snapchat-logo" />
          <Icon name="ph:linkedin-logo" />
          <Icon name="ph:instagram-logo" />
          <Icon name="ph:facebook-logo" />
          <Icon name="ph:x-logo" />
        </div>

        <p class="promo-text">{{ $t("promo_text") }}</p>

        <client-only>
          <div class="language-dropdown" ref="dropdownTarget">
            <div
              class="selected-lang"
              @click="toggleDropdown"
              role="button"
              tabindex="0"
              @keydown.enter="toggleDropdown"
            >
              <Icon name="ph:globe-light" class="icon-sm" />
              <span class="lang-text">
                {{ currentLang === "ar" ? "العربية" : "English" }}
              </span>
              <Icon
                name="ph:caret-down"
                class="chevron"
                :class="{ rotate: isOpen }"
              />
            </div>

            <transition name="slide-fade">
              <ul v-if="isOpen" class="dropdown-menu">
                <li
                  @click="changeLang('ar')"
                  :class="{ active: currentLang === 'ar' }"
                >
                  <Icon name="circle-flags:sa" class="flag-icon" />
                  العربية
                  <Icon
                    v-if="currentLang === 'ar'"
                    name="ph:check-bold"
                    class="check-mark"
                  />
                </li>
                <li
                  @click="changeLang('en')"
                  :class="{ active: currentLang === 'en' }"
                >
                  <Icon name="circle-flags:us" class="flag-icon" />
                  English
                  <Icon
                    v-if="currentLang === 'en'"
                    name="ph:check-bold"
                    class="check-mark"
                  />
                </li>
              </ul>
            </transition>
          </div>

          <template #placeholder>
            <div class="language-selector-placeholder">
              <Icon name="ph:circle-notch" class="spinner" />
            </div>
          </template>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onClickOutside } from "@vueuse/core";

// استخدام الـ Composable الخاص بك
const { currentLang, setLanguage, initLanguage } = useLanguage();

const isOpen = ref(false);
const dropdownTarget = ref(null);

// إغلاق القائمة عند الضغط خارجها
onClickOutside(dropdownTarget, () => {
  isOpen.value = false;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const changeLang = (lang) => {
  if (lang !== currentLang.value) {
    setLanguage(lang);
  }
  isOpen.value = false;
};

// تهيئة اللغة عند التحميل
onMounted(() => {
  initLanguage();
});
</script>

<style scoped lang="scss">
.top-bar {
  background-color: var(--color-green-primary, #059669);
  color: white;
  padding: 6px 0;
  font-size: 14px;
  position: relative;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* تصميم الـ Dropdown */
.language-dropdown {
  position: relative;
  user-select: none;

  .selected-lang {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 2px 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .lang-text {
      font-weight: 600;
      font-size: 12px;
    }

    .chevron {
      font-size: 12px;
      transition: transform 0.3s ease;
      &.rotate {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0; // سيتأثر بالـ RTL تلقائياً
    background: white;
    color: #333;
    min-width: 150px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 8px;
    margin: 0;
    overflow: hidden;

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;

      &:hover {
        background: #f3f4f6;
      }

      &.active {
        color: var(--color-green-primary, #059669);
        background: #ecfdf5;
      }

      .flag-icon {
        font-size: 18px;
      }

      .check-mark {
        margin-right: auto; // يضع علامة الصح في الطرف الآخر
        font-size: 12px;
      }
    }
  }
}

/* الأيقونات والروابط الاجتماعية */
.social-links {
  display: flex;
  gap: 15px;
  font-size: 18px;
  @media (max-width: 768px) {
    display: none;
  }
  svg {
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-2px);
    }
  }
}

.promo-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  @media (max-width: 992px) {
    display: none;
  }
}

/* الأنميشن */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.spinner {
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
</style>

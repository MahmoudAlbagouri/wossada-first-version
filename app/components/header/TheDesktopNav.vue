<template>
  <nav class="bottom-nav">
    <div class="container">
      <div class="menu-links">
        <div
          v-if="categoryStore.loading && categoryStore.categories.length === 0"
          class="desktop-menu"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="skeleton-item"
            style="margin: 0 10px"
          ></div>
        </div>

        <div v-else class="desktop-menu">
          <NuxtLink to="/" class="nav-link">{{
            $t("all_products") || "كل المنتجات"
          }}</NuxtLink>

          <div
            v-for="category in topLevelCategories"
            :key="category.id"
            class="dropdown-menu"
            @mouseenter="activeCategory = category.id"
            @mouseleave="activeCategory = null"
          >
            <div
              class="menu-trigger"
              :class="{ 'is-active': activeCategory === category.id }"
            >
              <span>{{
                categoryStore.getCategoryName(category, currentLang)
              }}</span>
              <Icon name="ph:caret-down" class="chevron" />
            </div>

            <transition name="fade-slide">
              <div
                v-if="activeCategory === category.id"
                class="dropdown-content"
              >
                <div class="submenu-container">
                  <div class="submenu-header">
                    <h3>
                      {{ categoryStore.getCategoryName(category, currentLang) }}
                    </h3>
                    <button @click="activeCategory = null" class="close-btn">
                      <Icon name="ph:x" />
                    </button>
                  </div>

                  <div class="submenu-grid">
                    <template
                      v-if="category.children && category.children.length > 0"
                    >
                      <NuxtLink
                        v-for="child in category.children"
                        :key="child.id"
                        :to="`/category/${child.slug}`"
                        class="category-item"
                        @click="activeCategory = null"
                      >
                        <div class="category-icon">
                          <Icon name="ph:folder" />
                        </div>
                        <span>{{
                          categoryStore.getCategoryName(child, currentLang)
                        }}</span>
                      </NuxtLink>
                    </template>

                    <div v-else class="submenu-column">
                      <NuxtLink
                        :to="`/category/${category.slug}`"
                        class="category-item primary"
                        @click="activeCategory = null"
                      >
                        <div class="category-icon">
                          <Icon name="ph:eye" />
                        </div>
                        <span>{{ $t("view_all") || "عرض الكل" }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useCategoryStore } from "@/stores/category";
import { ref, computed, watch } from "vue";

const categoryStore = useCategoryStore();
const { currentLang } = useLanguage();
const activeCategory = ref(null);

// الجلب الأولي
await useAsyncData("categories-init", () => categoryStore.fetchCategories(), {
  lazy: true,
});

// ✅ راقب تغيير اللغة وأعد الجلب يدوياً
watch(currentLang, async (newLang) => {
  console.log("🔄 اللغة اتغيرت:", newLang);
  await categoryStore.fetchCategories(newLang);
  console.log("✅ الكاتجوري اتحدثت:", categoryStore.categories);
});

// ✅ computed مباشرة من الستور بدل storeToRefs
const topLevelCategories = computed(() => {
  return categoryStore.categories.filter((cat) => !cat.parentId);
});
</script>

<style scoped lang="scss">
.bottom-nav {
  background-color: var(--color-green-white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 60px;
  display: flex;
  align-items: center;
}
.menu-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
}
.desktop-menu {
  display: flex;
  align-items: center;
  position: relative;
}
.skeleton-item {
  width: 100px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}
@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (max-width: 870px) {
  .desktop-menu {
    display: none;
  }
}
.menu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 18px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  &.is-active {
    background-color: var(--color-green-light-active);
    color: var(--color-green-primary);
    .chevron {
      transform: rotate(180deg);
    }
  }
  &:hover {
    background-color: var(--color-green-light-active);
    color: var(--color-green-primary);
  }
}
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-body, #fff);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: auto;
  min-width: 600px;
  max-width: 1200px;
  z-index: 1001;
  margin-top: 10px;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
.submenu-container {
  padding: 25px;
}
.submenu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-green-primary);
}
.submenu-header h3 {
  color: var(--color-green-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 18px;
  display: flex;
}
.submenu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}
.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  &:hover {
    background-color: var(--color-green-light-active);
    color: var(--color-green-primary);
    border-color: var(--color-green-primary);
  }
}
.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-green-primary);
}
.nav-link {
  text-decoration: none;
  color: inherit;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: 0.3s;
  &:hover {
    background-color: var(--color-green-light-active);
    color: var(--color-green-primary);
  }
}
.chevron {
  font-size: 12px;
  transition: transform 0.3s ease;
}
</style>

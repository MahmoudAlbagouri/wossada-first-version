<template>
  <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <button
      @click="closeMobileMenu"
      class="mobile-menu-close-btn"
      aria-label="إغلاق القائمة"
    >
      <Icon name="ph:x" class="close-icon" />
    </button>

    <div class="mobile-menu-content">
      <NuxtLink to="/" class="mobile-nav-link" @click="closeMobileMenu">
        كل المنتجات
      </NuxtLink>

      <div
        v-for="category in topLevelCategories"
        :key="category.id"
        class="mobile-accordion-item"
      >
        <button
          class="mobile-accordion-header"
          @click="toggleAccordion(category.id)"
        >
          <span>{{ getCategoryName(category) }}</span>
          <Icon
            :name="
              activeAccordion === category.id ? 'ph:caret-up' : 'ph:caret-down'
            "
            class="accordion-icon"
          />
        </button>

        <div
          v-show="activeAccordion === category.id"
          class="mobile-accordion-content"
        >
          <!-- إذا كان هناك أبناء -->
          <template v-if="category.children && category.children.length > 0">
            <NuxtLink
              v-for="child in category.children"
              :key="child.id"
              :to="`/category/${child.slug}`"
              class="mobile-submenu-link"
              @click="closeMobileMenu"
            >
              {{ getCategoryName(child) }}
            </NuxtLink>
          </template>

          <!-- إذا لم يكن هناك أبناء -->
          <template v-else>
            <NuxtLink
              :to="`/category/${category.slug}`"
              class="mobile-submenu-link"
              @click="closeMobileMenu"
            >
              عرض الكل
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCategoryStore } from "@/stores/category";
import { computed, onMounted } from "vue";

const props = defineProps({
  mobileMenuOpen: Boolean,
  activeAccordion: String,
});

const emit = defineEmits(["close-mobile-menu", "toggle-accordion"]);

const categoryStore = useCategoryStore();
const getCategoryName = (cat) => categoryStore.getCategoryName(cat);

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
});

const topLevelCategories = computed(() => categoryStore.topLevelCategories);

const closeMobileMenu = () => emit("close-mobile-menu");
const toggleAccordion = (catId) => emit("toggle-accordion", catId);
</script>

<style scoped lang="scss">
/* نفس الـ Styles السابقة */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 320px;
  height: 100vh;
  background-color: var(--bg-body);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 2000;
  overflow-y: auto;
  padding: 20px;
}
.mobile-menu-open {
  right: 0;
}
.mobile-menu-close-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--color-green-primary);
  font-size: 28px;
  z-index: 10;
}
.close-icon {
  font-size: 28px;
}
.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 40px;
}
.mobile-nav-link,
.mobile-submenu-link {
  display: block;
  color: var(--text-main);
  text-decoration: none;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 16px;
}
.mobile-nav-link:hover,
.mobile-submenu-link:hover {
  background-color: var(--color-green-light-active);
  color: var(--color-green-primary);
  transform: translateX(5px);
}
.mobile-accordion-item {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.mobile-accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--color-green-primary);
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: white;
  transition: background-color 0.3s;
}
.mobile-accordion-header:hover {
  background-color: var(--color-green-dark);
}
.mobile-accordion-content {
  background-color: var(--color-green-white);
  padding: 10px 0;
  border: 1px solid var(--color-green-light-active);
  border-radius: 0 0 8px 8px;
}
.mobile-submenu-link {
  padding: 12px 25px;
  font-size: 14px;
  color: var(--text-main);
  display: block;
  text-decoration: none;
  transition: all 0.3s;
  &:hover {
    background-color: var(--color-green-light-active);
    color: var(--color-green-primary);
    padding-left: 30px;
  }
}
.accordion-icon {
  font-size: 20px;
  transition: transform 0.3s;
}
</style>

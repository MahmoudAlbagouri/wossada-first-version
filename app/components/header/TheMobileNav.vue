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

      <!-- الأثاث -->
      <div class="mobile-accordion-item">
        <button
          class="mobile-accordion-header"
          @click="toggleAccordion('furniture')"
        >
          <span>الأثاث</span>
          <Icon
            :name="
              activeAccordion === 'furniture' ? 'ph:caret-up' : 'ph:caret-down'
            "
            class="accordion-icon"
          />
        </button>
        <div
          v-show="activeAccordion === 'furniture'"
          class="mobile-accordion-content"
        >
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('living-room')"
            >
              <span>أثاث المعيشة</span>
              <Icon
                :name="
                  activeSubAccordion === 'living-room'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'living-room'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/sofas"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >كنب</NuxtLink
              >
              <NuxtLink
                to="/category/chairs"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >كراسي</NuxtLink
              >
              <NuxtLink
                to="/category/tables"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >طاولات</NuxtLink
              >
              <NuxtLink
                to="/category/tv-units"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >وحدات تلفزيون</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('bedroom')"
            >
              <span>أثاث النوم</span>
              <Icon
                :name="
                  activeSubAccordion === 'bedroom'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'bedroom'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/beds"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >أسرة</NuxtLink
              >
              <NuxtLink
                to="/category/wardrobes"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >خزائن ملابس</NuxtLink
              >
              <NuxtLink
                to="/category/nightstands"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >طاولات سرير</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('kitchen')"
            >
              <span>أثاث المطابخ</span>
              <Icon
                :name="
                  activeSubAccordion === 'kitchen'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'kitchen'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/kitchen-cabinets"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >خزائن مطابخ</NuxtLink
              >
              <NuxtLink
                to="/category/dining-sets"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >مجموعات طعام</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>

      <!-- المفروشات -->
      <div class="mobile-accordion-item">
        <button
          class="mobile-accordion-header"
          @click="toggleAccordion('furnishings')"
        >
          <span>مفروشات</span>
          <Icon
            :name="
              activeAccordion === 'furnishings'
                ? 'ph:caret-up'
                : 'ph:caret-down'
            "
            class="accordion-icon"
          />
        </button>
        <div
          v-show="activeAccordion === 'furnishings'"
          class="mobile-accordion-content"
        >
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('rugs')"
            >
              <span>السجاد</span>
              <Icon
                :name="
                  activeSubAccordion === 'rugs'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'rugs'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/rugs"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >سجاد</NuxtLink
              >
              <NuxtLink
                to="/category/carpets"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >بسط</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('curtains')"
            >
              <span>الستائر</span>
              <Icon
                :name="
                  activeSubAccordion === 'curtains'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'curtains'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/curtains"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >ستائر</NuxtLink
              >
              <NuxtLink
                to="/category/blinds"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >ستائر خشبية</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('cushions')"
            >
              <span>الوسائد</span>
              <Icon
                :name="
                  activeSubAccordion === 'cushions'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'cushions'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/cushions"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >وسائد ديكور</NuxtLink
              >
              <NuxtLink
                to="/category/pillows"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >وسائد سرير</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>

      <!-- الديكور -->
      <div class="mobile-accordion-item">
        <button
          class="mobile-accordion-header"
          @click="toggleAccordion('decor')"
        >
          <span>ديكور</span>
          <Icon
            :name="
              activeAccordion === 'decor' ? 'ph:caret-up' : 'ph:caret-down'
            "
            class="accordion-icon"
          />
        </button>
        <div
          v-show="activeAccordion === 'decor'"
          class="mobile-accordion-content"
        >
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('frames')"
            >
              <span>إطارات وصور</span>
              <Icon
                :name="
                  activeSubAccordion === 'frames'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'frames'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/frames"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >إطارات</NuxtLink
              >
              <NuxtLink
                to="/category/wall-art"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >فن جداري</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('accessories')"
            >
              <span>إكسسوارات</span>
              <Icon
                :name="
                  activeSubAccordion === 'accessories'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'accessories'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/vases"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >مزهريات</NuxtLink
              >
              <NuxtLink
                to="/category/decorative-items"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >قطع ديكور</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>

      <!-- الإضاءة -->
      <div class="mobile-accordion-item">
        <button
          class="mobile-accordion-header"
          @click="toggleAccordion('lighting')"
        >
          <span>إضاءة</span>
          <Icon
            :name="
              activeAccordion === 'lighting' ? 'ph:caret-up' : 'ph:caret-down'
            "
            class="accordion-icon"
          />
        </button>
        <div
          v-show="activeAccordion === 'lighting'"
          class="mobile-accordion-content"
        >
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('ceiling-lights')"
            >
              <span>إضاءة السقف</span>
              <Icon
                :name="
                  activeSubAccordion === 'ceiling-lights'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'ceiling-lights'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/ceiling-lights"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >ثريات</NuxtLink
              >
              <NuxtLink
                to="/category/pendant-lights"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >إضاءة معلقة</NuxtLink
              >
            </div>
          </div>
          <div class="mobile-sub-accordion-item">
            <button
              class="mobile-sub-accordion-header"
              @click="toggleSubAccordion('table-lamps')"
            >
              <span>إضاءة الطاولات</span>
              <Icon
                :name="
                  activeSubAccordion === 'table-lamps'
                    ? 'ph:caret-up'
                    : 'ph:caret-down'
                "
                class="accordion-icon"
              />
            </button>
            <div
              v-show="activeSubAccordion === 'table-lamps'"
              class="mobile-sub-accordion-content"
            >
              <NuxtLink
                to="/category/table-lamps"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >مصابيح طاولات</NuxtLink
              >
              <NuxtLink
                to="/category/floor-lamps"
                class="mobile-submenu-link"
                @click="closeMobileMenu"
                >مصابيح أرضية</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mobileMenuOpen: Boolean,
  activeAccordion: String,
  activeSubAccordion: String,
});

const emit = defineEmits([
  "close-mobile-menu",
  "toggle-accordion",
  "toggle-sub-accordion",
]);

const closeMobileMenu = () => emit("close-mobile-menu");
const toggleAccordion = (cat) => emit("toggle-accordion", cat);
const toggleSubAccordion = (sub) => emit("toggle-sub-accordion", sub);
</script>

<style scoped lang="scss">
/* نفس الأنماط السابقة بدون تغيير */
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
.mobile-accordion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
.mobile-sub-accordion-item {
  border-radius: 8px;
  overflow: hidden;
  margin: 5px 0;
  border-left: 3px solid var(--color-green-primary);
}
.mobile-sub-accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: var(--color-green-light-active);
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  transition: background-color 0.3s;
}
.mobile-sub-accordion-header:hover {
  background-color: var(--color-green-light-hover);
}
.mobile-sub-accordion-content {
  background-color: var(--color-green-white);
  padding: 8px 0;
}
.mobile-submenu-link {
  padding: 10px 25px;
  font-size: 13px;
  margin: 2px 0;
}
.accordion-icon {
  font-size: 20px;
  transition: transform 0.3s;
}
</style>

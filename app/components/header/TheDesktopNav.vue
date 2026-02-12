<template>
  <nav class="bottom-nav">
    <div class="container">
      <div class="menu-links">
        <div class="desktop-menu">
          <NuxtLink to="/" class="nav-link">كل المنتجات</NuxtLink>

          <!-- قائمة الأثاث -->
          <div class="dropdown-menu">
            <div class="menu-trigger">
              <span>الأثاث</span>
              <Icon name="ph:caret-down" class="chevron" />
            </div>
            <div class="dropdown-content">
              <div class="submenu-grid">
                <div class="submenu-column">
                  <h4>أثاث المعيشة</h4>
                  <NuxtLink to="/category/sofas" class="submenu-link"
                    >كنب</NuxtLink
                  >
                  <NuxtLink to="/category/chairs" class="submenu-link"
                    >كراسي</NuxtLink
                  >
                  <NuxtLink to="/category/tables" class="submenu-link"
                    >طاولات</NuxtLink
                  >
                  <NuxtLink to="/category/tv-units" class="submenu-link"
                    >وحدات تلفزيون</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>أثاث النوم</h4>
                  <NuxtLink to="/category/beds" class="submenu-link"
                    >أسرة</NuxtLink
                  >
                  <NuxtLink to="/category/wardrobes" class="submenu-link"
                    >خزائن ملابس</NuxtLink
                  >
                  <NuxtLink to="/category/nightstands" class="submenu-link"
                    >طاولات سرير</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>أثاث المطابخ</h4>
                  <NuxtLink to="/category/kitchen-cabinets" class="submenu-link"
                    >خزائن مطابخ</NuxtLink
                  >
                  <NuxtLink to="/category/dining-sets" class="submenu-link"
                    >مجموعات طعام</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- قائمة المفروشات -->
          <div class="dropdown-menu">
            <div class="menu-trigger">
              <span>مفروشات</span>
              <Icon name="ph:caret-down" class="chevron" />
            </div>
            <div class="dropdown-content">
              <div class="submenu-grid">
                <div class="submenu-column">
                  <h4>السجاد</h4>
                  <NuxtLink to="/category/rugs" class="submenu-link"
                    >سجاد</NuxtLink
                  >
                  <NuxtLink to="/category/carpets" class="submenu-link"
                    >بسط</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>الستائر</h4>
                  <NuxtLink to="/category/curtains" class="submenu-link"
                    >ستائر</NuxtLink
                  >
                  <NuxtLink to="/category/blinds" class="submenu-link"
                    >ستائر خشبية</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>الوسائد</h4>
                  <NuxtLink to="/category/cushions" class="submenu-link"
                    >وسائد ديكور</NuxtLink
                  >
                  <NuxtLink to="/category/pillows" class="submenu-link"
                    >وسائد سرير</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- قائمة الديكور -->
          <div class="dropdown-menu">
            <div class="menu-trigger">
              <span>ديكور</span>
              <Icon name="ph:caret-down" class="chevron" />
            </div>
            <div class="dropdown-content">
              <div class="submenu-grid">
                <div class="submenu-column">
                  <h4>إطارات وصور</h4>
                  <NuxtLink to="/category/frames" class="submenu-link"
                    >إطارات</NuxtLink
                  >
                  <NuxtLink to="/category/wall-art" class="submenu-link"
                    >فن جداري</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>إكسسوارات</h4>
                  <NuxtLink to="/category/vases" class="submenu-link"
                    >مزهريات</NuxtLink
                  >
                  <NuxtLink to="/category/decorative-items" class="submenu-link"
                    >قطع ديكور</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- قائمة الإضاءة -->
          <div class="dropdown-menu">
            <div class="menu-trigger">
              <span>إضاءة</span>
              <Icon name="ph:caret-down" class="chevron" />
            </div>
            <div class="dropdown-content">
              <div class="submenu-grid">
                <div class="submenu-column">
                  <h4>إضاءة السقف</h4>
                  <NuxtLink to="/category/ceiling-lights" class="submenu-link"
                    >ثريات</NuxtLink
                  >
                  <NuxtLink to="/category/pendant-lights" class="submenu-link"
                    >إضاءة معلقة</NuxtLink
                  >
                </div>
                <div class="submenu-column">
                  <h4>إضاءة الطاولات</h4>
                  <NuxtLink to="/category/table-lamps" class="submenu-link"
                    >مصابيح طاولات</NuxtLink
                  >
                  <NuxtLink to="/category/floor-lamps" class="submenu-link"
                    >مصابيح أرضية</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
/* نفس الأنماط السابقة بدون تغيير */
.bottom-nav {
  background-color: var(--color-green-white);
}
.menu-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}
.desktop-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}
@media (max-width: 870px) {
  .desktop-menu {
    display: none;
  }
}
.menu-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 8px;
  transition: background-color 0.3s;
  font-size: 14px;
  font-weight: 600;
}
.menu-trigger:hover {
  background-color: var(--color-green-light-active);
}
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 50%;
  background-color: var(--bg-body);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  min-width: 800px;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(0);
  transition: all 0.3s ease;
  z-index: 1001;
}
.dropdown-menu:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%);
}
.submenu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.submenu-column h4 {
  color: var(--color-green-primary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-green-primary);
}
.submenu-link {
  display: block;
  color: var(--text-main);
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.3s;
  font-size: 14px;
}
.submenu-link:hover {
  color: var(--color-green-primary);
  transform: translateX(5px);
}
.nav-link,
.menu-item {
  text-decoration: none;
  color: var(--text-main);
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.3s;
}
.nav-link:hover,
.menu-item:hover {
  color: var(--color-green-primary);
}
.chevron {
  font-size: 14px;
  color: var(--text-muted);
}
</style>

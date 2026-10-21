<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
const { brandName, logo } = useBrand();
const sidebarOpen = ref(false);

interface NavLink {
  to: string;
  icon: string;
  label: string;
  exact?: boolean;
}

/** Back-office navigation (Arabic only). */
const groups: { title: string; links: NavLink[] }[] = [
  {
    title: 'عام',
    links: [{ to: '/admin', icon: 'ph:squares-four', label: 'الرئيسية', exact: true }],
  },
  {
    title: 'المبيعات',
    links: [
      { to: '/admin/orders', icon: 'ph:receipt', label: 'الطلبات' },
      { to: '/admin/coupons', icon: 'ph:ticket', label: 'كوبونات الخصم' },
      { to: '/admin/users', icon: 'ph:users-three', label: 'المستخدمون' },
    ],
  },
  {
    title: 'الكتالوج',
    links: [
      { to: '/admin/products', icon: 'ph:armchair', label: 'المنتجات' },
      { to: '/admin/category', icon: 'ph:tree-structure', label: 'الأقسام' },
      { to: '/admin/brands', icon: 'ph:seal-check', label: 'الماركات' },
      { to: '/admin/colors', icon: 'ph:palette', label: 'الألوان' },
      { to: '/admin/sizes', icon: 'ph:ruler', label: 'المقاسات' },
      { to: '/admin/materials', icon: 'ph:tree', label: 'الخامات' },
    ],
  },
  {
    title: 'المتجر',
    links: [
      { to: '/admin/home', icon: 'ph:layout', label: 'الصفحة الرئيسية' },
      { to: '/admin/sliders-banners', icon: 'ph:images', label: 'السلايدر والبانرات' },
      { to: '/admin/shipping', icon: 'ph:truck', label: 'الشحن والمحافظات' },
    ],
  },
];

const isActive = (to: string, exact?: boolean) => (exact ? route.path === to : route.path.startsWith(to));
const current = computed(() => groups.flatMap((g) => g.links).find((l) => isActive(l.to, l.exact)));

watch(() => route.fullPath, () => (sidebarOpen.value = false));

useHead({
  titleTemplate: (title?: string) => (title ? `${title} | لوحة التحكم` : 'لوحة التحكم'),
  htmlAttrs: { lang: 'ar', dir: 'rtl' },
});

async function logout() {
  await auth.logout();
  await navigateTo('/login');
}
</script>

<template>
  <div class="admin" dir="rtl" lang="ar">
    <aside class="admin__sidebar" :class="{ 'is-open': sidebarOpen }">
      <NuxtLink to="/admin" class="admin__brand">
        <img :src="logo" :alt="brandName" width="110" height="40" />
        <span>لوحة التحكم</span>
      </NuxtLink>
      <nav class="admin__nav" aria-label="لوحة التحكم">
        <div v-for="group in groups" :key="group.title" class="admin__group">
          <p class="admin__group-title">{{ group.title }}</p>
          <NuxtLink
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            class="admin__link"
            :class="{ 'is-active': isActive(link.to, link.exact) }"
          >
            <Icon :name="link.icon" aria-hidden="true" />{{ link.label }}
          </NuxtLink>
        </div>
      </nav>
      <div class="admin__sidebar-foot">
        <NuxtLink to="/" class="admin__link" target="_blank">
          <Icon name="ph:storefront" aria-hidden="true" />عرض المتجر
        </NuxtLink>
        <button type="button" class="admin__link admin__link--danger" @click="logout">
          <Icon name="ph:sign-out" aria-hidden="true" />تسجيل الخروج
        </button>
      </div>
    </aside>
    <Transition name="fade">
      <div v-if="sidebarOpen" class="admin__overlay" @click="sidebarOpen = false" />
    </Transition>

    <div class="admin__body">
      <header class="admin__topbar">
        <button type="button" class="admin__burger" aria-label="القائمة" @click="sidebarOpen = true">
          <Icon name="ph:list" />
        </button>
        <p class="admin__crumb">
          <Icon v-if="current" :name="current.icon" aria-hidden="true" />{{ current?.label ?? 'لوحة التحكم' }}
        </p>
        <div class="admin__user">
          <span class="admin__avatar">{{ initials(auth.displayName) || '?' }}</span>
          <span class="hide-mobile">{{ auth.displayName }}</span>
        </div>
      </header>
      <main id="main" class="admin__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin {
  --sidebar-w: 264px;
  display: flex;
  min-block-size: 100dvh;
  background: var(--color-surface-muted);
}
.admin__sidebar {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: var(--z-drawer);
  display: flex;
  flex-direction: column;
  inline-size: var(--sidebar-w);
  padding: var(--space-4);
  background: var(--stone-900);
  color: rgb(255 255 255 / 0.75);
  overflow-y: auto;
  transform: translateX(100%);
  /* Hidden off-canvas links must not be reachable with Tab. */
  visibility: hidden;
  transition:
    transform var(--duration-slow) var(--ease-out),
    visibility 0s linear var(--duration-slow);
}
.admin__sidebar.is-open {
  transform: none;
  visibility: visible;
  transition-delay: 0s;
}
@media (min-width: 1024px) {
  .admin__sidebar {
    position: sticky;
    block-size: 100dvh;
    transform: none;
    visibility: visible;
  }
}
.admin__overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-drawer) - 1);
  background: var(--color-overlay);
}
.admin__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-5);
  color: #fff;
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
}
.admin__brand img {
  block-size: 2.25rem;
  inline-size: auto;
  filter: brightness(1.2);
}
.admin__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-4);
}
.admin__group-title {
  padding-inline: var(--space-3);
  margin-block-end: var(--space-1);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  color: rgb(255 255 255 / 0.4);
}
.admin__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  inline-size: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.admin__link > :first-child {
  font-size: 1.2rem;
}
.admin__link:hover {
  background: rgb(255 255 255 / 0.06);
  color: #fff;
}
.admin__link.is-active {
  background: linear-gradient(135deg, var(--gold-500), var(--gold-700));
  color: #fff;
  box-shadow: 0 6px 18px rgb(152 114 38 / 0.35);
}
.admin__link--danger:hover {
  background: rgb(198 40 40 / 0.2);
  color: #fecaca;
}
.admin__sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-block-start: var(--space-4);
  margin-block-start: var(--space-4);
  border-block-start: 1px solid rgb(255 255 255 / 0.08);
}
.admin__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
}
.admin__topbar {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  block-size: 4rem;
  padding-inline: clamp(1rem, 0.5rem + 2vw, 2rem);
  background: rgb(255 255 255 / 0.9);
  backdrop-filter: blur(12px);
  border-block-end: 1px solid var(--color-border);
}
.admin__burger {
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: var(--radius-sm);
  font-size: 1.4rem;
}
@media (min-width: 1024px) {
  .admin__burger {
    display: none;
  }
}
.admin__crumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-bold);
}
.admin__crumb > :first-child {
  color: var(--color-primary);
  font-size: 1.25rem;
}
.admin__user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.admin__avatar {
  display: grid;
  place-items: center;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-400), var(--gold-700));
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.admin__main {
  padding: clamp(1rem, 0.5rem + 2vw, 2rem);
  animation: fade-up 0.4s var(--ease-out);
}
</style>

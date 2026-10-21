<script setup lang="ts">
const emit = defineEmits<{ openMenu: [] }>();

const { t } = useI18n();
const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const route = useRoute();

const tabs = computed(() => [
  { to: '/', icon: 'ph:house', activeIcon: 'ph:house-fill', label: t('nav.home'), exact: true },
  { to: '/cart', icon: 'ph:shopping-bag', activeIcon: 'ph:shopping-bag-fill', label: t('nav.cart'), count: cart.count },
  {
    to: '/account/wishlist',
    icon: 'ph:heart',
    activeIcon: 'ph:heart-fill',
    label: t('account.wishlist'),
    count: auth.isLoggedIn ? wishlist.count : 0,
  },
  { to: auth.isLoggedIn ? '/account' : '/login', icon: 'ph:user', activeIcon: 'ph:user-fill', label: t('account.title') },
]);

const isActive = (to: string, exact?: boolean) =>
  exact ? route.path === to : route.path === to || route.path.startsWith(`${to}/`);
</script>

<template>
  <nav class="tabbar hide-desktop" :aria-label="t('nav.main')">
    <NuxtLink
      v-for="tab in tabs.slice(0, 1)"
      :key="tab.to"
      :to="tab.to"
      class="tabbar__tab"
      :class="{ 'is-active': isActive(tab.to, tab.exact) }"
    >
      <Icon :name="isActive(tab.to, tab.exact) ? tab.activeIcon : tab.icon" class="tabbar__icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
    </NuxtLink>

    <button type="button" class="tabbar__tab" @click="emit('openMenu')">
      <Icon name="ph:list-magnifying-glass" class="tabbar__icon" aria-hidden="true" />
      <span>{{ t('nav.categories') }}</span>
    </button>

    <NuxtLink
      v-for="tab in tabs.slice(1)"
      :key="tab.to"
      :to="tab.to"
      class="tabbar__tab"
      :class="{ 'is-active': isActive(tab.to, tab.exact) }"
    >
      <span class="tabbar__icon-wrap">
        <Icon :name="isActive(tab.to, tab.exact) ? tab.activeIcon : tab.icon" class="tabbar__icon" aria-hidden="true" />
        <span v-if="tab.count" :key="tab.count" class="tabbar__count">{{ tab.count > 99 ? '99+' : tab.count }}</span>
      </span>
      <span>{{ tab.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: var(--z-sticky);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  block-size: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
  padding-block-end: env(safe-area-inset-bottom);
  background: rgb(255 255 255 / 0.94);
  backdrop-filter: blur(14px);
  border-block-start: 1px solid var(--color-border);
  box-shadow: 0 -6px 24px rgb(47 42 34 / 0.06);
}
.tabbar__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text-subtle);
  transition: color var(--duration-fast) ease;
  -webkit-tap-highlight-color: transparent;
}
.tabbar__tab::before {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inline-size: 2rem;
  block-size: 3px;
  border-end-start-radius: 3px;
  border-end-end-radius: 3px;
  background: var(--color-primary);
  transform: scaleX(0);
  transition: transform var(--duration-base) var(--ease-spring);
}
.tabbar__tab.is-active {
  color: var(--color-primary);
}
.tabbar__tab.is-active::before {
  transform: scaleX(1);
}
.tabbar__tab:active .tabbar__icon {
  transform: scale(0.88);
}
.tabbar__icon-wrap {
  position: relative;
  display: grid;
}
.tabbar__icon {
  font-size: 1.5rem;
  transition: transform var(--duration-fast) ease;
}
.tabbar__count {
  position: absolute;
  inset-block-start: -0.3rem;
  inset-inline-end: -0.6rem;
  display: grid;
  place-items: center;
  min-inline-size: 1.1rem;
  block-size: 1.1rem;
  padding-inline: 0.2rem;
  border-radius: var(--radius-full);
  border: 2px solid #fff;
  background: var(--color-danger);
  color: #fff;
  font-size: 0.6rem;
  font-weight: var(--weight-bold);
  animation: pop var(--duration-slow) var(--ease-spring);
}
</style>

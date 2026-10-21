<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core';

const emit = defineEmits<{ openMenu: [] }>();

const { t } = useI18n();
const { brandName, logo, contact } = useBrand();
const { price } = useLocalized();
const freeShippingThreshold = useRuntimeConfig().public.freeShippingThreshold;
const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const route = useRoute();

const { y } = useWindowScroll();
const scrolled = computed(() => y.value > 8);
const searchOpen = ref(false);

watch(() => route.fullPath, () => (searchOpen.value = false));
</script>

<template>
  <div class="topbar">
    <div class="container topbar__inner">
      <p v-if="freeShippingThreshold > 0" class="topbar__promo">
        <Icon name="ph:truck" aria-hidden="true" />
        {{ t('header.freeShipping', { amount: price(freeShippingThreshold) }) }}
      </p>
      <p v-else class="topbar__promo">
        <Icon name="ph:truck" aria-hidden="true" />{{ t('header.deliveryAll') }}
      </p>
      <div class="topbar__end">
        <a :href="`tel:${contact.phone}`" class="topbar__link hide-mobile">
          <Icon name="ph:phone" aria-hidden="true" /><span dir="ltr">{{ contact.phone }}</span>
        </a>
        <LanguageSwitcher />
      </div>
    </div>
  </div>

  <header class="header" :class="{ 'is-scrolled': scrolled }">
    <div class="container header__bar">
      <button type="button" class="header__menu hide-desktop" :aria-label="t('header.openMenu')" @click="emit('openMenu')">
        <Icon name="ph:list" />
      </button>

      <NuxtLink to="/" class="header__logo" :aria-label="brandName">
        <img :src="logo" :alt="brandName" width="132" height="48" fetchpriority="high" />
      </NuxtLink>

      <div class="header__search hide-mobile">
        <SearchBar />
      </div>

      <nav class="header__actions" :aria-label="t('header.actions')">
        <HeaderAction
          class="hide-desktop"
          icon="ph:magnifying-glass"
          :label="t('search.label')"
          @click="searchOpen = true"
        />
        <HeaderAction
          class="hide-mobile"
          to="/account/wishlist"
          icon="ph:heart"
          :label="t('account.wishlist')"
          :count="auth.isLoggedIn ? wishlist.count : 0"
        />
        <HeaderAction to="/cart" icon="ph:shopping-bag" :label="t('cart.title')" :count="cart.count" />
        <AccountMenu class="hide-mobile" />
      </nav>
    </div>

    <MegaNav class="hide-mobile" />
  </header>

  <Teleport to="body">
    <Transition name="search-sheet">
      <div v-if="searchOpen" class="search-sheet" @keydown.esc="searchOpen = false">
        <div class="search-sheet__backdrop" @click="searchOpen = false" />
        <div class="search-sheet__panel" role="dialog" aria-modal="true" :aria-label="t('search.label')">
          <SearchBar autofocus id-prefix="search-mobile" @navigate="searchOpen = false" />
          <BaseButton variant="ghost" size="sm" @click="searchOpen = false">{{ t('common.cancel') }}</BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.topbar {
  background: linear-gradient(90deg, var(--stone-900), var(--gold-900), var(--stone-900));
  color: rgb(255 255 255 / 0.9);
  font-size: var(--text-xs);
}
.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-block-size: 2.25rem;
}
.topbar__promo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
}
.topbar__promo :deep(svg),
.topbar__promo > :first-child {
  color: var(--gold-300);
  font-size: 1rem;
}
.topbar__end {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}
.topbar__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}
.topbar__link:hover {
  background: rgb(255 255 255 / 0.12);
}

.header {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-header);
  background: rgb(255 255 255 / 0.88);
  backdrop-filter: saturate(1.6) blur(14px);
  border-block-end: 1px solid transparent;
  transition:
    box-shadow var(--duration-base) var(--ease-out),
    border-color var(--duration-base) ease;
}
.header.is-scrolled {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}
.header__bar {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.2rem + 1.5vw, 2rem);
  block-size: var(--header-height);
}
.header__menu {
  display: grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  margin-inline-start: calc(var(--space-2) * -1);
  border-radius: 50%;
  font-size: 1.6rem;
}
.header__menu:hover {
  background: var(--color-primary-softer);
}
.header__logo {
  flex-shrink: 0;
  transition: transform var(--duration-base) var(--ease-out);
}
.header__logo:hover {
  transform: scale(1.03);
}
.header__logo img {
  block-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem);
  inline-size: auto;
}
.header__search {
  flex: 1;
  max-inline-size: 640px;
  margin-inline: auto;
}
.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-inline-start: auto;
}
@media (min-width: 1024px) {
  .header__actions {
    margin-inline-start: 0;
  }
}

.search-sheet {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
}
.search-sheet__backdrop {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
}
.search-sheet__panel {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--gutter);
  padding-block-start: calc(var(--space-3) + env(safe-area-inset-top));
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}
.search-sheet-enter-active,
.search-sheet-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.search-sheet-enter-active .search-sheet__panel,
.search-sheet-leave-active .search-sheet__panel {
  transition: transform var(--duration-base) var(--ease-out);
}
.search-sheet-enter-from,
.search-sheet-leave-to {
  opacity: 0;
}
.search-sheet-enter-from .search-sheet__panel,
.search-sheet-leave-to .search-sheet__panel {
  transform: translateY(-100%);
}
</style>

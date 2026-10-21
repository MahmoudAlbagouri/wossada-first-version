<script setup lang="ts">
const open = defineModel<boolean>({ default: false });

const { t } = useI18n();
const { name } = useLocalized();
const { brandName, logo, contact } = useBrand();
const categories = useNavCategories();
const auth = useAuthStore();
const accountLinks = useAccountLinks();

async function logout() {
  open.value = false;
  await auth.logout();
  await navigateTo('/');
}
</script>

<template>
  <BaseDrawer v-model="open" side="start" width="340px" :title="brandName">
    <template #header>
      <NuxtLink to="/" class="menu__logo" @click="open = false">
        <img :src="logo" :alt="brandName" width="110" height="40" loading="lazy" />
      </NuxtLink>
    </template>

    <div class="menu">
      <div v-if="auth.isLoggedIn" class="menu__user">
        <span class="menu__avatar">{{ initials(auth.displayName) || '?' }}</span>
        <div>
          <p class="menu__hello">{{ t('header.hello') }}</p>
          <strong class="line-clamp-1">{{ auth.displayName }}</strong>
        </div>
      </div>
      <div v-else class="menu__auth">
        <BaseButton to="/login" block>{{ t('auth.login') }}</BaseButton>
        <BaseButton to="/register" variant="outline" block>{{ t('auth.register') }}</BaseButton>
      </div>

      <section class="menu__section">
        <h3 class="menu__heading">{{ t('nav.categories') }}</h3>
        <NuxtLink to="/products" class="menu__link">
          <Icon name="ph:squares-four" aria-hidden="true" />{{ t('nav.allProducts') }}
        </NuxtLink>
        <template v-for="category in categories" :key="category.id">
          <details v-if="category.children?.length" class="menu__group">
            <summary class="menu__link">
              <span>{{ name(category) }}</span>
              <Icon name="ph:caret-down" class="menu__caret" aria-hidden="true" />
            </summary>
            <div class="menu__children">
              <NuxtLink :to="`/category/${category.slug}`" class="menu__child menu__child--all">
                {{ t('nav.viewAllIn', { name: name(category) }) }}
              </NuxtLink>
              <NuxtLink v-for="child in category.children" :key="child.id" :to="`/category/${child.slug}`" class="menu__child">
                {{ name(child) }}
              </NuxtLink>
            </div>
          </details>
          <NuxtLink v-else :to="`/category/${category.slug}`" class="menu__link">{{ name(category) }}</NuxtLink>
        </template>
      </section>

      <section v-if="auth.isLoggedIn" class="menu__section">
        <h3 class="menu__heading">{{ t('account.title') }}</h3>
        <NuxtLink v-for="link in accountLinks" :key="link.to" :to="link.to" class="menu__link">
          <Icon :name="link.icon" aria-hidden="true" />{{ link.label }}
        </NuxtLink>
        <button type="button" class="menu__link menu__link--danger" @click="logout">
          <Icon name="ph:sign-out" aria-hidden="true" />{{ t('auth.logout') }}
        </button>
      </section>

      <section class="menu__section">
        <h3 class="menu__heading">{{ t('footer.help') }}</h3>
        <NuxtLink to="/contact" class="menu__link"><Icon name="ph:headset" aria-hidden="true" />{{ t('nav.contact') }}</NuxtLink>
        <a :href="`tel:${contact.phone}`" class="menu__link">
          <Icon name="ph:phone" aria-hidden="true" /><span dir="ltr">{{ contact.phone }}</span>
        </a>
      </section>
    </div>

    <template #footer>
      <LanguageSwitcher variant="dark" />
    </template>
  </BaseDrawer>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.menu__logo img {
  block-size: 2.4rem;
  inline-size: auto;
}
.menu__user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-primary-softer);
}
.menu__avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-400), var(--gold-700));
  color: #fff;
  font-weight: var(--weight-bold);
}
.menu__hello {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.menu__auth {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-2);
}
.menu__section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.menu__heading {
  margin-block-end: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  color: var(--color-text-subtle);
  text-transform: uppercase;
}
.menu__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  inline-size: 100%;
  min-block-size: 2.75rem;
  padding-inline: var(--space-3);
  border-radius: var(--radius-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  list-style: none;
  transition: background-color var(--duration-fast) ease;
}
.menu__link::-webkit-details-marker {
  display: none;
}
.menu__link > :first-child:not(span) {
  font-size: 1.2rem;
  color: var(--color-primary);
}
.menu__link:hover,
.menu__link.router-link-exact-active {
  background: var(--color-surface-muted);
}
.menu__link--danger {
  color: var(--color-danger);
}
.menu__link--danger > :first-child {
  color: var(--color-danger) !important;
}
.menu__caret {
  margin-inline-start: auto;
  transition: transform var(--duration-base) var(--ease-out);
}
.menu__group[open] .menu__caret {
  transform: rotate(180deg);
}
.menu__children {
  display: flex;
  flex-direction: column;
  padding-inline-start: var(--space-4);
  margin-inline-start: var(--space-3);
  border-inline-start: 2px solid var(--color-primary-soft);
  animation: fade-up var(--duration-base) var(--ease-out);
}
.menu__child {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.menu__child:hover {
  color: var(--color-primary);
}
.menu__child--all {
  color: var(--color-primary);
  font-weight: var(--weight-bold);
}
</style>

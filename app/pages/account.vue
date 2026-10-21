<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const auth = useAuthStore();
const links = useAccountLinks();
const route = useRoute();

useSeoMeta({ robots: 'noindex, nofollow' });

const isActive = (to: string) => (to === '/account' ? route.path === to : route.path.startsWith(to));

async function logout() {
  await auth.logout();
  await navigateTo('/');
}
</script>

<template>
  <div class="container account">
    <aside class="account__nav">
      <div class="account__user">
        <span class="account__avatar">{{ initials(auth.displayName) || '?' }}</span>
        <div class="account__who">
          <p class="text-subtle">{{ t('header.hello') }}</p>
          <strong class="line-clamp-1">{{ auth.displayName }}</strong>
        </div>
      </div>
      <nav class="account__links scroller" :aria-label="t('account.title')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="account__link"
          :class="{ 'is-active': isActive(link.to) }"
        >
          <Icon :name="link.icon" aria-hidden="true" />{{ link.label }}
        </NuxtLink>
        <button type="button" class="account__link account__link--danger hide-mobile" @click="logout">
          <Icon name="ph:sign-out" aria-hidden="true" />{{ t('auth.logout') }}
        </button>
      </nav>
    </aside>

    <main class="account__main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.account {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
  padding-block: var(--space-6) var(--space-section);
}
@media (min-width: 1024px) {
  .account {
    grid-template-columns: 270px minmax(0, 1fr);
    gap: var(--space-8);
  }
  .account__nav {
    position: sticky;
    inset-block-start: calc(var(--header-height) + 4rem);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
}
.account__user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-block-end: var(--space-3);
}
.account__avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-400), var(--gold-700));
  color: #fff;
  font-weight: var(--weight-bold);
  box-shadow: var(--shadow-gold);
}
.account__who {
  min-inline-size: 0;
  font-size: var(--text-sm);
}
.account__who p {
  font-size: var(--text-xs);
}
.account__links {
  gap: var(--space-2);
}
@media (min-width: 1024px) {
  .account__links {
    flex-direction: column;
    gap: 2px;
    overflow: visible;
  }
}
.account__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  min-block-size: 2.75rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    border-color var(--duration-fast) ease;
}
@media (min-width: 1024px) {
  .account__link {
    border: none;
    border-radius: var(--radius-sm);
  }
}
.account__link > :first-child {
  font-size: 1.2rem;
  color: var(--color-text-subtle);
}
.account__link:hover {
  background: var(--color-surface-muted);
}
.account__link.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
@media (min-width: 1024px) {
  .account__link.is-active {
    background: var(--color-primary-softer);
    color: var(--color-primary);
  }
}
.account__link.is-active > :first-child {
  color: inherit;
}
.account__link--danger {
  margin-block-start: var(--space-2);
  color: var(--color-danger);
}
.account__link--danger > :first-child {
  color: var(--color-danger);
}
.account__link--danger:hover {
  background: var(--color-danger-soft);
}
.account__main {
  min-inline-size: 0;
}
</style>

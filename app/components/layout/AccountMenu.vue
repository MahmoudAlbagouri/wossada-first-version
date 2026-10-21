<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const auth = useAuthStore();
const { t } = useI18n();
const route = useRoute();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

onClickOutside(root, () => (open.value = false));
watch(() => route.fullPath, () => (open.value = false));

const links = useAccountLinks();

async function logout() {
  open.value = false;
  await auth.logout();
  await navigateTo('/');
}
</script>

<template>
  <div ref="root" class="account-menu" @keydown.esc="open = false">
    <HeaderAction v-if="!auth.isLoggedIn" to="/login" icon="ph:user-circle" :label="t('auth.login')" show-label />

    <template v-else>
      <HeaderAction
        :label="t('account.menu')"
        show-label
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="open = !open"
      >
        <template #icon>
          <span class="avatar">{{ initials(auth.displayName) || '?' }}</span>
        </template>
        {{ auth.displayName }}
      </HeaderAction>

      <Transition name="scale">
        <div v-if="open" class="account-menu__panel" role="menu">
          <div class="account-menu__head">
            <span class="avatar avatar--lg">{{ initials(auth.displayName) || '?' }}</span>
            <div class="account-menu__who">
              <strong class="line-clamp-1">{{ auth.displayName }}</strong>
              <span class="line-clamp-1">{{ auth.user?.email }}</span>
            </div>
          </div>
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="account-menu__link" role="menuitem">
            <Icon :name="link.icon" aria-hidden="true" />{{ link.label }}
          </NuxtLink>
          <button type="button" class="account-menu__link account-menu__link--danger" role="menuitem" @click="logout">
            <Icon name="ph:sign-out" aria-hidden="true" />{{ t('auth.logout') }}
          </button>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.account-menu {
  position: relative;
}
.avatar {
  display: grid;
  place-items: center;
  inline-size: 2.1rem;
  block-size: 2.1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-400), var(--gold-700));
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.avatar--lg {
  flex-shrink: 0;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  font-size: var(--text-sm);
}
.account-menu__panel {
  position: absolute;
  inset-inline-end: 0;
  inset-block-start: calc(100% + var(--space-3));
  z-index: var(--z-dropdown);
  inline-size: 260px;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  transform-origin: top left;
}
:dir(ltr) .account-menu__panel {
  transform-origin: top right;
}
.account-menu__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-block-end: var(--space-2);
  border-block-end: 1px solid var(--color-border);
}
.account-menu__who {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
  font-size: var(--text-sm);
}
.account-menu__who span {
  color: var(--color-text-subtle);
  font-size: var(--text-xs);
}
.account-menu__link {
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
.account-menu__link > :first-child {
  font-size: 1.15rem;
  color: var(--color-text-subtle);
}
.account-menu__link:hover,
.account-menu__link.router-link-exact-active {
  background: var(--color-primary-softer);
  color: var(--color-primary);
}
.account-menu__link--danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>

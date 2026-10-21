<script setup lang="ts">
const { brandName, tagline, logo } = useBrand();
const { t } = useI18n();

const perks = computed(() => [
  { icon: 'ph:truck', text: t('authLayout.perkDelivery') },
  { icon: 'ph:shield-check', text: t('authLayout.perkQuality') },
  { icon: 'ph:arrows-counter-clockwise', text: t('authLayout.perkReturns') },
]);
</script>

<template>
  <div class="auth">
    <aside class="auth__art hide-mobile" aria-hidden="true">
      <div class="auth__pattern" />
      <div class="auth__art-content">
        <NuxtLink to="/" tabindex="-1">
          <img :src="logo" :alt="brandName" class="auth__art-logo" width="160" height="58" />
        </NuxtLink>
        <h2 class="auth__headline">{{ tagline }}</h2>
        <ul class="auth__perks">
          <li v-for="(perk, index) in perks" :key="perk.icon" :style="{ animationDelay: `${200 + index * 120}ms` }">
            <span class="auth__perk-icon"><Icon :name="perk.icon" /></span>
            {{ perk.text }}
          </li>
        </ul>
      </div>
    </aside>

    <main id="main" class="auth__main">
      <div class="auth__top">
        <NuxtLink to="/" class="auth__logo hide-desktop" :aria-label="brandName">
          <img :src="logo" :alt="brandName" width="120" height="44" />
        </NuxtLink>
        <NuxtLink to="/" class="auth__back">
          <Icon name="ph:arrow-left" class="flip-rtl" aria-hidden="true" />{{ t('authLayout.backToStore') }}
        </NuxtLink>
        <LanguageSwitcher variant="dark" />
      </div>
      <div class="auth__card">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  min-block-size: 100dvh;
  background: var(--color-bg);
}
@media (min-width: 1024px) {
  .auth {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  }
}
.auth__art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 15%, rgb(220 195 138 / 0.35), transparent 45%),
    radial-gradient(circle at 85% 90%, rgb(152 114 38 / 0.45), transparent 50%),
    linear-gradient(160deg, var(--stone-900), var(--gold-900));
  color: #fff;
}
.auth__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 22px 22px;
}
.auth__art-content {
  position: relative;
  max-inline-size: 420px;
}
.auth__art-logo {
  block-size: 3.5rem;
  inline-size: auto;
  filter: brightness(1.2);
}
.auth__headline {
  margin-block: var(--space-8) var(--space-6);
  font-size: var(--text-4xl);
  font-weight: var(--weight-black);
  line-height: var(--leading-tight);
  animation: fade-up 0.8s var(--ease-out) both;
}
.auth__perks {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.auth__perks li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: rgb(255 255 255 / 0.85);
  animation: fade-up 0.7s var(--ease-out) both;
}
.auth__perk-icon {
  display: grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.1);
  color: var(--gold-300);
  font-size: 1.35rem;
  backdrop-filter: blur(6px);
}
.auth__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5) var(--gutter) var(--space-10);
}
.auth__top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  inline-size: 100%;
  max-inline-size: 480px;
  margin-block-end: clamp(1.5rem, 1rem + 4vh, 4rem);
}
.auth__logo img {
  block-size: 2.5rem;
  inline-size: auto;
}
.auth__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.auth__back:hover {
  color: var(--color-primary);
}
.auth__card {
  inline-size: 100%;
  max-inline-size: 480px;
  animation: fade-up 0.6s var(--ease-out);
}
</style>

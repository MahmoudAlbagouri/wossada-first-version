<script setup lang="ts">
const { t } = useI18n();
const { name, text } = useLocalized();
const { brandName, brandDescription, logo, contact, social, address } = useBrand();
const appConfig = useAppConfig();
const categories = useNavCategories();

const SOCIAL_ICONS: Record<string, string> = {
  facebook: 'ph:facebook-logo',
  instagram: 'ph:instagram-logo',
  tiktok: 'ph:tiktok-logo',
  snapchat: 'ph:snapchat-logo',
  youtube: 'ph:youtube-logo',
  x: 'ph:x-logo',
};

const socials = computed(() =>
  Object.entries(social)
    .filter(([, url]) => !!url)
    .map(([network, url]) => ({ network, url: url as string, icon: SOCIAL_ICONS[network] ?? 'ph:link' })),
);

const helpLinks = computed(() => [
  { to: '/about', label: t('nav.about') },
  { to: '/contact', label: t('nav.contact') },
  { to: '/shipping-returns', label: t('nav.shippingReturns') },
  { to: '/privacy', label: t('nav.privacy') },
  { to: '/terms', label: t('nav.terms') },
]);

const apps = computed(() => appConfig.apps.filter((app) => !!app.url));
const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="footer__glow" aria-hidden="true" />

    <div class="container footer__grid">
      <section class="footer__brand">
        <NuxtLink to="/" class="footer__logo" :aria-label="brandName">
          <img :src="logo" :alt="brandName" width="140" height="50" loading="lazy" />
        </NuxtLink>
        <p class="footer__about">{{ brandDescription }}</p>
        <div v-if="socials.length" class="footer__socials">
          <a
            v-for="item in socials"
            :key="item.network"
            :href="item.url"
            class="footer__social"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="item.network"
          >
            <Icon :name="item.icon" />
          </a>
        </div>
      </section>

      <section class="footer__col">
        <h2 class="footer__title">{{ t('footer.shop') }}</h2>
        <ul class="footer__links">
          <li><NuxtLink to="/products">{{ t('nav.allProducts') }}</NuxtLink></li>
          <li v-for="category in categories.slice(0, 6)" :key="category.id">
            <NuxtLink :to="`/category/${category.slug}`">{{ name(category) }}</NuxtLink>
          </li>
        </ul>
      </section>

      <section class="footer__col">
        <h2 class="footer__title">{{ t('footer.help') }}</h2>
        <ul class="footer__links">
          <li v-for="link in helpLinks" :key="link.to">
            <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </section>

      <section class="footer__col">
        <h2 class="footer__title">{{ t('footer.contact') }}</h2>
        <ul class="footer__contact">
          <li>
            <Icon name="ph:phone" aria-hidden="true" />
            <a :href="`tel:${contact.phone}`" dir="ltr">{{ contact.phone }}</a>
          </li>
          <li v-if="contact.whatsapp">
            <Icon name="ph:whatsapp-logo" aria-hidden="true" />
            <a :href="`https://wa.me/${contact.whatsapp}`" target="_blank" rel="noopener noreferrer">{{ t('footer.whatsapp') }}</a>
          </li>
          <li>
            <Icon name="ph:envelope-simple" aria-hidden="true" />
            <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
          </li>
          <li>
            <Icon name="ph:map-pin" aria-hidden="true" />
            <span>{{ address }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div v-if="appConfig.branches.length" class="container footer__branches">
      <h2 class="footer__title">{{ t('footer.branches') }}</h2>
      <div class="footer__branch-list">
        <component
          :is="branch.mapUrl ? 'a' : 'div'"
          v-for="branch in appConfig.branches"
          :key="branch.name.en"
          :href="branch.mapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__branch"
        >
          <Icon name="ph:storefront" aria-hidden="true" />
          <span>
            <strong>{{ text(branch.name) }}</strong>
            <small>{{ text(branch.address) }}</small>
          </span>
        </component>
      </div>
    </div>

    <div class="container footer__strip">
      <div class="footer__payments">
        <span>{{ t('footer.securePayment') }}</span>
        <img
          v-for="payment in appConfig.payments"
          :key="payment.name"
          :src="payment.logo"
          :alt="payment.name"
          height="28"
          loading="lazy"
          class="footer__payment"
        />
      </div>
      <div v-if="apps.length" class="footer__apps">
        <a v-for="app in apps" :key="app.name" :href="app.url" target="_blank" rel="noopener noreferrer">
          <img :src="app.badge" :alt="app.name" height="36" loading="lazy" />
        </a>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>{{ t('footer.copyright', { year, name: brandName }) }}</p>
        <LanguageSwitcher />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  margin-block-start: var(--space-section);
  padding-block-start: clamp(2.5rem, 2rem + 3vw, 4.5rem);
  background: var(--stone-900);
  color: rgb(255 255 255 / 0.75);
  overflow: hidden;
}
.footer__glow {
  position: absolute;
  inset-block-start: -18rem;
  inset-inline-end: -10rem;
  inline-size: 36rem;
  block-size: 36rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(201 164 94 / 0.18), transparent 65%);
  pointer-events: none;
}
.footer__grid {
  position: relative;
  display: grid;
  gap: var(--space-8);
  grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 640px) {
  .footer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .footer__grid {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr);
  }
}
.footer__logo img {
  block-size: 3rem;
  inline-size: auto;
  filter: brightness(1.15);
}
.footer__about {
  margin-block: var(--space-4);
  max-inline-size: 40ch;
  line-height: var(--leading-relaxed);
  font-size: var(--text-sm);
}
.footer__socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.footer__social {
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.08);
  color: #fff;
  font-size: 1.2rem;
  transition:
    background-color var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
.footer__social:hover {
  background: var(--color-primary);
  transform: translateY(-3px);
}
.footer__title {
  margin-block-end: var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  color: #fff;
}
.footer__links,
.footer__contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.footer__links a {
  position: relative;
  transition:
    color var(--duration-fast) ease,
    padding var(--duration-base) var(--ease-out);
}
.footer__links a:hover {
  color: var(--gold-300);
  padding-inline-start: var(--space-2);
}
.footer__contact li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.footer__contact li > :first-child {
  flex-shrink: 0;
  margin-block-start: 2px;
  font-size: 1.15rem;
  color: var(--gold-300);
}
.footer__contact a:hover {
  color: var(--gold-300);
}
.footer__branches {
  position: relative;
  margin-block-start: var(--space-10);
}
.footer__branch-list {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.footer__branch {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.05);
  border: 1px solid rgb(255 255 255 / 0.08);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast) ease;
}
.footer__branch:hover {
  border-color: var(--gold-400);
}
.footer__branch > :first-child {
  font-size: 1.4rem;
  color: var(--gold-300);
}
.footer__branch span {
  display: flex;
  flex-direction: column;
}
.footer__branch strong {
  color: #fff;
}
.footer__strip {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-block-start: var(--space-10);
  padding-block: var(--space-6);
  border-block-start: 1px solid rgb(255 255 255 / 0.08);
}
.footer__payments,
.footer__apps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.footer__payment {
  block-size: 1.75rem;
  inline-size: auto;
  padding: 3px 6px;
  border-radius: var(--radius-xs);
  background: #fff;
}
.footer__apps img {
  block-size: 2.25rem;
  inline-size: auto;
}
.footer__bottom {
  padding-block: var(--space-4) calc(var(--space-4) + var(--tabbar-height) + env(safe-area-inset-bottom));
  background: rgb(0 0 0 / 0.25);
  font-size: var(--text-xs);
}
@media (min-width: 1024px) {
  .footer__bottom {
    padding-block-end: var(--space-4);
  }
}
.footer__bottom-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
</style>

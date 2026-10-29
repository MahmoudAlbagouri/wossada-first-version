<script setup lang="ts">
const { t } = useI18n();
const { text } = useLocalized();
const { brandName, contact, address, social } = useBrand();
const appConfig = useAppConfig();
const siteUrl = useSiteUrl();

usePageSeo({ title: t('contact.title'), description: t('contact.intro', { brand: brandName.value }) });

const channels = computed(() => [
  {
    icon: 'ph:phone-call',
    title: t('contact.call'),
    value: contact.phone,
    href: `tel:${contact.phone}`,
    ltr: true,
  },
  ...(contact.whatsapp
    ? [
        {
          icon: 'ph:whatsapp-logo',
          title: t('contact.whatsapp'),
          value: t('contact.whatsappCta'),
          href: `https://wa.me/${contact.whatsapp}`,
          external: true,
        },
      ]
    : []),
  { icon: 'ph:envelope-simple', title: t('contact.email'), value: contact.email, href: `mailto:${contact.email}`, ltr: true },
  { icon: 'ph:map-pin', title: t('contact.visit'), value: address.value },
]);

useJsonLd(
  () => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t('contact.title'),
    mainEntity: {
      '@type': 'Organization',
      name: brandName.value,
      url: siteUrl,
      sameAs: Object.values(social).filter(Boolean),
      contactPoint: [{ '@type': 'ContactPoint', telephone: contact.phone, email: contact.email, contactType: 'customer service' }],
    },
  }),
  'contact',
);
</script>

<template>
  <div>
    <PageHeader :title="t('contact.title')" :description="t('contact.intro', { brand: brandName })" :crumbs="[{ label: t('contact.title') }]" />
    <div class="container">
      <div class="channels">
        <component
          :is="channel.href ? 'a' : 'div'"
          v-for="(channel, index) in channels"
          :key="channel.icon"
          v-reveal="index * 80"
          :href="channel.href"
          :target="channel.external ? '_blank' : undefined"
          :rel="channel.external ? 'noopener noreferrer' : undefined"
          class="channel card"
        >
          <span class="channel__icon" aria-hidden="true"><Icon :name="channel.icon" /></span>
          <span class="channel__title">{{ channel.title }}</span>
          <span class="channel__value" :dir="channel.ltr ? 'ltr' : undefined">{{ channel.value }}</span>
        </component>
      </div>

      <section v-if="appConfig.branches.length" class="section">
        <h2 class="title-lg">{{ t('footer.branches') }}</h2>
        <div class="grid-auto branches" style="--min: 260px">
          <component
            :is="branch.mapUrl ? 'a' : 'div'"
            v-for="branch in appConfig.branches"
            :key="branch.name.en"
            :href="branch.mapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="card card-pad branch"
          >
            <Icon name="ph:storefront" aria-hidden="true" />
            <strong>{{ text(branch.name) }}</strong>
            <span class="text-muted">{{ text(branch.address) }}</span>
          </component>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.channels {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
}
.channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-5);
  text-align: center;
  transition:
    transform var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out),
    border-color var(--duration-base) ease;
}
a.channel:hover {
  transform: translateY(-4px);
  border-color: var(--gold-200);
  box-shadow: var(--shadow-md);
}
.channel__icon {
  display: grid;
  place-items: center;
  inline-size: 3.75rem;
  block-size: 3.75rem;
  margin-block-end: var(--space-2);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-50), var(--gold-100));
  color: var(--color-primary);
  font-size: 1.75rem;
}
.channel__title {
  font-weight: var(--weight-bold);
}
.channel__value {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.branches {
  margin-block-start: var(--space-5);
}
.branch {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.branch > :first-child {
  font-size: 1.5rem;
  color: var(--color-primary);
}
</style>

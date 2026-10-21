<script setup lang="ts">
const { t } = useI18n();

const features = computed(() => [
  { icon: 'ph:truck', title: t('features.deliveryTitle'), text: t('features.deliveryText') },
  { icon: 'ph:hand-coins', title: t('features.codTitle'), text: t('features.codText') },
  { icon: 'ph:shield-check', title: t('features.qualityTitle'), text: t('features.qualityText') },
  { icon: 'ph:headset', title: t('features.supportTitle'), text: t('features.supportText') },
]);
</script>

<template>
  <section class="features" :aria-label="t('features.title')">
    <article v-for="(feature, index) in features" :key="feature.icon" v-reveal="index * 90" class="feature">
      <span class="feature__icon" aria-hidden="true"><Icon :name="feature.icon" /></span>
      <div>
        <h3 class="feature__title">{{ feature.title }}</h3>
        <p class="feature__text">{{ feature.text }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.features {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
}
.feature {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition:
    transform var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out),
    border-color var(--duration-base) ease;
}
.feature::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  block-size: 3px;
  background: linear-gradient(90deg, var(--gold-300), var(--gold-600));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-slow) var(--ease-out);
}
:dir(ltr) .feature::before {
  transform-origin: left;
}
.feature:hover {
  transform: translateY(-4px);
  border-color: var(--gold-200);
  box-shadow: var(--shadow-md);
}
.feature:hover::before {
  transform: scaleX(1);
}
.feature__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 3.25rem;
  block-size: 3.25rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--gold-50), var(--gold-100));
  color: var(--color-primary);
  font-size: 1.6rem;
  transition: transform var(--duration-slow) var(--ease-spring);
}
.feature:hover .feature__icon {
  transform: rotate(-8deg) scale(1.08);
}
.feature__title {
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
}
.feature__text {
  margin-block-start: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>

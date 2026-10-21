<script setup lang="ts">
const { contact } = useBrand();
const { t } = useI18n();
const href = computed(() =>
  contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t('footer.whatsappGreeting'))}` : null,
);
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="whatsapp"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="t('footer.whatsapp')"
    :title="t('footer.whatsapp')"
  >
    <Icon name="ph:whatsapp-logo-fill" />
  </a>
</template>

<style scoped>
.whatsapp {
  position: fixed;
  inset-inline-end: var(--space-4);
  inset-block-end: calc(var(--tabbar-height) + var(--space-4) + env(safe-area-inset-bottom));
  z-index: var(--z-sticky);
  display: grid;
  place-items: center;
  inline-size: 3.25rem;
  block-size: 3.25rem;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  font-size: 1.85rem;
  box-shadow: 0 10px 25px rgb(37 211 102 / 0.4);
  animation: pulse-whatsapp 2.6s ease-out infinite;
  transition: transform var(--duration-base) var(--ease-spring);
}
.whatsapp:hover {
  transform: scale(1.08);
}
@media (min-width: 1024px) {
  .whatsapp {
    inset-block-end: var(--space-6);
    inset-inline-end: var(--space-6);
  }
}
@keyframes pulse-whatsapp {
  0% {
    box-shadow:
      0 10px 25px rgb(37 211 102 / 0.4),
      0 0 0 0 rgb(37 211 102 / 0.45);
  }
  70%,
  100% {
    box-shadow:
      0 10px 25px rgb(37 211 102 / 0.4),
      0 0 0 16px rgb(37 211 102 / 0);
  }
}
</style>

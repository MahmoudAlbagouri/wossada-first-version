<script setup lang="ts">
/** Title bar + card used by every account page. */
defineProps<{ title: string; description?: string; flat?: boolean }>();
</script>

<template>
  <section class="acc-section">
    <header class="acc-section__head">
      <div>
        <h1 class="acc-section__title">{{ title }}</h1>
        <p v-if="description" class="acc-section__description">{{ description }}</p>
      </div>
      <slot name="actions" />
    </header>
    <div :class="flat ? 'acc-section__flat' : 'card card-pad'">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.acc-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fade-up 0.5s var(--ease-out);
}
.acc-section__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
}
.acc-section__title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
}
.acc-section__description {
  margin-block-start: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.acc-section__flat {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>

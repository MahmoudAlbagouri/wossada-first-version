<script setup lang="ts">
/** Page frame for every back-office screen: title, actions and content. */
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__head">
      <div>
        <h1 class="admin-page__title">{{ title }}</h1>
        <p v-if="description" class="admin-page__description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="admin-page__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.admin-page__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
}
.admin-page__title {
  font-size: clamp(1.25rem, 1.05rem + 1vw, 1.75rem);
  font-weight: var(--weight-black);
  line-height: var(--leading-tight);
}
.admin-page__description {
  margin-block-start: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.admin-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>

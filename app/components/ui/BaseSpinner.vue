<script setup lang="ts">
withDefaults(defineProps<{ size?: string; label?: string }>(), { size: '1.5rem' });
</script>

<template>
  <span class="spinner" role="status" :style="{ '--size': size }">
    <span class="visually-hidden">{{ label ?? $t('common.loading') }}</span>
  </span>
</template>

<style scoped>
.spinner {
  display: inline-block;
  inline-size: var(--size);
  block-size: var(--size);
  border-radius: 50%;
  border: 3px solid var(--color-primary-soft);
  border-block-start-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}
</style>

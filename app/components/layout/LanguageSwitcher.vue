<script setup lang="ts">
defineProps<{ variant?: 'light' | 'dark' }>();

const { locale, locales, setLocale } = useI18n();

const target = computed(() => locales.value.find((l) => l.code !== locale.value));
const FLAGS: Record<string, string> = { ar: 'circle-flags:eg', en: 'circle-flags:gb' };
</script>

<template>
  <button
    v-if="target"
    type="button"
    class="lang"
    :class="`lang--${variant ?? 'light'}`"
    :lang="target.code"
    :aria-label="target.name"
    @click="setLocale(target.code)"
  >
    <Icon :name="FLAGS[target.code] ?? 'ph:globe'" class="lang__flag" aria-hidden="true" />
    <span>{{ target.name }}</span>
  </button>
</template>

<style scoped>
.lang {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  transition: background-color var(--duration-fast) ease;
}
.lang--light:hover {
  background: rgb(255 255 255 / 0.12);
}
.lang--dark {
  border: 1px solid var(--color-border);
}
.lang--dark:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.lang__flag {
  font-size: 1.1rem;
}
</style>

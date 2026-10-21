<script setup lang="ts">
import type { AdminLanguage } from '~/utils/translation';

/**
 * Arabic / English tabs around translatable fields:
 * `<TranslationTabs v-slot="{ lang }"><BaseInput v-model="form.tr[lang].name" /></TranslationTabs>`
 */
const props = defineProps<{ errors?: Partial<Record<AdminLanguage, boolean>> }>();
defineSlots<{ default: (props: { lang: AdminLanguage }) => unknown }>();

const active = ref<AdminLanguage>('ar');
const tabs = computed(() =>
  ADMIN_LANGUAGES.map((code) => ({
    key: code,
    label: code === 'ar' ? 'العربية' : 'English',
    icon: props.errors?.[code] ? 'ph:warning-circle' : code === 'ar' ? 'circle-flags:eg' : 'circle-flags:gb',
  })),
);
</script>

<template>
  <div class="translations">
    <BaseTabs v-model="active" :tabs="tabs" />
    <div :key="active" class="translations__panel" :dir="active === 'ar' ? 'rtl' : 'ltr'" :lang="active">
      <slot :lang="active" />
    </div>
  </div>
</template>

<style scoped>
.translations {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
}
.translations__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  animation: fade-up var(--duration-base) var(--ease-out);
}
</style>

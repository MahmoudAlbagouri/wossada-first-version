<script setup lang="ts" generic="K extends string">
const active = defineModel<K>({ required: true });

defineProps<{
  tabs: { key: K; label: string; icon?: string; count?: number }[];
  /** Stretch tabs to fill the row (segmented control look). */
  stretch?: boolean;
}>();
</script>

<template>
  <div class="tabs scroller" :class="{ 'tabs--stretch': stretch }" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'is-active': tab.key === active }"
      :aria-selected="tab.key === active"
      @click="active = tab.key"
    >
      <Icon v-if="tab.icon" :name="tab.icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
      <span v-if="tab.count !== undefined" class="tabs__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  border-radius: var(--radius-full);
  background: var(--color-surface-sunken);
  inline-size: fit-content;
  max-inline-size: 100%;
}
.tabs--stretch {
  inline-size: 100%;
}
.tabs--stretch .tabs__tab {
  flex: 1;
}
.tabs__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-block-size: 2.5rem;
  padding-inline: var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-muted);
  white-space: nowrap;
  transition:
    background-color var(--duration-base) var(--ease-out),
    color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out);
}
.tabs__tab:hover {
  color: var(--color-text);
}
.tabs__tab.is-active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.tabs__count {
  min-inline-size: 1.4rem;
  padding: 0 0.4rem;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--gold-800);
  font-size: var(--text-2xs);
  line-height: 1.4rem;
}
</style>

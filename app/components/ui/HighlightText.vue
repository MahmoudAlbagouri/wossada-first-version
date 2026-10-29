<script setup lang="ts">
/** Renders `text` with the words of `query` wrapped in `<mark>`. */
const props = defineProps<{ text: string; query: string }>();

const parts = computed(() => highlightParts(props.text, props.query));
</script>

<template>
  <span><template v-for="(part, i) in parts" :key="i"><mark v-if="part.match" class="highlight">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
</template>

<style scoped>
.highlight {
  background: var(--color-primary-soft);
  color: inherit;
  border-radius: 2px;
}
</style>

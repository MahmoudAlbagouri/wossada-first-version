<script setup lang="ts">
const model = defineModel<number>({ default: 0 });

const props = withDefaults(
  defineProps<{
    /** Display-only value (ignored when `interactive`). */
    value?: number;
    count?: number;
    interactive?: boolean;
    size?: string;
    showValue?: boolean;
  }>(),
  { size: '1rem' },
);

const { t } = useI18n();
const hover = ref(0);
const shown = computed(() => (props.interactive ? hover.value || model.value : (props.value ?? model.value)));

/** Fill ratio (0..1) of star `n`, so 4.5 renders half a star. */
const fill = (n: number) => Math.max(0, Math.min(1, shown.value - (n - 1)));
</script>

<template>
  <div
    class="rating"
    :class="{ 'rating--interactive': interactive }"
    :style="{ '--star': size }"
    :role="interactive ? 'radiogroup' : 'img'"
    :aria-label="interactive ? t('reviews.yourRating') : t('reviews.ratedOutOf', { value: (value ?? 0).toFixed(1) })"
    @mouseleave="hover = 0"
  >
    <component
      :is="interactive ? 'button' : 'span'"
      v-for="n in 5"
      :key="n"
      :type="interactive ? 'button' : undefined"
      class="rating__star"
      :role="interactive ? 'radio' : undefined"
      :aria-checked="interactive ? model === n : undefined"
      :aria-label="interactive ? t('reviews.stars', { n }) : undefined"
      @mouseenter="interactive && (hover = n)"
      @click="interactive && (model = n)"
    >
      <Icon name="ph:star-fill" class="rating__bg" />
      <span class="rating__fg" :style="{ inlineSize: `${fill(n) * 100}%` }">
        <Icon name="ph:star-fill" />
      </span>
    </component>
    <span v-if="showValue && !interactive" class="rating__value">{{ (value ?? 0).toFixed(1) }}</span>
    <span v-if="count !== undefined" class="rating__count">({{ count }})</span>
  </div>
</template>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--star);
  line-height: 1;
}
.rating__star {
  position: relative;
  display: inline-grid;
  inline-size: 1em;
  block-size: 1em;
}
.rating__bg {
  color: var(--stone-200);
}
.rating__fg {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  overflow: hidden;
  color: #f5b301;
}
.rating--interactive .rating__star {
  font-size: 1.6em;
  inline-size: 1.15em;
  block-size: 1.15em;
  place-items: center;
  transition: transform var(--duration-fast) var(--ease-spring);
}
.rating--interactive .rating__star:hover {
  transform: scale(1.2);
}
.rating--interactive .rating__fg {
  inset: 0;
  display: grid;
  place-items: center;
  transition: inline-size var(--duration-fast) ease;
}
.rating__value {
  margin-inline-start: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.rating__count {
  margin-inline-start: 2px;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
</style>

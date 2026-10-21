<script setup lang="ts">
const props = defineProps<{ images: string[]; alt: string; badge?: string | null }>();

const { t } = useI18n();
const track = ref<HTMLElement | null>(null);
const { activeIndex, goTo, canPrev, canNext, prev, next } = useScroller(track);

// A new variant may bring its own images: start from the first one again.
watch(
  () => props.images[0],
  () => goTo(0),
);

/** Desktop hover zoom: the image scales around the cursor. */
function onMove(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  target.style.setProperty('--zx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
  target.style.setProperty('--zy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
}
</script>

<template>
  <div class="gallery">
    <div class="gallery__stage">
      <div ref="track" class="scroller gallery__track" data-page="full">
        <div
          v-for="(image, index) in images"
          :key="image"
          class="gallery__slide"
          @mousemove="onMove"
        >
          <BaseImage
            :src="image"
            :alt="index === 0 ? alt : `${alt} — ${index + 1}`"
            :width="900"
            :height="900"
            ratio="1"
            sizes="xs:100vw lg:50vw"
            fit="contain"
            :priority="index === 0"
            class="gallery__image"
          />
        </div>
      </div>

      <BaseBadge v-if="badge" tone="danger" solid class="gallery__badge" dir="ltr">{{ badge }}</BaseBadge>

      <template v-if="images.length > 1">
        <button type="button" class="gallery__arrow gallery__arrow--prev hide-mobile" :disabled="!canPrev" :aria-label="t('common.previous')" @click="prev">
          <Icon name="ph:caret-left" class="flip-rtl" />
        </button>
        <button type="button" class="gallery__arrow gallery__arrow--next hide-mobile" :disabled="!canNext" :aria-label="t('common.next')" @click="next">
          <Icon name="ph:caret-right" class="flip-rtl" />
        </button>
        <div class="gallery__dots hide-desktop" aria-hidden="true">
          <span v-for="(image, index) in images" :key="image" :class="{ 'is-active': index === activeIndex }" />
        </div>
      </template>
    </div>

    <div v-if="images.length > 1" class="scroller gallery__thumbs" role="tablist" :aria-label="t('product.gallery')">
      <button
        v-for="(image, index) in images"
        :key="image"
        type="button"
        role="tab"
        class="gallery__thumb"
        :class="{ 'is-active': index === activeIndex }"
        :aria-selected="index === activeIndex"
        :aria-label="t('product.imageN', { n: index + 1 })"
        @click="goTo(index)"
      >
        <BaseImage :src="image" :alt="''" :width="120" :height="120" ratio="1" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.gallery__stage {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.gallery__track {
  gap: 0;
  padding: 0;
}
.gallery__slide {
  inline-size: 100%;
  overflow: hidden;
  --zx: 50%;
  --zy: 50%;
}
@media (hover: hover) and (min-width: 1024px) {
  .gallery__slide {
    cursor: zoom-in;
  }
  .gallery__slide :deep(.img-frame__img) {
    transform-origin: var(--zx) var(--zy);
    transition: transform 0.35s var(--ease-out), opacity var(--duration-slow) ease;
  }
  .gallery__slide:hover :deep(.img-frame__img) {
    transform: scale(1.9);
  }
}
.gallery__image {
  background: var(--color-surface);
}
.gallery__badge {
  position: absolute;
  inset-block-start: var(--space-4);
  inset-inline-start: var(--space-4);
}
.gallery__arrow {
  position: absolute;
  inset-block-start: 50%;
  display: grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-md);
  font-size: 1.2rem;
  transform: translateY(-50%);
  opacity: 0;
  transition:
    opacity var(--duration-base) ease,
    transform var(--duration-base) var(--ease-out);
}
.gallery__stage:hover .gallery__arrow:not(:disabled) {
  opacity: 1;
}
.gallery__arrow--prev {
  inset-inline-start: var(--space-4);
}
.gallery__arrow--next {
  inset-inline-end: var(--space-4);
}
.gallery__dots {
  position: absolute;
  inset-inline: 0;
  inset-block-end: var(--space-3);
  display: flex;
  justify-content: center;
  gap: 6px;
}
.gallery__dots span {
  inline-size: 7px;
  block-size: 7px;
  border-radius: var(--radius-full);
  background: rgb(0 0 0 / 0.2);
  transition:
    inline-size var(--duration-base) var(--ease-out),
    background-color var(--duration-base) ease;
}
.gallery__dots span.is-active {
  inline-size: 20px;
  background: var(--color-primary);
}
.gallery__thumbs {
  gap: var(--space-2);
}
.gallery__thumb {
  inline-size: clamp(4rem, 3rem + 3vw, 5.5rem);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.6;
  transition:
    opacity var(--duration-fast) ease,
    border-color var(--duration-fast) ease;
}
.gallery__thumb:hover {
  opacity: 1;
}
.gallery__thumb.is-active {
  opacity: 1;
  border-color: var(--color-primary);
}
</style>

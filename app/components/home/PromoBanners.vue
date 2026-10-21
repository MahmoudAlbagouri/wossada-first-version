<script setup lang="ts">
import type { FixedBanner, FullImage } from '~/types/models';
import { NuxtLink } from '#components';

/** Fixed banners (grid of 1–3) and full-width image banners share this component. */
const props = defineProps<{ banners: (FixedBanner | FullImage)[]; full?: boolean }>();

const { pick } = useLocalized();
const { brandName } = useBrand();

const items = computed(() =>
  props.banners.map((banner) => {
    const tr = pick(banner.translations) as { title?: string | null; link?: string | null } | undefined;
    return { id: banner.id, image: banner.imageUrl, title: tr?.title ?? null, link: tr?.link || null };
  }),
);
</script>

<template>
  <section v-if="items.length" class="banners" :class="[full ? 'banners--full' : `banners--${Math.min(items.length, 3)}`]">
    <component
      :is="item.link ? NuxtLink : 'div'"
      v-for="(item, index) in items"
      :key="item.id"
      v-reveal="index * 90"
      :to="item.link ?? undefined"
      class="banner"
    >
      <BaseImage
        :src="item.image"
        :alt="item.title || brandName"
        :width="full ? 1600 : 800"
        :height="full ? 500 : 450"
        :ratio="full ? '16/5' : '16/9'"
        :sizes="full ? 'xs:100vw' : 'xs:100vw md:50vw'"
        class="banner__image"
      />
      <span v-if="item.title" class="banner__caption">
        <span class="banner__title">{{ item.title }}</span>
        <span v-if="item.link" class="banner__arrow" aria-hidden="true"><Icon name="ph:arrow-right" class="flip-rtl" /></span>
      </span>
    </component>
  </section>
</template>

<style scoped>
.banners {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
}
@media (min-width: 768px) {
  .banners--2,
  .banners--3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .banners--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.banner {
  position: relative;
  display: block;
  border-radius: var(--radius-xl);
  overflow: hidden;
  isolation: isolate;
}
.banners--full .banner :deep(.img-frame) {
  aspect-ratio: 16 / 9 !important;
}
@media (min-width: 768px) {
  .banners--full .banner :deep(.img-frame) {
    aspect-ratio: 16 / 5 !important;
  }
}
.banner :deep(.img-frame__img) {
  transition:
    transform 1s var(--ease-out),
    opacity var(--duration-slow) ease;
}
.banner:hover :deep(.img-frame__img) {
  transform: scale(1.05);
}
.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(28 25 20 / 0.55), transparent 55%);
  opacity: 0.85;
  transition: opacity var(--duration-base) ease;
  pointer-events: none;
}
.banner__caption {
  position: absolute;
  inset-inline: var(--space-5);
  inset-block-end: var(--space-5);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: #fff;
}
.banner__title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
  text-shadow: 0 2px 14px rgb(0 0 0 / 0.3);
}
.banner__arrow {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  font-size: 1.2rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.2);
  backdrop-filter: blur(8px);
  transition: transform var(--duration-base) var(--ease-out);
}
.banner:hover .banner__arrow {
  transform: translateX(-4px);
}
:dir(ltr) .banner:hover .banner__arrow {
  transform: translateX(4px);
}
</style>

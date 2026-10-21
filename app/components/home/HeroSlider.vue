<script setup lang="ts">
import type { MainSlider } from '~/types/models';

const props = defineProps<{ sliders: MainSlider[] }>();

const { t } = useI18n();
const { pick } = useLocalized();
const { tagline, brandDescription } = useBrand();

const slides = computed(() =>
  (props.sliders ?? [])
    .flatMap((slider) => slider?.items ?? [])
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const tr = pick(item.translations);
      return { id: item.id, image: item.imageUrl, title: tr?.title, cta: tr?.buttonText, link: tr?.buttonLink || null };
    }),
);

const track = ref<HTMLElement | null>(null);
const { activeIndex, goTo, next, prev } = useScroller(track, { autoplay: 6000 });

const isInternal = (link: string) => link.startsWith('/');
</script>

<template>
  <section class="hero" :aria-label="t('home.featured')">
    <template v-if="slides.length">
      <div ref="track" class="scroller hero__track" data-page="full" aria-roledescription="carousel">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="hero__slide"
          :class="{ 'is-active': index === activeIndex }"
          role="group"
          aria-roledescription="slide"
          :aria-label="t('home.slideOf', { n: index + 1, total: slides.length })"
        >
          <BaseImage
            :src="slide.image"
            :alt="slide.title || tagline"
            :width="1600"
            :height="640"
            sizes="xs:100vw"
            :priority="index === 0"
            class="hero__image"
          />
          <div v-if="slide.title || slide.cta" class="hero__overlay">
            <div class="container hero__content">
              <h2 v-if="slide.title" class="hero__title">{{ slide.title }}</h2>
              <BaseButton
                v-if="slide.cta && slide.link"
                :to="isInternal(slide.link) ? slide.link : undefined"
                :href="isInternal(slide.link) ? undefined : slide.link"
                size="lg"
                icon-end="ph:arrow-right"
                class="hero__cta"
              >
                {{ slide.cta }}
              </BaseButton>
            </div>
          </div>
          <NuxtLink v-else-if="slide.link" :to="slide.link" class="hero__link" :aria-label="slide.title || tagline" />
        </div>
      </div>

      <template v-if="slides.length > 1">
        <button type="button" class="hero__arrow hero__arrow--prev hide-mobile" :aria-label="t('common.previous')" @click="prev">
          <Icon name="ph:caret-left" class="flip-rtl" />
        </button>
        <button type="button" class="hero__arrow hero__arrow--next hide-mobile" :aria-label="t('common.next')" @click="next">
          <Icon name="ph:caret-right" class="flip-rtl" />
        </button>
        <div class="hero__dots">
          <button
            v-for="(slide, index) in slides"
            :key="slide.id"
            type="button"
            class="hero__dot"
            :class="{ 'is-active': index === activeIndex }"
            :aria-label="t('home.goToSlide', { n: index + 1 })"
            :aria-current="index === activeIndex"
            @click="goTo(index)"
          />
        </div>
      </template>
    </template>

    <!-- Brand hero while no slider has been configured yet -->
    <div v-else class="hero__fallback">
      <div class="hero__orb hero__orb--1" aria-hidden="true" />
      <div class="hero__orb hero__orb--2" aria-hidden="true" />
      <div class="container hero__fallback-content">
        <span class="eyebrow">{{ t('home.welcome') }}</span>
        <p class="hero__headline">
          <span class="text-gradient">{{ tagline }}</span>
        </p>
        <p class="hero__lead">{{ brandDescription }}</p>
        <div class="cluster">
          <BaseButton to="/products" size="lg" icon-end="ph:arrow-right">{{ t('home.shopNow') }}</BaseButton>
          <BaseButton to="/contact" size="lg" variant="outline">{{ t('nav.contact') }}</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
}
.hero__track {
  gap: 0;
  padding: 0;
}
.hero__slide {
  position: relative;
  inline-size: 100%;
  aspect-ratio: 16 / 10;
  max-block-size: 640px;
}
@media (min-width: 768px) {
  .hero__slide {
    aspect-ratio: 5 / 2;
  }
}
.hero__image {
  position: absolute !important;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
}
.hero__slide :deep(.img-frame__img) {
  transform: scale(1.06);
  transition:
    transform 6s linear,
    opacity var(--duration-slow) ease;
}
.hero__slide.is-active :deep(.img-frame__img) {
  transform: scale(1);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding-block-end: clamp(2.5rem, 1.5rem + 5vw, 5rem);
  background: linear-gradient(to top, rgb(28 25 20 / 0.65), rgb(28 25 20 / 0.05) 60%);
}
@media (min-width: 768px) {
  .hero__overlay {
    align-items: center;
    padding-block-end: 0;
    background: linear-gradient(to left, rgb(28 25 20 / 0.6), transparent 70%);
  }
  :dir(ltr) .hero__overlay {
    background: linear-gradient(to right, rgb(28 25 20 / 0.6), transparent 70%);
  }
}
.hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
}
.hero__title {
  max-inline-size: 18ch;
  font-size: var(--text-5xl);
  font-weight: var(--weight-black);
  line-height: 1.15;
  color: #fff;
  text-shadow: 0 2px 20px rgb(0 0 0 / 0.25);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.8s var(--ease-out) 0.2s,
    transform 0.8s var(--ease-out) 0.2s;
}
.hero__cta {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.8s var(--ease-out) 0.4s,
    transform 0.8s var(--ease-out) 0.4s,
    box-shadow var(--duration-base) ease;
}
.is-active .hero__title,
.is-active .hero__cta {
  opacity: 1;
  transform: none;
}
.hero__link {
  position: absolute;
  inset: 0;
}
.hero__arrow {
  position: absolute;
  inset-block-start: 50%;
  display: grid;
  place-items: center;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.2);
  border: 1px solid rgb(255 255 255 / 0.35);
  color: #fff;
  font-size: 1.25rem;
  backdrop-filter: blur(10px);
  transform: translateY(-50%);
  transition: background-color var(--duration-fast) ease;
}
.hero__arrow:hover {
  background: rgb(255 255 255 / 0.35);
}
.hero__arrow--prev {
  inset-inline-start: var(--space-6);
}
.hero__arrow--next {
  inset-inline-end: var(--space-6);
}
.hero__dots {
  position: absolute;
  inset-inline: 0;
  inset-block-end: var(--space-4);
  display: flex;
  justify-content: center;
  gap: var(--space-2);
}
.hero__dot {
  inline-size: 0.6rem;
  block-size: 0.6rem;
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.5);
  transition:
    inline-size var(--duration-slow) var(--ease-out),
    background-color var(--duration-base) ease;
}
.hero__dot.is-active {
  inline-size: 2rem;
  background: #fff;
}

.hero__fallback {
  position: relative;
  padding-block: clamp(4rem, 3rem + 7vw, 9rem);
  background:
    radial-gradient(circle at 15% 20%, var(--gold-100), transparent 45%),
    radial-gradient(circle at 85% 80%, var(--gold-50), transparent 50%),
    var(--color-bg);
  overflow: hidden;
}
.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 9s ease-in-out infinite;
}
.hero__orb--1 {
  inset-block-start: -6rem;
  inset-inline-end: 10%;
  inline-size: 22rem;
  block-size: 22rem;
  background: var(--gold-200);
}
.hero__orb--2 {
  inset-block-end: -8rem;
  inset-inline-start: 5%;
  inline-size: 18rem;
  block-size: 18rem;
  background: var(--gold-300);
  animation-delay: -4s;
}
.hero__fallback-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  animation: fade-up 0.9s var(--ease-out);
}
.hero__headline {
  max-inline-size: 16ch;
  font-size: var(--text-5xl);
  font-weight: var(--weight-black);
  line-height: 1.15;
}
.hero__lead {
  max-inline-size: 56ch;
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}
</style>

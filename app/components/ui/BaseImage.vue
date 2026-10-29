<script setup lang="ts">
/**
 * The single image component of the app: optimized `<NuxtImg>` (AVIF/WebP,
 * responsive `sizes`), lazy by default, with a placeholder on error.
 */
const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt: string;
    width?: number;
    height?: number;
    /** e.g. `xs:50vw md:33vw lg:25vw` */
    sizes?: string;
    fit?: 'cover' | 'contain';
    /** Above-the-fold images (hero, product main image). */
    priority?: boolean;
    /** CSS aspect-ratio of the frame, e.g. `1`, `4/5`, `16/9`. */
    ratio?: string | number;
    rounded?: boolean;
  }>(),
  { fit: 'cover' },
);

const config = useRuntimeConfig();
const appConfig = useAppConfig();
const frame = ref<HTMLElement | null>(null);
const failed = ref(false);
const loaded = ref(false);

// A cached image can finish before NuxtImg attaches its listeners (e.g. coming
// Back to a list rendered inside a pending Suspense), so `load` never arrives.
onMounted(() => {
  const img = frame.value?.querySelector('img');
  if (img?.complete && img.naturalWidth) loaded.value = true;
});

watch(
  () => props.src,
  () => {
    failed.value = false;
    loaded.value = false;
  },
);

const source = computed(() => (!props.src || failed.value ? appConfig.ui.placeholderImage : props.src));
const isPlaceholder = computed(() => source.value === appConfig.ui.placeholderImage);
/** SVGs, the placeholder and `NUXT_PUBLIC_IMAGE_PROVIDER=none` skip the optimizer. */
const optimize = computed(
  () => config.public.imageProvider !== 'none' && !isPlaceholder.value && !source.value.endsWith('.svg'),
);
</script>

<template>
  <span
    ref="frame"
    class="img-frame"
    :class="{ 'is-loaded': loaded || isPlaceholder, 'img-frame--rounded': rounded, 'img-frame--ratio': ratio }"
    :style="ratio ? { aspectRatio: String(ratio) } : undefined"
  >
    <NuxtImg
      v-if="optimize"
      :src="source"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      :preload="priority || undefined"
      decoding="async"
      class="img-frame__img"
      :style="{ objectFit: fit }"
      @load="loaded = true"
      @error="failed = true"
    />
    <img
      v-else
      :src="source"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="priority ? 'eager' : 'lazy'"
      decoding="async"
      class="img-frame__img"
      :style="{ objectFit: fit }"
      @load="loaded = true"
      @error="failed = true"
    />
  </span>
</template>

<style scoped>
.img-frame {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--color-surface-sunken);
}
.img-frame--ratio .img-frame__img {
  position: absolute;
  inset: 0;
}
.img-frame--rounded {
  border-radius: var(--radius-md);
}
.img-frame__img {
  inline-size: 100%;
  block-size: 100%;
  opacity: 0;
  transition:
    opacity var(--duration-slow) var(--ease-out),
    transform 0.8s var(--ease-out);
}
.img-frame.is-loaded .img-frame__img {
  opacity: 1;
}
/* Server-rendered images are visible before hydration (no JS needed). */
@media (scripting: none) {
  .img-frame__img {
    opacity: 1;
  }
}
</style>

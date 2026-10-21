import { useEventListener, useResizeObserver } from '@vueuse/core';
import type { Ref } from 'vue';

/**
 * Drives a CSS scroll-snap track (`.scroller`): arrows, dots and autoplay
 * without a slider library. Native touch swiping comes for free and RTL works
 * because "next" always means "towards the inline end".
 */
export function useScroller(track: Ref<HTMLElement | null>, { autoplay = 0 }: { autoplay?: number } = {}) {
  const canPrev = ref(false);
  const canNext = ref(false);
  const activeIndex = ref(0);
  const paused = ref(false);

  const isRtl = () => !!track.value && getComputedStyle(track.value).direction === 'rtl';

  function update(): void {
    const el = track.value;
    if (!el) return;
    // scrollLeft is 0 at the start and negative towards the end in RTL.
    const position = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    canPrev.value = position > 4;
    canNext.value = position < max - 4;
    activeIndex.value = el.clientWidth ? Math.round(position / el.clientWidth) : 0;
  }

  function scrollByPage(direction: 1 | -1): void {
    const el = track.value;
    if (!el) return;
    const amount = el.clientWidth * (el.dataset.page === 'full' ? 1 : 0.85);
    el.scrollBy({ left: direction * amount * (isRtl() ? -1 : 1), behavior: 'smooth' });
  }

  /** For full-width slides: jump to slide `index`. */
  function goTo(index: number): void {
    const el = track.value;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth * (isRtl() ? -1 : 1), behavior: 'smooth' });
  }

  const next = () => (canNext.value ? scrollByPage(1) : goTo(0));
  const prev = () => scrollByPage(-1);

  useEventListener(track, 'scroll', update, { passive: true });
  useResizeObserver(track, update);
  onMounted(() => nextTick(update));

  if (autoplay > 0 && import.meta.client) {
    let timer: ReturnType<typeof setInterval> | undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => {
      stop();
      if (!reduceMotion) timer = setInterval(() => !paused.value && !document.hidden && next(), autoplay);
    };
    const stop = () => timer && clearInterval(timer);
    onMounted(start);
    onBeforeUnmount(stop);
    useEventListener(track, 'pointerenter', () => (paused.value = true));
    useEventListener(track, 'pointerleave', () => (paused.value = false));
    useEventListener(track, 'focusin', () => (paused.value = true));
    useEventListener(track, 'focusout', () => (paused.value = false));
  }

  return { canPrev, canNext, activeIndex, paused, next, prev, goTo, update };
}

import type { Directive } from 'vue';

/**
 * `v-reveal` fades/slides an element in the first time it scrolls into view.
 * `v-reveal="120"` adds a delay in ms (handy for staggered grids).
 *
 * Nothing is rendered on the server and elements already on screen at mount
 * are left alone, so content is never hidden before JavaScript loads (no
 * layout shift, no LCP delay, no hydration mismatch). Uses data attributes so
 * Vue's class patching can never undo the revealed state.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null;

  const getObserver = () =>
    (observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = '';
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    ));

  const reveal: Directive<HTMLElement, number | undefined> = {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (!('IntersectionObserver' in window)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) return;
      el.dataset.reveal = '';
      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`);
      getObserver().observe(el);
    },
    unmounted(el) {
      observer?.unobserve(el);
    },
  };

  nuxtApp.vueApp.directive('reveal', reveal);
});

<script setup lang="ts">
const props = withDefaults(defineProps<{ productId: string; variant?: 'floating' | 'outline' }>(), {
  variant: 'floating',
});

const wishlist = useWishlistStore();
const requireAuth = useRequireAuth();
const toast = useToast();
const { t } = useI18n();

const saved = computed(() => wishlist.has(props.productId));
const busy = computed(() => wishlist.pending.has(props.productId));
const burst = ref(false);

async function toggle() {
  if (!requireAuth()) return;
  try {
    const added = await wishlist.toggle(props.productId);
    if (added) {
      burst.value = true;
      setTimeout(() => (burst.value = false), 600);
    }
    toast.success(added ? t('wishlist.added') : t('wishlist.removed'), {
      action: added ? { label: t('wishlist.view'), to: '/account/wishlist' } : undefined,
    });
  } catch (error) {
    toast.fromError(error);
  }
}
</script>

<template>
  <button
    type="button"
    class="wish"
    :class="[`wish--${variant}`, { 'is-saved': saved, 'is-burst': burst }]"
    :aria-pressed="saved"
    :aria-label="saved ? t('wishlist.remove') : t('wishlist.add')"
    :title="saved ? t('wishlist.remove') : t('wishlist.add')"
    :disabled="busy"
    @click.prevent.stop="toggle"
  >
    <Icon :name="saved ? 'ph:heart-fill' : 'ph:heart'" class="wish__icon" />
  </button>
</template>

<style scoped>
.wish {
  position: relative;
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  color: var(--color-text-muted);
  transition:
    color var(--duration-fast) ease,
    background-color var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
.wish--floating {
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(6px);
}
.wish--outline {
  inline-size: 3.25rem;
  block-size: 3.25rem;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
}
.wish:hover {
  color: var(--color-danger);
  transform: scale(1.08);
}
.wish.is-saved {
  color: var(--color-danger);
}
.wish__icon {
  font-size: 1.3rem;
}
.wish--outline .wish__icon {
  font-size: 1.5rem;
}
.wish.is-burst .wish__icon {
  animation: pop var(--duration-slow) var(--ease-spring);
}
.wish.is-burst::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: pulse-ring 0.6s ease-out;
  box-shadow: 0 0 0 0 rgb(198 40 40 / 0.4);
}
</style>

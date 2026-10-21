<script setup lang="ts">
const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Prevent closing by clicking the backdrop (e.g. forms with unsaved data). */
    persistent?: boolean;
    hideClose?: boolean;
  }>(),
  { size: 'md' },
);

const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();
const panel = ref<HTMLElement | null>(null);
const titleId = useId();
let previouslyFocused: HTMLElement | null = null;

function close() {
  open.value = false;
  emit('close');
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.persistent) close();
  // Minimal focus trap: keep Tab inside the dialog.
  if (event.key === 'Tab' && panel.value) {
    const focusable = panel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
}

watch(open, async (isOpen) => {
  if (!import.meta.client) return;
  document.body.classList.toggle('is-locked', isOpen);
  if (isOpen) {
    previouslyFocused = document.activeElement as HTMLElement | null;
    await nextTick();
    panel.value?.querySelector<HTMLElement>('[autofocus], input, select, textarea, button')?.focus();
  } else {
    previouslyFocused?.focus?.();
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) document.body.classList.remove('is-locked');
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @keydown="onKeydown">
        <div class="modal__backdrop" @click="!persistent && close()" />
        <div
          ref="panel"
          class="modal__panel"
          :class="`modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
        >
          <header v-if="title || !hideClose || $slots.header" class="modal__header">
            <slot name="header">
              <div>
                <h2 v-if="title" :id="titleId" class="modal__title">{{ title }}</h2>
                <p v-if="description" class="modal__description">{{ description }}</p>
              </div>
            </slot>
            <BaseButton
              v-if="!hideClose"
              variant="ghost"
              size="sm"
              icon="ph:x"
              icon-only
              :label="t('common.close')"
              class="modal__close"
              @click="close"
            />
          </header>
          <div class="modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" :close="close" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--space-4);
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
}

.modal__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  max-block-size: calc(100dvh - 2 * var(--space-4));
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal__panel--sm {
  max-inline-size: 420px;
}
.modal__panel--md {
  max-inline-size: 560px;
}
.modal__panel--lg {
  max-inline-size: 780px;
}
.modal__panel--xl {
  max-inline-size: 1080px;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6) var(--space-3);
}
.modal__title {
  font-size: var(--text-xl);
}
.modal__description {
  margin-block-start: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.modal__close {
  margin-inline-end: calc(var(--space-2) * -1);
}

.modal__body {
  padding: var(--space-3) var(--space-6) var(--space-6);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-block-start: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

/* Bottom sheet on phones */
@media (max-width: 640px) {
  .modal {
    align-items: end;
    padding: 0;
  }
  .modal__panel {
    max-inline-size: none !important;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    max-block-size: 92dvh;
  }
  .modal__footer {
    padding-block-end: calc(var(--space-4) + env(safe-area-inset-bottom));
  }
  .modal__footer :deep(.btn) {
    flex: 1;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform var(--duration-slow) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(24px) scale(0.98);
}
@media (max-width: 640px) {
  .modal-enter-from .modal__panel,
  .modal-leave-to .modal__panel {
    transform: translateY(100%);
  }
}
</style>

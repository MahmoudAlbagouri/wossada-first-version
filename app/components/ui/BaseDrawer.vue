<script setup lang="ts">
const open = defineModel<boolean>({ default: false });

withDefaults(
  defineProps<{
    title?: string;
    /** `start` = right in Arabic / left in English. */
    side?: 'start' | 'end';
    width?: string;
  }>(),
  { side: 'start', width: '360px' },
);

const { t } = useI18n();
const route = useRoute();

// Navigating from inside the drawer closes it.
watch(() => route.fullPath, () => (open.value = false));

watch(open, (isOpen) => {
  if (import.meta.client) document.body.classList.toggle('is-locked', isOpen);
});

onBeforeUnmount(() => {
  if (import.meta.client) document.body.classList.remove('is-locked');
});

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer" :class="`drawer--${side}`" @keydown="onKeydown">
        <div class="drawer__backdrop" @click="open = false" />
        <aside class="drawer__panel" :style="{ '--drawer-w': width }" role="dialog" aria-modal="true" :aria-label="title">
          <header class="drawer__header">
            <slot name="header">
              <h2 class="drawer__title">{{ title }}</h2>
            </slot>
            <BaseButton variant="ghost" size="sm" icon="ph:x" icon-only :label="t('common.close')" @click="open = false" />
          </header>
          <div class="drawer__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="drawer__footer">
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
  display: flex;
}
.drawer--end {
  justify-content: flex-end;
}
.drawer__backdrop {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(3px);
}
.drawer__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  inline-size: min(var(--drawer-w), 88vw);
  block-size: 100%;
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-block-end: 1px solid var(--color-border);
}
.drawer__title {
  font-size: var(--text-lg);
}
.drawer__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-4) var(--space-5);
}
.drawer__footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) calc(var(--space-4) + env(safe-area-inset-bottom));
  border-block-start: 1px solid var(--color-border);
}
.drawer__footer :deep(.btn) {
  flex: 1;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}
.drawer-enter-active .drawer__panel,
.drawer-leave-active .drawer__panel {
  transition: transform var(--duration-slow) var(--ease-out);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
/* `start` slides from the inline-start edge in both directions */
.drawer--start.drawer-enter-from .drawer__panel,
.drawer--start.drawer-leave-to .drawer__panel {
  transform: translateX(-100%);
}
:dir(rtl) .drawer--start.drawer-enter-from .drawer__panel,
:dir(rtl) .drawer--start.drawer-leave-to .drawer__panel {
  transform: translateX(100%);
}
.drawer--end.drawer-enter-from .drawer__panel,
.drawer--end.drawer-leave-to .drawer__panel {
  transform: translateX(100%);
}
:dir(rtl) .drawer--end.drawer-enter-from .drawer__panel,
:dir(rtl) .drawer--end.drawer-leave-to .drawer__panel {
  transform: translateX(-100%);
}
</style>

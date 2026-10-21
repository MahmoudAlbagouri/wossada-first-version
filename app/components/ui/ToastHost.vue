<script setup lang="ts">
import type { ToastType } from '~/composables/useToast';

const { toasts, dismiss } = useToast();
const { t } = useI18n();

const ICONS: Record<ToastType, string> = {
  success: 'ph:check-circle-fill',
  error: 'ph:x-circle-fill',
  warning: 'ph:warning-fill',
  info: 'ph:info-fill',
};
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <Icon :name="ICONS[toast.type]" class="toast__icon" aria-hidden="true" />
        <div class="toast__body">
          <p v-if="toast.title" class="toast__title">{{ toast.title }}</p>
          <p class="toast__message">{{ toast.message }}</p>
        </div>
        <NuxtLink v-if="toast.action" :to="toast.action.to" class="toast__action" @click="dismiss(toast.id)">
          {{ toast.action.label }}
        </NuxtLink>
        <button type="button" class="toast__close" :aria-label="t('common.close')" @click="dismiss(toast.id)">
          <Icon name="ph:x" />
        </button>
        <span
          v-if="toast.duration > 0"
          class="toast__progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
          aria-hidden="true"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  z-index: var(--z-toast);
  inset-inline: var(--space-4);
  inset-block-end: calc(var(--tabbar-height) + var(--space-3) + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}
@media (min-width: 1024px) {
  .toasts {
    inset-inline: auto var(--space-6);
    inset-block: calc(var(--header-height) + var(--space-4)) auto;
    inline-size: 380px;
  }
}
.toast {
  --tone: var(--color-info);
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  padding-inline: var(--space-4) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--stone-900);
  color: #fff;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  pointer-events: auto;
}
.toast--success {
  --tone: #4ade80;
}
.toast--error {
  --tone: #f87171;
}
.toast--warning {
  --tone: #fbbf24;
}
.toast--info {
  --tone: var(--gold-300);
}
.toast__icon {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: var(--tone);
}
.toast__body {
  flex: 1;
  min-inline-size: 0;
  font-size: var(--text-sm);
}
.toast__title {
  font-weight: var(--weight-bold);
}
.toast__message {
  color: rgb(255 255 255 / 0.85);
}
.toast__action {
  flex-shrink: 0;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.12);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--gold-200);
}
.toast__action:hover {
  background: rgb(255 255 255 / 0.2);
}
.toast__close {
  display: grid;
  place-items: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 50%;
  color: rgb(255 255 255 / 0.6);
}
.toast__close:hover {
  background: rgb(255 255 255 / 0.1);
  color: #fff;
}
.toast__progress {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  block-size: 3px;
  background: var(--tone);
  transform-origin: left;
  animation: toast-progress linear forwards;
}
:dir(rtl) .toast__progress {
  transform-origin: right;
}
@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}
.toast-leave-active {
  transition:
    opacity var(--duration-fast) ease,
    transform var(--duration-fast) ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.toast-move {
  transition: transform var(--duration-base) var(--ease-out);
}
</style>

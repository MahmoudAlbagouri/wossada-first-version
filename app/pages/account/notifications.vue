<script setup lang="ts">
import type { AppNotification, NotificationStatus } from '~/types/models';

const { t } = useI18n();
const { relative } = useLocalized();
const shop = useShopService();
const toast = useToast();

useHead({ title: t('account.notifications') });

const { data, status, refresh } = await useLazyAsyncData('my-notifications', () => shop.notifications(), {
  server: false,
  default: () => ({ items: [] as AppNotification[], unreadCount: 0 }),
});

const ICONS: Record<NotificationStatus, string> = {
  success: 'ph:check-circle',
  info: 'ph:info',
  warning: 'ph:warning',
  error: 'ph:x-circle',
};

async function open(notification: AppNotification) {
  if (!notification.isRead) {
    notification.isRead = true;
    data.value.unreadCount = Math.max(0, data.value.unreadCount - 1);
    shop.markNotificationRead(notification.id).catch(() => undefined);
  }
  if (notification.link?.startsWith('/')) await navigateTo(notification.link);
}

async function markAll() {
  try {
    await shop.markAllNotificationsRead();
    await refresh();
  } catch (error) {
    toast.fromError(error);
  }
}

async function remove(notification: AppNotification) {
  data.value.items = data.value.items.filter((n) => n.id !== notification.id);
  try {
    await shop.deleteNotification(notification.id);
  } catch (error) {
    toast.fromError(error);
    await refresh();
  }
}
</script>

<template>
  <AccountSection :title="t('account.notifications')" :description="t('notifications.hint')" flat>
    <template #actions>
      <BaseButton v-if="data.unreadCount" variant="secondary" size="sm" icon="ph:checks" @click="markAll">
        {{ t('notifications.markAll') }}
      </BaseButton>
    </template>

    <div v-if="isFetching(status) && !data.items.length" class="stack">
      <div v-for="n in 4" :key="n" class="skeleton" style="block-size: 5rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else-if="!data.items.length" class="card">
      <BaseEmptyState icon="ph:bell-slash" :title="t('notifications.emptyTitle')" :description="t('notifications.emptyText')" />
    </div>
    <TransitionGroup v-else name="list" tag="ul" class="notes">
      <li
        v-for="note in data.items"
        :key="note.id"
        class="note card"
        :class="[`note--${note.status}`, { 'is-unread': !note.isRead }]"
      >
        <button type="button" class="note__main" @click="open(note)">
          <span class="note__icon"><Icon :name="ICONS[note.status] ?? 'ph:bell'" aria-hidden="true" /></span>
          <span class="note__body">
            <strong>{{ note.title }}</strong>
            <span class="note__text">{{ note.message }}</span>
            <time :datetime="note.createdAt">{{ relative(note.createdAt) }}</time>
          </span>
          <span v-if="!note.isRead" class="note__dot" :aria-label="t('notifications.unread')" />
        </button>
        <BaseButton variant="ghost" size="sm" icon="ph:trash" icon-only :label="t('common.delete')" @click="remove(note)" />
      </li>
    </TransitionGroup>
  </AccountSection>
</template>

<style scoped>
.notes {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.note {
  --tone: var(--color-info);
  --tone-soft: var(--color-info-soft);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  padding-inline-end: var(--space-3);
  transition: background-color var(--duration-base) ease;
}
.note--success {
  --tone: var(--color-success);
  --tone-soft: var(--color-success-soft);
}
.note--warning {
  --tone: var(--color-warning);
  --tone-soft: var(--color-warning-soft);
}
.note--error {
  --tone: var(--color-danger);
  --tone-soft: var(--color-danger-soft);
}
.note.is-unread {
  background: var(--color-primary-softer);
  border-color: var(--gold-200);
}
.note__main {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: var(--space-3);
  min-inline-size: 0;
  padding: var(--space-2);
  text-align: start;
}
.note__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: var(--tone-soft);
  color: var(--tone);
  font-size: 1.25rem;
}
.note__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-inline-size: 0;
  font-size: var(--text-sm);
}
.note__text {
  color: var(--color-text-muted);
}
.note__body time {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.note__dot {
  flex-shrink: 0;
  inline-size: 0.6rem;
  block-size: 0.6rem;
  margin-block-start: var(--space-2);
  border-radius: 50%;
  background: var(--color-primary);
}
</style>

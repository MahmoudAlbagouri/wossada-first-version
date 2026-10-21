<script setup lang="ts">
import type { OrderStatus } from '~/types/models';

const props = defineProps<{ status: OrderStatus; size?: 'sm' | 'md' }>();
const { t } = useI18n();
const meta = computed(() => ORDER_STATUS_META[props.status]);
</script>

<template>
  <BaseBadge :tone="meta.tone" :icon="meta.icon" :size="size">{{ t(`orders.status.${status}`) }}</BaseBadge>
</template>

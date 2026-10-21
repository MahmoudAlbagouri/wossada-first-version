import type { OrderStatus } from '~/types/models';

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'primary';

interface StatusMeta {
  tone: Tone;
  icon: string;
  /** Position on the customer-facing progress tracker (-1 = off-track). */
  step: number;
}

/** Single source of truth for how each order status looks. Labels live in i18n. */
export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: { tone: 'warning', icon: 'ph:hourglass-medium', step: 0 },
  processing: { tone: 'info', icon: 'ph:package', step: 1 },
  shipped: { tone: 'primary', icon: 'ph:truck', step: 2 },
  redelivery: { tone: 'primary', icon: 'ph:arrows-clockwise', step: 2 },
  delivered: { tone: 'success', icon: 'ph:check-circle', step: 3 },
  cancelled: { tone: 'danger', icon: 'ph:x-circle', step: -1 },
  returned: { tone: 'neutral', icon: 'ph:arrow-u-up-left', step: -1 },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

/** The happy path shown as a progress tracker. */
export const ORDER_PROGRESS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

export const CUSTOMER_CANCELLABLE: readonly OrderStatus[] = ['pending', 'processing'];

/** Statuses an admin may no longer change (stock already returned). */
export const TERMINAL_STATUSES: readonly OrderStatus[] = ['cancelled', 'returned'];
